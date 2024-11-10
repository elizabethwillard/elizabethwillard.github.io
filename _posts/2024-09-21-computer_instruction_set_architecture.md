---
layout: post
title: The Evolution of Instruction Set Architecture
categories: Technical
date: 2024-11-10
hidden: False
---

Welcome to part 2 of my series on Computer Architecture and Organization. In the [first part](https://elizabethwillard.github.io/computer_organization_and_instruction_set_architecture/), we covered the difference between instruction set architecture types like RISC and CISC, computer organization principles like Von Neumann and Harvard. We will now dive into the historical evolution of ISAs and their respective processors into their most current processor architectures, x64 and RISC-V, and how the taxonomic classification of a processor as being RISC or CISC is no longer truly applicable to processors of today.

ARM, as discussed in the last post, is one of the dominating ISAs on the market currently available, that leverages RISC, but is facing fierce competition from RISC-V. What about CISC-friendly ISAs?

## x86 and x64

#### x86
x86 refers to the 16-bit and 32-bit instruction set architecture from a processor family that began with Intel 8086, hence the "86". "x86" can refer to members of this family as shorthand. x86 as an instruction set architecture is a CISC configuration with only 8 registers. Later iterations of Intel processors drop the numeric naming and receive names like Pentium, Core, Xeon, and so forth. x86 processors nowadays will boot into the 16-bit operating mode of the original Intel 8086, which is known as real mode. Real mode has commpatability with software written for the Intel 8086, but normally, this model is used as a bootloader into a protected mode operating system. 


#### x64 
From the base x86, the x86-64 came next. AMD64 was the processor architecture specification that extended the x86 processor and instruction set to 64-bits. AMD then released the Opteron, an AMD64 processor. Intel also developed an AMD64-compatible architecture called Xeon. Because of this, the architecture was called x86-64, then shortened to x64. Because x64 is a 64-bit extension of the 32-bit x86 architecture, then most software written for user-mode applications in 32-bit should execute without modification in a processor running in 64-bit mode. 



## ARM 

ARM architecture defines a wide variety of RISC processors that are applicable in many use-cases. These processors are usually desired for designs where high-performance, low power consumption, and small size are needed, such as smartwatches, phones, tablets, etc. 

#### 32-bit ARM

32-bit ARM encompasses architectures like ARMv7. The popularity of ARM instruction sets in cell phones and other small devices originates with the selection of the AM 6502, which was the 16-bit microprocessor, for the wildly unsuccessful Apple Newton PDA. 

#### 64-bit ARM

The 64-bit verison of ARM is known as AArch64 or ARMv8 and has a corresponding instruction set known as A64. Because the 64-bit instruction set is an expansion of the 32-bit instruction set, 32-bit code is backwards compatible with the 64-bit processor. ARMv8 will be found in most modern small-computing devices found today. 
Modern ARM processors support ARM as an instruction set, and many also support a variable-length instruction set called T32 (The 'T' stood for Thumb) which is valuable in situations where memory is scarce. instruction sets and can even switch between the two. 

Windows has recently announced the ability to run devices with ARM-processors. 

#### RISC-V

One of the biggest developments in processor architecture and instruction set development is the creation of RISC-V, which was announced in 2014. The RISC-V project wanted to incorporate 'lessons learned' from years of processor design and be used for a wide breadth of applications from micro-devies to cloud server multiprocessors. RISC-V processors are used in artificial intelligence, embedded systems, IoT Edge processing and more. 

RISC-V is an open-source specification for a RISC processor. There are a multitude of extensions that can be applied to this ISA to support a wide breadth of applications. Open source RISC-V would allow more RISC-V processors to come onto the market. In comparison, x86 and ARM are both proprietary architectures. 

The base RISC-V is a 32-bit processor with 31 general-purpose registers, meaning all instructions are 32 bits long. 

Most high end and portable devices are designed around processors that use ARMv8-a. While RISC-V isn't utilized by personal desktop CPUs, there's always the possibility these could be developed in the future, especially if more tech companies become more interested and involved. 


**Additional Resources and References:**
- [Learn about RISC-V](https://github.com/riscv/learn/tree/main?tab=readme-ov-file)

- [Beyond RISC: The Post-RISC Architecture](https://www.cse.msu.edu/~enbody/postrisc/postrisc2.htm)
can

- [Windows on ARM](https://learn.microsoft.com/en-us/windows/arm/overview)

- Modern Computer Organization and Architecture, Jim Ledin

- Computer Organization and Design RISC-V Ed.,John Hennessey and David Patternson