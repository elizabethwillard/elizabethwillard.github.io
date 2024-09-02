---
layout: post
title: Understanding Computer Organization and Instruction Set Architecture
categories: Technical
date: 2024-08-02
---

> *“Electronic elements! We can use electronic elements to make gate circuits and combine them into computers! Such computers will be many times faster and take up much less space. I estimate that a small building will be sufficient… At the same time, due to the invention of calculus and the Von Neumann architecture computer, the foundation was set for the quantitative mathematical analysis of the motion of three bodies.”* - Cixin Liu "The Three Body Problem"


I recently just purchased a Macbook Air, which has an M3 chip. After doing some reading on this chip, I wanted to delve into some of the most crucial fundamentals in computer architecture. This blog post delves into the intricate world of instruction set architectures (ISAs), the differences between CISC and RISC, the nuances of von Neumann and Harvard architectures, and the evolution of popular implementations like x86 and ARM. We will also dive into some real-life examples like the M-series from Mac.  Let's begin with some hardware.
### Computer Organization
Computer architecture is the combination of computer organization and instruction set architecture. Computer organization is essentially a high-level blueprint that details on an operational-level how a computing system works. Von Neumann and Harvard are the most common organization principles. 
<img width="743" alt="Screenshot 2024-08-14 at 11 45 28 AM" src="https://github.com/user-attachments/assets/77e9005c-bc92-4b37-8b65-cc93441a15f1">

#### Von Neumann (aka Princeton)

Introduced by John von Neumann in 1945, the von Neumann computer architecture utilized a single-memory approach to both program instructions and data. When memory holds both instructions and data together, this is known as a von Neumann machine. Instructions are executed sequentially, ensuring a linear and orderly process. There is a downside to von Neumann architecture styles though, and that is because of the single-memory location for both instructions and data, which leads to security issues due to exploitation of this vulnerability. 

#### Harvard
A Harvard machine has separate memories for data and program. The program counter points to program memory, not data memory. This separation of program and data memories allows for higher performance of digital signal processing. When processing signals (or streaming data), large amounts will flow through the CPU, and that data must be processed at precise intervals, not when the CPU will allow it.

The traditional definition of a Harvard design can't actually be physically realized. Modern Harvard-architectures are known as a modified-Harvard architecture. 


#### Modified Harvard Architecture:
They have some degree of separation between program instruction and data, which mitigates the effect of security vulnerabilities mentioned in the von Neumann architecture. The goal of the modified Harvard architecture is to loosen the delineation between program instructions and data in memory.

 Initial iterations of the ARM architecture leveraged a von Neumann architecture style, up until ARM7, whereas ARM9 was the first generation that leveraged a modified Harvard architecture. ARM is a load-store architecture; this means that data operands must be loaded into the CPU first, then back to main memory to save the results. and most modern architectures fall under the umbrella of modified Harvard architectures. So how do we actually execute programs on this hardware?
### Instruction Set Architecture

In essence, the instruction set architecture abstracts the hardware layer from the software layer, by providing a language that enables a program to run correctly. 

In other words (and bear with me), let's pretend you have a dog/cat/horse/etc named Harvard. You can give Harvard commands like you would any other pet, as long as they're a single-key word or some other short command. We can map an action to a keyword, like so:
**action:                       keyword:**
retrieval of a ball -> "fetch!"
sitting down        ->  "sit!"

and so-on. 

This mapping of an action to a keyword helps form the foundation of the intuitive understanding we want going into our discussion of instruction set architecture. 

*Instruction set architecture* of a computer defines the interface between software and hardware. Some other examples of ISAs are MIPS and x86. 

When designing a CPU, one of the questions that designers have to ask themselves is "Will the CPU be CISC or RISC?" but what does that mean?

![Pasted image 20240902094158](https://github.com/user-attachments/assets/c9f92efd-ce11-4b31-9463-8ee0768cba1e)


An instruction set architecture is usually classified one of two ways.  

**Complex instruction set computers** (CISC, predecessor of RISC)
- CISC has instructions that are capable of carrying out multiple large operations.
- Very little RAM is needed to store the instructions, but building the complex instructions into the hardware is where most effort goes.
- Attempts to minimize number of instructions per program 
**Reduced instruction set computers** (RISC)
- RISC provides fewer and simpler instructions, so they can be executed in pipelined processors, the instructions should be executed within one clock cycle. 
- Reduces the cycles per instruction at the cost of the number of instructions per program.
	- RISC architectures are optimized to execute individual instructions at very high speed
- RISC provides higher performance per watt for battery operated devices where energy efficiency is key.

Going back to our Harvard-the-pet example, "sit" would be a good example of the kind of instruction that RISC would leverage, as it's a mapping of one action to one keyword. 

"Fetch" is a good example of a CISC instruction because it's a single command that would prompt Harvard into a *series* of actions (Harvard runs to the object -> Harvard picks up the object -> Harvard returns the object). 

Most modern architectures are considered RISC architectures. Advanced RISC Machines (ARM) develops the RISC ISA as a proprietary architecture and they also design computer processors that leverage the ISA, but other companies can license the usage of the RISC ISA from ARM. ARM is not a manufacturer, nor is it a single architecture. ARM is also the colloquial name of a family of RISC architectures that have been developed, which only makes things more confusing. 

The Macbook M1 chip and its next iterations are the proprietary information of Apple, and so most information about them is done through black-box reverse engineering. We do know that the Apple M1 chip has "Firestorm" and "Icestorm" cores, about four of each, respectively. This is what is known as "hetereogenous computing". The instruction set used with the M1 is the ARMv8.5-A, which is another major turning point for the ARM architecture history. ARMv8-A incorporates an 64-bit execution state denoted as AArch64, along with the 32-bit execution state, so existing 32-bit code can run unmodified on 64-bit processors.

 In the next, we'll cover the evolution of ISAs and computer organization. 
 
 **Additional Resources and References:**
 - [Reverse Engineered Microarchitecture Documentation of the Apple M1 Firestorm](https://dougallj.github.io/applecpu/firestorm.html)
-  [Apple M1's 'Small' Icestorm Cores Benchmarked Against 'Big' Firestorm Cores](https://www.tomshardware.com/news/apple-m1-icestorm-delivers)
- Computer Organization and Design: The Hardware/Software Interface by David Patterson and John Hennessy
- [CISV v RISC from Stanford CS](https://cs.stanford.edu/people/eroberts/courses/soco/projects/risc/risccisc/)

----

