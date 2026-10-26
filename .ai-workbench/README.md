# AI project setup

This project was initialized from the personal AI Workbench. Portable skills are copied into:

- `.github/skills/` for GitHub Copilot and the VS Code Codex integration.
- `.agents/skills/` for VS Code and Codex-compatible agents.
- `.claude/skills/` for Claude Code.

Project instructions live in `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md`. Keep project architecture, APIs, and decisions here; do not add proprietary project facts to global user instructions.

For an initialized project, run `aiwb updateSkills` to add newly selected skills without changing project instructions. Existing files are preserved by default. Use `aiwb updateSkills -Force` to refresh existing skill files after backing them up.

Run `aiwb update` to install missing workbench tools, then refresh managed global instructions, agents, and skills. Tools already available are skipped; existing tool versions are not upgraded. Replaced workbench files are backed up under `$HOME\.ai-workbench-backups`.

To add a reusable skill from GitHub, use the `aiwb-add-skill` skill or Copilot agent to review the repository, license, and candidate skill first. After approval, run `aiwb add skill https://github.com/owner/repo -SkillPath path/to/skill`. The importer copies tracked files into the canonical workbench without executing them and syncs the skill to the user-level agent directories. Use `aiwb updateSkills` in projects that should receive it.

If AI skills do not appear in VS Code, open the project and run **Chat: Configure Skills**.

## Set up another Windows machine

Clone or extract this repository, then run `.ai-workbench\Setup-AIWorkbench.bat` from CMD or `.ai-workbench\Setup-AIWorkbench.ps1` from PowerShell at the repository root. Setup installs the workbench, user-level AI instructions/skills, selected VS Code AI extensions, missing tools from the workbench's tool list, and the selected global MCP servers. Existing tools are skipped. Preview with `.ai-workbench\Setup-AIWorkbench.ps1 -WhatIf`; use `-SkipExtensions`, `-SkipTools`, or `-SkipMCP` to omit those setup phases. Existing files are preserved unless `-Force` is supplied, which backs them up before replacement.

## Global MCP servers

`aiwb mcp -WhatIf` previews the selected global MCP setup; `aiwb mcp` configures it for VS Code Copilot, Codex, and Claude Code. It creates/updates a Docker MCP Toolkit profile named `aiwb` with the official GitHub, Context7, Docker Docs, and Docker Hub integrations, and adds the local Git MCP server. The same Docker gateway is configured in all three clients. Existing MCP entries are preserved, and modified JSON configs are backed up under `$HOME\.ai-workbench-backups\mcp`.

Docker Desktop 4.62 or later with MCP Toolkit is required; Docker Desktop is not installed by this workbench. `uvx` is used to launch the Git server, and `aiwb tools` installs its `uv` runtime if missing. Git's server is pinned to `mcp-server-git==2026.10.19`; the publisher labels it early-development, and it exposes write operations such as staging, commits, and branch changes. It can access repositories the current Windows user can access, so review/approve any operation that changes repository state. No local Docker-daemon-control MCP server is enabled.

GitHub and Context7 may request authentication through Docker Desktop MCP Toolkit. After setup, restart the AI clients and verify MCP connections in each client. Use `aiwb mcp` again to add missing profile/config entries; it does not remove existing servers or overwrite same-named client entries.

Official references: [VS Code MCP servers](https://code.visualstudio.com/docs/agent-customization/mcp-servers), [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [Claude Code MCP](https://code.claude.com/docs/en/mcp), [Docker MCP Toolkit CLI](https://docs.docker.com/ai/mcp-catalog-and-toolkit/cli/), [GitHub MCP Server](https://github.com/github/github-mcp-server), [Context7 clients](https://context7.com/docs/resources/all-clients), [Git MCP reference](https://github.com/modelcontextprotocol/servers/tree/main/src/git).
