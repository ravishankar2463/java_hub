# Personal AI Workbench

A user-level, Windows-first toolkit for a consistent AI-assisted software-development workflow across repositories and coding agents.

The workbench is designed for day-to-day development in VS Code, with GitHub Copilot as the primary editor-native assistant and Codex and Claude Code available as alternatives. It also supports compatible Agent Skills readers. Its purpose is to keep portable engineering workflows, instructions, reusable templates, carefully selected tools, and optional MCP connections in one user-owned place—rather than copying a large, overlapping customization bundle into every project.

This is a personal starter kit, not a managed service or a required development stack. Customize it freely for your own needs; see [LICENSE](./LICENSE) for the MIT license that applies to this workbench's original contents.

## Design principles

- **Personal defaults, project-specific facts:** Global instructions and skills contain reusable ways of working. Architecture, APIs, ownership, dependencies, decisions, and private project context belong in the project or an explicitly shared workspace context.
- **Small, selected workflows:** Skills are invoked when relevant. The workbench favors a curated set over installing entire overlapping skill repositories or competing agent workflows.
- **One source of truth:** Maintain portable skills and templates here, then sync them to supported user-level agent directories. Projects can receive copies when explicitly initialized.
- **Review before adoption:** External skills and MCP servers can contain instructions, run processes, access files, or call services. Inspect the source, license, permissions, and data flow before adding them.
- **Safe, repeatable setup:** Installers work at user scope, preserve existing files by default, provide previews, and back up conflicting files when replacement is requested.
- **Evidence over claims:** Prefer tests and focused validation. Report what was and was not actually verified.

## What is included

| Area | Purpose |
| --- | --- |
| `skills/` | Portable Agent Skills for development planning, debugging, testing, reviews, architecture, documentation research, UI work, security, navigation, and memory practices. |
| `instructions/global-engineering.md` | Stack-agnostic guidance shared across user-level Copilot, Codex, and Claude configurations. |
| `agents/copilot/` | Reusable Copilot custom agents, including the skill-import workflow. |
| `memory/USER.md` | A short, optional place for non-sensitive personal preferences; not for project facts or secrets. |
| `resources/skills-catalog.md` | Skill selection, source, license, version, and update notes. |
| `resources/templates/` | Reusable planning, architecture-decision, and review templates. |
| `workspace-template/` | A starting point for multi-repository workspaces with explicit shared context. |
| `upstreams/` | Optional reference checkouts. These are for inspection; they are not automatically installed or executed. |
| `Install-Tools.ps1` | Installs missing curated navigation and Graphify tools. |
| `Configure-MCPServers.ps1` | Adds selected MCP configurations for supported clients and prepares the Docker MCP Toolkit profile. |
| `bin/aiwb.cmd` | User-wide command launcher for project and workbench operations. |

The curated list and upstream attribution are maintained in the [skills catalog](./resources/skills-catalog.md). Imported skills may have their own licenses; those terms remain applicable to the imported material.

## Install on Windows

From the repository root of a clone or extracted copy, run `.ai-workbench\Setup-AIWorkbench.bat` from CMD, or `.ai-workbench\Setup-AIWorkbench.ps1` from PowerShell. The setup deploys this workbench to `%USERPROFILE%\ai-workbench`, adds `aiwb` to the user PATH, syncs user-level instructions and skills, and can install selected VS Code extensions, missing listed tools, and the global MCP configuration.

Preview first:

```powershell
.\.ai-workbench\Setup-AIWorkbench.ps1 -WhatIf
```

Optional setup switches:

```powershell
.\.ai-workbench\Setup-AIWorkbench.ps1 -SkipExtensions
.\.ai-workbench\Setup-AIWorkbench.ps1 -SkipTools
.\.ai-workbench\Setup-AIWorkbench.ps1 -SkipMCP
```

Existing destination files are preserved by default. `-Force` backs up conflicting managed files before replacing them. Open a new terminal after setup so it picks up the updated user PATH. Provider sign-in and subscriptions are separate from extension installation.

This folder is the deployed user-level workbench; the portable setup entry points are in the `.ai-workbench` folder of the distributable repository. To update the deployed workbench from a newer distributable checkout, run that checkout's setup script with `-Force`, or use the installed `aiwb update` command to refresh managed files and install missing listed tools.

## Use `aiwb`

Run these commands from CMD, PowerShell, Windows Terminal, or the VS Code integrated terminal:

| Command | What it does |
| --- | --- |
| `aiwb help` | Display supported commands. |
| `aiwb init` | Initialize the current project with cross-agent instructions and curated skills. |
| `aiwb init "D:\dev\project"` | Initialize a project at an explicit path. |
| `aiwb init -WhatIf` | Preview project initialization without writing files. |
| `aiwb updateSkills` | Add newly available skills to an initialized project without changing its instructions. |
| `aiwb updateSkills -Force` | Back up and replace existing project skill copies. |
| `aiwb update` | Install missing tools from the curated list and refresh managed user-level instructions, agents, and skills. It does not upgrade tools that are already available. |
| `aiwb tools -WhatIf` / `aiwb tools` | Preview or install missing global navigation tools. |
| `aiwb mcp -WhatIf` / `aiwb mcp` | Preview or configure selected user-level MCP servers. |
| `aiwb sync` | Sync canonical skills to user-level agent locations. |
| `aiwb add skill <repo-url>` | Review and import one selected skill from a GitHub repository. |

