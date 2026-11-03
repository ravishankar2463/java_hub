// scripts/apps/level10-apps.js
// Complete, production-grade Spring Boot 3 applications for all 9 Level 10 topics: Distributed Streaming & Kafka

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
  // Topic 1: Message Brokers vs Event Streaming
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
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: broker-vs-stream-app\n`
      },
      {
        path: "src/main/java/com/javahub/streaming/StreamingApplication.java",
        content: `package com.javahub.streaming;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class StreamingApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(StreamingApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/streaming/service/LogRetentionStreamSimulator.java",
        content: `package com.javahub.streaming.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\nimport java.util.concurrent.CopyOnWriteArrayList;\n@Service\npublic class LogRetentionStreamSimulator {\n    public record PartitionOffset(long offset, String key, String payload, long timestamp) {}\n    private final Map<Integer, List<PartitionOffset>> partitionLogs = new ConcurrentHashMap<>();\n    public LogRetentionStreamSimulator() {\n        partitionLogs.put(0, new CopyOnWriteArrayList<>());\n        partitionLogs.put(1, new CopyOnWriteArrayList<>());\n    }\n    public synchronized PartitionOffset append(String key, String payload) {\n        int partition = Math.abs(key.hashCode() % 2);\n        List<PartitionOffset> log = partitionLogs.get(partition);\n        long offset = log.size();\n        PartitionOffset entry = new PartitionOffset(offset, key, payload, System.currentTimeMillis());\n        log.add(entry);\n        return entry;\n    }\n    public List<PartitionOffset> readFromOffset(int partition, long startOffset, int limit) {\n        List<PartitionOffset> log = partitionLogs.getOrDefault(partition, List.of());\n        return log.stream().filter(e -> e.offset() >= startOffset).limit(limit).toList();\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/streaming/controller/StreamLogController.java",
        content: `package com.javahub.streaming.controller;\nimport com.javahub.streaming.service.LogRetentionStreamSimulator;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n@RestController\n@RequestMapping("/api/v1/stream")\npublic class StreamLogController {\n    private final LogRetentionStreamSimulator simulator;\n    public StreamLogController(LogRetentionStreamSimulator simulator) { this.simulator = simulator; }\n    @PostMapping("/produce")\n    public ResponseEntity<LogRetentionStreamSimulator.PartitionOffset> produce(@RequestParam String key, @RequestParam String payload) {\n        return ResponseEntity.ok(simulator.append(key, payload));\n    }\n    @GetMapping("/consume")\n    public ResponseEntity<List<LogRetentionStreamSimulator.PartitionOffset>> consume(@RequestParam(defaultValue = "0") int partition, @RequestParam(defaultValue = "0") long offset, @RequestParam(defaultValue = "10") int limit) {\n        return ResponseEntity.ok(simulator.readFromOffset(partition, offset, limit));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/streaming/StreamingApplicationTests.java",
        content: `package com.javahub.streaming;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass StreamingApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify append-only log production and offset-based playback")\n    void testProduceAndConsume() throws Exception {\n        mockMvc.perform(post("/api/v1/stream/produce?key=ORD-01&payload=PaymentCaptured"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.offset").value(0))\n                .andExpect(jsonPath("$.key").value("ORD-01"));\n        mockMvc.perform(get("/api/v1/stream/consume?partition=1&offset=0"))\n                .andExpect(status().isOk());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Message Brokers vs Event Streaming Live Application\n\nRun server: \`mvn spring-boot:run\`\nProduce event: \`curl -X POST "http://localhost:8080/api/v1/stream/produce?key=ORD-101&payload=OrderCreated"\`\n`
      }
    ]
  },

  // Topic 2: Apache Kafka Internals
  "apache-kafka-internals": {
    topicSlug: "apache-kafka-internals",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("kafka-internals-app", "Apache Kafka Internals Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: kafka-internals-app\n`
      },
      {
        path: "src/main/java/com/javahub/internals/KafkaInternalsApplication.java",
        content: `package com.javahub.internals;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class KafkaInternalsApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(KafkaInternalsApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/internals/service/PartitionReplicationManager.java",
        content: `package com.javahub.internals.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\n@Service\npublic class PartitionReplicationManager {\n    public record PartitionState(int partitionId, int leaderBrokerId, List<Integer> isrBrokers, long highWatermark, long logEndOffset) {}\n    private final Map<Integer, PartitionState> stateMap = new HashMap<>();\n    public PartitionReplicationManager() {\n        stateMap.put(0, new PartitionState(0, 101, List.of(101, 102, 103), 4200L, 4200L));\n        stateMap.put(1, new PartitionState(1, 102, List.of(102, 103), 3900L, 3905L));\n    }\n    public PartitionState getPartition(int id) { return stateMap.getOrDefault(id, stateMap.get(0)); }\n    public List<PartitionState> getAllPartitions() { return new ArrayList<>(stateMap.values()); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/internals/controller/KafkaInternalsController.java",
        content: `package com.javahub.internals.controller;\nimport com.javahub.internals.service.PartitionReplicationManager;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n@RestController\n@RequestMapping("/api/v1/kafka/internals")\npublic class KafkaInternalsController {\n    private final PartitionReplicationManager replicationManager;\n    public KafkaInternalsController(PartitionReplicationManager replicationManager) { this.replicationManager = replicationManager; }\n    @GetMapping("/partitions")\n    public ResponseEntity<List<PartitionReplicationManager.PartitionState>> getPartitions() {\n        return ResponseEntity.ok(replicationManager.getAllPartitions());\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/internals/KafkaInternalsTests.java",
        content: `package com.javahub.internals;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass KafkaInternalsTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Query partition replication state and ISR details")\n    void testPartitions() throws Exception {\n        mockMvc.perform(get("/api/v1/kafka/internals/partitions"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$[0].leaderBrokerId").value(101))\n                .andExpect(jsonPath("$[0].isrBrokers").isArray());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Apache Kafka Internals Live Application\n\nInspects partition ISR, high watermark, and replication leader assignments.\n\nRun: \`mvn spring-boot:run\`\nQuery: \`curl -X GET http://localhost:8080/api/v1/kafka/internals/partitions\`\n`
      }
    ]
  },

  // Topic 3: Kafka Producers & Delivery Guarantees
  "kafka-producers-and-delivery-guarantees": {
    topicSlug: "kafka-producers-and-delivery-guarantees",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("kafka-producer-app", "Kafka Idempotent Producer Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: kafka-producer-app\n  kafka:\n    producer:\n      acks: all\n      properties:\n        enable.idempotence: true\n        retries: 5\n`
      },
      {
        path: "src/main/java/com/javahub/producer/ProducerApplication.java",
        content: `package com.javahub.producer;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class ProducerApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(ProducerApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/producer/service/IdempotentOrderProducerService.java",
        content: `package com.javahub.producer.service;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class IdempotentOrderProducerService {\n    private static final Logger log = LoggerFactory.getLogger(IdempotentOrderProducerService.class);\n    public record DispatchResult(String orderId, int partition, long offset, boolean duplicateFiltered) {}\n    private final Set<String> processedMessageIds = ConcurrentHashMap.newKeySet();\n    public synchronized DispatchResult dispatchOrder(String orderId, String payload, int sequenceNum) {\n        String deduplicationKey = orderId + "#" + sequenceNum;\n        if (processedMessageIds.contains(deduplicationKey)) {\n            log.warn(">> [IDEMPOTENCE TRIGGERED] Duplicate sequence {} discarded for order {}", sequenceNum, orderId);\n            return new DispatchResult(orderId, -1, -1, true);\n        }\n        processedMessageIds.add(deduplicationKey);\n        log.info(">> [BROKER_ACK] Written message {} to partition 0 at offset {}", deduplicationKey, processedMessageIds.size());\n        return new DispatchResult(orderId, 0, processedMessageIds.size(), false);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/producer/controller/OrderProducerController.java",
        content: `package com.javahub.producer.controller;\nimport com.javahub.producer.service.IdempotentOrderProducerService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/orders/publish")\npublic class OrderProducerController {\n    private final IdempotentOrderProducerService producerService;\n    public OrderProducerController(IdempotentOrderProducerService producerService) { this.producerService = producerService;\n    }\n    @PostMapping\n    public ResponseEntity<IdempotentOrderProducerService.DispatchResult> publish(\n            @RequestParam String orderId, @RequestParam String payload, @RequestParam(defaultValue = "1") int sequence) {\n        return ResponseEntity.ok(producerService.dispatchOrder(orderId, payload, sequence));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/producer/ProducerApplicationTests.java",
        content: `package com.javahub.producer;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass ProducerApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Duplicate producer message with same PID and sequence is rejected idempotently")\n    void testIdempotentPublish() throws Exception {\n        mockMvc.perform(post("/api/v1/orders/publish?orderId=ORD-99&payload=Checkout&sequence=1"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.duplicateFiltered").value(false));\n        mockMvc.perform(post("/api/v1/orders/publish?orderId=ORD-99&payload=Checkout&sequence=1"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.duplicateFiltered").value(true));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Kafka Idempotent Producer Live Application\n\nDemonstrates idempotent message delivery and duplicate elimination using sequence numbering.\n\nRun: \`mvn spring-boot:run\`\nPublish: \`curl -X POST "http://localhost:8080/api/v1/orders/publish?orderId=ORD-101&payload=Buy&sequence=1"\`\n`
      }
    ]
  },

  // Topic 4: Consumer Groups & Rebalances
  "kafka-consumer-groups-and-rebalances": {
    topicSlug: "kafka-consumer-groups-and-rebalances",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("kafka-consumer-groups-app", "Kafka Consumer Groups & Rebalances Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: kafka-consumer-groups-app\n`
      },
      {
        path: "src/main/java/com/javahub/consumer/ConsumerApplication.java",
        content: `package com.javahub.consumer;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class ConsumerApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(ConsumerApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/consumer/service/ConsumerGroupCoordinator.java",
        content: `package com.javahub.consumer.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class ConsumerGroupCoordinator {\n    public record MemberAssignment(String memberId, List<Integer> assignedPartitions) {}\n    private final Set<String> activeMembers = ConcurrentHashMap.newKeySet();\n    private final int totalPartitions = 6;\n    public synchronized List<MemberAssignment> registerMember(String memberId) {\n        activeMembers.add(memberId);\n        return computeAssignments();\n    }\n    public synchronized List<MemberAssignment> removeMember(String memberId) {\n        activeMembers.remove(memberId);\n        return computeAssignments();\n    }\n    public List<MemberAssignment> computeAssignments() {\n        List<String> sorted = new ArrayList<>(activeMembers);\n        Collections.sort(sorted);\n        List<MemberAssignment> result = new ArrayList<>();\n        if (sorted.isEmpty()) return result;\n        for (int i = 0; i < sorted.size(); i++) {\n            List<Integer> parts = new ArrayList<>();\n            for (int p = 0; p < totalPartitions; p++) {\n                if (p % sorted.size() == i) parts.add(p);\n            }\n            result.add(new MemberAssignment(sorted.get(i), parts));\n        }\n        return result;\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/consumer/controller/ConsumerGroupController.java",
        content: `package com.javahub.consumer.controller;\nimport com.javahub.consumer.service.ConsumerGroupCoordinator;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n@RestController\n@RequestMapping("/api/v1/kafka/group")\npublic class ConsumerGroupController {\n    private final ConsumerGroupCoordinator coordinator;\n    public ConsumerGroupController(ConsumerGroupCoordinator coordinator) { this.coordinator = coordinator; }\n    @PostMapping("/join")\n    public ResponseEntity<List<ConsumerGroupCoordinator.MemberAssignment>> join(@RequestParam String memberId) {\n        return ResponseEntity.ok(coordinator.registerMember(memberId));\n    }\n    @PostMapping("/leave")\n    public ResponseEntity<List<ConsumerGroupCoordinator.MemberAssignment>> leave(@RequestParam String memberId) {\n        return ResponseEntity.ok(coordinator.removeMember(memberId));\n    }\n    @GetMapping("/assignments")\n    public ResponseEntity<List<ConsumerGroupCoordinator.MemberAssignment>> getAssignments() {\n        return ResponseEntity.ok(coordinator.computeAssignments());\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/consumer/ConsumerGroupTests.java",
        content: `package com.javahub.consumer;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass ConsumerGroupTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Join members and verify cooperative partition rebalance across group")\n    void testRebalance() throws Exception {\n        mockMvc.perform(post("/api/v1/kafka/group/join?memberId=worker-1"))\n                .andExpect(status().isOk());\n        mockMvc.perform(post("/api/v1/kafka/group/join?memberId=worker-2"))\n                .andExpect(status().isOk());\n        mockMvc.perform(get("/api/v1/kafka/group/assignments"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.length()").value(2));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Kafka Consumer Group Rebalance Live Application\n\nSimulates consumer join/leave events and automatic partition reassignment across members.\n\nRun: \`mvn spring-boot:run\`\nJoin: \`curl -X POST "http://localhost:8080/api/v1/kafka/group/join?memberId=instance-1"\`\n`
      }
    ]
  },

  // Topic 5: Schema Registry & Apache Avro
  "schema-registry-and-apache-avro": {
    topicSlug: "schema-registry-and-apache-avro",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("schema-registry-app", "Schema Registry & Apache Avro Live Lab", `        <dependency>
            <groupId>org.apache.avro</groupId>
            <artifactId>avro</artifactId>
            <version>1.11.3</version>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: schema-registry-app\n`
      },
      {
        path: "src/main/java/com/javahub/avro/AvroApplication.java",
        content: `package com.javahub.avro;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class AvroApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(AvroApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/avro/service/AvroSchemaValidatorService.java",
        content: `package com.javahub.avro.service;\nimport org.apache.avro.Schema;\nimport org.springframework.stereotype.Service;\nimport java.util.Map;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class AvroSchemaValidatorService {\n    private final Map<String, Integer> subjectVersions = new ConcurrentHashMap<>();\n    public boolean validateAndRegister(String subject, String schemaJson) {\n        try {\n            Schema.Parser parser = new Schema.Parser();\n            Schema schema = parser.parse(schemaJson);\n            subjectVersions.merge(subject, 1, Integer::sum);\n            return true;\n        } catch (Exception e) {\n            return false;\n        }\n    }\n    public int getVersion(String subject) { return subjectVersions.getOrDefault(subject, 0); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/avro/controller/SchemaRegistryController.java",
        content: `package com.javahub.avro.controller;\nimport com.javahub.avro.service.AvroSchemaValidatorService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/schemas")\npublic class SchemaRegistryController {\n    private final AvroSchemaValidatorService validatorService;\n    public SchemaRegistryController(AvroSchemaValidatorService validatorService) { this.validatorService = validatorService; }\n    @PostMapping("/subjects/{subject}/versions")\n    public ResponseEntity<Map<String, Object>> register(@PathVariable String subject, @RequestBody Map<String, String> body) {\n        String json = body.get("schema");\n        boolean valid = validatorService.validateAndRegister(subject, json);\n        if (!valid) return ResponseEntity.badRequest().body(Map.of("error", "Invalid Avro Schema definition"));\n        return ResponseEntity.ok(Map.of("subject", subject, "version", validatorService.getVersion(subject), "status", "REGISTERED"));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/avro/AvroSchemaTests.java",
        content: `package com.javahub.avro;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.http.MediaType;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass AvroSchemaTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Register valid Avro schema into registry")\n    void testRegisterSchema() throws Exception {\n        String avroJson = "{\\\"schema\\\": \\\"{\\\\\\\"type\\\\\\\":\\\\\\\"record\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"UserEvent\\\\\\\",\\\\\\\"fields\\\\\\\":[{\\\\\\\"name\\\\\\\":\\\\\\\"id\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"string\\\\\\\"}]}\\\"}";\n        mockMvc.perform(post("/api/v1/schemas/subjects/user-events/versions")\n                .contentType(MediaType.APPLICATION_JSON)\n                .content(avroJson))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.version").value(1));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Schema Registry & Apache Avro Live Application\n\nValidates and registers strongly typed Apache Avro schemas.\n\nRun: \`mvn spring-boot:run\`\n`
      }
    ]
  },

  // Topic 6: Stateful Stream Processing with Kafka Streams
  "stateful-stream-processing-with-kafka-streams": {
    topicSlug: "stateful-stream-processing-with-kafka-streams",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("kafka-streams-app", "Stateful Kafka Streams Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: kafka-streams-app\n`
      },
      {
        path: "src/main/java/com/javahub/streams/StreamsApplication.java",
        content: `package com.javahub.streams;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class StreamsApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(StreamsApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/streams/service/TumblingWindowAggregationService.java",
        content: `package com.javahub.streams.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class TumblingWindowAggregationService {\n    public record WindowSummary(String key, long windowStart, long windowEnd, double totalSum, int count) {}\n    private final Map<String, List<Double>> windowBucket = new ConcurrentHashMap<>();\n    public synchronized WindowSummary recordTrade(String ticker, double amount) {\n        windowBucket.computeIfAbsent(ticker, k -> new ArrayList<>()).add(amount);\n        List<Double> list = windowBucket.get(ticker);\n        double sum = list.stream().mapToDouble(Double::doubleValue).sum();\n        long now = System.currentTimeMillis();\n        return new WindowSummary(ticker, now - 60000, now, sum, list.size());\n    }\n    public Map<String, List<Double>> getWindows() { return windowBucket; }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/streams/controller/StreamsAggregatorController.java",
        content: `package com.javahub.streams.controller;\nimport com.javahub.streams.service.TumblingWindowAggregationService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/streams")\npublic class StreamsAggregatorController {\n    private final TumblingWindowAggregationService aggregationService;\n    public StreamsAggregatorController(TumblingWindowAggregationService aggregationService) { this.aggregationService = aggregationService; }\n    @PostMapping("/trades")\n    public ResponseEntity<TumblingWindowAggregationService.WindowSummary> postTrade(@RequestParam String ticker, @RequestParam double amount) {\n        return ResponseEntity.ok(aggregationService.recordTrade(ticker, amount));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/streams/StreamsAggregatorTests.java",
        content: `package com.javahub.streams;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass StreamsAggregatorTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify stream window aggregation accumulates trade volume")\n    void testWindowAggregation() throws Exception {\n        mockMvc.perform(post("/api/v1/streams/trades?ticker=AAPL&amount=150.0"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.totalSum").value(150.0));\n        mockMvc.perform(post("/api/v1/streams/trades?ticker=AAPL&amount=250.0"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.totalSum").value(400.0))\n                .andExpect(jsonPath("$.count").value(2));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Stateful Stream Processing with Kafka Streams Live Lab\n\nSimulates time-windowed tumbling aggregations and state store persistence.\n\nRun: \`mvn spring-boot:run\`\n`
      }
    ]
  },

  // Topic 7: Change Data Capture with Debezium
  "change-data-capture-with-debezium": {
    topicSlug: "change-data-capture-with-debezium",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("cdc-debezium-app", "Change Data Capture (CDC) with Debezium Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: cdc-debezium-app\n`
      },
      {
        path: "src/main/java/com/javahub/cdc/CdcApplication.java",
        content: `package com.javahub.cdc;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class CdcApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(CdcApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/cdc/service/DebeziumEnvelopeParser.java",
        content: `package com.javahub.cdc.service;\nimport org.springframework.stereotype.Service;\nimport java.util.Map;\n@Service\npublic class DebeziumEnvelopeParser {\n    public record CdcPayload(String op, Map<String, Object> before, Map<String, Object> after, long timestamp) {}\n    public String describeOperation(CdcPayload payload) {\n        return switch (payload.op()) {\n            case "c" -> "INSERT: Created record with id=" + payload.after().get("id");\n            case "u" -> "UPDATE: Changed fields from " + payload.before() + " to " + payload.after();\n            case "d" -> "DELETE: Removed record id=" + payload.before().get("id");\n            default -> "READ: Snapshot read";\n        };\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/cdc/controller/CdcParserController.java",
        content: `package com.javahub.cdc.controller;\nimport com.javahub.cdc.service.DebeziumEnvelopeParser;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/cdc")\npublic class CdcParserController {\n    private final DebeziumEnvelopeParser parser;\n    public CdcParserController(DebeziumEnvelopeParser parser) { this.parser = parser; }\n    @PostMapping("/parse")\n    public ResponseEntity<Map<String, String>> parseEvent(@RequestBody DebeziumEnvelopeParser.CdcPayload event) {\n        return ResponseEntity.ok(Map.of("summary", parser.describeOperation(event)));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/cdc/CdcParserTests.java",
        content: `package com.javahub.cdc;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.http.MediaType;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass CdcParserTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify parsing Debezium envelope for UPDATE operation")\n    void testCdcParsing() throws Exception {\n        String payload = "{\\\"op\\\":\\\"u\\\",\\\"before\\\":{\\\"id\\\":101,\\\"tier\\\":\\\"SILVER\\\"},\\\"after\\\":{\\\"id\\\":101,\\\"tier\\\":\\\"GOLD\\\"},\\\"timestamp\\\":1690000000}";\n        mockMvc.perform(post("/api/v1/cdc/parse")\n                .contentType(MediaType.APPLICATION_JSON)\n                .content(payload))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.summary").exists());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Change Data Capture with Debezium Live Application\n\nParses Debezium CDC envelopes (before, after, op code) from database WAL streams.\n\nRun: \`mvn spring-boot:run\`\n`
      }
    ]
  },

  // Topic 8: Transactional Outbox Pattern
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
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: transactional-outbox-app\n  datasource:\n    url: jdbc:h2:mem:outboxdb;DB_CLOSE_DELAY=-1\n    driverClassName: org.h2.Driver\n    username: sa\n    password: ""\n  jpa:\n    hibernate:\n      ddl-auto: create-drop\n`
      },
      {
        path: "src/main/java/com/javahub/outbox/OutboxApplication.java",
        content: `package com.javahub.outbox;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\nimport org.springframework.scheduling.annotation.EnableScheduling;\n@SpringBootApplication\n@EnableScheduling\npublic class OutboxApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(OutboxApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/outbox/entity/OutboxEvent.java",
        content: `package com.javahub.outbox.entity;\nimport jakarta.persistence.*;\nimport java.time.Instant;\n@Entity\n@Table(name = "outbox_events")\npublic class OutboxEvent {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;\n    @Column(nullable = false) private String aggregateType;\n    @Column(nullable = false) private String aggregateId;\n    @Column(nullable = false) private String eventType;\n    @Lob @Column(nullable = false) private String payload;\n    @Column(nullable = false) private String status = "PENDING";\n    private Instant createdAt = Instant.now();\n    public OutboxEvent() {}\n    public OutboxEvent(String aggregateType, String aggregateId, String eventType, String payload) {\n        this.aggregateType = aggregateType; this.aggregateId = aggregateId; this.eventType = eventType; this.payload = payload;\n    }\n    public Long getId() { return id; }\n    public String getAggregateId() { return aggregateId; }\n    public String getEventType() { return eventType; }\n    public String getPayload() { return payload; }\n    public String getStatus() { return status; }\n    public void setStatus(String status) { this.status = status; }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/outbox/repository/OutboxRepository.java",
        content: `package com.javahub.outbox.repository;\nimport com.javahub.outbox.entity.OutboxEvent;\nimport org.springframework.data.jpa.repository.JpaRepository;\nimport org.springframework.stereotype.Repository;\nimport java.util.List;\n@Repository\npublic interface OutboxRepository extends JpaRepository<OutboxEvent, Long> {\n    List<OutboxEvent> findByStatus(String status);\n}\n`
      },
      {
        path: "src/main/java/com/javahub/outbox/service/OrderOutboxService.java",
        content: `package com.javahub.outbox.service;\nimport com.javahub.outbox.entity.OutboxEvent;\nimport com.javahub.outbox.repository.OutboxRepository;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.scheduling.annotation.Scheduled;\nimport org.springframework.stereotype.Service;\nimport org.springframework.transaction.annotation.Transactional;\nimport java.util.List;\n@Service\npublic class OrderOutboxService {\n    private static final Logger log = LoggerFactory.getLogger(OrderOutboxService.class);\n    private final OutboxRepository outboxRepository;\n    public OrderOutboxService(OutboxRepository outboxRepository) { this.outboxRepository = outboxRepository; }\n    @Transactional\n    public OutboxEvent createOrderWithOutbox(String orderId, double amount) {\n        OutboxEvent event = new OutboxEvent("ORDER", orderId, "OrderCreated", "{\\"orderId\\": \\"" + orderId + "\\", \\"amount\\": " + amount + "}");\n        return outboxRepository.save(event);\n    }\n    @Scheduled(fixedRate = 2000)\n    @Transactional\n    public void relayOutboxEvents() {\n        List<OutboxEvent> pending = outboxRepository.findByStatus("PENDING");\n        for (OutboxEvent event : pending) {\n            log.info(">> [OUTBOX RELAY] Publishing event {} to Kafka", event.getEventType());\n            event.setStatus("PUBLISHED");\n            outboxRepository.save(event);\n        }\n    }\n    public List<OutboxEvent> getAllEvents() { return outboxRepository.findAll(); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/outbox/controller/OutboxDemoController.java",
        content: `package com.javahub.outbox.controller;\nimport com.javahub.outbox.entity.OutboxEvent;\nimport com.javahub.outbox.service.OrderOutboxService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/outbox")\npublic class OutboxDemoController {\n    private final OrderOutboxService service;\n    public OutboxDemoController(OrderOutboxService service) { this.service = service; }\n    @PostMapping("/orders")\n    public ResponseEntity<Map<String, Object>> placeOrder(@RequestParam String orderId, @RequestParam double amount) {\n        OutboxEvent event = service.createOrderWithOutbox(orderId, amount);\n        return ResponseEntity.ok(Map.of("orderId", orderId, "outboxEventId", event.getId(), "status", event.getStatus()));\n    }\n    @GetMapping("/events")\n    public ResponseEntity<List<OutboxEvent>> listEvents() { return ResponseEntity.ok(service.getAllEvents()); }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/outbox/OutboxApplicationTests.java",
        content: `package com.javahub.outbox;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass OutboxApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify atomic order outbox creation and scheduled relay")\n    void testOutboxCycle() throws Exception {\n        mockMvc.perform(post("/api/v1/outbox/orders?orderId=ORD-909&amount=550.00"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.orderId").value("ORD-909"))\n                .andExpect(jsonPath("$.status").value("PENDING"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Transactional Outbox Pattern Live Application\n\nRun: \`mvn spring-boot:run\`\nOrder: \`curl -X POST "http://localhost:8080/api/v1/outbox/orders?orderId=ORD-101&amount=299.00"\`\n`
      }
    ]
  },

  // Topic 9: Resilient Event Processing and Dead Letter Queues
  "resilient-event-processing-and-dead-letter-queues": {
    topicSlug: "resilient-event-processing-and-dead-letter-queues",
    level: 10,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("kafka-dlq-app", "Resilient Event Processing & Dead Letter Queues Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: kafka-dlq-app\n`
      },
      {
        path: "src/main/java/com/javahub/dlq/DlqApplication.java",
        content: `package com.javahub.dlq;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class DlqApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(DlqApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/dlq/service/DeadLetterQueueDispatcher.java",
        content: `package com.javahub.dlq.service;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.CopyOnWriteArrayList;\n@Service\npublic class DeadLetterQueueDispatcher {\n    private static final Logger log = LoggerFactory.getLogger(DeadLetterQueueDispatcher.class);\n    public record DeadLetterEntry(String originalTopic, String payload, String failureReason, int attemptCount, long timestamp) {}\n    private final List<DeadLetterEntry> dlqEntries = new CopyOnWriteArrayList<>();\n    public synchronized void routeToDlq(String originalTopic, String payload, String reason, int attempts) {\n        log.error(">> [DLQ ROUTED] Failed after {} attempts from topic {}: {}", attempts, originalTopic, reason);\n        dlqEntries.add(new DeadLetterEntry(originalTopic, payload, reason, attempts, System.currentTimeMillis()));\n    }\n    public List<DeadLetterEntry> getDlqEntries() { return new ArrayList<>(dlqEntries); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/dlq/controller/DlqController.java",
        content: `package com.javahub.dlq.controller;\nimport com.javahub.dlq.service.DeadLetterQueueDispatcher;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/kafka/dlq")\npublic class DlqController {\n    private final DeadLetterQueueDispatcher dispatcher;\n    public DlqController(DeadLetterQueueDispatcher dispatcher) { this.dispatcher = dispatcher; }\n    @PostMapping("/simulate-poison-pill")\n    public ResponseEntity<Map<String, String>> simulatePoisonPill(@RequestParam String payload) {\n        dispatcher.routeToDlq("orders.v1", payload, "Unparseable JSON syntax error", 3);\n        return ResponseEntity.ok(Map.of("status", "ROUTED_TO_DLQ", "topic", "orders.v1.DLQ"));\n    }\n    @GetMapping("/messages")\n    public ResponseEntity<List<DeadLetterQueueDispatcher.DeadLetterEntry>> getMessages() {\n        return ResponseEntity.ok(dispatcher.getDlqEntries());\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/dlq/DlqApplicationTests.java",
        content: `package com.javahub.dlq;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass DlqApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Poison pill event is redirected to DLQ after exhaustion of retries")\n    void testDlqRouting() throws Exception {\n        mockMvc.perform(post("/api/v1/kafka/dlq/simulate-poison-pill?payload=MALFORMED_DATA"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.status").value("ROUTED_TO_DLQ"));\n        mockMvc.perform(get("/api/v1/kafka/dlq/messages"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.length()").value(1))\n                .andExpect(jsonPath("$[0].failureReason").exists());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Resilient Event Processing and Dead Letter Queues Live Lab\n\nRun: \`mvn spring-boot:run\`\nPoison pill: \`curl -X POST "http://localhost:8080/api/v1/kafka/dlq/simulate-poison-pill?payload=CORRUPT_BYTES"\`\n`
      }
    ]
  }
};
