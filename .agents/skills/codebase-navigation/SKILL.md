---
name: codebase-navigation
description: Navigate repositories with focused search, structural queries, symbol indexes, and compact summaries to reduce unnecessary file reads and context use.
---

# Codebase navigation

Use the smallest tool that answers the question. Do not dump whole repositories or large files into context.

## Search workflow

1. Read the repository's instructions and identify its languages and existing search tools.
2. Find candidate paths first, then search only relevant file types and folders:
   - `rg --files -g "*.java" -g "*.kt" -g "*.ts" -g "*.tsx" -g "*.js"`
   - `rg -n -g "*.java" "TargetSymbol|relatedTerm" src`
3. Bound output with narrow globs and ripgrep options such as `-m 3`; inspect only the relevant ranges after finding a match.
4. Prefer `ast-grep` (`sg`) for syntax-aware searches when whitespace, nesting, or exact syntax matters. Check `sg --help` for the installed CLI's current syntax.
5. Use `fd` to locate paths by name and `ctags` when a symbol index is more useful than repeated text searches. Check each tool's help for project-appropriate options.
6. Use `jq` to select fields from JSON rather than printing whole API or configuration responses. Use `tokei` for a compact language/file-size overview when repository shape matters.
7. Use `fzf` only for interactive selection in a terminal; do not require it for non-interactive tasks.

Prefer direct symbol references, short excerpts, and explicit file paths in reports. Explain when a search was incomplete because of generated, ignored, or unsupported files. Do not treat a navigation result as proof that every implementation or call site was found.
