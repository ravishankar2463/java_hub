---
name: systematic-debugging
description: Use when diagnosing a reproducible bug, failed test, unexpected behavior, or environment issue before choosing a fix.
---

# Systematic debugging

1. Capture the exact symptom, reproduction steps, expected behavior, and available logs.
2. Read the affected code and trace the execution path; reproduce with the smallest relevant command when safe.
3. Form a specific hypothesis and check it against evidence before changing code.
4. Find the root cause rather than masking the symptom. Preserve useful diagnostics and report errors explicitly.
5. Add or update a focused regression test when appropriate, then run it and the narrowest related checks.
6. Inspect the diff and report confirmed facts separately from remaining hypotheses.
