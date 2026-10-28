# Project Handoff & Progress Report
**Date:** October 29, 2026
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
- **Mandatory Examples & Diagrams**: Every single topic MUST have extensive code examples, edge-case traps, and visual Mermaid diagrams to explain architecture and memory. Never write a short, high-level summary. Go deep.

### 2. Markdown & Curriculum Syncing (Mistakes to Avoid)
- **Slug Matching**: The filename in `content/roadmap/level-[x]/[slug].md` **MUST EXACTLY MATCH** the slugified `title` from `data/roadmap.ts` (e.g., `title: "Memory References & Copying"` -> `memory-references-copying.md`). Failure to do this causes 404 errors.
- **Table of Contents & Headings**: The app uses `github-slugger` for TOC generation. **DO NOT use hardcoded numbers in your markdown headings** (e.g., use `## Method Overriding` instead of `## 1. Method Overriding`). This ensures TOC links never break when we inject new sections later.

### 3. Visuals & Diagrams
- **Mermaid v11**: You must include rich architectural Mermaid diagrams where applicable. 
- **The Mermaid Parsing Bug**: Mermaid v11 requires that any node label containing special characters (parentheses, brackets, hyphens) must be wrapped in double quotes. (e.g., `A["My Label (Special)"]`). Failure to use quotes will crash the markdown renderer.

### 4. What is "Okay" to do
- **Restructuring**: You have full permission to analyze the roadmap and dynamically re-order topics, split topics into parts, or introduce new modules if it creates a more logical learning progression (e.g., moving Abstraction before Composition).
- **Refactoring**: If you notice a gap in an existing module (like Wrapper classes missing from primitive types), proactively go back and inject a deep dive section to fix it.

### Immediate Next Step: Level 8, Spring Security Architecture
Continue in curriculum order. Compare `data/roadmap.ts` with `content/roadmap/level-<n>/` before writing; create any missing topic at the exact slugified title and update its level checklist below.

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
- [x] The Static Keyword
- [x] Memory References & Copying (Pass-by-Value, Shallow vs Deep Copy)
- [x] Encapsulation & Access Modifiers
- [x] Inheritance
- [x] Abstraction
- [x] Composition over Inheritance
- [x] Polymorphism
- [x] Advanced Class Design

**Level 2 Status:**
- [x] Exception Handling
- [x] Enums
- [x] The String Constant Pool & StringBuilders
- [x] Modern Core APIs
- [x] I/O and NIO.2
- [x] Network Socket Programming

**Level 3 Status:**
- [x] Generics
- [x] The Collections Framework (Lists & Sets)
- [x] The Collections Framework (Maps)
- [x] JVM Architecture Internals
- [x] Garbage Collection Basics
- [x] Reflection API & Custom Annotations

**Level 4 Status:**
- [x] Lambdas and Functional Interfaces
- [x] The Streams API
- [x] Advanced Streams & Collectors
- [x] Optional API
- [x] Reactive Programming Basics

**Level 5 Status:**
- [x] The Java Memory Model (JMM)
- [x] Thread Safety and Synchronization
- [x] The `java.util.concurrent` Package
- [x] Executors and Thread Pools
- [x] Asynchronous Programming
- [x] Project Loom (Virtual Threads)

**Level 6 Status:**
- [x] SOLID Principles Basics
- [x] Creational Patterns
- [x] Structural Patterns
- [x] Behavioral Patterns
- [x] Architectural Patterns

**Level 7 Status:**
- [x] Relational Database Fundamentals & Advanced SQL
- [x] Database Migrations
- [x] JDBC and Connection Pooling
- [x] JPA and Hibernate Basics
- [x] Entity Relationships
- [x] Hibernate Performance Tuning
- [x] NoSQL Databases

**Level 8 Status:**
- [x] Build Tools
- [x] Spring Core Internals
- [x] Aspect-Oriented Programming (AOP)
- [x] Building RESTful APIs
- [x] Spring Data JPA
- [x] Spring Events, Caching, & Scheduling
- [ ] Spring Security Architecture
- [ ] Stateless Authentication (JWT)
- [ ] Automated Testing

**Level 9 Status:**
- [ ] Microservice Principles
- [ ] API Gateways and Service Discovery
- [ ] Inter-Service Communication
- [ ] Resiliency Patterns
- [ ] Event-Driven Architecture
- [ ] Distributed Transactions

**Level 10 Status:**
- [ ] Advanced JVM Tuning & Profiling
- [ ] Cloud Native & Serverless Java
- [ ] Docker and Containerization
- [ ] Kubernetes (K8s) for Java Devs
- [ ] System Design: Scalability Patterns
- [ ] System Design: Observability
- [ ] CI/CD and Infrastructure as Code

*You are building a resource for "Java Gods". Do not gloss over details.*
