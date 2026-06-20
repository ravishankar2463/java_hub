---
title: "Java 21 Virtual Threads"
description: "Understand how Project Loom is revolutionizing concurrent programming in Java."
category: "core"
date: "2026-06-19T10:00:00Z"
---

# Java 21 Virtual Threads

Project Loom has finally delivered **Virtual Threads** in Java 21, marking the biggest change to the JVM's concurrency model in decades.

Virtual threads are lightweight threads that dramatically reduce the effort of writing, maintaining, and observing high-throughput concurrent applications.

## How to use them

Instead of heavy OS-level threads, you can now launch millions of virtual threads:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}
```
