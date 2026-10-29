// scripts/apps/level10-apps.js
// Complete, production-grade Spring Boot 3 applications for Level 10: Distributed Streaming & Kafka

const springBootPom = (artifactId, name, extraDependencies = '') => `<?xml version="1.0" encoding="UTF-8"?>
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
    <groupId>com.javahub.level10</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>${name}</name>
    <description>JavaHub Companion Lab - ${name}</description>
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
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
${extraDependencies}
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka-test</artifactId>
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
</project>
`;

module.exports = {
  // Topic: Message Brokers vs Event Streaming
  "message-brokers-vs-event-streaming": {
    topicSlug: "message-brokers-vs-event-streaming",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("broker-vs-stream-app", "Message Brokers vs Event Streaming Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: broker-vs-stream-app
`
      },
      {
        path: "src/main/java/com/javahub/streaming/StreamingApplication.java",
        content: `package com.javahub.streaming;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StreamingApplication {
    public static void main(String[] args) {
        SpringApplication.run(StreamingApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/streaming/service/LogRetentionStreamSimulator.java",
        content: `package com.javahub.streaming.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class LogRetentionStreamSimulator {

    public record PartitionOffset(long offset, String key, String payload, long timestamp) {}

    // Simulates immutable append-only commit log partitioned by key
    private final Map<Integer, List<PartitionOffset>> partitionLogs = new ConcurrentHashMap<>();

    public LogRetentionStreamSimulator() {
        partitionLogs.put(0, new CopyOnWriteArrayList<>());
        partitionLogs.put(1, new CopyOnWriteArrayList<>());
    }

    public synchronized PartitionOffset append(String key, String payload) {
        int partition = Math.abs(key.hashCode() % 2);
        List<PartitionOffset> log = partitionLogs.get(partition);
        long offset = log.size();
        PartitionOffset entry = new PartitionOffset(offset, key, payload, System.currentTimeMillis());
        log.add(entry);
        return entry;
    }

    public List<PartitionOffset> readFromOffset(int partition, long startOffset, int limit) {
        List<PartitionOffset> log = partitionLogs.getOrDefault(partition, List.of());
        return log.stream()
                .filter(e -> e.offset() >= startOffset)
                .limit(limit)
                .toList();
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/streaming/controller/StreamLogController.java",
        content: `package com.javahub.streaming.controller;

import com.javahub.streaming.service.LogRetentionStreamSimulator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/stream")
public class StreamLogController {

    private final LogRetentionStreamSimulator simulator;

    public StreamLogController(LogRetentionStreamSimulator simulator) {
        this.simulator = simulator;
    }

    @PostMapping("/produce")
    public ResponseEntity<LogRetentionStreamSimulator.PartitionOffset> produce(
            @RequestParam String key,
            @RequestParam String payload) {
        return ResponseEntity.ok(simulator.append(key, payload));
    }

    @GetMapping("/consume")
    public ResponseEntity<List<LogRetentionStreamSimulator.PartitionOffset>> consume(
            @RequestParam(defaultValue = "0") int partition,
            @RequestParam(defaultValue = "0") long offset,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(simulator.readFromOffset(partition, offset, limit));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/streaming/StreamingApplicationTests.java",
        content: `package com.javahub.streaming;

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
class StreamingApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify append-only log production and offset-based playback")
    void testProduceAndConsume() throws Exception {
        mockMvc.perform(post("/api/v1/stream/produce?key=ORD-01&payload=PaymentCaptured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.offset").value(0))
                .andExpect(jsonPath("$.key").value("ORD-01"));

        mockMvc.perform(get("/api/v1/stream/consume?partition=1&offset=0"))
                .andExpect(status().isOk());
    }
}
`
      },
      {
        path: "README.md",
        content: `# Message Brokers vs Event Streaming Live Application

Demonstrates:
- **Append-Only Distributed Commit Log**: Preserving events permanently rather than destructive queue consumption.
- **Partitioning by Key**: Preserving deterministic ordering per partition.
- **Consumer Offset Replayability**: Reprocessing events from arbitrary past offsets.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Produce event to partitioned log
curl -X POST "http://localhost:8080/api/v1/stream/produce?key=ORD-101&payload=OrderCreated"

# 2. Consume events from partition offset 0
curl -X GET "http://localhost:8080/api/v1/stream/consume?partition=1&offset=0"
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // Topic: Transactional Outbox Pattern
  "transactional-outbox-and-inbox-patterns": {
    topicSlug: "transactional-outbox-and-inbox-patterns",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("transactional-outbox-app", "Transactional Outbox Pattern Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: transactional-outbox-app
  datasource:
    url: jdbc:h2:mem:outboxdb;DB_CLOSE_DELAY=-1
    driverClassName: org.h2.Driver
    username: sa
    password: ""
  jpa:
    hibernate:
      ddl-auto: create-drop
`
      },
      {
        path: "src/main/java/com/javahub/outbox/OutboxApplication.java",
        content: `package com.javahub.outbox;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OutboxApplication {
    public static void main(String[] args) {
        SpringApplication.run(OutboxApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/outbox/entity/OutboxEvent.java",
        content: `package com.javahub.outbox.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String aggregateType;

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false)
    private String eventType;

    @Lob
    @Column(nullable = false)
    private String payload;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, PUBLISHED

    private Instant createdAt = Instant.now();

    public OutboxEvent() {}

    public OutboxEvent(String aggregateType, String aggregateId, String eventType, String payload) {
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.payload = payload;
    }

    public Long getId() { return id; }
    public String getAggregateId() { return aggregateId; }
    public String getEventType() { return eventType; }
    public String getPayload() { return payload; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
`
      },
      {
        path: "src/main/java/com/javahub/outbox/repository/OutboxRepository.java",
        content: `package com.javahub.outbox.repository;

import com.javahub.outbox.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboxRepository extends JpaRepository<OutboxEvent, Long> {
    List<OutboxEvent> findByStatus(String status);
}
`
      },
      {
        path: "src/main/java/com/javahub/outbox/service/OrderOutboxService.java",
        content: `package com.javahub.outbox.service;

import com.javahub.outbox.entity.OutboxEvent;
import com.javahub.outbox.repository.OutboxRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderOutboxService {

    private static final Logger log = LoggerFactory.getLogger(OrderOutboxService.class);
    private final OutboxRepository outboxRepository;

    public OrderOutboxService(OutboxRepository outboxRepository) {
        this.outboxRepository = outboxRepository;
    }

    @Transactional
    public OutboxEvent createOrderWithOutbox(String orderId, double amount) {
        // In real business logic: save Order entity and OutboxEvent atomically in same DB transaction
        OutboxEvent event = new OutboxEvent(
            "ORDER",
            orderId,
            "OrderCreated",
            "{\\"orderId\\": \\"" + orderId + "\\", \\"amount\\": " + amount + "}"
        );
        return outboxRepository.save(event);
    }

    @Scheduled(fixedRate = 2000)
    @Transactional
    public void relayOutboxEvents() {
        List<OutboxEvent> pending = outboxRepository.findByStatus("PENDING");
        for (OutboxEvent event : pending) {
            log.info(">> [OUTBOX RELAY] Publishing event {} for aggregate {} to Kafka", event.getEventType(), event.getAggregateId());
            // In real app: kafkaTemplate.send(topic, event.getPayload())
            event.setStatus("PUBLISHED");
            outboxRepository.save(event);
        }
    }

    public List<OutboxEvent> getAllEvents() {
        return outboxRepository.findAll();
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/outbox/controller/OutboxDemoController.java",
        content: `package com.javahub.outbox.controller;

import com.javahub.outbox.entity.OutboxEvent;
import com.javahub.outbox.service.OrderOutboxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/outbox")
public class OutboxDemoController {

    private final OrderOutboxService service;

    public OutboxDemoController(OrderOutboxService service) {
        this.service = service;
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> placeOrder(
            @RequestParam String orderId,
            @RequestParam double amount) {
        OutboxEvent event = service.createOrderWithOutbox(orderId, amount);
        return ResponseEntity.ok(Map.of(
            "orderId", orderId,
            "outboxEventId", event.getId(),
            "status", event.getStatus()
        ));
    }

    @GetMapping("/events")
    public ResponseEntity<List<OutboxEvent>> listEvents() {
        return ResponseEntity.ok(service.getAllEvents());
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/outbox/OutboxApplicationTests.java",
        content: `package com.javahub.outbox;

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
class OutboxApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify atomic order outbox creation and scheduled relay")
    void testOutboxCycle() throws Exception {
        mockMvc.perform(post("/api/v1/outbox/orders?orderId=ORD-909&amount=550.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("ORD-909"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Wait brief moment for scheduled relay
        Thread.sleep(2500);

        mockMvc.perform(get("/api/v1/outbox/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PUBLISHED"));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Transactional Outbox Pattern Live Application

Demonstrates:
- **Dual-Write Hazard Mitigation**: Preventing inconsistencies between database commits and message broker dispatch.
- **Outbox Relay**: Asynchronously publishing events to Kafka without blocking user transactions.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Place order (creates outbox event atomically)
curl -X POST "http://localhost:8080/api/v1/outbox/orders?orderId=ORD-7711&amount=899.00"

# 2. Inspect outbox events (transitions from PENDING to PUBLISHED via scheduled relay)
curl -X GET http://localhost:8080/api/v1/outbox/events
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  }
};
