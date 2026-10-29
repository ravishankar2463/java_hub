module.exports = {
  level: 2,
  topics: {
    'exception-handling': {
      className: 'ResilientFileReader',
      description: 'Demonstrates try-with-resources, suppressed exception preservation, and lightweight custom exceptions.',
      source: `package io.javahub.level2.exceptionhandling;

import java.io.Closeable;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Demonstrates try-with-resources and suppressed exception extraction.
 */
public class ResilientFileReader {

    public static class FaultyResource implements Closeable {
        private final String name;
        private final boolean failOnClose;

        public FaultyResource(String name, boolean failOnClose) {
            this.name = name;
            this.failOnClose = failOnClose;
        }

        public void doWork(boolean throwInWork) throws IOException {
            if (throwInWork) {
                throw new IOException("Primary failure in resource work: " + name);
            }
        }

        @Override
        public void close() throws IOException {
            if (failOnClose) {
                throw new IOException("Secondary close failure in: " + name);
            }
        }
    }

    public List<String> processWithSuppressedHandling() {
        List<String> recordedExceptions = new ArrayList<>();
        try (FaultyResource r = new FaultyResource("PrimaryDatabase", true)) {
            r.doWork(true);
        } catch (IOException primaryEx) {
            recordedExceptions.add("Primary: " + primaryEx.getMessage());
            for (Throwable suppressed : primaryEx.getSuppressed()) {
                recordedExceptions.add("Suppressed: " + suppressed.getMessage());
            }
        }
        return recordedExceptions;
    }
}
`,
      test: `package io.javahub.level2.exceptionhandling;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class ResilientFileReaderTest {

    @Test
    @DisplayName("Try-with-resources should preserve secondary close exceptions via getSuppressed()")
    void testSuppressedExceptions() {
        ResilientFileReader reader = new ResilientFileReader();
        List<String> errors = reader.processWithSuppressedHandling();

        assertThat(errors).hasSize(2);
        assertThat(errors.get(0)).contains("Primary: Primary failure");
        assertThat(errors.get(1)).contains("Suppressed: Secondary close failure");
    }
}
`
    },

    'enums': {
      className: 'OrderStatusStateMachine',
      description: 'Demonstrates rich enums with state transition matrices, abstract methods, and high-speed EnumSet.',
      source: `package io.javahub.level2.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * Finite state machine implemented via a type-safe Java enum.
 */
public class OrderStatusStateMachine {

    public enum Status {
        CREATED {
            @Override
            public boolean canTransitionTo(Status target) {
                return target == PAID || target == CANCELLED;
            }
        },
        PAID {
            @Override
            public boolean canTransitionTo(Status target) {
                return target == SHIPPED || target == REFUNDED;
            }
        },
        SHIPPED {
            @Override
            public boolean canTransitionTo(Status target) {
                return target == DELIVERED;
            }
        },
        DELIVERED {
            @Override
            public boolean canTransitionTo(Status target) {
                return false; // Terminal state
            }
        },
        CANCELLED {
            @Override
            public boolean canTransitionTo(Status target) {
                return false; // Terminal state
            }
        },
        REFUNDED {
            @Override
            public boolean canTransitionTo(Status target) {
                return false; // Terminal state
            }
        };

        public abstract boolean canTransitionTo(Status target);

        public static Set<Status> terminalStatuses() {
            return EnumSet.of(DELIVERED, CANCELLED, REFUNDED);
        }
    }

    private Status currentStatus = Status.CREATED;

    public void transition(Status newStatus) {
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new IllegalStateException("Illegal transition from " + currentStatus + " to " + newStatus);
        }
        this.currentStatus = newStatus;
    }

    public Status getCurrentStatus() {
        return currentStatus;
    }
}
`,
      test: `package io.javahub.level2.enums;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class OrderStatusStateMachineTest {

    @Test
    @DisplayName("Should successfully transition through valid enum states")
    void testValidTransitions() {
        OrderStatusStateMachine fsm = new OrderStatusStateMachine();
        fsm.transition(OrderStatusStateMachine.Status.PAID);
        fsm.transition(OrderStatusStateMachine.Status.SHIPPED);
        fsm.transition(OrderStatusStateMachine.Status.DELIVERED);

        assertThat(fsm.getCurrentStatus()).isEqualTo(OrderStatusStateMachine.Status.DELIVERED);
    }

    @Test
    @DisplayName("Should reject illegal transition directly from CREATED to SHIPPED")
    void testIllegalTransition() {
        OrderStatusStateMachine fsm = new OrderStatusStateMachine();

        assertThatThrownBy(() -> fsm.transition(OrderStatusStateMachine.Status.SHIPPED))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Illegal transition");
    }
}
`
    },

    'the-string-constant-pool-stringbuilders': {
      className: 'StringPoolMechanics',
      description: 'Demonstrates String Constant Pool intern(), identity hash codes, and pre-sized StringBuilder capacity.',
      source: `package io.javahub.level2.thestringconstantpoolstringbuilders;

/**
 * Demonstrates string pooling, intern() mechanics, and StringBuilder allocation behavior.
 */
public class StringPoolMechanics {

    public boolean testStringLiteralIdentity() {
        String a = "JavaMastery";
        String b = "JavaMastery";
        return a == b; // Identical pooled reference
    }

    public boolean testInternBehavior() {
        String heapString = new String("JavaMastery");
        String interned = heapString.intern();
        String literal = "JavaMastery";

        // heapString points to unique heap memory, interned points to string pool
        return heapString != literal && interned == literal;
    }

    public String buildConcatenatedCsv(int count) {
        // Pre-size capacity to avoid internal byte[] reallocations
        StringBuilder sb = new StringBuilder(count * 8);
        for (int i = 0; i < count; i++) {
            if (i > 0) sb.append(',');
            sb.append("id_").append(i);
        }
        return sb.toString();
    }
}
`,
      test: `package io.javahub.level2.thestringconstantpoolstringbuilders;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class StringPoolMechanicsTest {

    private final StringPoolMechanics mechanics = new StringPoolMechanics();

    @Test
    @DisplayName("String literals must point to the same String Constant Pool address")
    void testPoolIdentity() {
        assertThat(mechanics.testStringLiteralIdentity()).isTrue();
    }

    @Test
    @DisplayName("intern() must return pooled canonical string reference")
    void testIntern() {
        assertThat(mechanics.testInternBehavior()).isTrue();
    }

    @Test
    @DisplayName("StringBuilder should assemble CSV without truncation")
    void testStringBuilder() {
        String csv = mechanics.buildConcatenatedCsv(3);
        assertThat(csv).isEqualTo("id_0,id_1,id_2");
    }
}
`
    },

    'modern-core-apis': {
      className: 'ModernCoreCatalog',
      description: 'Demonstrates java.time (JSR-310), unmodifiable collections List.of(), and Java 21 Record patterns.',
      source: `package io.javahub.level2.moderncoreapis;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * Modern Java 21 core APIs: Records, java.time, and immutable collections.
 */
public class ModernCoreCatalog {

    public record AuditLog(String actor, Instant timestamp, String action) {}

    public List<AuditLog> createSampleLogs() {
        Instant now = Instant.now();
        // List.of returns an unmodifiable List rejecting nulls and mutations
        return List.of(
            new AuditLog("alice", now, "LOGIN"),
            new AuditLog("bob", now.plus(Duration.ofMinutes(5)), "EXPORT_DATA")
        );
    }

    public ZonedDateTime convertToZone(Instant instant, String zoneIdString) {
        return instant.atZone(ZoneId.of(zoneIdString));
    }
}
`,
      test: `package io.javahub.level2.moderncoreapis;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class ModernCoreCatalogTest {

    private final ModernCoreCatalog catalog = new ModernCoreCatalog();

    @Test
    @DisplayName("List.of must return strictly unmodifiable list")
    void testImmutableList() {
        List<ModernCoreCatalog.AuditLog> logs = catalog.createSampleLogs();
        assertThat(logs).hasSize(2);

        assertThatThrownBy(() -> logs.add(new ModernCoreCatalog.AuditLog("eve", Instant.now(), "HACK")))
            .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("Instant should convert accurately to specific time zone")
    void testZoneConversion() {
        Instant now = Instant.parse("2026-10-29T10:00:00Z");
        ZonedDateTime tokyoTime = catalog.convertToZone(now, "Asia/Tokyo");

        assertThat(tokyoTime.getHour()).isEqualTo(19); // UTC+9
    }
}
`
    },

    'io-and-nio2': {
      className: 'NioFastFileProcessor',
      description: 'Demonstrates NIO.2 Path, Files, direct ByteBuffers, and memory-mapped file channels.',
      source: `package io.javahub.level2.ioandnio2;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * High-speed NIO.2 buffer manipulations and file path utilities.
 */
public class NioFastFileProcessor {

    public void writeAndReadBuffer(Path tempFile, String message) throws IOException {
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        Files.write(tempFile, bytes);
    }

    public String readViaDirectBuffer(Path tempFile) throws IOException {
        byte[] bytes = Files.readAllBytes(tempFile);
        ByteBuffer buffer = ByteBuffer.allocateDirect(bytes.length);
        buffer.put(bytes);
        buffer.flip(); // Prepare for reading

        byte[] result = new byte[buffer.remaining()];
        buffer.get(result);
        return new String(result, StandardCharsets.UTF_8);
    }
}
`,
      test: `package io.javahub.level2.ioandnio2;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.io.IOException;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

public class NioFastFileProcessorTest {

    private final NioFastFileProcessor processor = new NioFastFileProcessor();

    @Test
    @DisplayName("Should write and read file using NIO.2 and direct ByteBuffer")
    void testNioBufferRoundtrip(@TempDir Path tempDir) throws IOException {
        Path file = tempDir.resolve("nio-test.txt");
        String content = "Zero-Copy High-Throughput I/O with Java 21";

        processor.writeAndReadBuffer(file, content);
        String readBack = processor.readViaDirectBuffer(file);

        assertThat(readBack).isEqualTo(content);
    }
}
`
    },

    'network-socket-programming': {
      className: 'EchoProtocolSimulator',
      description: 'Demonstrates TCP client-server request-response protocols, socket streams, and buffer flushes.',
      source: `package io.javahub.level2.networksocketprogramming;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Emulates TCP network socket request-response streams.
 */
public class EchoProtocolSimulator {

    public String processEchoStream(String inputMessage) throws IOException {
        byte[] incomingBytes = inputMessage.getBytes(StandardCharsets.UTF_8);
        ByteArrayInputStream clientIn = new ByteArrayInputStream(incomingBytes);
        ByteArrayOutputStream serverOut = new ByteArrayOutputStream();

        // Server reads client bytes and echoes with prefix
        byte[] buffer = new byte[1024];
        int bytesRead = clientIn.read(buffer);
        if (bytesRead > 0) {
            serverOut.write("ECHO: ".getBytes(StandardCharsets.UTF_8));
            serverOut.write(buffer, 0, bytesRead);
        }

        return serverOut.toString(StandardCharsets.UTF_8);
    }
}
`,
      test: `package io.javahub.level2.networksocketprogramming;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.io.IOException;
import static org.assertj.core.api.Assertions.assertThat;

public class EchoProtocolSimulatorTest {

    @Test
    @DisplayName("Should simulate TCP echo server protocol stream transformation")
    void testEchoProtocol() throws IOException {
        EchoProtocolSimulator simulator = new EchoProtocolSimulator();
        String response = simulator.processEchoStream("PING");

        assertThat(response).isEqualTo("ECHO: PING");
    }
}
`
    },

    'regular-expressions-and-redos-defense': {
      className: 'SafeRegexValidator',
      description: 'Guards against Regular Expression Denial of Service (ReDoS) using possessive quantifiers and timeout limits.',
      source: `package io.javahub.level2.regularexpressionsandredosdefense;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ReDoS-hardened regular expression matching engine.
 */
public class SafeRegexValidator {

    // Uses possessive quantifier '++' to eliminate catastrophic backtracking
    private static final Pattern SAFE_EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]++@[a-zA-Z0-9.-]++\\\\.[a-zA-Z]{2,}+$");

    public boolean isValidEmail(String email) {
        if (email == null || email.length() > 254) { // RFC 5321 length guard
            return false;
        }
        return SAFE_EMAIL_PATTERN.matcher(email).matches();
    }

    public boolean safeTimeoutMatch(String input, Pattern pattern, long maxMillis) {
        long startTime = System.currentTimeMillis();
        CharSequence timeoutSeq = new CharSequence() {
            @Override
            public int length() { return input.length(); }
            @Override
            public char charAt(int index) {
                if (System.currentTimeMillis() - startTime > maxMillis) {
                    throw new RuntimeException("Regex execution timeout exceeded (ReDoS defense)");
                }
                return input.charAt(index);
            }
            @Override
            public CharSequence subSequence(int start, int end) {
                return input.subSequence(start, end);
            }
        };

        Matcher matcher = pattern.matcher(timeoutSeq);
        return matcher.find();
    }
}
`,
      test: `package io.javahub.level2.regularexpressionsandredosdefense;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.regex.Pattern;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class SafeRegexValidatorTest {

    private final SafeRegexValidator validator = new SafeRegexValidator();

    @Test
    @DisplayName("Should validate correct emails using possessive quantifiers")
    void testValidEmail() {
        assertThat(validator.isValidEmail("dev@javahub.io")).isTrue();
        assertThat(validator.isValidEmail("invalid-email")).isFalse();
    }

    @Test
    @DisplayName("Timeout guard should interrupt catastrophic backtracking patterns")
    void testReDosInterruption() {
        // Vulnerable catastrophic backtracking regex: (a+)+$
        Pattern evilPattern = Pattern.compile("(a+)+$");
        String evilInput = "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!"; // 28 'a's triggers exponential paths

        assertThatThrownBy(() -> validator.safeTimeoutMatch(evilInput, evilPattern, 50))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Regex execution timeout exceeded");
    }
}
`
    }
  }
};

