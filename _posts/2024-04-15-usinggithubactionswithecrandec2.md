---
layout: post
title: Using Github Actions to Push a Containerized Streamlit Application to ECR and Deploy to an EC2 Instance
categories: [technical]
hidden: true
---


Recently, I used Github Actions to automate the deployment of a Streamlit application I was using for my capstone project, Charge Buddy. 
As we draw closer to the finish line, the risk that manual deployment introduces becomes too much at a certain point. Today, I wanted to go over the steps I took to write a simple Github Actions workflow that automated the deployment of our Streamlit application, along with a NGINX container that was used as a reverse proxy, since Streamlit cannot use HTTPS on its own, but a NGINX reverse proxy can enable us to use HTTPS in our application. 

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

I want to call attention to the last line `echo "IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT`. This effectively exports the value of image to your Github Action runner output. This output can then be used in later steps of the workflow. See [here](https://docs.github.com/en/actions/using-jobs/defining-outputs-for-jobs).

5. We can now create an EC2 instance. We will need to add our our SSH private key to our Github repo secrets. From there, we can append this to our Github Actions workflow file, which echoes the SSH value from our Github Secrets to a file called ssh_private_key. The Github Actions runner then enables read and write permissions on this file in order to use it to access our EC2 Instance. We then copy the contents of our Nginx folder, which has 


```
    - name: Create SSH key 
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      run: |
        echo "$SSH_PRIVATE_KEY" > ssh_private_key && chmod 600 ssh_private_key
        ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@[EC2 Instance IP]
```
6. We need to create a folder in our Github repo called "nginx" and add a Dockerfile and a .conf file for Nginx to use.
The project.conf file will look like this:

```
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com; # REPLACE HERE WITH YOUR DOMAIN NAME

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # REPLACE HERE
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # REPLACE HERE

    include snippets/ssl-params.conf;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_pass http://localhost:5000/;
        proxy_ssl_session_reuse off;
        proxy_set_header Host $http_host;
        proxy_pass_header Server;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }
    location /_stcore/stream { # most important config
        proxy_pass http://[name of Docker container with Streamlit app]:8501/_stcore/stream;
        proxy_http_version 1.1; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_set_header X-Forwarded-Method $request_method;
        proxy_read_timeout 86400;
    }
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;
}

}

Our Dockerfile will be:

```
FROM nginx:1.15.8

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/project.conf /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
```

7. From here, we can add the next step to our Github Actions workflow, which uses the ssh_private_key file we created earlier in the workflow to copy the contents of the /nginx directory to the EC2 instance. We then echo the $IMAGE variable to a file called .env, which will be used in our Docker-Compose workflow to take advantage of the dynamically tagged image in the ECR repository. This .env file is copied over to the EC2 Instance as well. 
```

    - name: Copy files over and deploy environment variable for Docker Compose
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        IMAGE: ${{ steps.build-image.outputs.IMAGE }}
      run: |
        scp -oStrictHostKeyChecking=no -i ssh_private_key -r nginx ubuntu@[EC2 Instance IP]:~
        echo "IMAGE=$IMAGE" > .env 
        scp -oStrictHostKeyChecking=no -i ssh_private_key .env ubuntu@[EC2 Instance IP]:~
```

8. Finally, we can add this final step, which uses a deploy.sh file in our Github repo that we can copy over to the EC2 instance once again and execute within the EC2 instance.
This is the deploy.sh file:

```shell
#!/bin/bash
# remove old image container
docker system prune --all --force

# login to the ecr to get pushed docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 241112547949.dkr.ecr.us-east-1.amazonaws.com
docker-compose --env-file .env up -d
```
And in this final step, we copy a docker-compose.yml file from our repo to the EC2 Instance. The docker-compose.yml will look like something similar to this:

The Docker Compose File
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

Now, we can add this to our Github Actions workflow.
```
    - name: Copy contents of deploy.sh and execute deploy.sh  
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      run: |
        cat deploy.sh | ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254 'cat > ./deploy.sh'
        cat docker-compose.yml | ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254 'bash -c "cat > docker-compose.yml && chmod -R 755 ./deploy.sh && ./deploy.sh"'
```


The entire workflow should look like 

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
        aws-region: $

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REPOSITORY: "charge-buddy"
        IMAGE_TAG: $
      run: |
        # Build a docker container and
        # push it to ECR so that it can
        # be deployed to ECS.
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
  - name: Create SSH key 
      env:
        SSH_PRIVATE_KEY: $
      run: |
        echo "$SSH_PRIVATE_KEY" > ssh_private_key && chmod 600 ssh_private_key
        ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254


    - name: Copy files over and deploy environment variable for Docker Compose
      env:
        SSH_PRIVATE_KEY: $
        IMAGE: $
      run: |
        scp -oStrictHostKeyChecking=no -i ssh_private_key -r nginx ubuntu@34.231.106.254:~
        echo "IMAGE=$IMAGE" > .env 
        scp -oStrictHostKeyChecking=no -i ssh_private_key .env ubuntu@34.231.106.254:~

    - name: Copy contents of deploy.sh and execute deploy.sh  
      env:
        SSH_PRIVATE_KEY: $
      run: |
        cat deploy.sh | ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254 'cat > ./deploy.sh'
        cat docker-compose.yml | ssh -oStrictHostKeyChecking=no -i ssh_private_key ubuntu@34.231.106.254 'bash -c "cat > docker-compose.yml && chmod -R 755 ./deploy.sh && ./deploy.sh"'

```

