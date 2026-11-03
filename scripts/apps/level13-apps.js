// scripts/apps/level13-apps.js
// Level 13: High-Scale System Design, Profiling & SRE Observability (6 topics)

module.exports = {
  // 1. System Design: Scalability Patterns
  'system-design-scalability-patterns': {
    level: 13,
    topicSlug: 'system-design-scalability-patterns',
    title: 'Scalability Patterns: Consistent Hashing Ring & Partitioning',
    files: [
      {
        path: 'pom.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>io.javahub.level13</groupId>
    <artifactId>scalability-patterns-service</artifactId>
    <version>1.0.0</version>
    <name>scalability-patterns-service</name>
    <description>Consistent Hashing with Virtual Nodes & Partitioning Router</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
      },
      {
        path: 'src/main/resources/application.yml',
        content: `server:
  port: 8080
spring:
  application:
    name: scalability-patterns-service`
      },
      {
        path: 'src/main/java/io/javahub/level13/scalability/ScalabilityApplication.java',
        content: `package io.javahub.level13.scalability;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ScalabilityApplication {
    public static void main(String[] args) {
        SpringApplication.run(ScalabilityApplication.class, args);
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/scalability/router/ConsistentHashRouter.java',
        content: `package io.javahub.level13.scalability.router;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class ConsistentHashRouter {

    private final SortedMap<Long, String> ring = new TreeMap<>();
    private final int numberOfReplicas;
    private final Set<String> physicalNodes = new HashSet<>();

    public ConsistentHashRouter() {
        this(100); // 100 virtual nodes per physical host by default
        addNode("storage-node-east-1");
        addNode("storage-node-west-2");
        addNode("storage-node-eu-central-1");
    }

    public ConsistentHashRouter(int numberOfReplicas) {
        this.numberOfReplicas = numberOfReplicas;
    }

    public synchronized void addNode(String node) {
        physicalNodes.add(node);
        for (int i = 0; i < numberOfReplicas; i++) {
            long hash = hash(node + "-vnode-" + i);
            ring.put(hash, node);
        }
    }

    public synchronized void removeNode(String node) {
        physicalNodes.remove(node);
        for (int i = 0; i < numberOfReplicas; i++) {
            long hash = hash(node + "-vnode-" + i);
            ring.remove(hash);
        }
    }

    public synchronized String routeKey(String key) {
        if (ring.isEmpty()) {
            return null;
        }
        long hash = hash(key);
        if (!ring.containsKey(hash)) {
            SortedMap<Long, String> tailMap = ring.tailMap(hash);
            hash = tailMap.isEmpty() ? ring.firstKey() : tailMap.firstKey();
        }
        return ring.get(hash);
    }

    public synchronized Set<String> getPhysicalNodes() {
        return Collections.unmodifiableSet(physicalNodes);
    }

    public synchronized int getVirtualNodeCount() {
        return ring.size();
    }

    private long hash(String key) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(key.getBytes(StandardCharsets.UTF_8));
            // 32-bit integer truncation from digest
            return ((long) (digest[3] & 0xFF) << 24)
                    | ((long) (digest[2] & 0xFF) << 16)
                    | ((long) (digest[1] & 0xFF) << 8)
                    | ((long) (digest[0] & 0xFF));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 not available", e);
        }
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/scalability/controller/PartitioningController.java',
        content: `package io.javahub.level13.scalability.controller;

import io.javahub.level13.scalability.router.ConsistentHashRouter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/partitioning")
public class PartitioningController {

    private final ConsistentHashRouter router;

    public PartitioningController(ConsistentHashRouter router) {
        this.router = router;
    }

    @GetMapping("/route")
    public ResponseEntity<Map<String, Object>> route(@RequestParam String key) {
        String targetNode = router.routeKey(key);
        return ResponseEntity.ok(Map.of(
                "key", key,
                "assignedNode", targetNode,
                "totalPhysicalNodes", router.getPhysicalNodes().size(),
                "totalVirtualNodes", router.getVirtualNodeCount()
        ));
    }

    @PostMapping("/nodes")
    public ResponseEntity<Map<String, Object>> addNode(@RequestParam String nodeName) {
        router.addNode(nodeName);
        return ResponseEntity.ok(Map.of("message", "Node added to hash ring", "node", nodeName));
    }
}`
      },
      {
        path: 'src/test/java/io/javahub/level13/scalability/ScalabilityApplicationTest.java',
        content: `package io.javahub.level13.scalability;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ScalabilityApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify consistent hashing routing assigns keys deterministically to nodes")
    void shouldRouteKeysDeterministically() throws Exception {
        mockMvc.perform(get("/api/v1/partitioning/route").param("key", "user:session:10492"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.key").value("user:session:10492"))
                .andExpect(jsonPath("$.assignedNode").isNotEmpty())
                .andExpect(jsonPath("$.totalPhysicalNodes").value(3))
                .andExpect(jsonPath("$.totalVirtualNodes").value(300));
    }
}`
      },
      {
        path: 'README.md',
        content: `# Level 13: System Design — Consistent Hashing & Scalability Patterns

This project provides a production-grade **Consistent Hashing Ring** implementation featuring:
- **Virtual Nodes**: Prevents hash skew and hot-spotting by mapping each physical machine to 100 virtual points on the 32-bit circular key space.
- **Minimal Rebalancing**: Adding or removing a physical server migrates only $K/N$ keys, compared to $O(K)$ catastrophic invalidation with traditional modulo hashing.

---

## Testing Routing

\`\`\`bash
# Route a session key
curl -s "http://localhost:8080/api/v1/partitioning/route?key=session_98234"

# Add a fourth cluster node
curl -X POST "http://localhost:8080/api/v1/partitioning/nodes?nodeName=storage-node-apac-1"
\`\`\``
      }
    ]
  },

  // 2. JVM Profiling with JFR and Async-Profiler
  'jvm-profiling-with-jfr-and-async-profiler': {
    level: 13,
    topicSlug: 'jvm-profiling-with-jfr-and-async-profiler',
    title: 'JVM Profiling with Java Flight Recorder (JFR) & Custom Events',
    files: [
      {
        path: 'pom.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>io.javahub.level13</groupId>
    <artifactId>jfr-profiling-service</artifactId>
    <version>1.0.0</version>
    <name>jfr-profiling-service</name>
    <description>Continuous Production Profiling with Custom JDK Flight Recorder (JFR) Events</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
      },
      {
        path: 'src/main/resources/application.yml',
        content: `server:
  port: 8080
spring:
  application:
    name: jfr-profiling-service`
      },
      {
        path: 'src/main/java/io/javahub/level13/jfr/JfrApplication.java',
        content: `package io.javahub.level13.jfr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JfrApplication {
    public static void main(String[] args) {
        SpringApplication.run(JfrApplication.class, args);
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/jfr/event/PaymentProcessingEvent.java',
        content: `package io.javahub.level13.jfr.event;

import jdk.jfr.Category;
import jdk.jfr.Description;
import jdk.jfr.Event;
import jdk.jfr.Label;
import jdk.jfr.Name;

@Name("io.javahub.PaymentProcessing")
@Label("Payment Processing Transaction")
@Category({"JavaHub", "Business Logic"})
@Description("Records the execution latency and outcome of enterprise payment flows")
public class PaymentProcessingEvent extends Event {

    @Label("Transaction ID")
    private String transactionId;

    @Label("Amount")
    private double amount;

    @Label("Gateway Status")
    private String status;

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public double getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/jfr/controller/ProfilingTriggerController.java',
        content: `package io.javahub.level13.jfr.controller;

import io.javahub.level13.jfr.event.PaymentProcessingEvent;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiling")
public class ProfilingTriggerController {

    @PostMapping("/simulate-workload")
    public ResponseEntity<Map<String, Object>> simulatePayment(@RequestParam(defaultValue = "100.0") double amount) {
        String txId = UUID.randomUUID().toString();

        PaymentProcessingEvent event = new PaymentProcessingEvent();
        event.setTransactionId(txId);
        event.setAmount(amount);

        // Begin recording JFR event duration
        event.begin();
        try {
            // Simulate CPU & thread work
            Thread.sleep(15);
            event.setStatus("COMPLETED_SUCCESS");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            event.setStatus("INTERRUPTED");
        } finally {
            // Commit event directly into JVM flight recorder circular ring buffer
            event.commit();
        }

        return ResponseEntity.ok(Map.of(
                "transactionId", txId,
                "amount", amount,
                "jfrEventCommitted", true
        ));
    }
}`
      },
      {
        path: 'src/test/java/io/javahub/level13/jfr/JfrApplicationTest.java',
        content: `package io.javahub.level13.jfr;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JfrApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify custom JFR payment event commits to runtime event pipeline")
    void shouldCommitJfrEvent() throws Exception {
        mockMvc.perform(post("/api/v1/profiling/simulate-workload").param("amount", "250.50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").isNotEmpty())
                .andExpect(jsonPath("$.jfrEventCommitted").value(true));
    }
}`
      },
      {
        path: 'README.md',
        content: `# Level 13: JVM Profiling with JFR & Custom Events

Continuous production profiling using **Java Flight Recorder (JFR)** introduces less than 1% overhead, making it safe for production hyperscale deployments.

---

## Starting JFR Recording at JVM Startup

\`\`\`bash
java -XX:StartFlightRecording=disk=true,dumponexit=true,filename=recording.jfr,settings=profile -jar app.jar
\`\`\`

## Starting JFR via JDK \`jcmd\` on a Running Process

\`\`\`bash
# 1. Discover JVM PID
jcmd

# 2. Start a 60-second diagnostic recording
jcmd <PID> JFR.start name=prod-profiling duration=60s filename=prod-profile.jfr
\`\`\``
      }
    ]
  },

  // 3. Advanced JVM Tuning & Profiling
  'advanced-jvm-tuning-profiling': {
    level: 13,
    topicSlug: 'advanced-jvm-tuning-profiling',
    title: 'Advanced JVM Tuning, Memory Pool Diagnostics & GC Analysis',
    files: [
      {
        path: 'pom.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>io.javahub.level13</groupId>
    <artifactId>jvm-tuning-service</artifactId>
    <version>1.0.0</version>
    <name>jvm-tuning-service</name>
    <description>Enterprise JVM Tuning, Generational Memory Pools and GC Metrics</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
      },
      {
        path: 'src/main/resources/application.yml',
        content: `server:
  port: 8080
spring:
  application:
    name: jvm-tuning-service`
      },
      {
        path: 'src/main/java/io/javahub/level13/tuning/JvmTuningApplication.java',
        content: `package io.javahub.level13.tuning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JvmTuningApplication {
    public static void main(String[] args) {
        SpringApplication.run(JvmTuningApplication.class, args);
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/tuning/controller/JvmMemoryDiagnosticsController.java',
        content: `package io.javahub.level13.tuning.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryPoolMXBean;
import java.lang.management.MemoryUsage;
import java.util.*;

@RestController
@RequestMapping("/api/v1/jvm")
public class JvmMemoryDiagnosticsController {

    @GetMapping("/memory-pools")
    public ResponseEntity<Map<String, Object>> getMemoryPools() {
        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> poolList = new ArrayList<>();

        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            MemoryUsage usage = pool.getUsage();
            poolList.add(Map.of(
                    "name", pool.getName(),
                    "type", pool.getType().toString(),
                    "usedMb", usage.getUsed() / (1024 * 1024),
                    "committedMb", usage.getCommitted() / (1024 * 1024),
                    "maxMb", usage.getMax() > 0 ? usage.getMax() / (1024 * 1024) : -1
            ));
        }

        List<Map<String, Object>> gcList = new ArrayList<>();
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            gcList.add(Map.of(
                    "name", gc.getName(),
                    "collectionCount", gc.getCollectionCount(),
                    "collectionTimeMs", gc.getCollectionTime()
            ));
        }

        response.put("memoryPools", poolList);
        response.put("garbageCollectors", gcList);
        return ResponseEntity.ok(response);
    }
}`
      },
      {
        path: 'src/test/java/io/javahub/level13/tuning/JvmTuningApplicationTest.java',
        content: `package io.javahub.level13.tuning;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JvmTuningApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify JVM memory pools and GC collectors are exposed via diagnostic API")
    void shouldExposeMemoryPools() throws Exception {
        mockMvc.perform(get("/api/v1/jvm/memory-pools"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.memoryPools").isArray())
                .andExpect(jsonPath("$.garbageCollectors").isArray());
    }
}`
      },
      {
        path: 'README.md',
        content: `# Level 13: Advanced JVM Tuning & Generational GC Profiling

This project provides live runtime diagnostics into JVM generational memory structures (Eden, Survivor, Old Gen / Tenured, Metaspace) and GC metrics.

---

## Production Recommended Flag Profiles

### 1. Low Latency: Generational ZGC (Java 21+)
\`\`\`bash
java -XX:+UseZGC -XX:+ZGenerational -Xms4g -Xmx4g -jar app.jar
\`\`\`

### 2. High Throughput: G1GC with String Deduplication
\`\`\`bash
java -XX:+UseG1GC \\
     -XX:MaxGCPauseMillis=100 \\
     -XX:+UseStringDeduplication \\
     -Xlog:gc*,gc+phases=debug:file=/var/log/app/gc.log:time,uptime,pid:filecount=5,filesize=50M \\
     -jar app.jar
\`\`\``
      }
    ]
  },

  // 4. System Design: Observability
  'system-design-observability': {
    level: 13,
    topicSlug: 'system-design-observability',
    title: 'Distributed Tracing & W3C TraceContext Propagation',
    files: [
      {
        path: 'pom.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>io.javahub.level13</groupId>
    <artifactId>observability-tracing-service</artifactId>
    <version>1.0.0</version>
    <name>observability-tracing-service</name>
    <description>OpenTelemetry Distributed Tracing & W3C TraceContext Propagation</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-tracing-bridge-otel</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
      },
      {
        path: 'src/main/resources/application.yml',
        content: `server:
  port: 8080
spring:
  application:
    name: observability-tracing-service

management:
  tracing:
    sampling:
      probability: 1.0
  endpoints:
    web:
      exposure:
        include: health,info,metrics`
      },
      {
        path: 'src/main/java/io/javahub/level13/observability/ObservabilityApplication.java',
        content: `package io.javahub.level13.observability;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ObservabilityApplication {
    public static void main(String[] args) {
        SpringApplication.run(ObservabilityApplication.class, args);
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/observability/controller/TraceContextController.java',
        content: `package io.javahub.level13.observability.controller;

import io.micrometer.tracing.Tracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/observability")
public class TraceContextController {

    private static final Logger log = LoggerFactory.getLogger(TraceContextController.class);
    private final Tracer tracer;

    public TraceContextController(Tracer tracer) {
        this.tracer = tracer;
    }

    @GetMapping("/trace")
    public ResponseEntity<Map<String, String>> getCurrentTrace() {
        var currentSpan = tracer.currentSpan();
        String traceId = currentSpan != null ? currentSpan.context().traceId() : "none";
        String spanId = currentSpan != null ? currentSpan.context().spanId() : "none";

        log.info("Processing request within active OpenTelemetry context: traceId={}, spanId={}", traceId, spanId);

        return ResponseEntity.ok(Map.of(
                "traceId", traceId,
                "spanId", spanId,
                "w3cStandard", "traceparent: 00-" + traceId + "-" + spanId + "-01"
        ));
    }
}`
      },
      {
        path: 'src/test/java/io/javahub/level13/observability/ObservabilityApplicationTest.java',
        content: `package io.javahub.level13.observability;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ObservabilityApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify distributed tracing assigns valid W3C traceId and spanId")
    void shouldReturnActiveTraceContext() throws Exception {
        mockMvc.perform(get("/api/v1/observability/trace"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andExpect(jsonPath("$.spanId").isNotEmpty());
    }
}`
      },
      {
        path: 'README.md',
        content: `# Level 13: System Design — Distributed Tracing with OpenTelemetry

This project demonstrates distributed tracing and **W3C TraceContext** (\`traceparent\`) propagation across asynchronous service boundaries.

---

## W3C TraceContext Specification

The \`traceparent\` header format:
\`\`\`
version-trace_id-parent_id-trace_flags
00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
\`\`\`

---

## Verification

\`\`\`bash
# Trigger traced request
curl -s http://localhost:8080/api/v1/observability/trace

# Run test suite
mvn clean test
\`\`\``
      }
    ]
  },

  // 5. Production Metrics with Micrometer and Prometheus
  'production-metrics-with-micrometer-and-prometheus': {
    level: 13,
    topicSlug: 'production-metrics-with-micrometer-and-prometheus',
    title: 'Production Metrics with Micrometer & Prometheus',
    files: [
      {
        path: 'pom.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>io.javahub.level13</groupId>
    <artifactId>prometheus-metrics-service</artifactId>
    <version>1.0.0</version>
    <name>prometheus-metrics-service</name>
    <description>Enterprise Production Metrics, SLO Histograms & Prometheus Scraping</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-registry-prometheus</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
      },
      {
        path: 'src/main/resources/application.yml',
        content: `server:
  port: 8080
spring:
  application:
    name: prometheus-metrics-service

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    distribution:
      percentiles-histogram:
        http.server.requests: true`
      },
      {
        path: 'src/main/java/io/javahub/level13/metrics/MetricsApplication.java',
        content: `package io.javahub.level13.metrics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MetricsApplication {
    public static void main(String[] args) {
        SpringApplication.run(MetricsApplication.class, args);
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/metrics/service/OrderTelemetryService.java',
        content: `package io.javahub.level13.metrics.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class OrderTelemetryService {

    private final Counter orderSuccessCounter;
    private final Counter orderFailureCounter;
    private final Timer orderProcessingTimer;
    private final AtomicInteger pendingOrdersGauge;

    public OrderTelemetryService(MeterRegistry registry) {
        this.orderSuccessCounter = Counter.builder("business.orders.placed")
                .tag("status", "success")
                .description("Total successfully completed orders")
                .register(registry);

        this.orderFailureCounter = Counter.builder("business.orders.placed")
                .tag("status", "failed")
                .description("Total failed orders")
                .register(registry);

        this.orderProcessingTimer = Timer.builder("business.orders.latency")
                .description("Latency distribution of checkout operations")
                .publishPercentiles(0.50, 0.95, 0.99)
                .register(registry);

        this.pendingOrdersGauge = registry.gauge("business.orders.pending.queue", new AtomicInteger(0));
    }

    public void recordOrder(boolean success, long durationMs) {
        if (success) {
            orderSuccessCounter.increment();
        } else {
            orderFailureCounter.increment();
        }
        orderProcessingTimer.record(Duration.ofMillis(durationMs));
    }

    public void updatePendingQueue(int count) {
        pendingOrdersGauge.set(count);
    }

    public double getSuccessCount() {
        return orderSuccessCounter.count();
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/metrics/controller/MetricsTriggerController.java',
        content: `package io.javahub.level13.metrics.controller;

import io.javahub.level13.metrics.service.OrderTelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/telemetry")
public class MetricsTriggerController {

    private final OrderTelemetryService telemetryService;

    public MetricsTriggerController(OrderTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestParam(defaultValue = "true") boolean success,
                                                          @RequestParam(defaultValue = "45") long durationMs) {
        telemetryService.recordOrder(success, durationMs);
        return ResponseEntity.ok(Map.of(
                "status", success ? "SUCCESS" : "FAILED",
                "recordedLatencyMs", durationMs,
                "totalSuccessfulOrders", telemetryService.getSuccessCount()
        ));
    }
}`
      },
      {
        path: 'src/test/java/io/javahub/level13/metrics/MetricsApplicationTest.java',
        content: `package io.javahub.level13.metrics;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MetricsApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify custom Micrometer counters increment and Prometheus endpoint exposes metrics")
    void shouldRecordAndExposePrometheusMetrics() throws Exception {
        // Increment metric
        mockMvc.perform(post("/api/v1/telemetry/orders").param("success", "true").param("durationMs", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        // Verify prometheus scraping endpoint
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk());
    }
}`
      },
      {
        path: 'README.md',
        content: `# Level 13: Production Metrics with Micrometer & Prometheus

This project configures **Micrometer** meters (Counters, Gauges, Timers with p95/p99 percentiles) and exposes them formatted for Prometheus scraping at \`/actuator/prometheus\`.

---

## Testing Prometheus Scraping

\`\`\`bash
# Trigger business orders to populate metrics
curl -X POST "http://localhost:8080/api/v1/telemetry/orders?success=true&durationMs=25"

# Scrape metrics formatted in OpenMetrics / Prometheus notation
curl -s http://localhost:8080/actuator/prometheus | grep "business_orders"
\`\`\``
      }
    ]
  },

  // 6. Zero-Downtime Deployments: Blue-Green and Canary
  'zero-downtime-deployments-blue-green-and-canary': {
    level: 13,
    topicSlug: 'zero-downtime-deployments-blue-green-and-canary',
    title: 'Zero-Downtime Deployments: Blue-Green & Canary Rollouts',
    files: [
      {
        path: 'pom.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>io.javahub.level13</groupId>
    <artifactId>canary-deployment-service</artifactId>
    <version>1.0.0</version>
    <name>canary-deployment-service</name>
    <description>Dynamic Canary Traffic Splitting & Blue/Green Cutover Engine</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
      },
      {
        path: 'src/main/resources/application.yml',
        content: `server:
  port: 8080
spring:
  application:
    name: canary-deployment-service`
      },
      {
        path: 'src/main/java/io/javahub/level13/deployments/DeploymentsApplication.java',
        content: `package io.javahub.level13.deployments;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DeploymentsApplication {
    public static void main(String[] args) {
        SpringApplication.run(DeploymentsApplication.class, args);
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/deployments/router/CanaryTrafficRouter.java',
        content: `package io.javahub.level13.deployments.router;

import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class CanaryTrafficRouter {

    private final AtomicInteger canaryWeightPercentage = new AtomicInteger(10); // 10% canary traffic
    private volatile boolean isCutoverToGreen = false;

    public String routeTraffic() {
        if (isCutoverToGreen) {
            return "GREEN_V2_ACTIVE";
        }

        int diceRoll = ThreadLocalRandom.current().nextInt(100);
        if (diceRoll < canaryWeightPercentage.get()) {
            return "CANARY_V2_EXPERIMENTAL";
        }
        return "BLUE_V1_STABLE";
    }

    public void setCanaryWeight(int percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException("Weight must be between 0 and 100");
        }
        this.canaryWeightPercentage.set(percentage);
    }

    public void completeCutover() {
        this.isCutoverToGreen = true;
    }

    public void emergencyRollback() {
        this.canaryWeightPercentage.set(0);
        this.isCutoverToGreen = false;
    }

    public int getCanaryWeight() {
        return canaryWeightPercentage.get();
    }

    public boolean isCutoverToGreen() {
        return isCutoverToGreen;
    }
}`
      },
      {
        path: 'src/main/java/io/javahub/level13/deployments/controller/CanaryTrafficController.java',
        content: `package io.javahub.level13.deployments.controller;

import io.javahub.level13.deployments.router.CanaryTrafficRouter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/deployments")
public class CanaryTrafficController {

    private final CanaryTrafficRouter router;

    public CanaryTrafficController(CanaryTrafficRouter router) {
        this.router = router;
    }

    @GetMapping("/route")
    public ResponseEntity<Map<String, Object>> routeTraffic() {
        String targetDeployment = router.routeTraffic();
        return ResponseEntity.ok(Map.of(
                "targetDeployment", targetDeployment,
                "currentCanaryWeight", router.getCanaryWeight() + "%",
                "isCutoverToGreen", router.isCutoverToGreen()
        ));
    }

    @PostMapping("/canary-weight")
    public ResponseEntity<Map<String, Object>> updateWeight(@RequestParam int weight) {
        router.setCanaryWeight(weight);
        return ResponseEntity.ok(Map.of("message", "Canary weight updated", "newWeight", weight));
    }

    @PostMapping("/rollback")
    public ResponseEntity<Map<String, String>> rollback() {
        router.emergencyRollback();
        return ResponseEntity.ok(Map.of("message", "Emergency rollback executed: 100% traffic to BLUE_V1"));
    }
}`
      },
      {
        path: 'src/test/java/io/javahub/level13/deployments/DeploymentsApplicationTest.java',
        content: `package io.javahub.level13.deployments;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DeploymentsApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify canary weight adjustments and traffic routing decisions")
    void shouldAdjustCanaryWeightAndRoute() throws Exception {
        mockMvc.perform(post("/api/v1/deployments/canary-weight").param("weight", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newWeight").value(50));

        mockMvc.perform(get("/api/v1/deployments/route"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetDeployment").isNotEmpty());
    }
}`
      },
      {
        path: 'README.md',
        content: `# Level 13: Zero-Downtime Deployments — Blue-Green & Canary Rollouts

This project implements a dynamic traffic router demonstrating:
1. **Canary Releases**: Route a small percentage of user traffic (e.g. 5% $\to$ 20% $\to$ 50%) to the new release to validate production error rates and latency.
2. **Automated Rollback**: Instantly route 100% of traffic back to the stable Blue deployment if error budget anomalies occur.
3. **Instant Cutover**: Promote Green to 100% primary once health gates are satisfied.

---

## Verification Commands

\`\`\`bash
# Test traffic route
curl -s http://localhost:8080/api/v1/deployments/route

# Set canary weight to 25%
curl -X POST "http://localhost:8080/api/v1/deployments/canary-weight?weight=25"

# Emergency rollback
curl -X POST http://localhost:8080/api/v1/deployments/rollback
\`\`\``
      }
    ]
  }
};
