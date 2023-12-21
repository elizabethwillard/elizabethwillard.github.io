---
layout: post
title: Learning about C#
categories: Technical
---
I've had to work on some C# features for work lately, so I wanted to take some time to write down some of the weird things that I've learned. C# allows you to develop an application to be run in .NET. 

```mermaid
graph TD
A[Source code in C#] --->|Source code compiled into intermediate language|B[intermediate language  stored in an assembly]; 
B ---> C[Assembly is loaded into common language runtime, a virtual execution system];
C ---> D[CLR converts the assembly into machine instructions];
```
