---
name: graphify-codebase
description: Build or query a Graphify knowledge graph when a repository is large or its relationships are hard to trace with focused search.
---

# Graphify codebase

Use Graphify only when a code graph is likely to save repeated navigation or clarify relationships across a substantial codebase. For a small, direct lookup, use focused search instead.

## Existing graph

If `graphify-out/graph.json` exists, ask a focused question with a bounded result:

```text
graphify query "How does the request reach the persistence layer?" --budget 800
graphify explain "RelevantSymbol"
graphify path "SourceSymbol" "TargetSymbol"
```

Verify important relationships against the source. Treat inferred edges as hypotheses.

For an explicit request to refresh a code graph, `graphify update <path>` re-extracts code and updates the graph without LLM processing. It writes generated data under `graphify-out/`; do not overwrite or delete existing graph data without checking its status and the user's intent.

## Building a graph

The installed CLI does not expose a first-build command. Graphify's separate `/graphify <path>` agent skill provides the initial extraction workflow; its assistant registration is not performed by this workbench. If the user wants that integration, review its behavior and check that `$HOME\.agents\skills\graphify` does not contain user work before opting in with `graphify install --platform agents`. Do not run that installer or build a graph automatically. The full workflow can process documents and media through a model-backed service, which may transmit repository content and incur usage costs; confirm the supported local-only scope and user approval first.

Do not install Graphify hooks, MCP servers, assistant plugins, or project configuration without being asked. Mention when a graph is stale, partial, or does not support a language. Do not rebuild a current graph without a reason.
