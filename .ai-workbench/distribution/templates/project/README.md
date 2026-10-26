# AI project setup

This project was initialized from the personal AI Workbench. Portable skills are copied into:

- `.github/skills/` for GitHub Copilot and the VS Code Codex integration.
- `.agents/skills/` for VS Code and Codex-compatible agents.
- `.claude/skills/` for Claude Code.

Project instructions live in `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md`. Keep project architecture, APIs, and decisions here; do not add proprietary project facts to global user instructions.

From any terminal, run `aiwb updateSkills` at this project root to add newly selected workbench skills without changing project instructions. Existing skill files are preserved by default. Use `aiwb updateSkills -Force` only when you intend to replace conflicting skill files; overwritten files are backed up under `$HOME\.ai-workbench-backups\projects`.

Run `aiwb init` only when initializing a new project or when you also want to add/update the project's AI instructions.

If AI skills do not appear in VS Code, open the project and run **Chat: Configure Skills**.
