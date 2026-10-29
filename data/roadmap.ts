export interface RoadmapTopic {
  title: string;
  description?: string;
  details: string[];
}

export interface InterviewQuestion {
  question: string;
  expectation: string;
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
    badge: "bg-neutral-500/10 text-neutral-800 dark:text-neutral-200 border-neutral-500/30",
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
        title: "Variables and Data Types",
        details: ["Primitive vs Reference Types", "The 8 Primitive Types", "Wrapper Classes & Autoboxing", "The `String` Constant Pool", "Type Casting", "Block Scope", "Local Variable Type Inference (`var`)"]
      },
      {
        title: "Control Flow",
        details: ["Conditional Branching (`if`/`else`)", "The Ternary Operator", "Modern `switch` Expressions (Java 14+)", "Iterative Loops (`for`, `while`, `do-while`)", "Enhanced `for-each` Loop", "Flow Disruption: `break`, `continue`, & Labels"]
      },
      {
        title: "Arrays & 2D Matrices",
        details: ["1D Arrays", "2D/Multidimensional Arrays", "Memory layout", "`ArrayIndexOutOfBoundsException`", "The `Arrays` utility class"]
      },
      {
        title: "Intro to OOPS",
        details: ["The Blueprint vs the Instance", "Constructors & Object Initialization", "The `this` Keyword Mechanics", "Functions vs Methods", "Object References & The `null` Value"]
      }
    ]
  },
  {
    level: 1,
    title: "Level 1: The Object-Oriented Thinker",
    subtitle: "Modeling the Real World",
    description: "Java is fundamentally an Object-Oriented language. Here you will learn how to design software by modeling data and behavior together into objects.",
    color: "from-blue-500/20 to-blue-500/5",
    badge: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30",
    topics: [
      {
        title: "Classes and Objects",
        details: ["The blueprint vs the instance", "Constructors (Default, Parameterized, No-Args)", "The `this` keyword", "Instance Variables & Methods"]
      },
      {
        title: "The Static Keyword",
        details: ["Static Variables & Memory (Metaspace)", "Static Methods & Utility Classes", "Static Initialization Blocks", "Why the `main` method is static"]
      },
      {
        title: "Memory References & Copying",
        details: ["Pass-by-Value vs Pass-by-Reference", "The Assignment Trap", "Shallow Copy & Object.clone()", "Deep Copy & Copy Constructors"]
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
        title: "Abstraction",
        details: ["Abstract Classes and Methods", "Interfaces", "Multiple inheritance of types", "Default and Static methods in Interfaces"]
      },
      {
        title: "Composition over Inheritance",
        details: ["The Fragile Base Class problem", "Deep inheritance pitfalls", "Using interfaces + composition for modular design"]
      },
      {
        title: "Polymorphism",
        details: ["Compile-time (Static) vs Run-time (Dynamic) Polymorphism", "Upcasting and Downcasting", "The `instanceof` operator", "Pattern Matching for `instanceof` (Java 16+)"]
      },
      {
        title: "Advanced Class Design",
        details: ["Nested / Inner Classes", "Anonymous Inner Classes", "Records (Java 14+) for immutable data carriers"]
      },
      {
        title: "Sealed Classes and Pattern Matching",
        details: ["Algebraic Data Types (Sum & Product Types)", "The `sealed`, `non-sealed`, and `permits` Modifiers", "Exhaustive Pattern Matching in `switch` (Java 21+)", "Record Patterns & Nested Deconstruction", "Eliminating the Gang-of-Four Visitor Pattern"]
      }
    ]
  },
  {
    level: 2,
    title: "Level 2: The Core Master (Part 1)",
    subtitle: "I/O, Exceptions, and Utilities",
    description: "Move beyond syntax and understand how to handle errors, work with files, and connect over networks.",
    color: "from-emerald-500/20 to-emerald-500/5",
    badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    topics: [
      {
        title: "Exception Handling",
        details: ["The Throwable Hierarchy (`Error`, `Exception`, `RuntimeException`)", "Checked vs Unchecked Exceptions", "`try-catch-finally` blocks", "Try-with-resources and `AutoCloseable`", "Creating Custom Domain Exceptions"]
      },
      {
        title: "Enums",
        details: ["Advanced: State and Behavior", "Using enums in switch statements", "Enum constructors and methods"]
      },
      {
        title: "The String Constant Pool & StringBuilders",
        details: ["String immutability", "String interning", "`StringBuilder` vs `StringBuffer`"]
      },
      {
        title: "Modern Core APIs",
        details: ["The `java.time` API (LocalDate, ZonedDateTime, Duration)", "String formatting and modern String methods (Java 11+)", "The `HttpClient` API (Java 11+)"]
      },
      {
        title: "I/O and NIO.2",
        details: ["ByteStreams vs CharacterStreams", "Reading and Writing Files", "The `java.nio.file` package (`Paths`, `Files`)", "Serialization and Deserialization"]
      },
      {
        title: "Network Socket Programming",
        details: ["`ServerSocket`", "`Socket`", "TCP vs UDP", "Blocking I/O network calls"]
      },
      {
        title: "Regular Expressions and ReDoS Defense",
        details: ["The `java.util.regex` Architecture (`Pattern` & `Matcher`)", "Nondeterministic Finite Automata (NFA) Internals", "Catastrophic Backtracking & ReDoS Vulnerability", "Greedy, Reluctant, & Possessive Quantifiers", "Text Blocks (`\"\"\"`) and Regex Compilation Caching"]
      }
    ]
  },
  {
    level: 3,
    title: "Level 3: The Core Master (Part 2)",
    subtitle: "Data Structures & JVM Magic",
    description: "Master the tools provided by the standard library to handle data, and learn how Java actually works under the hood.",
    color: "from-cyan-500/20 to-cyan-500/5",
    badge: "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
    topics: [
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
        title: "JVM Architecture Internals",
        details: ["Classloaders (Bootstrap, Platform, System)", "The Execution Engine (JIT Compiler, Interpreter)", "Memory Areas: Stack vs Heap vs Metaspace"]
      },
      {
        title: "Garbage Collection Basics",
        details: ["Reachability and the Object Lifecycle", "Minor vs Major GC Collections", "Stop-the-World events", "Understanding `System.gc()` and `finalize()` (and why to avoid them)"]
      },
      {
        title: "Reflection API & Custom Annotations",
        details: ["The `Class<?>` object", "Dynamic method invocation", "Building custom `@Annotations`", "The performance cost of reflection"]
      },
      {
        title: "Java Platform Module System (JPMS)",
        details: ["Project Jigsaw and `module-info.java`", "`requires`, `exports`, `opens`, and Qualified Exports", "Strong Encapsulation vs Reflection Infiltration", "Split Packages & The Unnamed Module", "Creating Custom Minimal Runtimes with `jlink`"]
      }
    ]
  },
  {
    level: 4,
    title: "Level 4: The Functional Java Dev",
    subtitle: "Declarative Programming",
    description: "Java 8 changed everything. Learn to write clean, declarative, and easily parallelizable code using functional programming paradigms.",
    color: "from-teal-500/20 to-teal-500/5",
    badge: "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30",
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
    level: 5,
    title: "Level 5: The Concurrency Expert",
    subtitle: "Mastering Threads & Multicore",
    description: "Write code that handles millions of requests safely. Deep dive into the Java Memory Model, locks, and the revolutionary Project Loom.",
    color: "from-rose-500/20 to-rose-500/5",
    badge: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30",
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
        title: "The java.util.concurrent Package",
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
      },
      {
        title: "Structured Concurrency and Scoped Values",
        details: ["The Flaws of Unstructured Concurrency (`Future.get()`, Orphan Threads)", "StructuredTaskScope (`ShutdownOnFailure`, `ShutdownOnSuccess`)", "Subtask Lifecycle & Cancellation Cascades", "ScopedValue (JEP 446) vs Memory-Leaking ThreadLocal", "Unifying Virtual Threads with Structured Task Hierarchies"]
      }
    ]
  },
  {
    level: 6,
    title: "Level 6: The Architect",
    subtitle: "Design Patterns & Principles",
    description: "Build enterprise muscle memory. Master the patterns that scale to millions of lines of code without collapsing.",
    color: "from-indigo-500/20 to-indigo-500/5",
    badge: "bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
    topics: [
      {
        title: "SOLID Principles Basics",
        details: ["Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution Principle", "Interface Segregation", "Dependency Inversion"]
      },
      {
        title: "Creational Patterns",
        details: ["Singleton", "Factory Method", "Abstract Factory", "Builder", "Prototype"]
      },
      {
        title: "Structural Patterns",
        details: ["Adapter", "Decorator", "Facade", "Proxy", "Composite"]
      },
      {
        title: "Behavioral Patterns",
        details: ["Strategy", "Observer", "Command", "State", "Template Method"]
      },
      {
        title: "Architectural Patterns",
        details: ["Hexagonal Architecture (Ports and Adapters)", "Clean Architecture / Onion Architecture", "CQRS (Command Query Responsibility Segregation)", "Strangler Fig pattern for migrating monoliths"]
      },
      {
        title: "Domain-Driven Design Tactical Patterns",
        details: ["Strategic vs Tactical Domain-Driven Design (DDD)", "Entities vs Value Objects vs Aggregates", "Aggregate Roots as Transactional Invariant Boundaries", "Domain Events & Event-Driven Decoupling", "Repositories vs DAO Antipatterns", "Anti-Corruption Layers (ACL) in Legacy Integration"]
      }
    ]
  },
  {
    level: 7,
    title: "Level 7: The Data & Storage Architect",
    subtitle: "Databases, ORM & In-Memory Storage",
    description: "Master modern storage backends: relational database internals, high-performance connection pooling, Hibernate tuning, Redis caching, and full-text search.",
    color: "from-amber-500/20 to-amber-500/5",
    badge: "bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/30",
    topics: [
      {
        title: "Relational Database Fundamentals & Advanced SQL",
        details: ["ACID Properties", "Normalization", "Indexes and Query Execution Plans", "Window Functions & Common Table Expressions (CTEs)"]
      },
      {
        title: "Database Engine Internals: B-Trees and MVCC",
        details: ["B-Tree vs LSM-Tree Storage Engines", "Write-Ahead Logging (WAL)", "Multi-Version Concurrency Control (MVCC)", "Transaction Isolation Anomalies: Dirty, Non-repeatable, Phantom, & Serialization"]
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
        title: "Distributed Caching with Redis",
        details: ["Redis In-Memory Architecture", "Core Data Structures (Strings, Hashes, Lists, Sets, Sorted Sets)", "Persistence Models: RDB vs AOF", "Redis Sentinel vs Redis Cluster (16,384 Hash Slots)"]
      },
      {
        title: "Distributed Locking and Cache Patterns",
        details: ["Cache-Aside, Write-Through, Write-Behind Topologies", "Preventing Cache Stampede, Penetration, & Breakdown", "Distributed Locks with Redisson & The Redlock Algorithm"]
      },
      {
        title: "NoSQL Databases",
        details: ["When to use NoSQL vs SQL", "Document Stores (MongoDB)", "Key-Value Stores (Redis) for Caching", "Graph Databases (Neo4j) Basics"]
      },
      {
        title: "Full-Text Search with Elasticsearch",
        details: ["Inverted Indexes & Tokenization", "Spring Data Elasticsearch Integration", "Analyzers, Tokenizers, & Scoring (BM25)", "Bulk Indexing and Search Aggregations"]
      }
    ]
  },
  {
    level: 8,
    title: "Level 8: Enterprise Spring Boot 3 Deep Dive",
    subtitle: "Enterprise Backend Architecture",
    description: "Spring Boot is the global enterprise standard. Master IoC mechanics, custom starters, Spring Batch, REST architecture, and Testcontainers.",
    color: "from-orange-500/20 to-orange-500/5",
    badge: "bg-orange-500/10 text-orange-900 dark:text-orange-300 border-orange-500/30",
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
        title: "Custom Spring Boot Starters & Auto-Configurations",
        details: ["Anatomy of a Custom Starter", "`@AutoConfiguration` and `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`", "`@ConditionalOnClass`, `@ConditionalOnProperty`, `@ConditionalOnMissingBean`", "ConfigurationProperties with Validation"]
      },
      {
        title: "Spring Batch: Chunk Processing",
        details: ["Batch Architecture: JobRepository, Job, Step", "Chunk-Oriented Processing: ItemReader, ItemProcessor, ItemWriter", "Commit Intervals, Skip/Retry Policies", "Partitioning & Scaling Parallel Batch Steps"]
      },
      {
        title: "Spring Events, Caching, & Scheduling",
        details: ["`ApplicationEventPublisher`", "`@EventListener` and `@TransactionalEventListener`", "`@Scheduled` (Cron expressions)", "`@Cacheable` with Redis"]
      },
      {
        title: "Automated Testing",
        details: ["Unit Testing with JUnit 5 and AssertJ", "Mocking dependencies with Mockito (`@Mock`, `@InjectMocks`)", "Controller testing with `MockMvc`", "Integration testing with `@SpringBootTest`", "Database testing with **TestContainers**"]
      }
    ]
  },
  {
    level: 9,
    title: "Level 9: Enterprise Security & Advanced API Protocols",
    subtitle: "Identity, Authorization & Modern Protocols",
    description: "Secure enterprise systems and move beyond simple REST. Master OAuth2, Keycloak, GraphQL with Netflix DGS, gRPC, and WebSockets.",
    color: "from-purple-500/20 to-purple-500/5",
    badge: "bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30",
    topics: [
      {
        title: "Spring Security Architecture",
        details: ["The FilterChainProxy and SecurityFilterChain", "Authentication vs Authorization", "UserDetailsService and PasswordEncoders", "Role-Based Access Control (RBAC) with `@PreAuthorize`"]
      },
      {
        title: "Stateless Authentication (JWT)",
        details: ["OAuth2 vs OIDC vs JWTs", "Structure of a JSON Web Token", "Implementing a custom JWT Authentication Filter", "Refresh token rotation strategies"]
      },
      {
        title: "OAuth2 and OIDC Resource Servers",
        details: ["OAuth2 Grant Flows: Authorization Code with PKCE, Client Credentials", "JWT Validation against JWKS Endpoint", "Opaque Tokens and Token Introspection", "Configuring Spring Security as an OAuth2 Resource Server"]
      },
      {
        title: "Centralized Identity with Keycloak",
        details: ["Keycloak Architecture: Realms, Clients, Roles, Groups", "Single Sign-On (SSO) Integration with Spring Boot", "Token Exchange & Custom Protocol Mappers", "mTLS Zero-Trust Internal Service Communication"]
      },
      {
        title: "GraphQL with Netflix DGS",
        details: ["Schema-First GraphQL Design", "Netflix DGS Framework in Spring Boot", "Query Resolvers, Mutations, and Subscriptions", "DataLoader Pattern for N+1 Batching and Caching"]
      },
      {
        title: "High-Performance gRPC in Java",
        details: ["Protocol Buffers (`.proto`) Schema & Code Generation", "HTTP/2 Multiplexing & Binary Framing", "Unary, Client-Streaming, Server-Streaming, & Bidirectional RPCs", "gRPC Interceptors and Error Handling"]
      },
      {
        title: "Real-Time Messaging: WebSockets & SSE",
        details: ["WebSocket Handshake & Protocol Mechanics", "STOMP Messaging over WebSockets", "External Message Broker Relay (RabbitMQ)", "Server-Sent Events (SSE) with Spring MVC `SseEmitter`"]
      }
    ]
  },
  {
    level: 10,
    title: "Level 10: Event-Driven Architecture & Message Streaming",
    subtitle: "High-Throughput Streaming & CDC",
    description: "Build asynchronous, decoupled enterprise platforms. Master Apache Kafka internals, consumer groups, Debezium CDC, and Outbox patterns.",
    color: "from-fuchsia-500/20 to-fuchsia-500/5",
    badge: "bg-fuchsia-500/10 text-fuchsia-800 dark:text-fuchsia-300 border-fuchsia-500/30",
    topics: [
      {
        title: "Message Brokers vs Event Streaming",
        details: ["RabbitMQ (AMQP) vs Apache Kafka (Commit Log)", "Push vs Pull Consumption Models", "Message Persistence & Ordering Guarantees", "Choosing between Brokers and Streaming Platforms"]
      },
      {
        title: "Apache Kafka Internals",
        details: ["Brokers, Topics, and Partitions", "Disk Storage: Segment Files (`.log`), Index Files (`.index`)", "Zero-Copy Data Transfer (`sendfile`)", "In-Sync Replicas (ISR) and Leader Election"]
      },
      {
        title: "Kafka Producers and Delivery Guarantees",
        details: ["Producer Architecture & RecordAccumulator", "Delivery Guarantees: At-Most-Once, At-Least-Once", "`acks=all` and `enable.idempotence=true`", "Custom Partitioners & Batch Compression (Snappy/zstd)"]
      },
      {
        title: "Kafka Consumer Groups and Rebalances",
        details: ["Consumer Group Mechanics & Partition Assignment", "Commit Strategies: `commitSync` vs `commitAsync`", "Rebalance Protocol & Cooperative Sticky Assignor", "Handling Poison Pills & Slow Consumers"]
      },
      {
        title: "Transactional Outbox and Inbox Patterns",
        details: ["The Dual-Write Problem Disaster", "Transactional Outbox Table with Database Commits", "Polling Publisher vs CDC Event Streaming", "Idempotent Consumer with the Inbox Pattern"]
      },
      {
        title: "Change Data Capture with Debezium",
        details: ["CDC Concepts & Database Transaction Log Mining", "Kafka Connect Architecture (Source & Sink Connectors)", "Debezium PostgreSQL / MySQL Connector Configuration", "Transformations and Schema Evolution Events"]
      },
      {
        title: "Schema Registry and Apache Avro",
        details: ["Why JSON is Dangerous for High-Scale Events", "Apache Avro Binary Serialization", "Confluent Schema Registry Integration", "Schema Compatibility Modes: BACKWARD, FORWARD, FULL"]
      },
      {
        title: "Resilient Event Processing and Dead Letter Queues",
        details: ["Error Handling in Spring Kafka", "Non-Blocking Retries with `@RetryableTopic`", "Dead Letter Topic (DLT) Routing & Reprocessing", "Backpressure and Circuit Breakers for Event Consumers"]
      },
      {
        title: "Stateful Stream Processing with Kafka Streams",
        details: ["KStream, KTable, and GlobalKTable Duality", "RocksDB Local Embedded State Stores", "Windowing Operations: Tumbling, Hopping, & Sliding Windows", "Stream-Table Joins & Changelog Topic Compaction", "Exactly-Once Processing Semantics (EOS) in Kafka Streams"]
      }
    ]
  },
  {
    level: 11,
    title: "Level 11: Distributed Systems & Microservices Patterns",
    subtitle: "Enterprise Microservice Architectures",
    description: "Design fault-tolerant distributed architectures. Master strategic DDD, resilience patterns, Sagas with Temporal.io, and rate limiting.",
    color: "from-indigo-500/20 to-indigo-500/5",
    badge: "bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
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
        title: "Distributed Transactions",
        details: ["The Two-Phase Commit (2PC) problem", "The Saga Pattern (Orchestration vs Choreography)", "Compensating transactions", "Eventual Consistency"]
      },
      {
        title: "Long-Running Workflows with Temporal",
        details: ["Orchestration Hell vs Durable Execution", "Temporal.io Architecture: Workflow Engine, Workers, Task Queues", "Writing Deterministic Java Workflows", "Activity Retries, Signals, and Timers"]
      },
      {
        title: "Distributed Rate Limiting and Throttling",
        details: ["Rate Limiting Algorithms: Token Bucket, Leaky Bucket, Sliding Window Log", "Distributed Rate Limiting with Redis & Lua Scripts", "Spring Cloud Gateway RequestRateLimiter", "API Throttling & 429 Too Many Requests Responses"]
      },
      {
        title: "Contract Testing with Pact",
        details: ["Why End-to-End Tests Fail in Microservices", "Consumer-Driven Contract (CDC) Testing Principles", "Writing Consumer and Provider Tests with Pact Java", "Pact Broker Integration in CI/CD"]
      }
    ]
  },
  {
    level: 12,
    title: "Level 12: Cloud-Native, Kubernetes & DevOps",
    subtitle: "Containers, Orchestration & CI/CD",
    description: "Deploy and manage resilient production workloads on Kubernetes. Master Docker multi-stage builds, Helm, GraalVM AOT, and Terraform.",
    color: "from-sky-500/20 to-sky-500/5",
    badge: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/30",
    topics: [
      {
        title: "Docker and Containerization",
        details: ["Dockerfiles for Java applications", "Multi-stage builds", "Docker Compose for local environments", "Container resource limits and JVM memory alignment"]
      },
      {
        title: "Google Jib: Daemonless Containers",
        details: ["Why Traditional Dockerfiles Fail in CI/CD", "Google Jib Maven & Gradle Plugins", "Fast Layered Builds (Dependencies, Resources, Classes)", "Reproducible Bit-for-Bit Container Images"]
      },
      {
        title: "Kubernetes (K8s) for Java Devs",
        details: ["Pods, Deployments, and ReplicaSets", "Services and Ingress", "ConfigMaps and Secrets", "Liveness and Readiness Probes for Spring Boot", "Helm Charts"]
      },
      {
        title: "Helm Package Management in K8s",
        details: ["Helm Architecture & Chart Anatomy", "Templating `values.yaml` for Multi-Environment Config", "Subcharts, Dependencies, & Hooks", "Deploying Spring Boot Microservice Fleets with Helm"]
      },
      {
        title: "Cloud Native & Serverless Java",
        details: ["GraalVM Native Images (AOT Compilation deep dive)", "Spring Boot 3 Native vs Quarkus vs Micronaut", "Cold starts in AWS Lambda", "Optimizing container images (Jib, Buildpacks)"]
      },
      {
        title: "CI/CD and Infrastructure as Code",
        details: ["GitHub Actions / GitLab CI basics", "Automating tests and deployments", "Terraform basics for Infrastructure as Code", "Zero-downtime deployment strategies (Blue/Green, Canary)"]
      }
    ]
  },
  {
    level: 13,
    title: "Level 13: High-Scale System Design, Profiling & SRE Observability",
    subtitle: "Hyperscale Architecture & Performance",
    description: "The pinnacle of production engineering. Master JVM profiling with JFR, OpenTelemetry distributed tracing, database sharding, and zero-downtime migrations.",
    color: "from-emerald-500/20 to-emerald-500/5",
    badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    topics: [
      {
        title: "System Design: Scalability Patterns",
        details: ["CAP Theorem and PACELC", "Load Balancing (L4 vs L7)", "Database Sharding and Replication strategies", "Caching Topologies (Cache-aside, Write-through) and Redis Clusters", "Content Delivery Networks (CDNs)"]
      },
      {
        title: "JVM Profiling with JFR and Async-Profiler",
        details: ["Continuous Low-Overhead Profiling in Production", "Java Flight Recorder (JFR) & JDK Mission Control (JMC)", "Async-Profiler: Flame Graphs for CPU & Memory Allocations", "Finding Bottlenecks without Profiler Safepoint Bias"]
      },
      {
        title: "Advanced JVM Tuning & Profiling",
        details: ["Understanding GC Logs", "Choosing the right GC (G1GC vs ZGC vs Shenandoah)", "Memory Leak detection with Heap Dumps (.hprof)", "Profiling with Java Flight Recorder (JFR) and VisualVM"]
      },
      {
        title: "System Design: Observability",
        details: ["The Three Pillars: Logs, Metrics, Traces", "Distributed Tracing with OpenTelemetry and Jaeger", "Centralized Logging (ELK/EFK stack)", "Metrics with Micrometer, Prometheus, and Grafana"]
      },
      {
        title: "Production Metrics with Micrometer and Prometheus",
        details: ["Micrometer Meters: Gauges, Counters, Timers, & Distribution Summaries", "Prometheus Scraping & Cardinality Explosion Prevention", "Defining Production SLOs, SLIs, & Error Budgets", "Grafana Dashboard Design for Spring Boot Apps"]
      },
      {
        title: "Zero-Downtime Deployments: Blue-Green and Canary",
        details: ["Blue/Green Deployments with Traffic Cutover", "Canary Deployments with Istio & Argo Rollouts", "The Expand and Contract Pattern for Zero-Downtime Database Migrations", "Automated Rollbacks on Error Rate Anomalies"]
      }
    ]
  },
  {
    level: 14,
    title: "Level 14: Enterprise Java & AI Orchestration",
    subtitle: "Modern AI Engineering in Java",
    description: "Harness the modern frontier of Generative AI in enterprise Java. Master Spring AI, Vector Databases (pgvector), RAG architectures, and tool-calling agents.",
    color: "from-cyan-500/20 to-cyan-500/5",
    badge: "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
    topics: [
      {
        title: "The AI Landscape for Java: Spring AI",
        details: ["The GenAI Revolution for Java Engineers", "Spring AI Architecture: Models, Prompts, Output Parsers", "Comparing Spring AI vs LangChain4j", "Connecting to OpenAI, Anthropic, Gemini, & Local Ollama Models"]
      },
      {
        title: "LLM Integration and Structured Records",
        details: ["Prompt Engineering & Prompt Templates", "Structured Output Parsing into Java 21 Records", "Streaming Responses with Reactive Flux and WebFlux", "Rate Limiting and Token Usage Management"]
      },
      {
        title: "Vector Databases and Semantic Search",
        details: ["Text Embeddings: Vectors, Dimensions, & Cosine Similarity", "Vector Databases: pgvector (PostgreSQL), Chroma, Milvus", "Storing and Querying Embeddings with Spring Data", "Hybrid Search: Combining Full-Text Search with Vector Search"]
      },
      {
        title: "Retrieval-Augmented Generation (RAG)",
        details: ["The RAG Architecture: Retrieval + Context Augmentation + Generation", "Document Ingestion: PDF/Doc Readers, Token-Aware Text Splitters", "Vector Store Indexing ETL Pipelines", "Prompt Augmentation with Relevant Domain Context"]
      },
      {
        title: "LLM Tool Calling and Function Execution",
        details: ["Function Calling Mechanics with LLMs", "Registering Java Functions as Tools in Spring AI", "Multi-Step Decision Loops and Agentic Execution", "Securing AI Tool Execution in Enterprise Backends"]
      },
      {
        title: "Multi-Agent Orchestration and Autonomous Systems",
        details: ["Autonomous Agent Architectures: Perception, Reasoning, & Action", "The ReAct (Reason + Act) Loop in Enterprise Java", "Short-Term Working Memory vs Long-Term Vector Memory", "Multi-Agent Coordination & Supervision Patterns", "Human-in-the-Loop Safeguards for Autonomous Workflows"]
      }
    ]
  },
  {
    level: 15,
    title: "Level 15: Ultra-Low Latency & Mechanical Sympathy",
    subtitle: "Sub-Microsecond Systems & Hardware Alignment",
    description: "The apex tier of high-performance Java engineering. Master mechanical sympathy, LMAX Disruptor lock-free ring buffers, Project Panama FFM off-heap memory, zero-allocation algorithms, and low-latency Aeron messaging.",
    color: "from-rose-500/20 to-rose-500/5",
    badge: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30",
    topics: [
      {
        title: "Mechanical Sympathy and CPU Architecture",
        details: ["Mechanical Sympathy: Designing Code for Modern Hardware", "CPU Cache Hierarchy (L1, L2, L3) and 64-Byte Cache Lines", "False Sharing and the `@Contended` Annotation", "Branch Predictors, Out-of-Order Execution, & Instruction Pipelines", "Hardware Memory Barriers (Store-Load, Load-Load, Store-Store)"]
      },
      {
        title: "Project Panama: Foreign Function & Memory API",
        details: ["Retiring `sun.misc.Unsafe` and JNI Pitfalls (JEP 454)", "MemorySegment, MemoryLayout, and Arenas (Confined, Shared, Global)", "Deterministic Off-Heap Memory Allocation without GC Overhead", "Calling Native C/C++ Libraries via `Linker` and `SymbolLookup`", "High-Performance Direct Memory I/O"]
      },
      {
        title: "The LMAX Disruptor and Lock-Free Ring Buffers",
        details: ["The Contention Nightmare of BlockingQueues", "Circular Ring Buffer Topology with Power-of-Two Masking", "Sequencer Architecture: Single-Producer vs Multi-Producer", "Memory Barriers without Mutex Locks", "Wait Strategies: YieldingWaitStrategy vs BusySpinWaitStrategy"]
      },
      {
        title: "Zero-Allocation Java and Garbage-Free Patterns",
        details: ["Escaping the GC: Escape Analysis & Scalar Replacement", "Flyweight Pattern for Reusable Value Mutators", "Primitive Specialized Collections (Agrona, Eclipse Collections)", "CPU Core Pinning & Thread Affinity via JNI/JNA", "Garbage-Free Logging with Log4j2 Asynchronous Appenders"]
      },
      {
        title: "Ultra-Low-Latency Messaging: Aeron and Chronicle Queue",
        details: ["The Microsecond Barrier: TCP vs UDP Multicast", "Aeron Messaging Architecture: Media Driver, Log Buffers, & Flow Control", "Chronicle Queue: Memory-Mapped Inter-Process Communication (IPC)", "Kernel Bypass Networking (Solarflare OpenOnload, DPDK)", "Designing Deterministic Sub-Microsecond Trading Engines"]
      }
    ]
  }
];
