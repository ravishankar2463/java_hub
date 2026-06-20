---
title: "Mastering Spring Boot 3"
description: "Dive deep into the new features of Spring Boot 3, including AOT compilation and native images."
category: "spring"
date: "2026-06-20T10:00:00Z"
---

# Mastering Spring Boot 3

Spring Boot 3 brings massive changes to the ecosystem, most notably full support for **Java 17** and **GraalVM Native Images**.

## AOT Compilation

Ahead-of-Time (AOT) compilation is no longer an experimental project. With Spring Boot 3, it's a first-class citizen. This allows your applications to start in milliseconds and consume a fraction of the memory.

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

Stay tuned for more deep dives into the new observability features using Micrometer Tracing.
