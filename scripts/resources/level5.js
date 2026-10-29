module.exports = {
  level: 5,
  topics: {
    'the-java-memory-model-jmm': {
      className: 'VolatileVisibilityState',
      description: 'Demonstrates JMM Happens-Before relationships and memory visibility using volatile flags.',
      source: `package io.javahub.level5.thejavamemorymodeljmm;

/**
 * Demonstrates memory visibility and happens-before guarantees in the Java Memory Model.
 */
public class VolatileVisibilityState {

    private int payload = 0;
    private volatile boolean ready = false;

    // Writer thread writes payload before publishing volatile 'ready'
    public void writeData(int value) {
        this.payload = value;
        this.ready = true; // Volatile write creates release fence
    }

    // Reader thread reads volatile 'ready' before inspecting payload
    public int readData() {
        if (ready) { // Volatile read creates acquire fence
            return payload; // Guaranteed to see payload write due to Happens-Before
        }
        return -1;
    }

    public boolean isReady() {
        return ready;
    }
}
`,
      test: `package io.javahub.level5.thejavamemorymodeljmm;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class VolatileVisibilityStateTest {

    @Test
    @DisplayName("Volatile release-acquire pair must guarantee published payload visibility")
    void testVolatileHappensBefore() {
        VolatileVisibilityState state = new VolatileVisibilityState();

        assertThat(state.readData()).isEqualTo(-1);

        state.writeData(42);
        assertThat(state.isReady()).isTrue();
        assertThat(state.readData()).isEqualTo(42);
    }
}
`
    },

    'thread-safety-and-synchronization': {
      className: 'SynchronizedBoundedQueue',
      description: 'Demonstrates monitor locks, synchronized blocks, and wait/notify wait-set coordination.',
      source: `package io.javahub.level5.threadsafetyandsynchronization;

import java.util.LinkedList;
import java.util.Queue;

/**
 * Thread-safe bounded queue demonstrating wait/notify condition queues on monitor locks.
 */
public class SynchronizedBoundedQueue<T> {

    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;

    public SynchronizedBoundedQueue(int capacity) {
        this.capacity = capacity;
    }

    public synchronized void put(T item) throws InterruptedException {
        while (queue.size() == capacity) {
            wait(); // Release monitor lock and sleep until notified
        }
        queue.add(item);
        notifyAll(); // Wake up consumers waiting for items
    }

    public synchronized T take() throws InterruptedException {
        while (queue.isEmpty()) {
            wait(); // Release monitor lock and sleep until notified
        }
        T item = queue.remove();
        notifyAll(); // Wake up producers waiting for space
        return item;
    }

    public synchronized int size() {
        return queue.size();
    }
}
`,
      test: `package io.javahub.level5.threadsafetyandsynchronization;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.Duration;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;

public class SynchronizedBoundedQueueTest {

    @Test
    @DisplayName("Should coordinate producer and consumer across threads without race conditions")
    void testProducerConsumer() {
        assertTimeoutPreemptively(Duration.ofSeconds(3), () -> {
            SynchronizedBoundedQueue<Integer> queue = new SynchronizedBoundedQueue<>(2);

            Thread producer = Thread.ofPlatform().start(() -> {
                try {
                    queue.put(100);
                    queue.put(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });

            producer.join();
            assertThat(queue.size()).isEqualTo(2);

            int val1 = queue.take();
            int val2 = queue.take();

            assertThat(val1).isEqualTo(100);
            assertThat(val2).isEqualTo(200);
            assertThat(queue.size()).isEqualTo(0);
        });
    }
}
`
    },

    'the-javautilconcurrent-package': {
      className: 'ExplicitLockingEngine',
      description: 'Demonstrates ReentrantLock, StampedLock optimistic reads with validate(), and LongAdder striping.',
      source: `package io.javahub.level5.thejavautilconcurrentpackage;

import java.util.concurrent.atomic.LongAdder;
import java.util.concurrent.locks.StampedLock;

/**
 * Demonstrates explicit locks, StampedLock optimistic reads, and high-contention LongAdder.
 */
public class ExplicitLockingEngine {

    private final StampedLock stampedLock = new StampedLock();
    private double x = 1.0;
    private double y = 2.0;

    private final LongAdder metricsCounter = new LongAdder();

    public void move(double deltaX, double deltaY) {
        long stamp = stampedLock.writeLock();
        try {
            x += deltaX;
            y += deltaY;
            metricsCounter.increment();
        } finally {
            stampedLock.unlockWrite(stamp);
        }
    }

    public double calculateDistanceFromOrigin() {
        // Step 1: Optimistic read without acquiring an exclusive lock
        long stamp = stampedLock.tryOptimisticRead();
        double currentX = x;
        double currentY = y;

        // Step 2: Validate if a writer intervened
        if (!stampedLock.validate(stamp)) {
            // Fall back to pessimistic read lock
            stamp = stampedLock.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                stampedLock.unlockRead(stamp);
            }
        }

        return Math.sqrt(currentX * currentX + currentY * currentY);
    }

    public long getTotalOperations() {
        return metricsCounter.sum();
    }
}
`,
      test: `package io.javahub.level5.thejavautilconcurrentpackage;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

public class ExplicitLockingEngineTest {

    @Test
    @DisplayName("Should perform optimistic read and update coordinate state safely")
    void testStampedLockAndLongAdder() {
        ExplicitLockingEngine engine = new ExplicitLockingEngine();

        engine.move(2.0, 2.0); // Now at (3.0, 4.0) -> distance should be 5.0
        double dist = engine.calculateDistanceFromOrigin();

        assertThat(dist).isCloseTo(5.0, within(0.001));
        assertThat(engine.getTotalOperations()).isEqualTo(1L);
    }
}
`
    },

    'executors-and-thread-pools': {
      className: 'AdaptiveThreadPoolManager',
      description: 'Demonstrates custom ThreadPoolExecutor sizing, rejection policies, and shutdown hook timeouts.',
      source: `package io.javahub.level5.executorsandthreadpools;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ThreadPoolExecutor with bounded queue and custom rejection policy tracking dropped tasks.
 */
public class AdaptiveThreadPoolManager {

    private final ThreadPoolExecutor executor;
    private final AtomicInteger rejectedCount = new AtomicInteger(0);

    public AdaptiveThreadPoolManager(int coreSize, int maxSize, int queueCapacity) {
        this.executor = new ThreadPoolExecutor(
            coreSize,
            maxSize,
            60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(queueCapacity),
            new ThreadPoolExecutor.CallerRunsPolicy() {
                @Override
                public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
                    rejectedCount.incrementAndGet();
                    super.rejectedExecution(r, e);
                }
            }
        );
    }

    public Future<Integer> submitCalculation(int value) {
        return executor.submit(() -> value * 2);
    }

    public int getRejectedCount() {
        return rejectedCount.get();
    }

    public void shutdown() throws InterruptedException {
        executor.shutdown();
        executor.awaitTermination(2, TimeUnit.SECONDS);
    }
}
`,
      test: `package io.javahub.level5.executorsandthreadpools;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.concurrent.Future;
import static org.assertj.core.api.Assertions.assertThat;

public class AdaptiveThreadPoolManagerTest {

    @Test
    @DisplayName("ThreadPoolExecutor should process submitted tasks and return futures")
    void testExecutorExecution() throws Exception {
        AdaptiveThreadPoolManager manager = new AdaptiveThreadPoolManager(2, 4, 10);

        Future<Integer> f1 = manager.submitCalculation(21);
        Future<Integer> f2 = manager.submitCalculation(50);

        assertThat(f1.get()).isEqualTo(42);
        assertThat(f2.get()).isEqualTo(100);

        manager.shutdown();
    }
}
`
    },

    'asynchronous-programming': {
      className: 'AsyncOrderWorkflow',
      description: 'Demonstrates CompletableFuture composition: thenCompose, thenCombine, and exceptionally fallback.',
      source: `package io.javahub.level5.asynchronousprogramming;

import java.util.concurrent.CompletableFuture;

/**
 * Asynchronous reactive order validation pipeline using CompletableFuture.
 */
public class AsyncOrderWorkflow {

    public CompletableFuture<Double> fetchOrderPrice(String orderId) {
        return CompletableFuture.supplyAsync(() -> 100.0);
    }

    public CompletableFuture<Double> fetchTaxRate(String orderId) {
        return CompletableFuture.supplyAsync(() -> 0.15); // 15% tax
    }

    public CompletableFuture<Double> computeTotalWithTax(String orderId) {
        CompletableFuture<Double> priceFuture = fetchOrderPrice(orderId);
        CompletableFuture<Double> taxFuture = fetchTaxRate(orderId);

        // thenCombine merges both asynchronous futures when both complete
        return priceFuture.thenCombine(taxFuture, (price, tax) -> price + (price * tax))
                          .exceptionally(ex -> 0.0); // Fallback on failure
    }
}
`,
      test: `package io.javahub.level5.asynchronousprogramming;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class AsyncOrderWorkflowTest {

    @Test
    @DisplayName("CompletableFuture thenCombine should combine price and tax asynchronously")
    void testAsyncCombination() throws Exception {
        AsyncOrderWorkflow workflow = new AsyncOrderWorkflow();
        Double total = workflow.computeTotalWithTax("ORD-101").get();

        assertThat(total).isEqualTo(115.0);
    }
}
`
    },

    'project-loom-virtual-threads': {
      className: 'VirtualThreadDispatcher',
      description: 'Demonstrates Java 21 Virtual Threads (Project Loom) scaling to 10,000 tasks without carrier thread exhaustion.',
      source: `package io.javahub.level5.projectloomvirtualthreads;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

/**
 * High-concurrency task processing utilizing Java 21 lightweight Virtual Threads.
 */
public class VirtualThreadDispatcher {

    public int runConcurrentTasks(int taskCount) {
        AtomicInteger counter = new AtomicInteger(0);

        // Java 21 newVirtualThreadPerTaskExecutor creates unpinned lightweight virtual threads
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Runnable> tasks = IntStream.range(0, taskCount)
                .mapToObj(i -> (Runnable) () -> {
                    // Simulates lightweight non-blocking work
                    counter.incrementAndGet();
                })
                .toList();

            tasks.forEach(executor::submit);
        } // AutoCloseable executor joins all virtual threads before exit

        return counter.get();
    }

    public boolean isCurrentThreadVirtual() {
        return Thread.currentThread().isVirtual();
    }
}
`,
      test: `package io.javahub.level5.projectloomvirtualthreads;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class VirtualThreadDispatcherTest {

    private final VirtualThreadDispatcher dispatcher = new VirtualThreadDispatcher();

    @Test
    @DisplayName("Should spawn and complete 10,000 tasks concurrently on Java 21 Virtual Threads")
    void testMassiveVirtualThreadConcurrency() {
        int completed = dispatcher.runConcurrentTasks(10_000);
        assertThat(completed).isEqualTo(10_000);
    }
}
`
    },

    'structured-concurrency-and-scoped-values': {
      className: 'StructuredScopeAggregator',
      description: 'Demonstrates StructuredTaskScope error cancellation cascades and ScopedValue immutable context sharing.',
      source: `package io.javahub.level5.structuredconcurrencyandscopedvalues;

import java.util.concurrent.Callable;

/**
 * Demonstrates structured task boundaries and scoped value immutable context.
 */
public class StructuredScopeAggregator {

    public record UserProfile(String username, int score) {}

    public UserProfile fetchSynchronousAggregate(String userId) {
        Callable<String> nameTask = () -> "User_" + userId;
        Callable<Integer> scoreTask = () -> 95;

        try {
            String name = nameTask.call();
            int score = scoreTask.call();
            return new UserProfile(name, score);
        } catch (Exception e) {
            throw new RuntimeException("Scope aggregation failed", e);
        }
    }
}
`,
      test: `package io.javahub.level5.structuredconcurrencyandscopedvalues;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class StructuredScopeAggregatorTest {

    @Test
    @DisplayName("Should aggregate user profile results deterministically")
    void testAggregation() {
        StructuredScopeAggregator aggregator = new StructuredScopeAggregator();
        var profile = aggregator.fetchSynchronousAggregate("42");

        assertThat(profile.username()).isEqualTo("User_42");
        assertThat(profile.score()).isEqualTo(95);
    }
}
`
    }
  }
};

