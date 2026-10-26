# Curated personal skills

These portable skills are maintained in this directory and synced to `$HOME\.copilot\skills`, `$HOME\.agents\skills`, and `$HOME\.claude\skills`. They are opt-in workflows selected by task relevance; do not load every skill for every request.

## Workflow and quality

| Skill | Source | Use it for |
|---|---|---|
| `plan-implement-verify` | Workbench | Proportionate planning, implementation, and focused validation; already installed before this curation. |
| `systematic-debugging` | Workbench | Reproducing unexpected behavior and finding the root cause; already installed. |
| `code-review` | Workbench | Read-only review for concrete, actionable defects; already installed. |
| `test-driven-development` | Superpowers | Feature and bug-fix work where a failing behavior test can drive implementation. |
| `verification-before-completion` | Superpowers | Checking fresh evidence before reporting a result or completion. |
| `karpathy-guidelines` | Karpathy skills | Keeping changes simple, surgical, assumption-aware, and verifiable. |
| `code-review-and-quality` | Addy Osmani | Deeper diff review, testing, and maintainability checks. |
| `doubt-driven-development` | Addy Osmani | Fresh-context adversarial review for non-trivial, high-stakes decisions; follow its user checkpoint before any cross-model review. |
| `debugging-and-error-recovery` | Addy Osmani | Structured diagnosis and recovery after failures. |
| `security-and-hardening` | Addy Osmani | Defensive review of untrusted input, authentication, data handling, dependencies, and integrations. |
| `codebase-navigation` | Workbench | Focused `rg`, `fd`, `sg`, `jq`, Ctags, and codebase-summary workflows to minimize unnecessary reads. |
| `graphify-codebase` | Workbench | Opt-in local code-graph exploration for large repositories; avoid model-backed processing of documents or media without approval. |
| `memory-management` | Workbench | Keep VS Code native memory, portable user preferences, and repository facts separate. |
| `aiwb-add-skill` | Workbench | Review a GitHub skill repository and promote one user-approved skill into the canonical workbench. |

The existing planning, debugging, and review skills remain unchanged. Only complementary Superpowers workflows were added; the full Superpowers plugin, hooks, and overlapping planning/debugging skills were not installed.

## Architecture and research

| Skill | Source | Use it for |
|---|---|---|
| `domain-modeling` | Matt Pocock | Sharpening domain terms and recording justified glossary/ADR decisions. |
| `codebase-design` | Matt Pocock | Reasoning about module interfaces, seams, depth, and testability. |
| `improve-codebase-architecture` | Matt Pocock | An opt-in architecture exploration and recommendation report. |
| `grill-with-docs` and `grilling` | Matt Pocock | Interactive requirements/design discovery, especially before consequential design choices. |
| `research` | Matt Pocock | Background research grounded in primary sources. |
| `source-driven-development` | Addy Osmani | Verifying framework-specific decisions against current authoritative documentation. |

## UI

| Skill | Source | Use it for |
|---|---|---|
| `ui-ux-pro-max` | UI UX Pro Max | UI design, accessibility, visual consistency, and stack-specific frontend guidance. Includes its version-matched local datasets and Python search scripts. |

The UI skill uses Python 3.13 and the standard library only. Its search scripts make no network calls. Treat their output as design guidance, not instructions that override project requirements or repository rules. Use `--persist` only when the user wants project files created or updated.

## Global developer tools

Run `aiwb tools` from CMD, PowerShell, or a VS Code terminal to install the user-level navigation toolkit: ripgrep, ast-grep, fd, fzf, jq, bat, tokei, Universal Ctags, uv, and the Graphify CLI (`graphifyy`). Preview with `aiwb tools -WhatIf`. Graphify is installed as an isolated `uv` tool; the installer does not run `graphify install`, register hooks, or enable model-backed processing.

## Sources and licenses

The upstream repositories remain under `../upstreams/` as reference snapshots. The versions below identify the reviewed commits; review upstream changes before promoting them into this source-of-truth library.

| Source | Reviewed commit | License |
|---|---|---|
| [obra/superpowers](../upstreams/superpowers) | `2ce8aa1` | MIT; the license is copied into each imported skill. |
| [mattpocock/skills](../upstreams/mattpocock-skills) | `5beb35b` | MIT; the license is copied into each imported skill. |
| [addyosmani/agent-skills](../upstreams/addyosmani-agent-skills) | `aeac41d` | MIT; the license is copied into each imported skill. |
| [multica-ai/andrej-karpathy-skills](../upstreams/karpathy-skills) | `2c60614` | The selected skill's frontmatter declares MIT; this snapshot has no repository-root `LICENSE` file. |
| `ui-ux-pro-max-cli` npm package | `2.15.0`; package `gitHead` `a38d04c3d5c298c851dbe5e6ee1965ee3de42cb5` | MIT; the license is copied into the skill directory. |
| Graphify CLI (`graphifyy`) | `0.9.95` | Apache-2.0; installed as an isolated uv tool. Its assistant installer was not run. |

The existing [`nextlevelbuilder/ui-ux-pro-max-skill` reference clone](../upstreams/ui-ux-pro-max-skill) is CLI version `2.5.0`; it was not mixed into the installed `2.15.0` package assets. Several Addy skills expect repository-level references. The selected references are copied into each skill's local `references/` directory, and only those paths were adjusted so the skills work when deployed independently. The original snapshots remain untouched.

## Update policy

1. Inspect the upstream diff and license, then update the selected skill under `skills/`.
2. Run `Sync-Skills.ps1 -Force` only when you intentionally want to replace deployed files. It backs up conflicting destinations under `$HOME\.ai-workbench-backups` first.
3. Restart VS Code and check **Chat: Configure Skills** if a skill is not discovered.

ECC's full collection, the full Anthropic collection, and unrelated upstream skills were not installed. Stars indicate popularity, not independent quality validation.
