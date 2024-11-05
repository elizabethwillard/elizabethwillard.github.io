---
layout: post
title: The Evolution of Instruction Set Architecture
categories: Technical
date: 2024-08-21
hidden: True
---

Welcome to part 2 of my series on Computer Architecture and Organization. In the [first part](https://elizabethwillard.github.io/computer_organization_and_instruction_set_architecture/), we covered the difference between instruction set architecture types like RISC and CISC, computer organization principles like Von Neumann and Harvard. We will now dive into the historical evolution of ISAs, and how the taxonomic classification of a processor as being RISC or CISC is no longer truly applicable to processors of today. 

ARM, as discussed in the last post, is one of the dominating ISAs on the market currently available, but it leverages RISC. What about CISC-friendly ISAs?


#### x86
x86 refers to the 16-bit and 32-bit instruction set architecture from a processor family that began with Intel 8086, hence the "86". "x86" can refer to members of this family as shorthand. x86 as an instruction set architecture is a CISC configuration with only 8 registers. 

From the base x86, the x86-64 came next. AMD64 was the processor architecture specification that extended the x86 processor and instruction set to 64-bits. AMD then released the Opteron, an AMD64 processor. Intel also developed an AMD64-compatible architecture called Xeon. Because of this, the architecture was called x86-64, then shortened to x64. Because x64 is a 64-bit extension of the 32-bit x86 architecture, then most software written for user-mode applications in 32-bit should execute without modification in a processor running in 64-bit mode. 


#### RISC-V

RISC-V is an open-source specification for a RISC processor. There are a multitude of extensions that can be applied to this ISA to support a wide breadth of applications. Open source RISC-V would allow more RISC-V processors to come onto the market. 



Certainly, I'll elaborate on section 4: Modern ISA developments. This section will cover the significant advancements in instruction set architectures in recent years.

Modern ISA Developments

The landscape of instruction set architectures has evolved significantly in recent years, driven by technological advancements and changing computational needs. Here are some key developments:
a) x86-64 (AMD64):

Introduced by AMD in 2003
64-bit extension of the x86 architecture
Backward compatibility with 32-bit x86 code
Widely adopted in personal computers and servers

b) ARM architectures:

ARMv8: Introduced 64-bit computing (AArch64) alongside 32-bit support
Focus on energy efficiency, crucial for mobile devices
Expanding into server and desktop markets (e.g., Apple's M1 chips)

c) RISC-V:

Open-source ISA introduced in 2010
Modular design with a small base ISA and optional extensions
Gaining traction in academia, research, and industry
Potential to disrupt the ISA landscape due to its open nature

d) Vector extensions:

ARM's SVE (Scalable Vector Extension) and SVE2
x86's AVX (Advanced Vector Extensions)
RISC-V's vector extension
Enhance performance for data-parallel applications

e) Specialized instructions:

Cryptography extensions (e.g., AES-NI for x86, ARMv8 Crypto Extension)
Machine learning instructions (e.g., Intel DL Boost, ARM's ML extensions)

f) Hardware-assisted virtualization:

Intel VT-x and AMD-V for x86
ARM Virtualization Extensions
Improve performance and security of virtual machines



The x86 is arguably the only chip available that retains CISC, but in all honesty, as time moves on, the lines between RISC and CISC have become much more blurry. Some have argued that we are in a Post-RISC era, which is something I agree with, as ISAs used today are a mixture of features from both RISC and CISC, or neither. 

ISAs are being designed to leverage diverse computing resources. 
**Additional Resources and References:**
- [Learn about RISC-V](https://github.com/riscv/learn/tree/main?tab=readme-ov-file)

- [Beyond RISC: The Post-RISC Architecture](https://www.cse.msu.edu/~enbody/postrisc/postrisc2.htm)
