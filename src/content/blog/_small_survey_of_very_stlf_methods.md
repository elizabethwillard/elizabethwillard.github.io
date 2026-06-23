---
title: "A Small Survey of Very Short-Term Load Forecasting Methods"
description: "Overview of deep learning approaches for very short-term load forecasting using CNN, LSTM, and attention mechanisms."
date: 2026-06-23
draft: false
tags: ["machine-learning", "deep-learning", "forecasting"]
categories: ["technical"]
---

In this study, using a public dataset, we identified the most significant attributes of VSTLF and then trained four end-to-end deep models based on Convolutional Neural Networks (CNN), LSTM and an attention mechanism. Experiments demonstrated that the hybrid model comprised of CNN and Bidirectional LSTM (BiLSTM) outperformed the other models. Moreover, we utilized the Shapley Additive Explanations (SHAP) method to interpret the model and evaluate the feature importance. The contributions of our work are threefold: (1) we understand and predict a very short power load with high performance and achieve state-of-the-art; (2) the hybrid model, BiLSTM and CNN without any attention mechanism, is validated to be effective and efficient in Very Short-Term power Load Forecasting, and (3) we rank feature significances with the SHAP method, which may shed light on future power scheduling.

 The driving force behind this phenomenon is that they can provide powerful nonlinear modelling capabilities by cascading multiple hidden layers; hence, they can more effectively fit complex correlations across time, weather, and seasonal attributes

![paper_models](/images/figure/lstm_paper_overview1.png)

## Datasets Used:
 - Real Load History
- 3 Cities 
- January 2015 - June 2020
- Once per hour
    - 48048 samples no missing values
- 16 attributes:
    - nat_demand (load history)
    - temperature per city
    - humidity per city
    - wind speed per city 
    - precipitation per city 
    - school
    - holiday_IS
    - holiday
y (nat_demand) = holiday + holiday_IS + school + precipitation_per_city + humidity_per_city + historical_nat_demand + temperature_per_city

Pearson Correlation Analysis to evaluate every individual attributes contribution to power demand in the entire dataset 

Normalization of features:
- Different features have different ranges so they normalize them so all features are on the same interval which accelerates model convergence 
- Smooths the optimization curve to prevent it from being trapped in local optima 
- [0,1] target range 

Modeling Direction:

- Bidirectional models based on the CNN, LSTM, and attention mechanism 

## BiLSTM
- Bidirectional Long Short-Term Memory network model 
- Can model both long-term and short-term correlations simultaneously 
- long-run attributes: precipitation and school (why is school a long-run attritbute?)
- short-run attributes: temperature and wind speed
Three Layers:
1. Input Layer:
    - Accepted preprocessed time-series load data and computes value through timing weight matrices 
2. LSTM Cells accept input layer value computations
    - Notably, each LSTM cell undergoes an iterative process to update the hidden state of load demand / hour  
 ![bilstm_cell](/images/figure/bilstm_cell.png)
3. Ouput Layer:
    - Fully connected linear layer     
Between 2 and 3, a Bahdanau attention layer is inserted in between these.
- Calculates attention between using linear transformations and nonlinear operations 
- Used to weigh the sum of hidden state values, so the model can better understand the correlation between different parts of the input sequence and adjust the model's predictive output accordingly 

```
Initialize in_channels, out_channels, hid-den_si-ze, num_layers,  output_size, batch_size, seq_length, all weight matrices and biases
Set num_directions = 2
Add a linear layer
Set an attention_net function
Permute the input sequence
Pass the input through a convolutional layer
Permute the input sequence
Initialize hidden states and cell states
Permute the LSTM output
Calculate the attention context based on the attention-net function
Pass the context through linear layer
Input short-term electricity load data
Train the model
Validate and predict power demand
```