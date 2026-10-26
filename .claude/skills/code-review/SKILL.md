---
name: code-review
description: Use to review a code diff or proposed change for concrete, actionable defects without rewriting it.
---

# Code review

1. Read the change and enough surrounding implementation, tests, and requirements to establish expected behavior.
2. Prioritize actionable defects: incorrect behavior, regressions, data loss, security boundaries, compatibility, and missing validation.
3. Report only findings with concrete evidence. For each finding, give severity, file and line, the triggering case, and its impact.
4. Distinguish confirmed issues from questions and avoid style-only comments.
5. If no material issue is found, say so and mention important coverage gaps. Do not modify the code unless asked.
