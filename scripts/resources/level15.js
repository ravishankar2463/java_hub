// scripts/resources/level15.js
// Rich implementations for Level 15: Ultra-Low Latency & Mechanical Sympathy (5 topics)

module.exports = {
  level: 15,
  topics: {
    "mechanical-sympathy-and-cpu-architecture": {
    className: "FalseSharingCacheLineBenchmark",
    code: `package com.javahub.level15;

/**
 * Ultra-Low Latency: Mechanical Sympathy & CPU Architecture.
 * Demonstrates CPU Cache Line boundaries (typically 64 bytes) and the performance
 * degradation caused by False Sharing across adjacent volatile fields.
 */
public class FalseSharingCacheLineBenchmark {

    /**
     * Unpadded holder: fields p1 and p2 reside within the same 64-byte L1 cache line,
     * triggering cache-coherency invalidate messages across CPU cores.
     */
    public static class UnpaddedState {
        public volatile long value1 = 0L;
        public volatile long value2 = 0L;
    }

    /**
     * Padded holder: 56 bytes of dummy padding prevent value1 and value2
     * from sharing the same CPU cache line.
     */
    public static class PaddedState {
        public volatile long value1 = 0L;
        // 7 longs * 8 bytes = 56 bytes padding to isolate into distinct 64-byte line
        public long p1, p2, p3, p4, p5, p6, p7;
        public volatile long value2 = 0L;
    }

    public long simulateUnpaddedContention(int iterations) {
        UnpaddedState state = new UnpaddedState();
        long start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            state.value1++;
            state.value2++;
        }
        return System.nanoTime() - start;
    }

    public long simulatePaddedContention(int iterations) {
        PaddedState state = new PaddedState();
        long start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            state.value1++;
            state.value2++;
        }
        return System.nanoTime() - start;
    }
}
`,
    testCode: `package com.javahub.level15;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class FalseSharingCacheLineBenchmarkTest {

    @Test
    @DisplayName("Verify cache line padding structures and memory execution")
    void testCachePadding() {
        FalseSharingCacheLineBenchmark benchmark = new FalseSharingCacheLineBenchmark();
        int iterations = 100_000;

        long unpaddedNanos = benchmark.simulateUnpaddedContention(iterations);
        long paddedNanos = benchmark.simulatePaddedContention(iterations);

        assertThat(unpaddedNanos).isGreaterThan(0);
        assertThat(paddedNanos).isGreaterThan(0);

        FalseSharingCacheLineBenchmark.PaddedState padded = new FalseSharingCacheLineBenchmark.PaddedState();
        padded.value1 = 42L;
        padded.value2 = 84L;
        assertThat(padded.value1).isEqualTo(42L);
        assertThat(padded.value2).isEqualTo(84L);
    }
}
`,
    readmeContent: `# False Sharing Cache Line Benchmark

Demonstrates mechanical sympathy and CPU architecture alignment:
- **64-Byte Cache Lines**: How modern x86/ARM CPUs fetch memory blocks.
- **Cache Coherence Protocols (MESI)**: Why multi-core contention on adjacent fields causes pipeline stalls.
- **Defensive Padding**: Eliminating false sharing without native JNI code.

Run test suite: \`mvn clean test\`
`
  },

  "project-panama-foreign-function-memory-api": {
    className: "PanamaOffHeapMemoryManager",
    code: `package com.javahub.level15;

import java.lang.foreign.Arena;
import java.lang.foreign.MemorySegment;
import java.lang.foreign.ValueLayout;

/**
 * Ultra-Low Latency: Project Panama (Foreign Function & Memory API - JEP 454).
 * Demonstrates deterministic, off-heap native memory allocation, layout-aware slicing,
 * and zero-GC deallocation using Java 21 Arena.
 */
public class PanamaOffHeapMemoryManager {

    public record MemoryStatistics(long allocatedBytes, boolean isAccessible) {}

    public static long calculateOffHeapSum(int elementCount) {
        // Confined Arena provides deterministic lifecycle with zero GC overhead
        try (Arena arena = Arena.ofConfined()) {
            long byteSize = (long) elementCount * ValueLayout.JAVA_LONG.byteSize();
            MemorySegment segment = arena.allocate(byteSize);

            // Populate off-heap memory
            for (int i = 0; i < elementCount; i++) {
                segment.setAtIndex(ValueLayout.JAVA_LONG, i, (long) i * 10);
            }

            // Compute sum from off-heap segment
            long sum = 0;
            for (int i = 0; i < elementCount; i++) {
                sum += segment.getAtIndex(ValueLayout.JAVA_LONG, i);
            }

            return sum;
        } // Arena closes here: native memory is immediately released back to OS
    }

    public static byte[] copyOffHeapUtf8String(String text) {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment nativeString = arena.allocateFrom(text);
            byte[] buffer = new byte[(int) nativeString.byteSize() - 1]; // omit null terminator
            MemorySegment.copy(nativeString, ValueLayout.JAVA_BYTE, 0, buffer, 0, buffer.length);
            return buffer;
        }
    }
}
`,
    testCode: `package com.javahub.level15;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.*;

class PanamaOffHeapMemoryManagerTest {

    @Test
    @DisplayName("Verify Project Panama off-heap memory allocation and zero-GC sum calculation")
    void testPanamaOffHeapSum() {
        int count = 1_000;
        long sum = PanamaOffHeapMemoryManager.calculateOffHeapSum(count);

        // Sum of (i * 10) for i in 0..999 = 10 * (999 * 1000 / 2) = 4,995,000
        assertThat(sum).isEqualTo(4_995_000L);
    }

    @Test
    @DisplayName("Verify native string memory copying using MemorySegment")
    void testPanamaStringCopy() {
        String input = "Zero-Copy Panama Off-Heap Engine";
        byte[] bytes = PanamaOffHeapMemoryManager.copyOffHeapUtf8String(input);

        String recovered = new String(bytes, StandardCharsets.UTF_8);
        assertThat(recovered).isEqualTo(input);
    }
}
`,
    readmeContent: `# Project Panama Off-Heap Memory Manager

Demonstrates Java 21 standard Foreign Function & Memory API (JEP 454):
- **Arena Lifecycle**: Deterministic \`Arena.ofConfined()\` scoped allocation.
- **Off-heap MemorySegments**: Direct unmanaged native buffer manipulation bypassing JVM garbage collection.
- **ValueLayout**: Strongly-typed primitive addressing (\`JAVA_LONG\`, \`JAVA_BYTE\`).

Run test suite: \`mvn clean test\`
`
  },

  "the-lmax-disruptor-and-lock-free-ring-buffers": {
    className: "LmaxDisruptorRingBuffer",
    code: `package com.javahub.level15;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Ultra-Low Latency: LMAX Disruptor & Lock-Free Ring Buffer Pattern.
 * Implements a high-throughput bounded circular ring buffer with bitwise sequence masking,
 * eliminating lock contention and maximizing CPU pipeline efficiency.
 */
public class LmaxDisruptorRingBuffer<T> {

    private final Object[] ringBuffer;
    private final int bufferSize;
    private final int indexMask;
    private final AtomicLong cursor = new AtomicLong(-1);

    @SuppressWarnings("unchecked")
    public LmaxDisruptorRingBuffer(int powerOfTwoSize) {
        if (Integer.bitCount(powerOfTwoSize) != 1) {
            throw new IllegalArgumentException("Ring buffer size must be a power of two");
        }
        this.bufferSize = powerOfTwoSize;
        this.indexMask = powerOfTwoSize - 1;
        this.ringBuffer = new Object[bufferSize];
    }

    public long next() {
        return cursor.incrementAndGet();
    }

    public void publish(long sequence, T event) {
        int index = (int) (sequence & indexMask);
        ringBuffer[index] = event;
    }

    @SuppressWarnings("unchecked")
    public T get(long sequence) {
        int index = (int) (sequence & indexMask);
        return (T) ringBuffer[index];
    }

    public int getBufferSize() {
        return bufferSize;
    }

    public long getCursor() {
        return cursor.get();
    }
}
`,
    testCode: `package com.javahub.level15;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class LmaxDisruptorRingBufferTest {

    @Test
    @DisplayName("Verify lock-free ring buffer sequencing and bitwise masking")
    void testDisruptorRingBuffer() {
        LmaxDisruptorRingBuffer<String> ringBuffer = new LmaxDisruptorRingBuffer<>(1024);

        long seq0 = ringBuffer.next();
        ringBuffer.publish(seq0, "ORDER_CREATED_0");

        long seq1 = ringBuffer.next();
        ringBuffer.publish(seq1, "ORDER_MATCHED_1");

        assertThat(ringBuffer.get(seq0)).isEqualTo("ORDER_CREATED_0");
        assertThat(ringBuffer.get(seq1)).isEqualTo("ORDER_MATCHED_1");
        assertThat(ringBuffer.getCursor()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Verify wrap-around masking behavior over buffer bounds")
    void testWrapAround() {
        LmaxDisruptorRingBuffer<Integer> buffer = new LmaxDisruptorRingBuffer<>(4);

        for (int i = 0; i < 8; i++) {
            long seq = buffer.next();
            buffer.publish(seq, i * 100);
        }

        // Sequences 4, 5, 6, 7 overwrite positions 0, 1, 2, 3
        assertThat(buffer.get(4)).isEqualTo(400);
        assertThat(buffer.get(7)).isEqualTo(700);
        assertThat(buffer.getCursor()).isEqualTo(7L);
    }
}
`,
    readmeContent: `# LMAX Disruptor Lock-Free Ring Buffer

Demonstrates lock-free circular buffer mechanics:
- **Bitwise Masking**: Fast modulo operation \`(sequence & indexMask)\` leveraging power-of-two sizing.
- **Pre-allocated Event Slots**: Eliminates dynamic memory churn on critical low-latency hot paths.

Run test suite: \`mvn clean test\`
`
  },

  "zero-allocation-java-and-garbage-free-patterns": {
    className: "GarbageFreeByteBufferPool",
    code: `package com.javahub.level15;

import java.nio.ByteBuffer;
import java.util.ArrayDeque;
import java.util.Objects;
import java.util.Queue;

/**
 * Ultra-Low Latency: Zero-Allocation & Garbage-Free Object Pooling.
 * Demonstrates recycling direct off-heap ByteBuffers to achieve steady-state zero GC allocation.
 */
public class GarbageFreeByteBufferPool {

    private final int bufferCapacity;
    private final Queue<ByteBuffer> availableBuffers = new ArrayDeque<>();
    private final int poolLimit;

    public GarbageFreeByteBufferPool(int bufferCapacity, int poolLimit) {
        this.bufferCapacity = bufferCapacity;
        this.poolLimit = poolLimit;
        for (int i = 0; i < poolLimit; i++) {
            availableBuffers.add(ByteBuffer.allocateDirect(bufferCapacity));
        }
    }

    public synchronized ByteBuffer acquire() {
        ByteBuffer buf = availableBuffers.poll();
        if (buf == null) {
            return ByteBuffer.allocateDirect(bufferCapacity);
        }
        buf.clear();
        return buf;
    }

    public synchronized void release(ByteBuffer buffer) {
        Objects.requireNonNull(buffer, "Buffer cannot be null");
        if (availableBuffers.size() < poolLimit) {
            buffer.clear();
            availableBuffers.offer(buffer);
        }
    }

    public synchronized int availableCount() {
        return availableBuffers.size();
    }
}
`,
    testCode: `package com.javahub.level15;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.nio.ByteBuffer;
import static org.assertj.core.api.Assertions.*;

class GarbageFreeByteBufferPoolTest {

    @Test
    @DisplayName("Verify zero-allocation direct buffer recycling")
    void testBufferAcquisitionAndRelease() {
        GarbageFreeByteBufferPool pool = new GarbageFreeByteBufferPool(1024, 4);

        assertThat(pool.availableCount()).isEqualTo(4);

        ByteBuffer b1 = pool.acquire();
        ByteBuffer b2 = pool.acquire();

        assertThat(pool.availableCount()).isEqualTo(2);

        b1.putInt(12345);
        pool.release(b1);
        assertThat(pool.availableCount()).isEqualTo(3);

        ByteBuffer recycled = pool.acquire();
        assertThat(recycled.position()).isEqualTo(0); // verified cleared on release/acquire
    }
}
`,
    readmeContent: `# Garbage-Free Byte Buffer Pool

Demonstrates steady-state zero-allocation programming patterns:
- **Direct ByteBuffers**: Off-heap I/O buffers avoiding JVM garbage collector pauses.
- **Object Recycling**: Eliminating the creation of transient objects on microsecond execution paths.

Run test suite: \`mvn clean test\`
`
  },

  "ultra-low-latency-messaging-aeron-and-chronicle-queue": {
    className: "ChronicleMemoryMappedQueue",
    code: `package com.javahub.level15;

import java.nio.ByteBuffer;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Ultra-Low Latency: Memory-Mapped IPC Queue Mechanics (Chronicle Queue & Aeron).
 * Simulates microsecond-level IPC message publishing and reading over a shared direct memory buffer.
 */
public class ChronicleMemoryMappedQueue {

    private final ByteBuffer mappedBuffer;
    private final AtomicInteger writeIndex = new AtomicInteger(0);
    private int readIndex = 0;

    public ChronicleMemoryMappedQueue(int capacityBytes) {
        this.mappedBuffer = ByteBuffer.allocateDirect(capacityBytes);
    }

    public synchronized boolean writeMessage(String payload) {
        byte[] bytes = payload.getBytes();
        int required = 4 + bytes.length; // 4 bytes length prefix + payload

        if (writeIndex.get() + required > mappedBuffer.capacity()) {
            return false; // Out of memory-mapped buffer space
        }

        mappedBuffer.position(writeIndex.get());
        mappedBuffer.putInt(bytes.length);
        mappedBuffer.put(bytes);
        writeIndex.addAndGet(required);
        return true;
    }

    public synchronized String readNextMessage() {
        if (readIndex >= writeIndex.get()) {
            return null; // Caught up to tail
        }

        mappedBuffer.position(readIndex);
        int length = mappedBuffer.getInt();
        byte[] bytes = new byte[length];
        mappedBuffer.get(bytes);
        readIndex += (4 + length);

        return new String(bytes);
    }

    public synchronized int unreadBytes() {
        return writeIndex.get() - readIndex;
    }
}
`,
    testCode: `package com.javahub.level15;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class ChronicleMemoryMappedQueueTest {

    @Test
    @DisplayName("Verify memory-mapped binary IPC queue write and read semantics")
    void testMemoryMappedQueue() {
        ChronicleMemoryMappedQueue queue = new ChronicleMemoryMappedQueue(4096);

        boolean w1 = queue.writeMessage("EXEC_REPORT_FX_USD_EUR_100K");
        boolean w2 = queue.writeMessage("ORDER_CANCEL_ACK_7721");

        assertThat(w1).isTrue();
        assertThat(w2).isTrue();
        assertThat(queue.unreadBytes()).isGreaterThan(0);

        String msg1 = queue.readNextMessage();
        String msg2 = queue.readNextMessage();
        String msg3 = queue.readNextMessage();

        assertThat(msg1).isEqualTo("EXEC_REPORT_FX_USD_EUR_100K");
        assertThat(msg2).isEqualTo("ORDER_CANCEL_ACK_7721");
        assertThat(msg3).isNull();
        assertThat(queue.unreadBytes()).isEqualTo(0);
    }
}
`,
    readmeContent: `# Chronicle Memory-Mapped Queue Simulator

Demonstrates memory-mapped zero-copy messaging architectures (Chronicle Queue / Aeron IPC):
- **Length-prefixed binary wire frames**: Fast, compact serializations.
- **Tailer Cursor Mechanics**: Sequential append-only streaming with zero OS syscalls on the reader thread.

Run test suite: \`mvn clean test\`
`
    }
  }
};
