---
name: java-topic-writing
description: Write, expand, or revise in-depth Java learning content for this repository. Use when creating Java roadmap lessons or technical articles, explaining Java concepts, or improving the accuracy, teaching flow, and examples in existing topics.
---

# Java Topic Writing

Create accurate, engaging Java learning content that fits this repository's curriculum and helps readers build a working mental model, not just memorize syntax.

## Before Writing

1. Read the nearest related files in `content/roadmap/` or `content/articles/`. Check the learner level, terminology, structure, and whether the topic already exists.
2. Use the roadmap lessons as the depth reference: they typically build from a motivating idea through mechanisms, examples, edge cases, and practical guidance. Some existing articles are short stubs; do not treat their brevity as the desired depth.
3. Identify the target reader, prerequisites, and a small set of outcomes the reader should be able to explain or do after reading.
4. Choose the correct location:
   - Roadmap topic: `content/roadmap/level-<n>/<topic-slug>.md`
   - Technical article: `content/articles/<category>/<topic-slug>.md`
5. Match neighboring files' frontmatter and heading conventions. The content loader expects `title`, `description`, and `date`; roadmap files also set `category` to their level. Article category comes from its directory. Keep an existing file's format rather than normalizing unrelated content.

## Teach the Topic

Build a clear progression, selecting only the sections the topic needs:

1. Start with the problem, motivation, or concrete question the concept answers.
2. Establish prerequisites and the mental model before introducing dense terminology.
3. Explain what happens, why it happens, and how the parts relate, not only the syntax.
4. Introduce a small, readable example, then a realistic example that shows the concept in context.
5. Explain important behavior, boundaries, and failure cases. Include common misconceptions and how to diagnose them.
6. Discuss alternatives and trade-offs where they matter: API choice, complexity, memory, performance, concurrency, or maintainability.
7. Close with a concise recap and, when useful, a small exercise or question that checks understanding.

Scale the treatment to the reader. A beginner lesson should explain foundational terms and step through behavior; an advanced topic should dig into relevant JVM, language, library, or framework details and their practical consequences. Do not pad the lesson to meet a word or heading count, and do not omit a meaningful dimension just to keep it short.

## Technical Accuracy

- Verify version-sensitive language and API claims against primary sources such as the Java Language Specification, Java API documentation, JEPs, and official framework documentation. State the Java/framework version when it affects the explanation.
- Distinguish Java language or JVM guarantees from common implementation details. Label implementation-dependent behavior instead of presenting it as universal.
- Qualify advice and trade-offs. Avoid unsupported absolutes, invented performance numbers, hype, and claims that a feature is always faster, safer, or preferable.
- Make code examples internally consistent and valid for the stated Java version. Include necessary imports or surrounding context, and show output when it clarifies behavior. Clearly label pseudocode.
- Check the examples against the explanation, including boundary cases. Run a small snippet or relevant repository check when practical; do not claim code was run if it was not.
- Prefer precise, approachable prose. Define a term when it first matters, explain jargon, and avoid repeating the same idea in multiple sections.

## Diagrams and Markdown

- Add a diagram only when it clarifies relationships, execution paths, lifecycle, or memory better than prose alone. Use the `java-mermaid-flowcharts` skill for Mermaid flowcharts.
- Use fenced `java` blocks for Java examples and fenced `mermaid` blocks for Mermaid diagrams.
- Follow the repository's existing Markdown style, callouts, frontmatter, and heading conventions. Keep examples and diagrams close to the explanation they support.
- Link to authoritative documentation for version-specific or non-obvious claims when it helps readers verify or continue learning.

## Final Review

- The lesson answers its stated outcomes and has a logical beginner-to-advanced progression.
- Every important claim is accurate, appropriately qualified, and version-aware.
- Examples are understandable, consistent, and do not hide relevant assumptions.
- Coverage includes meaningful trade-offs, edge cases, and failure modes for this topic without filler.
- The title, description, category, date, and file location match the repository's content conventions.
- Markdown fences, links, and diagrams are well-formed; the content does not duplicate a neighboring lesson unnecessarily.
