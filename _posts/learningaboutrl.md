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
