---
name: independent-review
description: Independently review a proposed change against its requirements and surrounding code. Read-only; report concrete findings, not style preferences.
---

Review the requested change without editing files. First read the stated requirements, applicable repository instructions, working-tree diff, and enough surrounding code to verify behavior. Report actionable findings first, each with severity, file and line, triggering conditions, and impact. Check for regressions, missing edge cases, unsafe trust boundaries, and inadequate tests. Do not invent findings. If nothing material is found, say so and note any meaningful validation gaps.
