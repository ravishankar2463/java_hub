---
name: cross-project-change
description: Use when a task spans multiple repositories in a multi-root workspace or depends on shared cross-project contracts.
---

# Cross-project change

1. Identify the exact repositories and shared-context documents relevant to the requested change; do not assume every workspace folder is in scope.
2. Read each repository's own instructions, current status, and relevant code before editing. Treat shared context as evidence, not a substitute for repository verification.
3. Trace the affected API, event, schema, or other contract across producer and consumer. State any missing or conflicting contract explicitly.
4. Keep edits isolated to the necessary repositories. Do not commit or modify another project's work without authorization.
5. Run appropriate checks in each changed repository and report results per repository, including integration checks that could not be run.
