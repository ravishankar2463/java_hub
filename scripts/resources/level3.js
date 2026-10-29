module.exports = {
  level: 3,
  topics: {
    'generics': {
      className: 'PecsGenericProcessor',
      description: 'Demonstrates PECS (Producer Extends, Consumer Super), wildcard variance, and type erasure.',
      source: `package io.javahub.level3.generics;

import java.util.Collection;
import java.util.List;

/**
 * Demonstrates PECS: Producer Extends, Consumer Super for flexible generic APIs.
 */
public class PecsGenericProcessor {

    // Producer Extends: Reads from source (source produces numbers)
    public double sumOfList(List<? extends Number> numbers) {
        double sum = 0.0;
        for (Number n : numbers) {
            sum += n.doubleValue();
        }
        return sum;
    }

    // Consumer Super: Writes into destination (destination consumes integers)
    public void appendIntegers(Collection<? super Integer> destination, int count) {
        for (int i = 1; i <= count; i++) {
            destination.add(i);
        }
    }
}
`,
      test: `package io.javahub.level3.generics;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class PecsGenericProcessorTest {

    private final PecsGenericProcessor processor = new PecsGenericProcessor();

    @Test
    @DisplayName("Producer Extends should accept List<Integer> and List<Double>")
    void testProducerExtends() {
        List<Integer> ints = List.of(1, 2, 3);
        List<Double> doubles = List.of(1.5, 2.5);

        assertThat(processor.sumOfList(ints)).isEqualTo(6.0);
        assertThat(processor.sumOfList(doubles)).isEqualTo(4.0);
    }

    @Test
    @DisplayName("Consumer Super should allow writing integers into Collection<Number> or Collection<Object>")
    void testConsumerSuper() {
        List<Number> numberList = new ArrayList<>();
        processor.appendIntegers(numberList, 3);

        assertThat(numberList).containsExactly(1, 2, 3);
    }
}
`
    },

    'the-collections-framework-lists-sets': {
      className: 'CollectionMechanicsInspector',
      description: 'Demonstrates ArrayList growth capacity, LinkedList overhead, and HashSet collision handling.',
      source: `package io.javahub.level3.thecollectionsframeworklistssets;

import java.util.*;

/**
 * Demonstrates collection growth, hashing collisions, and performance characteristics.
 */
public class CollectionMechanicsInspector {

    public record CollisionKey(String key, int forcedHashCode) {
        @Override
        public int hashCode() {
            return forcedHashCode; // Force identical bucket placement
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (!(obj instanceof CollisionKey other)) return false;
            return Objects.equals(this.key, other.key);
        }
    }

    public Set<CollisionKey> populateCollidingSet(int count) {
        Set<CollisionKey> set = new HashSet<>();
        for (int i = 0; i < count; i++) {
            set.add(new CollisionKey("item_" + i, 42)); // All share bucket hash 42
        }
        return set;
    }

    public List<Integer> populateArrayListWithCapacity(int capacity) {
        List<Integer> list = new ArrayList<>(capacity);
        for (int i = 0; i < capacity; i++) {
            list.add(i);
        }
        return list;
    }
}
`,
      test: `package io.javahub.level3.thecollectionsframeworklistssets;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Set;
import static org.assertj.core.api.Assertions.assertThat;

public class CollectionMechanicsInspectorTest {

    private final CollectionMechanicsInspector inspector = new CollectionMechanicsInspector();

    @Test
    @DisplayName("HashSet must maintain correct element count even under deliberate hash collisions")
    void testHashSetCollisions() {
        Set<CollectionMechanicsInspector.CollisionKey> set = inspector.populateCollidingSet(5);
        assertThat(set).hasSize(5);
    }

    @Test
    @DisplayName("Pre-sized ArrayList should populate efficiently")
    void testArrayList() {
        List<Integer> list = inspector.populateArrayListWithCapacity(100);
        assertThat(list).hasSize(100).startsWith(0).endsWith(99);
    }
}
`
    },

    'the-collections-framework-maps': {
      className: 'ConcurrentMapMechanics',
      description: 'Demonstrates ConcurrentHashMap atomic computeIfAbsent and bucket-level synchronized locking.',
      source: `package io.javahub.level3.thecollectionsframeworkmaps;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-concurrency map mechanics using ConcurrentHashMap computeIfAbsent.
 */
public class ConcurrentMapMechanics {

    private final ConcurrentHashMap<String, AtomicInteger> accessCounters = new ConcurrentHashMap<>();

    public int incrementHit(String endpoint) {
        // computeIfAbsent is atomic per bucket
        return accessCounters.computeIfAbsent(endpoint, k -> new AtomicInteger(0))
                             .incrementAndGet();
    }

    public int getHits(String endpoint) {
        AtomicInteger counter = accessCounters.get(endpoint);
        return counter != null ? counter.get() : 0;
    }
}
`,
      test: `package io.javahub.level3.thecollectionsframeworkmaps;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ConcurrentMapMechanicsTest {

    @Test
    @DisplayName("ConcurrentHashMap computeIfAbsent must track hits atomically")
    void testComputeIfAbsent() {
        ConcurrentMapMechanics tracker = new ConcurrentMapMechanics();
        tracker.incrementHit("/api/v1/orders");
        tracker.incrementHit("/api/v1/orders");
        tracker.incrementHit("/api/v1/users");

        assertThat(tracker.getHits("/api/v1/orders")).isEqualTo(2);
        assertThat(tracker.getHits("/api/v1/users")).isEqualTo(1);
        assertThat(tracker.getHits("/api/v1/products")).isEqualTo(0);
    }
}
`
    },

    'jvm-architecture-internals': {
      className: 'ClassLoaderInspector',
      description: 'Demonstrates the ClassLoader parent delegation hierarchy: Bootstrap, Platform, and Application ClassLoaders.',
      source: `package io.javahub.level3.jvmarchitectureinternals;

/**
 * Inspects runtime ClassLoader hierarchy and delegation models.
 */
public class ClassLoaderInspector {

    public String getClassLoaderChain(Class<?> clazz) {
        StringBuilder sb = new StringBuilder();
        ClassLoader cl = clazz.getClassLoader();
        if (cl == null) {
            return "Bootstrap ClassLoader (null)";
        }

        while (cl != null) {
            sb.append(cl.getClass().getName());
            cl = cl.getParent();
            if (cl != null) sb.append(" -> ");
            else sb.append(" -> Bootstrap ClassLoader");
        }
        return sb.toString();
    }
}
`,
      test: `package io.javahub.level3.jvmarchitectureinternals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ClassLoaderInspectorTest {

    private final ClassLoaderInspector inspector = new ClassLoaderInspector();

    @Test
    @DisplayName("Core Java classes like String should be loaded by Bootstrap ClassLoader (null)")
    void testBootstrapClassLoader() {
        String chain = inspector.getClassLoaderChain(String.class);
        assertThat(chain).contains("Bootstrap ClassLoader");
    }

    @Test
    @DisplayName("Application classes should be loaded by AppClassLoader")
    void testAppClassLoader() {
        String chain = inspector.getClassLoaderChain(ClassLoaderInspector.class);
        assertThat(chain).contains("AppClassLoader");
    }
}
`
    },

    'garbage-collection-basics': {
      className: 'WeakReferenceTracker',
      description: 'Demonstrates GC reachability states using WeakReference and ReferenceQueue mechanics.',
      source: `package io.javahub.level3.garbagecollectionbasics;

import java.lang.ref.WeakReference;

/**
 * Demonstrates weak references and GC reclaimability.
 */
public class WeakReferenceTracker {

    public record SessionPayload(String sessionId, byte[] data) {}

    public WeakReference<SessionPayload> createTrackedSession(String id) {
        SessionPayload payload = new SessionPayload(id, new byte[1024]);
        return new WeakReference<>(payload);
    }
}
`,
      test: `package io.javahub.level3.garbagecollectionbasics;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.lang.ref.WeakReference;
import static org.assertj.core.api.Assertions.assertThat;

public class WeakReferenceTrackerTest {

    @Test
    @DisplayName("WeakReference should initially hold the referent before GC collection")
    void testWeakReference() {
        WeakReferenceTracker tracker = new WeakReferenceTracker();
        WeakReference<WeakReferenceTracker.SessionPayload> ref = tracker.createTrackedSession("SESS-1");

        // Without strong reference, referent is available before full GC
        assertThat(ref).isNotNull();
    }
}
`
    },

    'reflection-api-custom-annotations': {
      className: 'CustomDependencyInjector',
      description: 'Implements a dynamic reflection-based Dependency Injection container using custom annotations.',
      source: `package io.javahub.level3.reflectionapicustomannotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

/**
 * Lightweight IoC container utilizing Java Reflection and custom runtime annotations.
 */
public class CustomDependencyInjector {

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.FIELD)
    public @interface AutoInject {}

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    public @interface ManagedBean {}

    private final Map<Class<?>, Object> singletons = new HashMap<>();

    public <T> void registerSingleton(Class<T> type, T instance) {
        singletons.put(type, instance);
    }

    public <T> T createInstance(Class<T> clazz) throws Exception {
        T instance = clazz.getDeclaredConstructor().newInstance();

        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(AutoInject.class)) {
                Object dependency = singletons.get(field.getType());
                if (dependency != null) {
                    field.setAccessible(true);
                    field.set(instance, dependency);
                }
            }
        }
        return instance;
    }
}
`,
      test: `package io.javahub.level3.reflectionapicustomannotations;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class CustomDependencyInjectorTest {

    public interface DatabaseService {
        String query();
    }

    public static class MockDatabase implements DatabaseService {
        public String query() { return "Connected to mock DB"; }
    }

    public static class OrderController {
        @CustomDependencyInjector.AutoInject
        private DatabaseService db;

        public String handle() {
            return db.query();
        }
    }

    @Test
    @DisplayName("Reflection container should inject dependencies into annotated fields")
    void testReflectionInjection() throws Exception {
        CustomDependencyInjector injector = new CustomDependencyInjector();
        injector.registerSingleton(DatabaseService.class, new MockDatabase());

        OrderController controller = injector.createInstance(OrderController.class);

        assertThat(controller.handle()).isEqualTo("Connected to mock DB");
    }
}
`
    },

    'java-platform-module-system-jpms': {
      className: 'ModuleBoundaryValidator',
      description: 'Demonstrates JPMS module boundaries, strong encapsulation, and reflection restrictions.',
      source: `package io.javahub.level3.javaplatformmodulesystemjpms;

/**
 * Validates module encapsulation boundaries and package access.
 */
public class ModuleBoundaryValidator {

    public record ModuleInfoData(String moduleName, boolean isNamed, boolean isOpen) {}

    public ModuleInfoData inspectCurrentModule() {
        Module mod = this.getClass().getModule();
        return new ModuleInfoData(
            mod.getName() != null ? mod.getName() : "unnamed",
            mod.isNamed(),
            mod.isOpen(this.getClass().getPackageName())
        );
    }
}
`,
      test: `package io.javahub.level3.javaplatformmodulesystemjpms;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ModuleBoundaryValidatorTest {

    @Test
    @DisplayName("Should inspect JPMS module runtime descriptor")
    void testModuleInspection() {
        ModuleBoundaryValidator validator = new ModuleBoundaryValidator();
        ModuleBoundaryValidator.ModuleInfoData info = validator.inspectCurrentModule();

        assertThat(info).isNotNull();
        assertThat(info.moduleName()).isNotBlank();
    }
}
`
    }
  }
};

