---
layout: post
title: Using Github Actions to Push a Containerized Streamlit Application to ECR and Deploy to an EC2 Instance
categories: [technical]
hidden: false
---


Recently, I used Github Actions to automate the deployment of a Streamlit application I was using for my capstone project, Charge Buddy. 
As we draw closer to the finish line, the risk that manual deployment introduces becomes too much at a certain point. Today, I wanted to go over the steps I took to write a simple Github Actions workflow that automated the deployment of our Streamlit application. 

1. Create an Elastic Container Registry repository to store your Docker images

2. Configure an IAM role for Github Actions to use 
Create Role -> Web Identity
Identity Provider: token.actions.githubusercontent.com 
Audience: sts.amazonaws.com
Github Organization (This is the name of the owner of the Github repo you are working with)

You can skip over attaching policies to this role at this moment. 
3. Navigate to the IAM Role you created and go to "Permission Policies" -> "Add Permissions" -> Create an inline policy 
For the ECR-Registry Value, you will be using your AWS account ID, which should be the long numeric value in the URI portion of the ECR registry entry. 
The [AWS Documentation](https://docs.aws.amazon.com/AmazonECR/latest/userguide/Repositories.html) says "By default, your account has read and write access to the repositories in your default registry (aws_account_id.dkr.ecr.region.amazonaws.com)."
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Action": [
                "ecr:BatchGetImage",
                "ecr:BatchCheckLayerAvailability",
                "ecr:CompleteLayerUpload",
                "ecr:GetDownloadUrlForLayer",
                "ecr:PutImage",
                "ecr:UploadLayerPart",
                "ecr:InitiateLayerUpload"
            ],
            "Resource": "arn:aws:ecr:us-east-1:[ECR-Registry Value]:repository:[Name of ECR Repository]"
        }
    ]
}
```
The inline policy should resemble the code above. 

4. I initially began by adapting the workflow from [Deploying to Amazon ECS](https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-amazon-elastic-container-service)
This portion of the workflow is fairly simple to follow. I was having some issues with the memory limitations of the Github Action runner, so I added a step to delete the /opt/hostedtoolcache in order to free up some more room.
But, we configure our AWS credentials using the ARN value from the IAM role we created earlier. Then, we log into AWS ECR before we build, tag, and push the image. In this workflow, I have chosen to dynamically set the tag value
```
name: Deploy to Amazon ECR and SSH into EC2 Instance for Deployment

on:
  push:
    branches: [ "main" ]

env:
  AWS_REGION: us-east-1              # set this to your preferred AWS region, e.g. us-west-1
  ECR_REGISTRY: [ECR Registry URI]

permissions:
  contents: read
  id-token: write


jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    environment: production

    steps:
    - name: Delete unnecessary tools folder
      run: rm -rf /opt/hostedtoolcache
    - name: Checkout
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: [ARN from IAM Role you created in step 2]
        audience: sts.amazonaws.com
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REPOSITORY: "charge-buddy"
        IMAGE_TAG: ${{ github.sha }}
      run: |
        # Build a docker container and
        # push it to ECR so that it can
        # be deployed to ECS.
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
        



```
5. We can now create an EC2 instance. We will need to add our 

```
    - name: Create SSH key 
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      run: |
        echo "$SSH_PRIVATE_KEY" > ssh_private_key && chmod 600 ssh_private_key
        ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254


    - name: Copy files over and deploy environment variable for Docker Compose
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        IMAGE: ${{ steps.build-image.outputs.IMAGE }}
      run: |
        scp -oStrictHostKeyChecking=no -i ssh_private_key -r nginx ubuntu@34.231.106.254:~
        echo "IMAGE=$IMAGE" > .env 
        scp -oStrictHostKeyChecking=no -i ssh_private_key .env ubuntu@34.231.106.254:~

    - name: Copy contents of deploy.sh and execute deploy.sh  
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      run: |
        cat deploy.sh | ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254 'cat > ./deploy.sh'
        cat docker-compose.yml | ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254 'bash -c "cat > docker-compose.yml && chmod -R 755 ./deploy.sh && ./deploy.sh"'
  ```

The deploy.sh file
```
#!/bin/bash
# remove old image container
docker system prune --all --force

# login to the ecr to get pushed docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 241112547949.dkr.ecr.us-east-1.amazonaws.com
docker-compose --env-file .env up -d
```

```
services:
  app:
    env_file:
      - .env
    image: $IMAGE
    deploy:
      replicas: 1
    ports:
      - "8501:8501"
    command: streamlit run app.py --server.port=8501 --server.headless=true --server.enableCORS=false --server.enableXsrfProtection=false --server.enableWebsocketCompression=false
    networks:
      - proxy_network


  nginx:
    container_name: nginx
    restart: always
    build: 
      context: .
      dockerfile: ./nginx/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - app
    networks:
      - proxy_network

#Docker Networks
networks:
  proxy_network:
    driver: bridge
```
