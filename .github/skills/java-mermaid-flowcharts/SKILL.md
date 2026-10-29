---
name: java-mermaid-flowcharts
description: Create, improve, or validate Mermaid flowcharts for Java lessons and technical articles. Use to explain Java control flow, algorithms, object or resource lifecycles, exception paths, and other processes where branching or sequence matters.
---

# Java Mermaid Flowcharts

Create flowcharts that make a Java concept easier to understand. The diagram must reflect the described Java behavior, work with this repository's Mermaid renderer, and remain readable in the article.

## Workflow

1. Read the surrounding explanation and Java example. Confirm the Java version and the exact behavior being diagrammed; do not infer missing semantics.
2. Decide whether a flowchart adds value. Use one for decisions, loops, lifecycle steps, or alternate/error paths, not for decoration or to repeat a simple paragraph.
3. List the meaningful steps, decisions, entry and exit points, and exceptional paths before writing Mermaid.
4. Draw the normal path first, then add relevant branches and loops. Make loop-back edges and exit conditions explicit.
5. Place the fenced diagram next to the explanation it supports, then check its syntax and trace each path against the Java behavior.

## Diagram Conventions

- Use a fenced block with the exact language tag `mermaid`.
- Begin with `flowchart TD` for most logic; use `flowchart LR` when a genuinely linear or wide process reads better horizontally.
- Use concise, descriptive node IDs such as `readInput`, `isValid`, and `done`. Keep IDs unique and separate them from reader-facing labels.
- Use rectangles for actions and diamonds for decisions. Label every decision edge with its outcome (`yes`/`no`, `valid`/`invalid`, or the actual condition).
- Name start, successful completion, and failure states clearly. Show meaningful exceptions, cleanup, or early returns when they are part of the concept.
- Keep each node to one step or idea. Prefer a small diagram with readable labels; split a complex process into an overview and focused detail rather than shrinking text or drawing a maze.
- Use quoted labels to avoid ambiguous punctuation. For example, `isValid{"Input valid?"}` is a decision and `read["Read request"]` is an action.
- Avoid HTML, interactions such as `click`, elaborate custom styling, and syntax that is not needed to explain the concept. This project renders with Mermaid 12 in strict security mode and applies a dark theme. Let the shared theme style nodes by default; if explicit styling is genuinely useful, use a small number of high-contrast colors consistent with the site's emerald and neutral palette.
- Keep labels accessible and unambiguous. Do not rely on color alone to communicate meaning.

## Java-Specific Accuracy

- Match every branch to the Java example, including conditions, switch fall-through or arrow semantics, loop termination, exceptions, and resource cleanup where relevant.
- Distinguish compile-time behavior from runtime behavior. Do not draw implementation details (such as a particular memory layout or scheduler strategy) as Java guarantees.
- Include only paths meaningful to the explanation. If an edge case is out of scope, do not imply that the diagram is exhaustive.
- Make branch labels describe the condition outcome, not just repeat the destination node.
- If the code and diagram disagree, correct the explanation or diagram before finishing; never use the diagram to introduce behavior absent from the code.

## Validation

- Check that the diagram starts with a valid Mermaid flowchart declaration and is inside a correctly closed `mermaid` fence.
- Confirm every referenced node is defined, IDs are unique, labels parse, and every decision outcome is connected.
- Trace each route, including loop exits and error routes, against the prose or code.
- Render or preview it in the project when practical. If rendering is not available, state that it was not visually verified rather than claiming success.
- Keep a sentence or caption near the diagram that explains what readers should notice; the diagram should not have to stand alone without context.
