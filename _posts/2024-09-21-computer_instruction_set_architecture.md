---
layout: post
title: The Evolution of Instruction Set Architecture
categories: Technical
date: 2024-08-21
hidden: True
---

Welcome to part 2 of my series on Computer Architecture and Organization. In the [first part](https://elizabethwillard.github.io/computer_organization_and_instruction_set_architecture/), we covered the difference between instruction set architecture types like RISC and CISC, computer organization principles like Von Neumann and Harvard. We will now dive into the historical evolution of ISAs. 

ARM, as discussed in the last post, is one of the dominating ISAs on the market currently available.


#### so what about x86?
x86 refers to the 16-bit and 32-bit instruction set architecture from a processor family that began with Intel 8086, hence the "86". "x86" can refer to members of this family as shorthand. x86 as an instruction set architecture is a CISC configuration with only 8 registers. 

From the base x86, the x86-64 came next. AMD64 was the processor architecture specification that extended the x86 processor and instruction set to 64-bits. AMD then released the Opteron, an AMD64 processor. Intel also developed an AMD64-compatible architecture called Xeon. Because of this, the architecture was called x86-64, then shortened to x64. Because x64 is a 64-bit extension of the 32-bit x86architecture, then most software written for user-mode applications in 32-bit should execute without modification in a processor running in 64-bit mode. 

