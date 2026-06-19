---
layout: post
title: "What Load Forecasters Are Actually Forecasting"
categories: [technical]
date: 2026-05-29
hidden: true
---

If you come from a general data science background and land in the energy space, the domain knowledge required to do load forecasting well is not obvious. "Load" sounds simple — it's electricity demand — but what exactly is being forecast, why, and what drives it is a surprisingly rich topic. This post is a primer on the domain: what kinds of load exist, how forecasting horizons shape the problem, and why certain variables end up in models.

## What Is Load?

In the power systems world, **load** refers to electrical demand — the amount of power being drawn from the grid at any given moment, measured in megawatts (MW) or, over time, megawatt-hours (MWh). At the highest level, load forecasting means predicting this demand before it happens, so that the grid can be operated safely and efficiently.

But "load" isn't monolithic. It aggregates across many different consumers and use cases:

**Residential load** is driven heavily by behavior and comfort. Air conditioning in summer, heating in winter, appliances, lighting. It's highly weather-sensitive and has strong daily and weekly rhythms — mornings and evenings are peaks, weekends differ from weekdays.

**Commercial load** includes offices, retail, hospitality, and other businesses. It's also weather-sensitive (HVAC is a huge driver), but tends to be more clock-driven and less variable than residential. Office buildings ramp up sharply at 9am and drop off in the evening.

**Industrial load** is different in character — factories, data centers, manufacturing. Some of this load is relatively flat and predictable (a facility running 24/7), while other industrial customers have highly variable consumption tied to production schedules. Industrial load is less weather-sensitive than residential or commercial but can be large and hard to forecast around planned outages or shutdowns.

Understanding this composition matters because the mix differs by utility service territory, time of day, and season — and that mix shapes which modeling approaches and features work best.

### Net Load and the Complication of Distributed Generation

Historically, load forecasting meant forecasting gross demand — what's being consumed. But the rise of distributed energy resources (DERs), especially rooftop solar, has introduced an important distinction: **net load**.

Net load is gross demand minus behind-the-meter generation. A house with solar panels draws less from the grid during the day, so from the utility's perspective, the "load" it sees is lower. This creates the famous **duck curve** — a shape in the daily load profile where net load drops sharply in the middle of the day (solar generation peak) and then ramps steeply in the evening when solar falls off but demand stays high.

Forecasting net load requires either forecasting gross load and solar generation separately and subtracting, or modeling net load directly. Both approaches have tradeoffs, and the problem is increasingly important as solar penetration grows.

---

## Forecasting Horizons

The forecasting horizon — how far ahead you're predicting — fundamentally changes the problem, the data used, and what the forecast is for.

**Short-term load forecasting (STLF)** typically covers the next few hours to a few days. This is operational forecasting: grid operators and energy traders need it to dispatch generation resources, manage reserves, and settle energy markets. The inputs are primarily weather forecasts and recent historical load. Accuracy here matters enormously — errors have immediate financial and reliability consequences.

**Day-ahead forecasting** is a specific and important case of STLF. Energy markets clear the day before delivery, so utilities and grid operators must submit supply and demand bids 24 hours in advance. The day-ahead forecast drives procurement decisions worth real money.

**Medium-term forecasting** covers weeks to months. This supports maintenance scheduling, fuel procurement, and capacity planning. Weather uncertainty grows at this horizon, so forecasts are often expressed probabilistically or as scenarios.

**Long-term forecasting** covers years to decades. This is planning-horizon work: how much generation capacity will be needed, where to build infrastructure, what load growth to expect as the economy shifts. Inputs shift from weather to economic indicators — population growth, industrial expansion, electrification of transportation and heating, efficiency trends.

Each horizon uses different model architectures, different features, and serves different stakeholders. A short-term model optimized for day-ahead RMSE is not the right tool for a 10-year capacity expansion study.

---

## The Variables That Drive Load

### Temperature

Temperature is the single most important driver of electricity demand, and understanding *why* is important for building good features.

Demand has a roughly **U-shaped relationship with temperature**: when it's very cold, people heat their homes (increasingly with electric heat pumps); when it's very hot, air conditioning runs hard. In between — the "comfortable" range — demand is lower. The inflection point varies by region. In a southern climate where AC dominates, the curve is asymmetric; the cooling tail is long and steep. In a colder northern climate, heating load is more prominent.

This nonlinearity matters. A linear temperature feature will miss the curvature. Common encodings include:

- **Cooling Degree Days (CDD)**: max(T - 65°F, 0) — a proxy for cooling demand
- **Heating Degree Days (HDD)**: max(65°F - T, 0) — a proxy for heating demand
- Piecewise linear or spline features around the comfort inflection point

**Lagged temperature** also matters. Buildings have thermal mass — a house doesn't immediately respond to a temperature spike. Load at 3pm partly reflects what the temperature was at 8am. Forecasting models that ignore temperature lags underperform.

### Calendar Features

Electricity demand is deeply rhythmic. Time-of-day, day-of-week, and time-of-year effects are among the strongest signals:

- **Hour of day**: Demand peaks in the morning and evening, troughs overnight. The shape of this profile varies by season and customer class.
- **Day of week**: Weekdays have higher commercial and industrial load. Saturdays are intermediate. Sundays are typically the lowest demand day of the week.
- **Seasonality**: Summer and winter peaks, spring and fall troughs (in most of the US).
- **Holidays**: Federal holidays and major cultural holidays (Christmas, Thanksgiving) dramatically suppress commercial and industrial load. Holiday effects need explicit encoding — a model that doesn't know Christmas is coming will overforecast badly.

### Weather Beyond Temperature

Temperature dominates, but other weather variables add explanatory power:

- **Humidity**: Affects perceived heat and AC load. High humidity increases cooling demand at a given temperature.
- **Wind speed**: Affects both perceived temperature and (for renewable-rich grids) generation availability.
- **Cloud cover / solar irradiance**: Directly affects net load (rooftop solar) and influences heating/cooling loads through indirect effects.

### Economic and Structural Variables

For medium- and long-term forecasting, macro variables come into play:

- **GDP and employment**: Industrial and commercial load tracks economic activity.
- **Population and housing growth**: More people, more load.
- **Electrification**: Electric vehicle adoption, heat pump penetration, and electric cooking all shift load upward. Forecasters increasingly need to model adoption curves.
- **Energy efficiency**: Appliance standards, building codes, and efficiency programs push load down over time, partially offsetting electrification growth.

These structural trends are slow-moving but compound significantly over a 10-20 year planning horizon.

---

## How It All Comes Together

A practical short-term load forecasting pipeline typically involves:

1. **Historical load data** as the target variable — usually at hourly resolution, sometimes 15-minute intervals
2. **Actuals and forecasts of weather variables** as inputs — both real-time actuals (for training) and NWP forecasts (for inference)
3. **Calendar features** — hour, day-of-week, month, holiday indicators
4. **Lagged load** — what was demand at this hour yesterday? Last week? Same week last year?
5. **Model training** on historical periods, with careful attention to seasonality — you want the model to have seen both summer and winter peaks

The key modeling challenge is that load has multiple overlapping periodicities (daily, weekly, annual) and that the relationship between weather and load is nonlinear and changes over time as the customer mix and building stock evolve.

---

Load forecasting sits at an intersection of statistics, time series modeling, domain expertise, and operational constraints that makes it a genuinely interesting data science problem. The domain knowledge — knowing that an office building behaves differently than a factory, that humidity matters in Houston but less in Denver, that the week between Christmas and New Year is a unique demand signature — is what separates a good forecaster from a generic ML practitioner applying a generic model.
