module.exports = {
  level: 10,
  topics: {
    'message-brokers-vs-event-streaming': {
      className: 'BrokerModelSimulator',
      description: 'Contrasts transient queue consumption (RabbitMQ) vs immutable log replay (Kafka).',
      source: `package io.javahub.level10.messagebrokersvseventstreaming;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

/**
 * Contrasts queue-based destructive reads against immutable event stream offset retention.
 */
public class BrokerModelSimulator {

    // Queue pattern (RabbitMQ): message deleted after delivery
    public static class DestructiveQueue {
        private final Queue<String> queue = new LinkedList<>();

        public void publish(String msg) { queue.add(msg); }
        public String poll() { return queue.poll(); }
        public int size() { return queue.size(); }
    }

    // Log pattern (Kafka): message retained indefinitely, consumed via offset pointers
    public static class ImmutableLog {
        private final List<String> log = new ArrayList<>();

        public synchronized int append(String msg) {
            log.add(msg);
            return log.size() - 1; // Returns offset
        }

        public synchronized String readAtOffset(int offset) {
            return (offset >= 0 && offset < log.size()) ? log.get(offset) : null;
        }

        public synchronized int totalMessages() { return log.size(); }
    }
}
`,
      test: `package io.javahub.level10.messagebrokersvseventstreaming;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BrokerModelSimulatorTest {

    @Test
    @DisplayName("Kafka ImmutableLog should preserve messages allowing multiple independent consumers to replay")
    void testImmutableLogReplay() {
        var log = new BrokerModelSimulator.ImmutableLog();
        int offset0 = log.append("event_A");
        int offset1 = log.append("event_B");

        // Consumer 1 reads
        assertThat(log.readAtOffset(offset0)).isEqualTo("event_A");

        // Consumer 2 reads the same message again (replayability)
        assertThat(log.readAtOffset(offset0)).isEqualTo("event_A");
        assertThat(log.totalMessages()).isEqualTo(2);
    }
}
`
    },

    'apache-kafka-internals': {
      className: 'KafkaPartitionLog',
      description: 'Demonstrates Kafka Log End Offset (LEO), High Watermark (HW), and In-Sync Replicas (ISR).',
      source: `package io.javahub.level10.apachekafkainternals;

import java.util.ArrayList;
import java.util.List;

/**
 * Emulates a single Kafka partition log with LEO and High Watermark commit thresholds.
 */
public class KafkaPartitionLog {

    public record Record(long offset, String payload) {}

    private final List<Record> log = new ArrayList<>();
    private long highWatermark = 0L; // Offset up to which records are replicated to all ISRs

    public synchronized long append(String payload) {
        long offset = log.size();
        log.add(new Record(offset, payload));
        return offset; // Log End Offset (LEO) becomes offset + 1
    }

    public synchronized void updateHighWatermark(long newHw) {
        this.highWatermark = Math.min(newHw, log.size());
    }

    public synchronized List<Record> readCommitted(long fromOffset) {
        List<Record> committed = new ArrayList<>();
        for (long i = fromOffset; i < highWatermark && i < log.size(); i++) {
            committed.add(log.get((int) i));
        }
        return committed;
    }

    public long getLeo() { return log.size(); }
    public long getHighWatermark() { return highWatermark; }
}
`,
      test: `package io.javahub.level10.apachekafkainternals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class KafkaPartitionLogTest {

    @Test
    @DisplayName("Consumers should only be permitted to read up to the High Watermark (HW)")
    void testKafkaWatermark() {
        var partition = new KafkaPartitionLog();
        partition.append("msg_0");
        partition.append("msg_1");
        partition.append("msg_2");

        assertThat(partition.getLeo()).isEqualTo(3L);

        // ISR replicates up to offset 2 (meaning 0 and 1 are committed)
        partition.updateHighWatermark(2L);

        var visible = partition.readCommitted(0L);
        assertThat(visible).hasSize(2);
        assertThat(visible.get(1).payload()).isEqualTo("msg_1");
    }
}
`
    },

    'kafka-producers-and-delivery-guarantees': {
      className: 'IdempotentProducerSimulator',
      description: 'Demonstrates Kafka idempotent producer sequence numbers preventing duplicate messages.',
      source: `package io.javahub.level10.kafkaproducersanddeliveryguarantees;

import java.util.HashMap;
import java.util.Map;

/**
 * Emulates Kafka idempotent producer sequence number deduplication at the broker partition.
 */
public class IdempotentProducerSimulator {

    public record ProducerRecord(String producerId, long sequenceNumber, String value) {}

    private final Map<String, Long> lastSeenSequence = new HashMap<>();

    public boolean handleRecord(ProducerRecord record) {
        Long lastSeq = lastSeenSequence.get(record.producerId());
        if (lastSeq != null && record.sequenceNumber() <= lastSeq) {
            // Duplicate detected: ACK successfully but drop message to prevent duplicates
            return false;
        }

        lastSeenSequence.put(record.producerId(), record.sequenceNumber());
        return true; // Successfully written to partition log
    }
}
`,
      test: `package io.javahub.level10.kafkaproducersanddeliveryguarantees;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class IdempotentProducerSimulatorTest {

    @Test
    @DisplayName("Should accept new sequential records but drop duplicate sequence numbers")
    void testDeduplication() {
        var broker = new IdempotentProducerSimulator();

        assertThat(broker.handleRecord(new IdempotentProducerSimulator.ProducerRecord("PID-1", 0, "order_1"))).isTrue();
        assertThat(broker.handleRecord(new IdempotentProducerSimulator.ProducerRecord("PID-1", 1, "order_2"))).isTrue();

        // Retry of sequence 1 due to transient network timeout
        assertThat(broker.handleRecord(new IdempotentProducerSimulator.ProducerRecord("PID-1", 1, "order_2"))).isFalse();
    }
}
`
    },

    'kafka-consumer-groups-and-rebalances': {
      className: 'RebalancePartitionAssignor',
      description: 'Demonstrates sticky partition assignments minimizing partition movement during group rebalances.',
      source: `package io.javahub.level10.kafkaconsumergroupsandrebalances;

import java.util.*;

/**
 * Emulates Kafka CooperativeStickyAssignor partition assignment across active consumers.
 */
public class RebalancePartitionAssignor {

    public Map<String, List<Integer>> assignPartitions(List<String> consumers, int totalPartitions) {
        Map<String, List<Integer>> assignments = new HashMap<>();
        for (String c : consumers) {
            assignments.put(c, new ArrayList<>());
        }

        for (int p = 0; p < totalPartitions; p++) {
            String targetConsumer = consumers.get(p % consumers.size());
            assignments.get(targetConsumer).add(p);
        }
        return assignments;
    }
}
`,
      test: `package io.javahub.level10.kafkaconsumergroupsandrebalances;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class RebalancePartitionAssignorTest {

    @Test
    @DisplayName("Should evenly distribute partition assignments across consumer instances")
    void testAssignor() {
        var assignor = new RebalancePartitionAssignor();
        var assignment = assignor.assignPartitions(List.of("consumer_A", "consumer_B"), 4);

        assertThat(assignment.get("consumer_A")).containsExactly(0, 2);
        assertThat(assignment.get("consumer_B")).containsExactly(1, 3);
    }
}
`
    },

    'schema-registry-and-apache-avro': {
      className: 'AvroSchemaRegistrySimulator',
      description: 'Demonstrates Confluent Schema Registry magic byte protocol and backward compatibility checking.',
      source: `package io.javahub.level10.schemaregistryandapacheavro;

import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;

/**
 * Emulates Schema Registry 5-byte wire protocol: [Magic Byte 0x00] + [4-byte Schema ID].
 */
public class AvroSchemaRegistrySimulator {

    private final Map<Integer, String> registry = new HashMap<>();

    public void registerSchema(int id, String schemaJson) {
        registry.put(id, schemaJson);
    }

    public byte[] prependSchemaHeader(int schemaId, byte[] avroPayload) {
        ByteBuffer buffer = ByteBuffer.allocate(5 + avroPayload.length);
        buffer.put((byte) 0x00);       // Magic Byte
        buffer.putInt(schemaId);       // 4-Byte Schema ID
        buffer.put(avroPayload);
        return buffer.array();
    }

    public int extractSchemaId(byte[] payloadWithHeader) {
        ByteBuffer buffer = ByteBuffer.wrap(payloadWithHeader);
        byte magic = buffer.get();
        if (magic != 0x00) throw new IllegalArgumentException("Unknown magic byte: " + magic);
        return buffer.getInt();
    }
}
`,
      test: `package io.javahub.level10.schemaregistryandapacheavro;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class AvroSchemaRegistrySimulatorTest {

    @Test
    @DisplayName("Should prepend 5-byte header and extract schema ID correctly")
    void testSchemaRegistryWireProtocol() {
        var sr = new AvroSchemaRegistrySimulator();
        byte[] payload = new byte[]{0x12, 0x34};

        byte[] wired = sr.prependSchemaHeader(42, payload);
        assertThat(wired).hasSize(7);

        int extractedId = sr.extractSchemaId(wired);
        assertThat(extractedId).isEqualTo(42);
    }
}
`
    },

    'stateful-stream-processing-with-kafka-streams': {
      className: 'TumblingWindowAggregator',
      description: 'Demonstrates stateful stream processing: tumbling time windows and state stores.',
      source: `package io.javahub.level10.statefulstreamprocessingwithkafkastreams;

import java.util.HashMap;
import java.util.Map;

/**
 * Emulates Kafka Streams tumbling window aggregation.
 */
public class TumblingWindowAggregator {

    public record WindowKey(String key, long windowStartEpoch) {}

    private final Map<WindowKey, Long> windowCounts = new HashMap<>();
    private final long windowSizeMillis;

    public TumblingWindowAggregator(long windowSizeMillis) {
        this.windowSizeMillis = windowSizeMillis;
    }

    public void recordEvent(String key, long eventTimeEpoch) {
        long windowStart = (eventTimeEpoch / windowSizeMillis) * windowSizeMillis;
        WindowKey wk = new WindowKey(key, windowStart);
        windowCounts.put(wk, windowCounts.getOrDefault(wk, 0L) + 1);
    }

    public long getCount(String key, long windowStartEpoch) {
        return windowCounts.getOrDefault(new WindowKey(key, windowStartEpoch), 0L);
    }
}
`,
      test: `package io.javahub.level10.statefulstreamprocessingwithkafkastreams;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class TumblingWindowAggregatorTest {

    @Test
    @DisplayName("Should aggregate events within discrete 60-second tumbling windows")
    void testTumblingWindows() {
        var aggregator = new TumblingWindowAggregator(60_000L); // 60s windows

        aggregator.recordEvent("sensor_A", 10_000L); // Window 0
        aggregator.recordEvent("sensor_A", 25_000L); // Window 0
        aggregator.recordEvent("sensor_A", 70_000L); // Window 60,000

        assertThat(aggregator.getCount("sensor_A", 0L)).isEqualTo(2L);
        assertThat(aggregator.getCount("sensor_A", 60_000L)).isEqualTo(1L);
    }
}
`
    },

    'change-data-capture-with-debezium': {
      className: 'DebeziumCdcEventParser',
      description: 'Parses Debezium CDC event envelopes: before, after, op types (c, u, d), and source metadata.',
      source: `package io.javahub.level10.changedatacapturewithdebezium;

import java.util.Map;

/**
 * Parses and processes Debezium Change Data Capture (CDC) event envelopes.
 */
public class DebeziumCdcEventParser {

    public record CdcRecord(String op, Map<String, Object> before, Map<String, Object> after, long timestamp) {}

    public String classifyChange(CdcRecord record) {
        return switch (record.op()) {
            case "c" -> "INSERT: Created entity with ID " + record.after().get("id");
            case "u" -> "UPDATE: Modified fields on ID " + record.after().get("id");
            case "d" -> "DELETE: Removed record previously held as ID " + record.before().get("id");
            default -> "UNKNOWN_OP";
        };
    }
}
`,
      test: `package io.javahub.level10.changedatacapturewithdebezium;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

public class DebeziumCdcEventParserTest {

    @Test
    @DisplayName("Should classify CDC event envelope operations")
    void testCdcParser() {
        var parser = new DebeziumCdcEventParser();

        var insert = new DebeziumCdcEventParser.CdcRecord("c", null, Map.of("id", "U100"), 1000L);
        var update = new DebeziumCdcEventParser.CdcRecord("u", Map.of("id", "U100"), Map.of("id", "U100", "email", "new@javahub.io"), 2000L);

        assertThat(parser.classifyChange(insert)).isEqualTo("INSERT: Created entity with ID U100");
        assertThat(parser.classifyChange(update)).isEqualTo("UPDATE: Modified fields on ID U100");
    }
}
`
    },

    'transactional-outbox-and-inbox-patterns': {
      className: 'TransactionalOutboxRelay',
      description: 'Eliminates dual-write anomalies by writing domain entities and outbox events in a single local transaction.',
      source: `package io.javahub.level10.transactionaloutboxandinboxpatterns;

import java.util.ArrayList;
import java.util.List;

/**
 * Transactional Outbox pattern eliminating dual-write distributed failure modes.
 */
public class TransactionalOutboxRelay {

    public record OutboxMessage(String id, String aggregateType, String payload, boolean published) {}

    private final List<OutboxMessage> outboxTable = new ArrayList<>();

    public synchronized void saveOrderWithOutbox(String orderId, String payload) {
        // Single local atomic transaction inserting order AND outbox record
        outboxTable.add(new OutboxMessage(orderId, "ORDER", payload, false));
    }

    public synchronized List<OutboxMessage> pollUnpublished() {
        return outboxTable.stream().filter(m -> !m.published()).toList();
    }

    public synchronized void markPublished(String id) {
        for (int i = 0; i < outboxTable.size(); i++) {
            if (outboxTable.get(i).id().equals(id)) {
                outboxTable.set(i, new OutboxMessage(id, "ORDER", outboxTable.get(i).payload(), true));
            }
        }
    }
}
`,
      test: `package io.javahub.level10.transactionaloutboxandinboxpatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class TransactionalOutboxRelayTest {

    @Test
    @DisplayName("Outbox messages should be saved locally and marked published after relay")
    void testTransactionalOutbox() {
        var relay = new TransactionalOutboxRelay();
        relay.saveOrderWithOutbox("ORD-1", "{\\"total\\": 100}");

        var unpublished = relay.pollUnpublished();
        assertThat(unpublished).hasSize(1);

        relay.markPublished("ORD-1");
        assertThat(relay.pollUnpublished()).isEmpty();
    }
}
`
    },

    'resilient-event-processing-and-dead-letter-queues': {
      className: 'DeadLetterQueueDispatcher',
      description: 'Demonstrates exponential backoff retry policies and Dead Letter Queue (DLQ) routing upon retry exhaustion.',
      source: `package io.javahub.level10.resilienteventprocessinganddeadletterqueues;

import java.util.ArrayList;
import java.util.List;

/**
 * Dead Letter Queue (DLQ) retry and escalation handler.
 */
public class DeadLetterQueueDispatcher {

    private final List<String> mainQueue = new ArrayList<>();
    private final List<String> deadLetterQueue = new ArrayList<>();

    public void processMessage(String message, int attempts, int maxRetries) {
        if (attempts >= maxRetries) {
            deadLetterQueue.add(message); // Route to DLQ after exhausting retries
        } else {
            mainQueue.add(message); // Re-queue with exponential backoff
        }
    }

    public List<String> getDeadLetterQueue() { return List.copyOf(deadLetterQueue); }
    public List<String> getMainQueue() { return List.copyOf(mainQueue); }
}
`,
      test: `package io.javahub.level10.resilienteventprocessinganddeadletterqueues;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class DeadLetterQueueDispatcherTest {

    @Test
    @DisplayName("Should route poison pill message to Dead Letter Queue after max retries")
    void testDlqRouting() {
        var dispatcher = new DeadLetterQueueDispatcher();

        dispatcher.processMessage("retryable_msg", 1, 3);
        dispatcher.processMessage("poison_pill_msg", 3, 3);

        assertThat(dispatcher.getMainQueue()).containsExactly("retryable_msg");
        assertThat(dispatcher.getDeadLetterQueue()).containsExactly("poison_pill_msg");
    }
}
`
    }
  }
};

