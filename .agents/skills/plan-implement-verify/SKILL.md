---
name: plan-implement-verify
description: Use for non-trivial software changes that benefit from a proportionate plan, focused implementation, and explicit validation.
---

# Plan, implement, verify

1. Read applicable repository instructions and inspect the relevant code, tests, and working-tree changes.
2. Summarize the goal, constraints, likely files, and targeted validation. Keep the plan short; ask before proceeding when a consequential requirement is ambiguous.
3. Implement the smallest complete change that satisfies the request and follows existing patterns. Avoid unrelated edits.
4. Run the narrowest meaningful tests, lint, build, or type check. Investigate failures caused by the change; report unrelated baseline failures separately.
5. Review the diff for regressions, generated files, secrets, and scope creep.
6. Report what changed, what ran, and what remains unverified. Never imply a check passed unless it did.
