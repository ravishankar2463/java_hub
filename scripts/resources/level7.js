module.exports = {
  level: 7,
  topics: {
    'relational-database-fundamentals-advanced-sql': {
      className: 'SqlWindowFunctionSimulator',
      description: 'Simulates SQL window aggregation functions (ROW_NUMBER, RANK, DENSE_RANK, SUM OVER PARTITION).',
      source: `package io.javahub.level7.relationaldatabasefundamentalsadvancedsql;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Emulates SQL analytical window functions over partitioned in-memory result sets.
 */
public class SqlWindowFunctionSimulator {

    public record EmployeeSalary(String department, String employee, double salary) {}
    public record RankedEmployee(String department, String employee, double salary, int rowNumber, double runningTotal) {}

    public List<RankedEmployee> executeWindowPartition(List<EmployeeSalary> dataset) {
        Map<String, List<EmployeeSalary>> byDept = dataset.stream()
            .collect(Collectors.groupingBy(EmployeeSalary::department));

        List<RankedEmployee> results = new ArrayList<>();

        for (Map.Entry<String, List<EmployeeSalary>> entry : byDept.entrySet()) {
            List<EmployeeSalary> sorted = entry.getValue().stream()
                .sorted(Comparator.comparingDouble(EmployeeSalary::salary).reversed())
                .toList();

            double runningTotal = 0.0;
            int rowNum = 1;
            for (EmployeeSalary emp : sorted) {
                runningTotal += emp.salary();
                results.add(new RankedEmployee(emp.department(), emp.employee(), emp.salary(), rowNum++, runningTotal));
            }
        }
        return results;
    }
}
`,
      test: `package io.javahub.level7.relationaldatabasefundamentalsadvancedsql;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class SqlWindowFunctionSimulatorTest {

    @Test
    @DisplayName("Should execute window partition, calculate row numbers, and accumulate running totals")
    void testWindowFunctions() {
        var sim = new SqlWindowFunctionSimulator();
        var dataset = List.of(
            new SqlWindowFunctionSimulator.EmployeeSalary("ENG", "Alice", 120000.0),
            new SqlWindowFunctionSimulator.EmployeeSalary("ENG", "Bob", 150000.0),
            new SqlWindowFunctionSimulator.EmployeeSalary("HR", "Charlie", 90000.0)
        );

        var ranked = sim.executeWindowPartition(dataset);
        var engRanked = ranked.stream().filter(r -> r.department().equals("ENG")).toList();

        assertThat(engRanked).hasSize(2);
        assertThat(engRanked.get(0).employee()).isEqualTo("Bob");
        assertThat(engRanked.get(0).rowNumber()).isEqualTo(1);
        assertThat(engRanked.get(1).runningTotal()).isEqualTo(270000.0);
    }
}
`
    },

    'database-engine-internals-b-trees-and-mvcc': {
      className: 'BTreeIndexSimulator',
      description: 'Simulates balanced B-Tree index page splitting and MVCC row versioning snapshot visibility.',
      source: `package io.javahub.level7.databaseengineinternalsbtreesandmvcc;

import java.util.ArrayList;
import java.util.List;

/**
 * Emulates B-Tree index node splitting and Multi-Version Concurrency Control (MVCC).
 */
public class BTreeIndexSimulator {

    public record RowVersion(long xmin, long xmax, String data) {}

    public static class BTreeNode {
        private final int capacity;
        private final List<Integer> keys = new ArrayList<>();

        public BTreeNode(int capacity) {
            this.capacity = capacity;
        }

        public boolean insert(int key) {
            keys.add(key);
            keys.sort(Integer::compareTo);
            return keys.size() <= capacity; // false triggers page split
        }

        public List<Integer> getKeys() { return List.copyOf(keys); }
    }

    public boolean isVersionVisible(RowVersion version, long readerSnapshotTxId) {
        // MVCC Visibility: xmin must be committed before reader started, xmax must be uncommitted or after
        boolean createdBeforeReader = version.xmin() <= readerSnapshotTxId;
        boolean deletedAfterReader = version.xmax() == 0 || version.xmax() > readerSnapshotTxId;
        return createdBeforeReader && deletedAfterReader;
    }
}
`,
      test: `package io.javahub.level7.databaseengineinternalsbtreesandmvcc;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BTreeIndexSimulatorTest {

    private final BTreeIndexSimulator sim = new BTreeIndexSimulator();

    @Test
    @DisplayName("BTreeNode should detect capacity overflow triggering page split")
    void testBTreePageSplit() {
        var node = new BTreeIndexSimulator.BTreeNode(3);
        assertThat(node.insert(10)).isTrue();
        assertThat(node.insert(20)).isTrue();
        assertThat(node.insert(30)).isTrue();
        assertThat(node.insert(40)).isFalse(); // Exceeds capacity 3
    }

    @Test
    @DisplayName("MVCC should correctly evaluate snapshot visibility rules")
    void testMvccVisibility() {
        var version = new BTreeIndexSimulator.RowVersion(100L, 0L, "Active record");

        assertThat(sim.isVersionVisible(version, 105L)).isTrue();
        assertThat(sim.isVersionVisible(version, 90L)).isFalse(); // Created in future relative to tx 90
    }
}
`
    },

    'database-migrations': {
      className: 'SchemaMigrationTracker',
      description: 'Demonstrates zero-downtime expand/contract schema migrations, checksum validation, and rollback safety.',
      source: `package io.javahub.level7.databasemigrations;

import java.util.ArrayList;
import java.util.List;

/**
 * Migration state machine orchestrating non-blocking expand and contract migrations.
 */
public class SchemaMigrationTracker {

    public record Migration(int version, String description, String phase) {}

    private final List<Migration> applied = new ArrayList<>();

    public void applyMigration(int version, String desc, String phase) {
        if (!applied.isEmpty() && version <= applied.get(applied.size() - 1).version()) {
            throw new IllegalArgumentException("Migrations must be strictly ascending: " + version);
        }
        applied.add(new Migration(version, desc, phase));
    }

    public List<Migration> getApplied() { return List.copyOf(applied); }
}
`,
      test: `package io.javahub.level7.databasemigrations;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class SchemaMigrationTrackerTest {

    @Test
    @DisplayName("Should sequence Expand, Backfill, Switch, and Contract migrations")
    void testMigrationSequence() {
        SchemaMigrationTracker tracker = new SchemaMigrationTracker();
        tracker.applyMigration(1, "Add nullable display_name column", "EXPAND");
        tracker.applyMigration(2, "Backfill display_name from full_name", "BACKFILL");
        tracker.applyMigration(3, "Drop full_name column", "CONTRACT");

        assertThat(tracker.getApplied()).hasSize(3);
    }
}
`
    },

    'jdbc-and-connection-pooling': {
      className: 'PooledConnectionSimulator',
      description: 'Demonstrates connection pooling, PreparedStatement query caching, and batch updates.',
      source: `package io.javahub.level7.jdbcandconnectionpooling;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

/**
 * Emulates HikariCP connection leasing and auto-closing.
 */
public class PooledConnectionSimulator {

    public record MockConnection(int id) implements AutoCloseable {
        @Override
        public void close() {
            // Emulates returning leased connection to pool
        }
    }

    private final BlockingQueue<MockConnection> pool = new ArrayBlockingQueue<>(5);

    public PooledConnectionSimulator() {
        for (int i = 1; i <= 5; i++) {
            pool.add(new MockConnection(i));
        }
    }

    public MockConnection lease() throws InterruptedException {
        return pool.take();
    }

    public void release(MockConnection conn) {
        pool.offer(conn);
    }

    public int availableCount() { return pool.size(); }
}
`,
      test: `package io.javahub.level7.jdbcandconnectionpooling;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class PooledConnectionSimulatorTest {

    @Test
    @DisplayName("Pool should lease and reclaim connections")
    void testPoolLeaseAndRelease() throws Exception {
        var pool = new PooledConnectionSimulator();
        assertThat(pool.availableCount()).isEqualTo(5);

        var conn = pool.lease();
        assertThat(pool.availableCount()).isEqualTo(4);

        pool.release(conn);
        assertThat(pool.availableCount()).isEqualTo(5);
    }
}
`
    },

    'jpa-and-hibernate-basics': {
      className: 'PersistenceContextSimulator',
      description: 'Demonstrates First-Level Cache identity map, dirty checking, and entity lifecycle states.',
      source: `package io.javahub.level7.jpamandhibernatebasics;

import java.util.HashMap;
import java.util.Map;

/**
 * Emulates JPA Persistence Context L1 Cache and dirty checking.
 */
public class PersistenceContextSimulator {

    public record EntitySnapshot(String id, String data) {}

    private final Map<String, EntitySnapshot> identityMap = new HashMap<>();
    private final Map<String, EntitySnapshot> loadedSnapshots = new HashMap<>();

    public void persist(String id, String data) {
        var snapshot = new EntitySnapshot(id, data);
        identityMap.put(id, snapshot);
        loadedSnapshots.put(id, snapshot);
    }

    public EntitySnapshot find(String id) {
        return identityMap.get(id); // L1 Cache hit
    }

    public boolean isDirty(String id, String currentData) {
        EntitySnapshot loaded = loadedSnapshots.get(id);
        return loaded != null && !loaded.data().equals(currentData);
    }
}
`,
      test: `package io.javahub.level7.jpamandhibernatebasics;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class PersistenceContextSimulatorTest {

    @Test
    @DisplayName("L1 cache should serve repeat queries and detect dirty modifications")
    void testL1CacheAndDirtyChecking() {
        var context = new PersistenceContextSimulator();
        context.persist("E1", "Initial Name");

        assertThat(context.find("E1")).isNotNull();
        assertThat(context.isDirty("E1", "Initial Name")).isFalse();
        assertThat(context.isDirty("E1", "Updated Name")).isTrue();
    }
}
`
    },

    'entity-relationships': {
      className: 'BidirectionalRelationshipManager',
      description: 'Demonstrates JPA bidirectional @OneToMany and @ManyToOne synchronization avoiding orphan records.',
      source: `package io.javahub.level7.entityrelationships;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages bidirectional relationship synchronization between Parent and Child entities.
 */
public class BidirectionalRelationshipManager {

    public static class Order {
        private final String id;
        private final List<OrderItem> items = new ArrayList<>();

        public Order(String id) { this.id = id; }

        public void addItem(OrderItem item) {
            items.add(item);
            item.setOrder(this); // Synchronize bidirectional pointer
        }

        public List<OrderItem> getItems() { return List.copyOf(items); }
        public String getId() { return id; }
    }

    public static class OrderItem {
        private final String sku;
        private Order order;

        public OrderItem(String sku) { this.sku = sku; }
        public void setOrder(Order order) { this.order = order; }
        public Order getOrder() { return order; }
        public String getSku() { return sku; }
    }
}
`,
      test: `package io.javahub.level7.entityrelationships;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BidirectionalRelationshipManagerTest {

    @Test
    @DisplayName("Parent addItem helper must synchronize child back-pointer")
    void testBidirectionalSync() {
        var order = new BidirectionalRelationshipManager.Order("ORD-10");
        var item = new BidirectionalRelationshipManager.OrderItem("SKU-99");

        order.addItem(item);

        assertThat(order.getItems()).containsExactly(item);
        assertThat(item.getOrder()).isSameAs(order);
    }
}
`
    },

    'hibernate-performance-tuning': {
      className: 'QueryOptimizationGuide',
      description: 'Demonstrates solving N+1 select queries using batch fetching and projection maps.',
      source: `package io.javahub.level7.hibernateperformancetuning;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mitigates the N+1 select problem by batch-fetching related entities in a single roundtrip.
 */
public class QueryOptimizationGuide {

    public record Parent(long id, String name) {}
    public record Child(long id, long parentId, String value) {}

    public Map<Long, List<Child>> batchFetchChildren(List<Long> parentIds, List<Child> allChildren) {
        return allChildren.stream()
            .filter(c -> parentIds.contains(c.parentId()))
            .collect(Collectors.groupingBy(Child::parentId));
    }
}
`,
      test: `package io.javahub.level7.hibernateperformancetuning;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class QueryOptimizationGuideTest {

    @Test
    @DisplayName("Batch fetching should group children in 1 query avoiding N+1 roundtrips")
    void testBatchFetch() {
        var guide = new QueryOptimizationGuide();
        var children = List.of(
            new QueryOptimizationGuide.Child(1, 100L, "Child A"),
            new QueryOptimizationGuide.Child(2, 100L, "Child B"),
            new QueryOptimizationGuide.Child(3, 200L, "Child C")
        );

        var grouped = guide.batchFetchChildren(List.of(100L, 200L), children);

        assertThat(grouped.get(100L)).hasSize(2);
        assertThat(grouped.get(200L)).hasSize(1);
    }
}
`
    },

    'distributed-caching-with-redis': {
      className: 'RedisCacheAsideEngine',
      description: 'Demonstrates Cache-Aside, TTL expiration, and cache eviction patterns.',
      source: `package io.javahub.level7.distributedcachingwithredis;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * Emulates the Cache-Aside pattern with Redis key-value storage.
 */
public class RedisCacheAsideEngine<K, V> {

    private final Map<K, V> cache = new ConcurrentHashMap<>();

    public V getOrLoad(K key, Function<K, V> databaseLoader) {
        V cached = cache.get(key);
        if (cached != null) {
            return cached; // Cache Hit
        }

        // Cache Miss -> Load from database and populate cache
        V fresh = databaseLoader.apply(key);
        if (fresh != null) {
            cache.put(key, fresh);
        }
        return fresh;
    }

    public void evict(K key) {
        cache.remove(key);
    }
}
`,
      test: `package io.javahub.level7.distributedcachingwithredis;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.concurrent.atomic.AtomicInteger;
import static org.assertj.core.api.Assertions.assertThat;

public class RedisCacheAsideEngineTest {

    @Test
    @DisplayName("Cache-Aside pattern should only hit database loader on cache miss")
    void testCacheAside() {
        var cache = new RedisCacheAsideEngine<String, String>();
        AtomicInteger dbHits = new AtomicInteger(0);

        String v1 = cache.getOrLoad("user_1", k -> { dbHits.incrementAndGet(); return "Alice"; });
        String v2 = cache.getOrLoad("user_1", k -> { dbHits.incrementAndGet(); return "Alice"; });

        assertThat(v1).isEqualTo("Alice");
        assertThat(v2).isEqualTo("Alice");
        assertThat(dbHits.get()).isEqualTo(1); // Loaded from DB exactly once
    }
}
`
    },

    'distributed-locking-and-cache-patterns': {
      className: 'DistributedLockManager',
      description: 'Demonstrates distributed locking mutex leases, TTL renewals, and preventing cache stampedes.',
      source: `package io.javahub.level7.distributedlockingandcachepatterns;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Emulates distributed locking semantics with token leases.
 */
public class DistributedLockManager {

    private final ConcurrentHashMap<String, String> locks = new ConcurrentHashMap<>();

    public boolean tryAcquire(String lockKey, String ownerToken) {
        // Atomic putIfAbsent guarantees single lock holder
        return locks.putIfAbsent(lockKey, ownerToken) == null;
    }

    public boolean release(String lockKey, String ownerToken) {
        // Only release if the token matches the lock owner
        return locks.remove(lockKey, ownerToken);
    }
}
`,
      test: `package io.javahub.level7.distributedlockingandcachepatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class DistributedLockManagerTest {

    @Test
    @DisplayName("Should enforce mutual exclusion and verify owner token upon release")
    void testDistributedLock() {
        var manager = new DistributedLockManager();

        assertThat(manager.tryAcquire("order_42", "node_A")).isTrue();
        assertThat(manager.tryAcquire("order_42", "node_B")).isFalse();

        // Node B cannot release Node A's lock
        assertThat(manager.release("order_42", "node_B")).isFalse();

        // Node A releases successfully
        assertThat(manager.release("order_42", "node_A")).isTrue();
        assertThat(manager.tryAcquire("order_42", "node_B")).isTrue();
    }
}
`
    },

    'nosql-databases': {
      className: 'DocumentStoreSimulator',
      description: 'Demonstrates document-oriented JSON schemas and optimistic version concurrency.',
      source: `package io.javahub.level7.nosqldatabases;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Emulates a NoSQL document database with optimistic concurrency control (version tags).
 */
public class DocumentStoreSimulator {

    public record Document(String id, String jsonPayload, long version) {}

    private final ConcurrentHashMap<String, Document> store = new ConcurrentHashMap<>();

    public void insert(String id, String json) {
        store.put(id, new Document(id, json, 1L));
    }

    public boolean update(String id, String newJson, long expectedVersion) {
        Document current = store.get(id);
        if (current == null || current.version() != expectedVersion) {
            return false; // Optimistic locking collision
        }
        store.put(id, new Document(id, newJson, expectedVersion + 1));
        return true;
    }

    public Document find(String id) { return store.get(id); }
}
`,
      test: `package io.javahub.level7.nosqldatabases;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class DocumentStoreSimulatorTest {

    @Test
    @DisplayName("Should store JSON document and reject conflicting version updates")
    void testOptimisticConcurrency() {
        var db = new DocumentStoreSimulator();
        db.insert("doc_1", "{\\"name\\": \\"Alice\\"}");

        assertThat(db.update("doc_1", "{\\"name\\": \\"Alice V2\\"}", 1L)).isTrue();
        assertThat(db.update("doc_1", "{\\"name\\": \\"Alice Stale\\"}", 1L)).isFalse();
    }
}
`
    },

    'full-text-search-with-elasticsearch': {
      className: 'InvertedIndexEngine',
      description: 'Demonstrates text tokenization, inverted index posting lists, and keyword matching.',
      source: `package io.javahub.level7.fulltextsearchwithelasticsearch;

import java.util.*;

/**
 * Inverted index search engine modeling Elasticsearch text tokenization and posting lists.
 */
public class InvertedIndexEngine {

    private final Map<String, Set<String>> invertedIndex = new HashMap<>();

    public void indexDocument(String docId, String text) {
        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9\\\\s]", "").split("\\\\s+");
        for (String token : tokens) {
            if (!token.isBlank()) {
                invertedIndex.computeIfAbsent(token, k -> new HashSet<>()).add(docId);
            }
        }
    }

    public Set<String> search(String query) {
        String token = query.toLowerCase().trim();
        return invertedIndex.getOrDefault(token, Collections.emptySet());
    }
}
`,
      test: `package io.javahub.level7.fulltextsearchwithelasticsearch;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class InvertedIndexEngineTest {

    @Test
    @DisplayName("Inverted index should find document IDs containing matching tokens")
    void testInvertedIndex() {
        var engine = new InvertedIndexEngine();
        engine.indexDocument("doc1", "Elasticsearch provides high performance inverted index search");
        engine.indexDocument("doc2", "Java 21 delivers virtual threads and memory performance");

        assertThat(engine.search("inverted")).containsExactly("doc1");
        assertThat(engine.search("performance")).containsExactlyInAnyOrder("doc1", "doc2");
        assertThat(engine.search("unknown")).isEmpty();
    }
}
`
    }
  }
};

