---
title: "Garbage Collection Basics"
description: "Reason about object reachability, garbage collection pauses, memory retention, and why explicit resource management still matters."
category: "level-3"
date: "2026-10-29T10:00:00Z"
---

Java removes the need to manually free ordinary heap objects, but it does not make memory unlimited or resource cleanup automatic. The garbage collector (GC) can reclaim objects that are no longer reachable through the JVM's live references. It cannot infer that an application has logically finished with an object that is still reachable, and it does not replace closing files, sockets, or other external resources.

The Java Virtual Machine Specification describes an abstract heap; it does not require one garbage-collection algorithm. Generational collectors, pause behavior, and tuning options depend on the JVM implementation and collector.

## Reachability, not “unused” intent

The JVM determines whether an object can still be reached from live roots such as active thread state, static fields, and other runtime references. If an object is unreachable, it is eligible for reclamation; that does not mean collection happens immediately or at a predictable time.

```mermaid
flowchart TD
    roots["Live roots: threads and static state"] --> reachable["Object reachable through references"]
    reachable --> live["Object must remain available"]
    roots -->| "reference removed" | unreachable["Object is no longer reachable"]
    unreachable --> eligible["Object becomes eligible for reclamation"]
    eligible --> collector["Collector may reclaim storage later"]
```

The collector follows reachability, not the programmer's intent. An object that is no longer useful to the business logic can still be retained by a static collection, an event listener, a cache, or a long-lived task.

### A Java “memory leak”

A Java memory leak often means **unintended retention**: objects remain reachable even though the application no longer needs them. Examples include:

- A static map that keeps every request result forever.
- A listener registered with a long-lived event source but never removed.
- A `ThreadLocal` value retained by a pooled thread after a request.
- A queue whose consumer cannot keep up with producers.
- A cache without a maximum size or expiration policy.

The GC is behaving correctly in each case: the application still has references. A heap dump and a dominator/retention-path analysis can show which live object keeps a large graph reachable.

## Heap, collection cycles, and stop-the-world pauses

The heap is where objects and arrays are represented in the JVM's abstract machine. A collector may reclaim objects, compact memory, or perform work concurrently with application threads, depending on the algorithm. Some phases can pause application threads; others may run concurrently.

“Minor GC” and “major GC” are commonly used in descriptions of generational collectors, but their exact meaning and availability depend on the collector. Do not assume every JVM has the same generation layout or that a “major” collection always means one specific event. Use the documentation and diagnostic output for the exact collector deployed.

### Collection timing is not a program contract

`System.gc()` requests that the JVM expend effort toward reclaiming unused objects. The runtime may ignore the request, and the method does not promise that a particular object has been collected when it returns. Do not use it as normal memory management or as a test that relies on finalization timing.

An application should be correct regardless of whether a collection happens now, later, or not at all before process shutdown. Strongly reachable objects remain available even if a collection is requested.

## Reachability strengths

The `java.lang.ref` package provides reference objects with strengths in addition to ordinary strong references:

- **Strong reference**: the normal kind of reference; the referenced object remains strongly reachable while the reference is live.
- **Soft reference**: the referent can be cleared under memory demand, but this is not a predictable cache eviction policy.
- **Weak reference**: a weakly reachable referent can be cleared by the collector; weak references are useful for certain canonicalization and association patterns.
- **Phantom reference**: supports post-mortem processing after an object becomes phantom reachable, typically in coordination with a `ReferenceQueue`; it does not provide access to the referent.

These are not interchangeable convenience wrappers. In particular, soft references are not a substitute for a bounded cache with defined eviction semantics, and weak references do not automatically solve object ownership or concurrency design.

## Garbage collection is not resource management

Closing a file descriptor, socket, database connection, or lock is an application-level lifecycle responsibility. Such resources may be scarce even when their associated Java wrapper object is still reachable. Use `AutoCloseable` and try-with-resources:

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class ResourceLifetime {
    public static long countLines(Path path) throws IOException {
        try (BufferedReader reader =
                     Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            long lines = 0;
            while (reader.readLine() != null) {
                lines++;
            }
            return lines;
        }
    }
}
```

The reader is closed when the block exits normally or exceptionally. The GC may later reclaim the Java objects involved, but resource correctness does not depend on waiting for collection.

## Why `finalize()` should not be used

The `Object.finalize()` mechanism is deprecated for removal. Finalization has unpredictable timing, can delay reclamation, complicates object lifecycle reasoning, and permits an object to make itself reachable again (“resurrection”). It is not a reliable way to release resources.

Use, in order of preference:

1. Explicit cleanup with `try`-with-resources and `AutoCloseable`.
2. A `Cleaner` only as a best-effort fallback for a resource whose owner failed to close it; the cleaning action must not capture the object it is meant to clean.
3. Carefully designed `PhantomReference`/`ReferenceQueue` logic only when a lower-level lifecycle mechanism is genuinely required.

None of these fallback mechanisms makes cleanup deterministic. A cleaner action may not run before process exit, so it cannot replace explicit `close()`.

## Diagnosing memory pressure

When memory grows, first identify which resource is growing rather than changing heap flags immediately:

- **High live heap after full collection** may indicate retained application objects or an undersized heap.
- **Allocation spikes with a stable live set** may indicate temporary allocation pressure; profile allocation hot spots.
- **Metaspace growth** can relate to class loading or class-loader retention rather than ordinary object graphs.
- **Native memory** can include thread stacks, direct buffers, JNI allocations, and runtime metadata; it is not the same as `-Xmx`.
- **File descriptor or connection exhaustion** is a resource-lifecycle issue, not a heap leak by itself.

Useful evidence includes GC logs, heap dumps, Java Flight Recorder, and process-level memory metrics. A single `Runtime.freeMemory()` snapshot is not enough to diagnose a leak: it reports heap accounting at one moment, not the retained object graph or total process memory.

## Practical rules

- Remove references when the application is done with long-lived cached or queued objects.
- Give caches, queues, and background work explicit capacity and lifecycle policies.
- Close external resources deterministically instead of waiting for GC.
- Treat `System.gc()` as a request, never as a synchronization or cleanup mechanism.
- Avoid `finalize()`; it is deprecated for removal and has unsuitable lifecycle guarantees.
- Measure with the collector and runtime actually used in deployment; do not infer the algorithm from generic “minor/major GC” labels.

## Further reading

- [Java Virtual Machine Specification, Java SE 21, Runtime Data Areas](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5)
- [Java 21 `System.gc()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html#gc())
- [Java 21 `java.lang.ref` package](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ref/package-summary.html)
- [Java 21 `Cleaner`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ref/Cleaner.html)
- [JEP 421: Deprecate Finalization for Removal](https://openjdk.org/jeps/421)
