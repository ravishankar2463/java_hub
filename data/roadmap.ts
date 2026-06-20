export interface RoadmapTopic {
  title: string;
  description?: string;
  details: string[];
}

export interface RoadmapLevel {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  badge: string;
  topics: RoadmapTopic[];
}

export const roadmapData: RoadmapLevel[] = [
  {
    level: 0,
    title: "Level 0: The Absolute Beginner",
    subtitle: "Setting the Foundation",
    description: "Welcome to Java! This stage is all about setting up your environment and understanding the absolute basics of programming syntax. No prior experience required.",
    color: "from-neutral-500/20 to-neutral-500/5",
    badge: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    topics: [
      {
        title: "Environment Setup",
        details: ["JDK vs JRE vs JVM", "Installing Java (Adoptium/Amazon Corretto)", "Setting up an IDE (IntelliJ IDEA/Eclipse)", "Understanding the command line (`javac` and `java`)"]
      },
      {
        title: "Git & Version Control",
        details: ["Why use Version Control?", "Basic Git Commands (add, commit, push, pull)", "Branching and Merging", "Resolving Merge Conflicts"]
      },
      {
        title: "Anatomy of a Java Program",
        details: ["Classes and the `main` method", "Statements and Semicolons", "Comments (Single, Multi-line, Javadoc)", "Compilation process & Bytecode"]
      },
      {
        title: "Intro to OOPS",
        details: ["The Blueprint vs the Instance", "Constructors & Object Initialization", "The `this` Keyword Mechanics", "Functions vs Methods", "Object References & The `null` Value"]
      },
      {
        title: "Variables and Data Types",
        details: ["Primitive vs Reference Types", "The 8 Primitive Types & Literal Suffixes", "The `String` Constant Pool", "Type Casting (Implicit vs Explicit)", "Block Scope & Variable Shadowing", "Local Variable Type Inference (`var`)"]
      },
      {
        title: "Control Flow",
        details: ["Conditional Branching (`if`/`else`)", "The Ternary Operator", "Modern `switch` Expressions (Java 14+)", "Iterative Loops (`for`, `while`, `do-while`)", "Enhanced `for-each` Loop", "Flow Disruption: `break`, `continue`, & Labels"]
      }
    ]
  },
  {
    level: 1,
    title: "Level 1: The Object-Oriented Thinker",
    subtitle: "Modeling the Real World",
    description: "Java is fundamentally an Object-Oriented language. Here you will learn how to design software by modeling data and behavior together into objects.",
    color: "from-blue-500/20 to-blue-500/5",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    topics: [
      {
        title: "Classes and Objects",
        details: ["The blueprint vs the instance", "Constructors (Default, Parameterized, No-Args)", "The `this` keyword", "Instance vs Class (static) variables"]
      },
      {
        title: "Encapsulation & Access Modifiers",
        details: ["`private`, `default`, `protected`, `public`", "Getters and Setters", "Immutability concepts", "Information hiding principles"]
      },
      {
        title: "Inheritance",
        details: ["The `extends` keyword", "The `super` keyword and constructor chaining", "Method Overriding vs Overloading", "The cosmic `Object` class"]
      },
      {
        title: "Polymorphism",
        details: ["Compile-time (Static) vs Run-time (Dynamic) Polymorphism", "Upcasting and Downcasting", "The `instanceof` operator", "Pattern Matching for `instanceof` (Java 16+)"]
      },
      {
        title: "Abstraction",
        details: ["Abstract Classes and Methods", "Interfaces", "Multiple inheritance of types", "Default and Static methods in Interfaces"]
      },
      {
        title: "Advanced Class Design",
        details: ["Nested / Inner Classes", "Anonymous Inner Classes", "Enums (Advanced: State and Behavior)", "Records (Java 14+) for immutable data carriers"]
      },
      {
        title: "SOLID Principles Basics",
        details: ["Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution Principle", "Interface Segregation", "Dependency Inversion"]
      }
    ]
  },
  {
    level: 2,
    title: "Level 2: The Core Master",
    subtitle: "Data Structures & JVM Internals",
    description: "Move beyond syntax and understand how Java actually works under the hood. Master the tools provided by the standard library to handle data and errors.",
    color: "from-emerald-500/20 to-emerald-500/5",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    topics: [
      {
        title: "JVM Architecture Internals",
        details: ["Classloaders (Bootstrap, Platform, System)", "The Execution Engine (JIT Compiler, Interpreter)", "Memory Areas: Stack vs Heap vs Metaspace", "The String Constant Pool mechanics"]
      },
      {
        title: "Garbage Collection Basics",
        details: ["Reachability and the Object Lifecycle", "Minor vs Major GC Collections", "Stop-the-World events", "Understanding `System.gc()` and `finalize()` (and why to avoid them)"]
      },
      {
        title: "Exception Handling",
        details: ["The Throwable Hierarchy (`Error`, `Exception`, `RuntimeException`)", "Checked vs Unchecked Exceptions", "`try-catch-finally` blocks", "Try-with-resources and `AutoCloseable`", "Creating Custom Domain Exceptions"]
      },
      {
        title: "Generics",
        details: ["Type Erasure", "Generic Classes and Methods", "Bounded Type Parameters (`<T extends Comparable>`)", "Wildcards (`?`, `? extends T`, `? super T`)"]
      },
      {
        title: "The Collections Framework (Lists & Sets)",
        details: ["`ArrayList` dynamic resizing mechanics", "`LinkedList` vs `ArrayList` performance", "`HashSet` internals (hashing)", "`TreeSet` and the `Comparable`/`Comparator` interfaces"]
      },
      {
        title: "The Collections Framework (Maps)",
        details: ["`HashMap` internals (Buckets, Collisions, Red-Black Trees)", "`TreeMap` for sorted keys", "`LinkedHashMap` for insertion order", "The `equals()` and `hashCode()` contract"]
      },
      {
        title: "I/O and NIO.2",
        details: ["ByteStreams vs CharacterStreams", "Reading and Writing Files", "The `java.nio.file` package (`Paths`, `Files`)", "Serialization and Deserialization"]
      },
      {
        title: "Modern Core APIs",
        details: ["The `java.time` API (LocalDate, ZonedDateTime, Duration)", "String formatting and modern String methods (Java 11+)", "The `HttpClient` API (Java 11+)"]
      }
    ]
  },
  {
    level: 3,
    title: "Level 3: The Functional Java Dev",
    subtitle: "Declarative Programming",
    description: "Java 8 changed everything. Learn to write clean, declarative, and easily parallelizable code using functional programming paradigms.",
    color: "from-teal-500/20 to-teal-500/5",
    badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    topics: [
      {
        title: "Lambdas and Functional Interfaces",
        details: ["The `@FunctionalInterface` annotation", "Lambda syntax and variable capture (effectively final)", "Method References (`Class::method`)", "Built-in Interfaces: `Predicate`, `Function`, `Consumer`, `Supplier`"]
      },
      {
        title: "The Streams API",
        details: ["Intermediate vs Terminal Operations", "`map`, `filter`, `sorted`, `limit`", "`flatMap` for nested structures", "Short-circuiting operations (`findFirst`, `anyMatch`)"]
      },
      {
        title: "Advanced Streams & Collectors",
        details: ["`Collectors.toList()`, `toSet()`, `toMap()`", "`Collectors.groupingBy()` and `partitioningBy()`", "Custom Collectors", "Parallel Streams and the Fork/Join Pool"]
      },
      {
        title: "Optional API",
        details: ["Eradicating the `NullPointerException`", "Creating Optionals (`of`, `ofNullable`, `empty`)", "`ifPresent`, `orElse`, `orElseThrow`", "Mapping and chaining Optionals"]
      },
      {
        title: "Reactive Programming Basics",
        details: ["The Observer Pattern", "Reactive Streams Specification (Publisher, Subscriber)", "Project Reactor Basics (`Mono` and `Flux`)", "Backpressure handling"]
      }
    ]
  },
  {
    level: 4,
    title: "Level 4: The Data Wrangler",
    subtitle: "Databases and ORM",
    description: "Applications need data. Master relational databases, SQL, and how to elegantly map Java objects to database tables using Hibernate.",
    color: "from-yellow-500/20 to-yellow-500/5",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    topics: [
      {
        title: "Relational Database Fundamentals",
        details: ["ACID Properties", "Normalization (1NF, 2NF, 3NF)", "Primary Keys, Foreign Keys, and Constraints", "Joins (Inner, Left, Right, Full)"]
      },
      {
        title: "Advanced SQL",
        details: ["Indexes and Query Execution Plans", "Group By and Having clauses", "Window Functions", "Transactions and Isolation Levels", "Stored Procedures vs Functions"]
      },
      {
        title: "Database Migrations",
        details: ["Why use Schema Migrations?", "Flyway setup and syntax", "Liquibase basics", "Versioning database changes"]
      },
      {
        title: "JDBC and Connection Pooling",
        details: ["`Connection`, `Statement`, `PreparedStatement`", "Preventing SQL Injection", "ResultSets and Mappers", "Connection Pooling with HikariCP"]
      },
      {
        title: "JPA and Hibernate Basics",
        details: ["Entities, `@Id`, `@Column`, `@Table`", "The `EntityManager` and Persistence Context", "Entity Lifecycle (Transient, Persistent, Detached, Removed)", "Generating schemas automatically"]
      },
      {
        title: "Entity Relationships",
        details: ["`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`", "Unidirectional vs Bidirectional mapping", "The `mappedBy` attribute", "Cascade types and orphan removal"]
      },
      {
        title: "Hibernate Performance Tuning",
        details: ["Fetch Types (`EAGER` vs `LAZY`)", "The N+1 Query Problem", "Solving N+1 with `JOIN FETCH` and `@EntityGraph`", "L1 and L2 Caching strategies", "Optimistic Locking with `@Version`"]
      },
      {
        title: "NoSQL Databases",
        details: ["When to use NoSQL vs SQL", "Document Stores (MongoDB)", "Key-Value Stores (Redis) for Caching", "Graph Databases (Neo4j) Basics"]
      }
    ]
  },
  {
    level: 5,
    title: "Level 5: The Spring Boot Artisan",
    subtitle: "Enterprise Web Development",
    description: "Spring Boot is the industry standard. Learn how to build robust, secure, and production-ready RESTful APIs.",
    color: "from-orange-500/20 to-orange-500/5",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    topics: [
      {
        title: "Build Tools",
        details: ["Maven (pom.xml, lifecycles, dependencies)", "Gradle (build.gradle, tasks)", "Transitive Dependencies and Dependency Management"]
      },
      {
        title: "Spring Core Internals",
        details: ["Inversion of Control (IoC) Principle", "Dependency Injection (Constructor vs Field injection)", "The Application Context and Bean Lifecycle", "Bean Scopes (Singleton, Prototype, Request)", "Auto-Configuration magic (`@EnableAutoConfiguration`)"]
      },
      {
        title: "Aspect-Oriented Programming (AOP)",
        details: ["Cross-cutting concerns", "Aspects, Pointcuts, and Advice", "Creating custom `@Loggable` annotations"]
      },
      {
        title: "Building RESTful APIs",
        details: ["Richardson Maturity Model", "Spring Web MVC architecture (`DispatcherServlet`)", "`@RestController`, `@RequestMapping`, `@PathVariable`, `@RequestBody`", "Data validation with Jakarta Validation API", "Global Exception Handling (`@ControllerAdvice` and `ProblemDetail`)"]
      },
      {
        title: "Spring Data JPA",
        details: ["Repository interfaces (`CrudRepository`, `JpaRepository`)", "Query derivation from method names", "Custom `@Query` (JPQL and Native SQL)", "Pagination and Sorting", "Auditing (`@CreatedDate`, `@LastModifiedDate`)"]
      },
      {
        title: "Spring Security Architecture",
        details: ["The FilterChainProxy and SecurityFilterChain", "Authentication vs Authorization", "UserDetailsService and PasswordEncoders", "Role-Based Access Control (RBAC) with `@PreAuthorize`"]
      },
      {
        title: "Stateless Authentication (JWT)",
        details: ["OAuth2 vs OIDC vs JWTs", "Structure of a JSON Web Token", "Implementing a custom JWT Authentication Filter", "Refresh token rotation strategies"]
      },
      {
        title: "Automated Testing",
        details: ["Unit Testing with JUnit 5 and AssertJ", "Mocking dependencies with Mockito (`@Mock`, `@InjectMocks`)", "Controller testing with `MockMvc`", "Integration testing with `@SpringBootTest`", "Database testing with **TestContainers**"]
      }
    ]
  },
  {
    level: 6,
    title: "Level 6: The Concurrency Expert",
    subtitle: "Mastering Threads & Multicore",
    description: "Write code that handles millions of requests safely. Deep dive into the Java Memory Model, locks, and the revolutionary Project Loom.",
    color: "from-red-500/20 to-red-500/5",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    topics: [
      {
        title: "The Java Memory Model (JMM)",
        details: ["Hardware memory architecture vs JMM", "Visibility problems and caching", "The `volatile` keyword", "Happens-Before relationships"]
      },
      {
        title: "Thread Safety and Synchronization",
        details: ["Race conditions and Critical Sections", "Intrinsic locks (`synchronized`)", "Deadlocks, Livelocks, and Starvation", "Thread signaling (`wait()`, `notify()`)"]
      },
      {
        title: "The `java.util.concurrent` Package",
        details: ["Explicit Locks (`ReentrantLock`, `ReadWriteLock`)", "Atomic Variables and Compare-And-Swap (CAS)", "Concurrent Collections (`ConcurrentHashMap`, `CopyOnWriteArrayList`)", "Synchronizers (`CountDownLatch`, `CyclicBarrier`, `Semaphore`)"]
      },
      {
        title: "Executors and Thread Pools",
        details: ["The `ExecutorService` framework", "Thread pool types (Fixed, Cached, Scheduled)", "`Callable` and `Future`", "Tuning thread pool sizes based on CPU vs I/O bounds"]
      },
      {
        title: "Asynchronous Programming",
        details: ["The callback hell problem", "`CompletableFuture` API", "Chaining asynchronous tasks (`thenApply`, `thenCompose`)", "Combining futures (`allOf`, `anyOf`)"]
      },
      {
        title: "Project Loom (Virtual Threads)",
        details: ["Platform Threads vs OS Threads vs Virtual Threads", "How the JVM parks/unparks virtual threads during blocking I/O", "Structured Concurrency API", "Scoped Values (The modern ThreadLocal)"]
      }
    ]
  },
  {
    level: 7,
    title: "Level 7: The Microservices Architect",
    subtitle: "Distributed Systems",
    description: "Break the monolith. Learn how to design, deploy, and manage a fleet of independently scalable microservices.",
    color: "from-purple-500/20 to-purple-500/5",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    topics: [
      {
        title: "Microservice Principles",
        details: ["Monolith vs SOA vs Microservices", "Domain-Driven Design (DDD) basics", "Bounded Contexts and Domain Boundaries", "Database per service pattern"]
      },
      {
        title: "API Gateways and Service Discovery",
        details: ["The role of an API Gateway (Spring Cloud Gateway)", "Routing, Rate Limiting, and Authentication Offloading", "Client-side vs Server-side Service Discovery", "Netflix Eureka / HashiCorp Consul"]
      },
      {
        title: "Inter-Service Communication",
        details: ["Synchronous (REST) vs Asynchronous (Messaging)", "Feign Clients & RestTemplate", "gRPC basics with Java and Protocol Buffers", "Handling partial failures"]
      },
      {
        title: "Resiliency Patterns",
        details: ["Cascading failures", "The Circuit Breaker Pattern (Resilience4j)", "Retries with exponential backoff", "Bulkheads and Timeouts"]
      },
      {
        title: "Event-Driven Architecture",
        details: ["Message Brokers vs Event Streaming", "RabbitMQ (AMQP) concepts (Exchanges, Queues, Bindings)", "Apache Kafka Architecture (Topics, Partitions, Consumer Groups, Offsets)", "Event Sourcing and the Outbox Pattern"]
      },
      {
        title: "Distributed Transactions",
        details: ["The Two-Phase Commit (2PC) problem", "The Saga Pattern (Orchestration vs Choreography)", "Compensating transactions", "Eventual Consistency"]
      }
    ]
  },
  {
    level: 8,
    title: "Level 8: The Java God",
    subtitle: "System Design & Cloud Native",
    description: "The pinnacle of Java mastery. You are now architecting globally distributed systems, squeezing every drop of performance from the JVM, and deploying to Kubernetes.",
    color: "from-fuchsia-500/20 to-fuchsia-500/5",
    badge: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    topics: [
      {
        title: "Advanced JVM Tuning",
        details: ["Understanding GC Logs", "Choosing the right GC (G1GC vs ZGC vs Shenandoah)", "Memory Leak detection with Heap Dumps (.hprof)", "Profiling with Java Flight Recorder (JFR) and VisualVM"]
      },
      {
        title: "Cloud Native & Serverless Java",
        details: ["GraalVM Native Images (AOT Compilation deep dive)", "Spring Boot 3 Native vs Quarkus vs Micronaut", "Cold starts in AWS Lambda", "Optimizing container images (Jib, Buildpacks)"]
      },
      {
        title: "Docker and Containerization",
        details: ["Dockerfiles for Java applications", "Multi-stage builds", "Docker Compose for local environments", "Container resource limits and JVM memory alignment"]
      },
      {
        title: "Kubernetes (K8s) for Java Devs",
        details: ["Pods, Deployments, and ReplicaSets", "Services and Ingress", "ConfigMaps and Secrets", "Liveness and Readiness Probes for Spring Boot", "Helm Charts"]
      },
      {
        title: "System Design: Scalability Patterns",
        details: ["CAP Theorem and PACELC", "Load Balancing (L4 vs L7)", "Database Sharding and Replication strategies", "Caching Topologies (Cache-aside, Write-through) and Redis Clusters", "Content Delivery Networks (CDNs)"]
      },
      {
        title: "System Design: Observability",
        details: ["The Three Pillars: Logs, Metrics, Traces", "Distributed Tracing with OpenTelemetry and Jaeger", "Centralized Logging (ELK/EFK stack)", "Metrics with Micrometer, Prometheus, and Grafana"]
      },
      {
        title: "Architectural Patterns",
        details: ["Hexagonal Architecture (Ports and Adapters)", "Clean Architecture / Onion Architecture", "CQRS (Command Query Responsibility Segregation)", "Strangler Fig pattern for migrating monoliths"]
      },
      {
        title: "CI/CD and Infrastructure as Code",
        details: ["GitHub Actions / GitLab CI basics", "Automating tests and deployments", "Terraform basics for Infrastructure as Code", "Zero-downtime deployment strategies (Blue/Green, Canary)"]
      }
    ]
  }
];