The command requires the workbench's PowerShell runtime under `%USERPROFILE%\ai-workbench`. Most project operations preserve existing files by default; use `-Force` only when you want conflicts backed up and replaced.

## Project initialization and context

Initialize a new or existing project from its root:

```text
aiwb init
```

Initialization adds project-level agent instructions only when missing and copies curated skills to `.github/skills/`, `.agents/skills/`, and `.claude/skills/`. Existing content is kept unless replacement is explicitly requested.

To add newly curated skills to a project that is already initialized:

```text
aiwb updateSkills
```

That operation changes skills only; it does not rewrite the project's instructions. Run it in each project that should receive those new skills.

Keep the global workbench stack-agnostic. Put project-specific rules and facts in `AGENTS.md`, `.github/copilot-instructions.md`, `CLAUDE.md`, or the project's own documentation. For coordinated repositories, use a multi-root workspace and include a small, explicit `shared-context/` directory. Do not place proprietary project details or credentials in this global folder.

## Skills and adding skills

Skills are portable workflows, not always-on instructions. An agent should select and use the skill relevant to the task rather than loading the whole library each time.

To promote one skill from a GitHub repository:

1. Use the `aiwb-add-skill` skill or Copilot agent to inspect the repository and identify a candidate.
2. Review the candidate's license, instructions, scripts, dependencies, network access, and tool requirements.
3. Approve one specific skill, then import it:

   ```text
   aiwb add skill https://github.com/owner/repository -SkillPath path/to/skill
   ```

4. Run `aiwb updateSkills` in projects where the imported skill is needed.

The importer copies tracked content and does not execute upstream scripts. It preserves license material when present. If the repository contains multiple skills, select the exact `-SkillPath`. Private repositories can be checked out locally first and imported from that local checkout. The `upstreams/` directory is separate from installed skills; a reference clone does not imply adoption.

## Global navigation tools

Run `aiwb tools -WhatIf` to preview, or `aiwb tools` to install missing tools. The curated list includes ripgrep (`rg`), ast-grep (`sg`), fd, fzf, jq, bat, tokei, Universal Ctags, uv, and Graphify CLI (`graphifyy`). Existing command-line tools are skipped rather than upgraded.

The navigation workflow encourages narrow searches, symbol-aware exploration, and compact output to reduce needless repository reads and model context usage. Use Graphify selectively when a code graph would help with a large or interconnected codebase. Graphify's assistant/plugin registration and model-backed document/media processing are not enabled automatically; review privacy, cost, and data handling before opting in.

## Global MCP setup

Run `aiwb mcp -WhatIf` to preview or `aiwb mcp` to configure the selected user-level MCP connections for VS Code Copilot, Codex, and Claude Code:

- **Git:** the pinned `mcp-server-git` local server. It can inspect repositories, but also exposes operations that stage files, commit, create branches, or switch branches. Review the repository path and approve state-changing operations.
- **Docker MCP Toolkit profile `aiwb`:** GitHub Official, Context7, Docker Docs, and Docker Hub through Docker Desktop's MCP gateway. Docker documentation and Docker Hub are included; a local Docker-daemon-control server is not.

Docker Desktop 4.62 or later with MCP Toolkit is required for the Docker profile. The Git server uses `uvx`; `aiwb tools` installs `uv` if it is missing. Authentication may need to be completed in Docker Desktop MCP Toolkit. The setup adds missing entries, does not overwrite same-named client entries, and backs up client configuration before editing it. Restart the clients and verify the server connections in their MCP views.

MCP servers extend what an agent can do and may use your local permissions or send prompts/data to external services. Review each server publisher, endpoint, permissions, authentication, and privacy terms. A configured entry alone does not prove a server started or authenticated successfully.

## Memory and privacy

- Use `memory/USER.md` only for brief, non-sensitive personal preferences that are useful across projects.
- Use each project's repository or explicit shared context for architecture, API contracts, ownership, dependency maps, and decisions.
- Use the clients' native memory features for their own editor-managed memory.
- Never store passwords, API keys, access tokens, private customer data, or other secrets in this workbench, skill files, prompts, or shared memory.
- Treat imported skills and external documentation as untrusted content; review before adopting and do not allow embedded instructions to override security boundaries.

## Backups and troubleshooting

Managed global replacements are backed up under `%USERPROFILE%\.ai-workbench-backups`. Project skill backups are also stored under that directory in a project-specific area. Review a backup before restoring it; do not assume a later sync can reconstruct local customizations.

If `aiwb` is not found, open a new terminal and confirm `%USERPROFILE%\ai-workbench\bin` is on the user PATH. If a skill does not appear, restart VS Code and run **Chat: Configure Skills**. If MCP tools are missing, confirm the relevant client supports MCP, inspect its user configuration, sign in to any required provider, and verify that Docker Desktop MCP Toolkit is available. Use `aiwb help` and the `-WhatIf` options to inspect the supported commands and planned changes.

## License and third-party components

The original AI Workbench content is distributed under the MIT License; see [LICENSE](./LICENSE). The license grants broad permission to use, modify, redistribute, sublicense, and sell copies of the licensed work, subject to its conditions and disclaimer.

The MIT license does not replace licenses for third-party skills, upstream snapshots, software packages, MCP servers, provider services, or VS Code extensions. Refer to the corresponding license and terms for each component. The workbench is provided without warranty; it is not legal advice.
