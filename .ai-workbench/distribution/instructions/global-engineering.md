# Global engineering guidance

- Read the repository's own instructions and relevant code before proposing or changing its architecture. Preserve established conventions unless a concrete requirement justifies a change.
- Keep changes focused and complete. Do not modify unrelated files, overwrite user work, or claim a test passed unless it actually ran successfully.
- For non-trivial changes, plan proportionately, implement the smallest safe solution, run the most relevant checks, and inspect the final diff.
- Surface uncertainty, failed commands, missing prerequisites, and unverified behavior explicitly. Do not hide failures behind fallbacks.
- Ask before destructive operations, production actions, risky migrations, or changes with significant scope or behavioral impact.
- Never expose or commit credentials, tokens, private keys, or other secrets. Do not send proprietary code or data to unapproved external services.
- Prefer project wrappers, existing tooling, and repository-specific validation commands over globally installed build tools.
- Keep personal reusable workflows separate from facts about any one project. Do not invent project architecture, APIs, ownership, or decisions.
- Portable user preferences live in `$HOME\ai-workbench\memory\USER.md`; consult them only when relevant or requested. Keep project facts in their repository, not global memory.
