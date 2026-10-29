module.exports = {
  level: 8,
  topics: {
    'spring-core-internals': {
      className: 'SpringLifecycleContainer',
      description: 'Demonstrates BeanPostProcessor proxy creation, @PostConstruct initialization, and IoC lifecycle.',
      source: `package io.javahub.level8.springcoreinternals;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

/**
 * Emulates Spring Framework IoC container and BeanPostProcessor dynamic proxy wrapping.
 */
public class SpringLifecycleContainer {

    public interface OrderService {
        String processOrder(String orderId);
    }

    public static class OrderServiceImpl implements OrderService {
        @Override
        public String processOrder(String orderId) {
            return "ORDER_PROCESSED: " + orderId;
        }
    }

    // Emulates BeanPostProcessor wrapping raw bean into transactional proxy
    public static class TransactionalProxyFactory {
        @SuppressWarnings("unchecked")
        public static <T> T wrapInProxy(Class<T> interfaceType, T rawInstance) {
            return (T) Proxy.newProxyInstance(
                interfaceType.getClassLoader(),
                new Class<?>[]{interfaceType},
                new InvocationHandler() {
                    @Override
                    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                        // Simulated @Transactional BEGIN
                        Object result = method.invoke(rawInstance, args);
                        // Simulated @Transactional COMMIT
                        return result;
                    }
                }
            );
        }
    }
}
`,
      test: `package io.javahub.level8.springcoreinternals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class SpringLifecycleContainerTest {

    @Test
    @DisplayName("TransactionalProxyFactory should intercept and execute bean methods through dynamic proxy")
    void testDynamicProxyWrapping() {
        var rawService = new SpringLifecycleContainer.OrderServiceImpl();
        var proxied = SpringLifecycleContainer.TransactionalProxyFactory.wrapInProxy(
            SpringLifecycleContainer.OrderService.class, rawService
        );

        String result = proxied.processOrder("ORD-101");
        assertThat(result).isEqualTo("ORDER_PROCESSED: ORD-101");
    }
}
`
    },

    'spring-data-jpa': {
      className: 'DynamicSpecificationFilter',
      description: 'Demonstrates dynamic criteria filtering and projection queries mimicking Spring Data JPA.',
      source: `package io.javahub.level8.springdatajpa;

import java.util.List;
import java.util.function.Predicate;

/**
 * Emulates dynamic Specification and Criteria filtering in Spring Data JPA.
 */
public class DynamicSpecificationFilter {

    public record Product(String id, String category, double price, boolean available) {}

    public List<Product> filter(List<Product> catalog, String category, Double maxPrice, Boolean onlyAvailable) {
        Predicate<Product> predicate = p -> true;

        if (category != null) {
            predicate = predicate.and(p -> p.category().equalsIgnoreCase(category));
        }
        if (maxPrice != null) {
            predicate = predicate.and(p -> p.price() <= maxPrice);
        }
        if (onlyAvailable != null) {
            predicate = predicate.and(p -> p.available() == onlyAvailable);
        }

        return catalog.stream().filter(predicate).toList();
    }
}
`,
      test: `package io.javahub.level8.springdatajpa;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class DynamicSpecificationFilterTest {

    @Test
    @DisplayName("Should compose dynamic filter specifications matching Spring Data JPA criteria")
    void testDynamicFilter() {
        var filter = new DynamicSpecificationFilter();
        var products = List.of(
            new DynamicSpecificationFilter.Product("P1", "TECH", 800.0, true),
            new DynamicSpecificationFilter.Product("P2", "TECH", 1500.0, true),
            new DynamicSpecificationFilter.Product("P3", "HOME", 100.0, false)
        );

        var matches = filter.filter(products, "TECH", 1000.0, true);
        assertThat(matches).hasSize(1);
        assertThat(matches.get(0).id()).isEqualTo("P1");
    }
}
`
    },

    'building-restful-apis': {
      className: 'ProblemDetailResponseBuilder',
      description: 'Demonstrates RFC 7807 ProblemDetail error response modeling in Spring Boot 3 REST APIs.',
      source: `package io.javahub.level8.buildingrestfulapis;

import java.net.URI;
import java.time.Instant;
import java.util.Map;

/**
 * RFC 7807 Problem Detail response builder standard in Spring Boot 3.
 */
public class ProblemDetailResponseBuilder {

    public record ProblemDetail(
        URI type,
        String title,
        int status,
        String detail,
        URI instance,
        Instant timestamp,
        Map<String, Object> properties
    ) {
        public static ProblemDetail forNotFound(String entityName, String id) {
            return new ProblemDetail(
                URI.create("https://api.javahub.io/errors/not-found"),
                "Entity Not Found",
                404,
                entityName + " with ID " + id + " was not located",
                URI.create("/api/" + entityName.toLowerCase() + "/" + id),
                Instant.now(),
                Map.of("errorCode", "ERR_404_NOT_FOUND")
            );
        }
    }
}
`,
      test: `package io.javahub.level8.buildingrestfulapis;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ProblemDetailResponseBuilderTest {

    @Test
    @DisplayName("Should build RFC 7807 ProblemDetail with correct status and error properties")
    void testProblemDetail() {
        var pd = ProblemDetailResponseBuilder.ProblemDetail.forNotFound("Order", "99");

        assertThat(pd.status()).isEqualTo(404);
        assertThat(pd.title()).isEqualTo("Entity Not Found");
        assertThat(pd.detail()).contains("Order with ID 99");
        assertThat(pd.properties()).containsEntry("errorCode", "ERR_404_NOT_FOUND");
    }
}
`
    },

    'spring-events-caching-scheduling': {
      className: 'TransactionalEventBroadcaster',
      description: 'Demonstrates Spring @TransactionalEventListener AFTER_COMMIT semantics and cache invalidation.',
      source: `package io.javahub.level8.springeventscachingscheduling;

import java.util.ArrayList;
import java.util.List;

/**
 * Emulates Spring @TransactionalEventListener firing only on transaction commit.
 */
public class TransactionalEventBroadcaster {

    public record OrderPlacedEvent(String orderId) {}

    private final List<String> auditLogs = new ArrayList<>();

    public void handleTransaction(OrderPlacedEvent event, boolean commit) {
        if (commit) {
            // Fires strictly AFTER_COMMIT
            auditLogs.add("EMITTED_AFTER_COMMIT: " + event.orderId());
        }
        // Rolled back events are safely suppressed
    }

    public List<String> getAuditLogs() { return List.copyOf(auditLogs); }
}
`,
      test: `package io.javahub.level8.springeventscachingscheduling;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class TransactionalEventBroadcasterTest {

    @Test
    @DisplayName("Transactional event listener should fire on commit and suppress on rollback")
    void testTransactionalEvents() {
        var broadcaster = new TransactionalEventBroadcaster();

        broadcaster.handleTransaction(new TransactionalEventBroadcaster.OrderPlacedEvent("ORD-1"), true);
        broadcaster.handleTransaction(new TransactionalEventBroadcaster.OrderPlacedEvent("ORD-FAIL"), false);

        assertThat(broadcaster.getAuditLogs()).containsExactly("EMITTED_AFTER_COMMIT: ORD-1");
    }
}
`
    },

    'aspect-oriented-programming-aop': {
      className: 'ExecutionTimeAspectSimulator',
      description: 'Demonstrates Spring AOP @Around advice, joinpoint invocation, and performance metrics.',
      source: `package io.javahub.level8.aspectorientedprogrammingaop;

import java.util.function.Supplier;

/**
 * Emulates Spring AOP @Around aspect measurement of method execution times.
 */
public class ExecutionTimeAspectSimulator {

    public record ExecutionResult<T>(T result, long durationNanos) {}

    public <T> ExecutionResult<T> profileMethod(Supplier<T> jointPointInvocation) {
        long start = System.nanoTime();
        try {
            T value = jointPointInvocation.get();
            long duration = System.nanoTime() - start;
            return new ExecutionResult<>(value, duration);
        } catch (Exception e) {
            throw new RuntimeException("Aspect execution intercepted exception", e);
        }
    }
}
`,
      test: `package io.javahub.level8.aspectorientedprogrammingaop;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ExecutionTimeAspectSimulatorTest {

    @Test
    @DisplayName("Aspect should execute join point and report execution duration in nanoseconds")
    void testAspectProfiling() {
        var aspect = new ExecutionTimeAspectSimulator();

        var execution = aspect.profileMethod(() -> {
            int acc = 0;
            for (int i = 0; i < 1000; i++) acc += i;
            return acc;
        });

        assertThat(execution.result()).isEqualTo(499500);
        assertThat(execution.durationNanos()).isGreaterThan(0L);
    }
}
`
    },

    'custom-spring-boot-starters-auto-configurations': {
      className: 'AutoConfigurationEngine',
      description: 'Demonstrates conditional bean creation (@ConditionalOnMissingBean, @ConditionalOnProperty).',
      source: `package io.javahub.level8.customspringbootstartersautoconfigurations;

import java.util.HashMap;
import java.util.Map;

/**
 * Emulates Spring Boot Auto-Configuration conditional bean registration.
 */
public class AutoConfigurationEngine {

    public interface CacheClient {
        String type();
    }

    public static class DefaultMemoryCache implements CacheClient {
        @Override
        public String type() { return "IN_MEMORY"; }
    }

    public static class CustomRedisCache implements CacheClient {
        @Override
        public String type() { return "REDIS"; }
    }

    private final Map<Class<?>, Object> beanContext = new HashMap<>();

    public void registerUserBean(Class<?> type, Object instance) {
        beanContext.put(type, instance);
    }

    // Emulates @ConditionalOnMissingBean(CacheClient.class)
    public CacheClient autoConfigureCacheClient() {
        if (!beanContext.containsKey(CacheClient.class)) {
            DefaultMemoryCache fallback = new DefaultMemoryCache();
            beanContext.put(CacheClient.class, fallback);
            return fallback;
        }
        return (CacheClient) beanContext.get(CacheClient.class);
    }
}
`,
      test: `package io.javahub.level8.customspringbootstartersautoconfigurations;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class AutoConfigurationEngineTest {

    @Test
    @DisplayName("Should auto-configure DefaultMemoryCache when user bean is absent")
    void testConditionalFallback() {
        var engine = new AutoConfigurationEngine();
        var client = engine.autoConfigureCacheClient();

        assertThat(client.type()).isEqualTo("IN_MEMORY");
    }

    @Test
    @DisplayName("Should preserve user-provided bean and not overwrite it with default")
    void testUserBeanPrecedence() {
        var engine = new AutoConfigurationEngine();
        engine.registerUserBean(AutoConfigurationEngine.CacheClient.class, new AutoConfigurationEngine.CustomRedisCache());

        var client = engine.autoConfigureCacheClient();
        assertThat(client.type()).isEqualTo("REDIS");
    }
}
`
    },

    'spring-batch-chunk-processing': {
      className: 'ChunkProcessingPipeline',
      description: 'Demonstrates Spring Batch ItemReader, ItemProcessor, and ItemWriter chunk boundaries.',
      source: `package io.javahub.level8.springbatchchunkprocessing;

import java.util.ArrayList;
import java.util.List;

/**
 * Emulates Spring Batch chunk-oriented transaction processing.
 */
public class ChunkProcessingPipeline {

    public List<List<String>> processInChunks(List<Integer> rawItems, int chunkSize) {
        List<List<String>> committedBatches = new ArrayList<>();
        List<String> currentChunk = new ArrayList<>();

        for (Integer item : rawItems) {
            // ItemProcessor: Transform integer to formatted string
            String processed = "REC_" + (item * 10);
            currentChunk.add(processed);

            // ItemWriter: Commit when chunk boundary is met
            if (currentChunk.size() == chunkSize) {
                committedBatches.add(List.copyOf(currentChunk));
                currentChunk.clear();
            }
        }

        // Flush remainder chunk
        if (!currentChunk.isEmpty()) {
            committedBatches.add(List.copyOf(currentChunk));
        }

        return committedBatches;
    }
}
`,
      test: `package io.javahub.level8.springbatchchunkprocessing;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class ChunkProcessingPipelineTest {

    @Test
    @DisplayName("Should commit items in discrete chunks respecting configured chunk size")
    void testChunkProcessing() {
        var pipeline = new ChunkProcessingPipeline();
        var items = List.of(1, 2, 3, 4, 5);

        var batches = pipeline.processInChunks(items, 2);

        assertThat(batches).hasSize(3);
        assertThat(batches.get(0)).containsExactly("REC_10", "REC_20");
        assertThat(batches.get(1)).containsExactly("REC_30", "REC_40");
        assertThat(batches.get(2)).containsExactly("REC_50");
    }
}
`
    },

    'automated-testing': {
      className: 'TestingMockVerifier',
      description: 'Demonstrates service layer isolation, test doubles, and verification spies.',
      source: `package io.javahub.level8.automatedtesting;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Test double and verification spy modeling Mockito @MockBean interactions.
 */
public class TestingMockVerifier {

    public interface EmailGateway {
        void sendEmail(String to, String body);
    }

    public static class EmailGatewaySpy implements EmailGateway {
        private final AtomicInteger sendCount = new AtomicInteger(0);

        @Override
        public void sendEmail(String to, String body) {
            sendCount.incrementAndGet();
        }

        public int getSendCount() { return sendCount.get(); }
    }

    public static class NotificationService {
        private final EmailGateway gateway;

        public NotificationService(EmailGateway gateway) {
            this.gateway = gateway;
        }

        public void notifyUser(String user) {
            gateway.sendEmail(user + "@javahub.io", "Welcome!");
        }
    }
}
`,
      test: `package io.javahub.level8.automatedtesting;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class TestingMockVerifierTest {

    @Test
    @DisplayName("Spy should verify interaction count on collaborating service")
    void testMockInteraction() {
        var spy = new TestingMockVerifier.EmailGatewaySpy();
        var service = new TestingMockVerifier.NotificationService(spy);

        service.notifyUser("alice");
        service.notifyUser("bob");

        assertThat(spy.getSendCount()).isEqualTo(2);
    }
}
`
    },

    'build-tools': {
      className: 'DependencyCoordinateResolver',
      description: 'Demonstrates Maven and Gradle dependency coordinates, GAV resolution, and transitive exclusion.',
      source: `package io.javahub.level8.buildtools;

import java.util.HashSet;
import java.util.Set;

/**
 * Models Maven GAV (GroupId, ArtifactId, Version) coordinates and exclusions.
 */
public class DependencyCoordinateResolver {

    public record Dependency(String groupId, String artifactId, String version, boolean excluded) {}

    private final Set<Dependency> dependencies = new HashSet<>();

    public void addDependency(Dependency dep) {
        if (!dep.excluded()) {
            dependencies.add(dep);
        }
    }

    public Set<Dependency> getActiveDependencies() {
        return Set.copyOf(dependencies);
    }
}
`,
      test: `package io.javahub.level8.buildtools;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class DependencyCoordinateResolverTest {

    @Test
    @DisplayName("Should resolve active dependencies while excluding banned transitive artifacts")
    void testDependencyExclusion() {
        var resolver = new DependencyCoordinateResolver();
        resolver.addDependency(new DependencyCoordinateResolver.Dependency("org.springframework.boot", "spring-boot-starter-web", "3.3.0", false));
        resolver.addDependency(new DependencyCoordinateResolver.Dependency("commons-logging", "commons-logging", "1.2", true)); // Excluded

        assertThat(resolver.getActiveDependencies()).hasSize(1);
    }
}
`
    }
  }
};

