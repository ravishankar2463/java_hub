---
name: memory-management
description: Keep cross-project user preferences, VS Code agent memory, and repository-specific facts separate, concise, and user-controlled.
---

# Memory management

- Keep reusable, non-sensitive user preferences in the portable file `$HOME\ai-workbench\memory\USER.md`. Read or update it only when the user asks to apply, review, or change those preferences.
- VS Code's native agent memory is separate, user-scoped, and managed through VS Code Chat. Use its **Remember** behavior and **Chat: Show Memory Files** command; do not invent its storage path or write to its internal files.
- Keep architecture, APIs, dependencies, ownership, and decisions in the relevant repository or an explicitly shared workspace context. Never move project facts into global memory.
- Do not store credentials, private keys, customer data, or proprietary implementation details in user-level memory.
- Keep memory concise and factual. Remove stale or duplicate entries rather than accumulating broad session summaries. Ask before making a substantial or ambiguous memory change.
