---
layout: post
title: An Overview of Reinforcement Learning with Human Feedback
categories: Technical
date: 2024-01-04
---

### Introduction
After reading Cathy O’Neil’s book Weapons of Math Destruction. I wanted to learn more about machine learning techniques being used to mitigate and improve ethical and bias-related concerns for LLMs. Reinforcement learning with human feedback has become one of the major methods for accomplishing this. More importantly, proximal policy optimization (PPO), an algorithm developed by OpenAI, has become one of the forerunners to accomplishing this. I wanted to start to build an understanding by beginning at the fundamentals and working up to the context of PPO.


A policy ($\pi$) maps input states (s) to predicted actions (a), and utilizes a reward function (R ) to generate rewards (r ) that correspond to a state in order to improve the policy. 
![image](https://github.com/elizabethwillard/elizabethwillard.github.io/assets/57194659/d8dcc8be-0977-4a76-aee7-2c65761fe0ff)
The reward function is a generalized loss function, as it does not need to be differentiable like a loss function would. 

### What makes a policy a policy gradient?
Instead of predicting a single action for each state, the policy predicts a probability distribution of actions for a particular state. The rewards can then be used to change this distribution by up-weighting an action probability proportionally to the reward, which subsequently down-weights all other actions. We use the following equation to measure the performance of the policy and maximize it using gradient ascent. 

$$J(\pi) = \frac{1}{|S|}\sum_{(s,a)\epsilon S}{R(s,a)\Delta_{\pi}\pi(a|s)}$$

### What makes a policy "on-policy"?


A policy model is “on-policy” when the policy being evaluated to generate predictions is the same policy that incorporates the reward value generated so it can improve predictions. The policy collects data which is then stored in data-in temporary buffers, before finally being cleared at the beginning of the next training iteration. 


The vanilla on-policy policy gradient algorithm is known as REINFORCE. 

### REINFORCE

Let’s take a moment to “zoom out”. Let us consider the idea of a policy gradient for chess, we can assign numerical values to the possible outcomes of the chess game. Let's say that 1 will be victory, whereas -1 is a defeat, and 0 is a draw. If an action leads to victory, then the policy gradient will upweight it, and if an action leads to defeat, the policy will subsequently downweigh it. As this is "on policy" the data is being actively collected, therefore the state and actions are not sampled uniformly from our dataset in question. 

By utilizing a Monte Carlo sample of the observed rewards, but this estimation of the Q-function leads vanilla REINFORCE policy gradients to have high variance because future returns reinforce current actions, even when future actions are responsible for the resulting rewards. 

On-policy learning also means that data cannot be re-used, leading to a problem known as sample inefficiency. This sample inefficiency means that the policy will take a very long time to learn simple tasks.  


### Proximal Policy Optimization:

In light of these deficiencies with policy algorithms, Schulman et al. 2017 developed a new set of policy methods known as Proximal Policy Optimization or PPO. 
The big idea behind PPO is that we will avoid large policy updates. By taking a ratio of how much the current policy is different from the prior one, the current policy will not deviate too strongly from the old policy. We need to "clip" the ratio, by constraining how large it can be. 

We can then incorporate RLHF, by creating a reward model for the PPO algorithm to use. This reward model will be built off of human labelers of outputs from the LLM model in question. For a given prompt, this human ranking of outputs is known as the "reward". The policy will also generate an output, and this will be compared to the reward. The comparison will be used in the PPO algorithm to update the policy. Using RLHF, the model is unlikely to learn new behavior since it will only be able to reinforce behavior that the model generates already. 


#### Further Reading:
- Ready-to-use Reinforcement Learning Agents: https://github.com/cyoon1729/RLcycle
- A simple PPO Implementation: https://github.com/ericyangyu/PPO-for-Beginners
