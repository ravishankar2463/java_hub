# GitHub Copilot project instructions

- First inspect this repository's instructions, relevant code, tests, and working-tree changes. Follow `AGENTS.md` and any more specific project guidance.
- Determine the actual language, frameworks, and versions from project files; do not assume this repository uses the same stack as another project.
- Preserve established conventions and use the project's documented commands and build wrappers.
- Make focused, complete changes. Avoid unrelated files and preserve existing user work.
- For non-trivial changes, plan proportionately, implement, run the most relevant checks, and inspect the final diff.
- Report checks that ran, their results, and anything that remains unverified. Never claim success without fresh evidence.
- Ask before destructive operations, production actions, migrations, or materially ambiguous changes.
- Do not expose or commit secrets. Treat user input and external data as untrusted.
- Select relevant skills from `.github/skills/`; do not load the entire collection for every task.
- Keep project-specific architecture and decisions in this repository, not in user-level instructions.
