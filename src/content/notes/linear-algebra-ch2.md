---
title: "Chapter 2: Matrix Operations and Determinants"
textbook: "Linear Algebra"
date: 2026-06-22
draft: true
tags: ["matrices", "determinants"]
---

## Matrix Operations

### Matrix Multiplication
- Not commutative: AB ≠ BA (in general)
- Associative: (AB)C = A(BC)
- Time complexity: O(n³) for n×n matrices (standard algorithm)

### Determinant
- Scalar value associated with a square matrix
- Non-zero determinant means the matrix is invertible
- Represents the volume scaling factor of the transformation

### Inverse Matrix
- A⁻¹ such that AA⁻¹ = I
- Exists only if det(A) ≠ 0
- Used to solve Ax = b → x = A⁻¹b

## Computational Notes

- Efficient matrix multiplication is active research area (Strassen's algorithm: O(n^2.81))
- Computing determinants directly can be numerically unstable
- LU decomposition is more stable for solving systems
