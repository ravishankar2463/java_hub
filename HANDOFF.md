# Project Handoff & Progress Report
**Date:** June 20, 2026
**Project:** Zero to Java God (Interactive Next.js Mastery Roadmap)

## 1. Current State of the Application
We are building a highly premium, dark/light mode responsive Next.js application designed to be the ultimate roadmap for learning Java.
- **Markdown Engine**: We have a robust static markdown parser in `lib/markdown.ts` that dynamically generates routes for both generic Articles and Roadmap Topics.
- **SVG Diagrams**: We successfully integrated `mermaid` and a custom `<MermaidDiagram />` component into `react-markdown`. This allows us to write ````mermaid` blocks in `.md` files to instantly render beautiful, dynamic architecture diagrams.
- **Table of Contents**: Deep-dive topics feature an automatically generated, sticky Table of Contents sidebar on the right side of the screen. We integrated `rehype-slug` to enable smooth anchor-link scrolling.
- **Theming**: We fully integrated `next-themes` for Light/Dark mode. All hardcoded dark UI elements (Bento Grid cards, Navbar, Command Palette, typography) have been updated to seamlessly respect light/dark mode toggles.

## 2. Completed Application Features
- **Project Infrastructure**: Setup Next.js, Tailwind v4, global layouts, and routing.
- **UI/UX Overhaul**: Global navigation, search palette, theme switching, and responsive design.

## 3. AI Context & Strict Guidelines (CRITICAL)

When generating new content or modifying the application, you must adhere to these absolute rules:

### 1. The "Java God" Philosophy (Content Depth)
We are NOT writing a beginner crash course. We are building a masterclass. 
- Do not gloss over details. 
- You must explain the *why* alongside the *how*. 
- Always tie concepts back to JVM internals (Heap vs Stack, Metaspace, JIT compiler, memory allocation vs access rights).
- Provide complex, real-world edge cases (e.g., The Diamond Problem, the Fragile Base Class).

### 2. Markdown & Curriculum Syncing (Mistakes to Avoid)
- **Slug Matching**: The filename in `content/roadmap/level-[x]/[slug].md` **MUST EXACTLY MATCH** the slugified `title` from `data/roadmap.ts` (e.g., `title: "Memory References & Copying"` -> `memory-references-copying.md`). Failure to do this causes 404 errors.
- **Table of Contents & Headings**: The app uses `github-slugger` for TOC generation. **DO NOT use hardcoded numbers in your markdown headings** (e.g., use `## Method Overriding` instead of `## 1. Method Overriding`). This ensures TOC links never break when we inject new sections later.

### 3. Visuals & Diagrams
- **Mermaid v11**: You must include rich architectural Mermaid diagrams where applicable. 
- **The Mermaid Parsing Bug**: Mermaid v11 requires that any node label containing special characters (parentheses, brackets, hyphens) must be wrapped in double quotes. (e.g., `A["My Label (Special)"]`). Failure to use quotes will crash the markdown renderer.

### 4. What is "Okay" to do
- **Restructuring**: You have full permission to analyze the roadmap and dynamically re-order topics, split topics into parts, or introduce new modules if it creates a more logical learning progression (e.g., moving Abstraction before Composition).
- **Refactoring**: If you notice a gap in an existing module (like Wrapper classes missing from primitive types), proactively go back and inject a deep dive section to fix it.

### Immediate Next Step: Level 1, Abstraction
Open or create `content/roadmap/level-1/abstraction.md`.
**Requirements:**
1. **Absolute Depth**: Explain Abstract classes vs Interfaces. Dive deep into default methods, static methods in interfaces, and how they solve the multiple inheritance problem.

### Ongoing Strategy
Apply this exact standard of deep-dive rigorousness and Mermaid SVG architectural visualization to the remaining topics. Remember that Mermaid v11 requires wrapping node labels in double quotes (e.g. `A["Your Text"]`) if they contain special characters to avoid parsing errors.

**Level 0 Status:**
- [x] Environment Setup
- [x] Git & Version Control
- [x] Anatomy of a Java Program
- [x] Variables and Data Types
- [x] Control Flow
- [x] Arrays & 2D Matrices
- [x] Intro to OOPS (Classes & Methods)

**Level 1 Status:**
- [x] Classes and Objects (Metaspace, Static vs Instance)
- [x] Memory References & Copying (Pass-by-Value, Shallow vs Deep Copy)
- [x] Encapsulation & Access Modifiers
- [x] Inheritance
- [ ] Abstraction
- [ ] Composition over Inheritance
- [ ] Polymorphism
- [ ] Advanced Class Design

**Future Levels:**
- **Level 2:** The Core Master (Part 1)
- **Level 3:** The Core Master (Part 2)
- **Level 4:** The Functional Java Dev
- **Level 5:** The Concurrency Expert
- **Level 6:** The Architect (Design Patterns)
- **Level 7:** The Data Wrangler
- **Level 8:** The Spring Boot Artisan
- **Level 9:** The Microservices Architect
- **Level 10:** The Cloud-Native Java God

*You are building a resource for "Java Gods". Do not gloss over details.*
