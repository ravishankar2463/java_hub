module.exports = {
  level: 4,
  topics: {
    'lambdas-and-functional-interfaces': {
      className: 'FunctionalPipelineComposer',
      description: 'Demonstrates functional composition using Function.andThen(), Predicate chaining, and currying.',
      source: `package io.javahub.level4.lambdasandfunctionalinterfaces;

import java.util.function.Function;
import java.util.function.Predicate;

/**
 * Functional pipelines built with standard java.util.function interfaces.
 */
public class FunctionalPipelineComposer {

    public static Function<String, String> createSanitizer() {
        Function<String, String> trim = String::trim;
        Function<String, String> lower = String::toLowerCase;
        Function<String, String> stripNonAlpha = s -> s.replaceAll("[^a-z0-9]", "");

        return trim.andThen(lower).andThen(stripNonAlpha);
    }

    public static Predicate<Integer> isBetween(int min, int max) {
        Predicate<Integer> greaterOrEqual = val -> val >= min;
        Predicate<Integer> lessOrEqual = val -> val <= max;
        return greaterOrEqual.and(lessOrEqual);
    }
}
`,
      test: `package io.javahub.level4.lambdasandfunctionalinterfaces;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.function.Function;
import java.util.function.Predicate;
import static org.assertj.core.api.Assertions.assertThat;

public class FunctionalPipelineComposerTest {

    @Test
    @DisplayName("Should compose string transformation functions with andThen()")
    void testFunctionComposition() {
        Function<String, String> pipeline = FunctionalPipelineComposer.createSanitizer();
        String result = pipeline.apply("  Java_Hub-2026!  ");

        assertThat(result).isEqualTo("javahub2026");
    }

    @Test
    @DisplayName("Predicate.and() should validate within range")
    void testPredicateChaining() {
        Predicate<Integer> validator = FunctionalPipelineComposer.isBetween(10, 20);

        assertThat(validator.test(15)).isTrue();
        assertThat(validator.test(9)).isFalse();
        assertThat(validator.test(21)).isFalse();
    }
}
`
    },

    'the-streams-api': {
      className: 'OrderStreamPipeline',
      description: 'Demonstrates lazy evaluation, flatMap, reduce, and filtering in modern Java Stream pipelines.',
      source: `package io.javahub.level4.thestreamsapi;

import java.util.List;

/**
 * Demonstrates intermediate vs terminal stream operations and pipeline transformations.
 */
public class OrderStreamPipeline {

    public record Item(String name, double price, String category) {}
    public record CustomerOrder(String id, List<Item> items, boolean completed) {}

    public double calculateTotalRevenue(List<CustomerOrder> orders, String targetCategory) {
        return orders.stream()
            .filter(CustomerOrder::completed)               // Intermediate: Filter active orders
            .flatMap(order -> order.items().stream())       // Intermediate: Flatten items
            .filter(item -> item.category().equalsIgnoreCase(targetCategory))
            .mapToDouble(Item::price)                       // Map to primitive double
            .sum();                                         // Terminal: Reduction
    }
}
`,
      test: `package io.javahub.level4.thestreamsapi;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class OrderStreamPipelineTest {

    @Test
    @DisplayName("Should compute category revenue across completed orders via stream flatMap and sum")
    void testStreamPipeline() {
        OrderStreamPipeline pipeline = new OrderStreamPipeline();

        List<OrderStreamPipeline.CustomerOrder> orders = List.of(
            new OrderStreamPipeline.CustomerOrder("O1", List.of(
                new OrderStreamPipeline.Item("Laptop", 1200.0, "TECH"),
                new OrderStreamPipeline.Item("Book", 30.0, "BOOKS")
            ), true),
            new OrderStreamPipeline.CustomerOrder("O2", List.of(
                new OrderStreamPipeline.Item("Monitor", 400.0, "TECH")
            ), true),
            new OrderStreamPipeline.CustomerOrder("O3", List.of(
                new OrderStreamPipeline.Item("Mouse", 50.0, "TECH")
            ), false) // Incomplete order
        );

        double techRevenue = pipeline.calculateTotalRevenue(orders, "TECH");
        assertThat(techRevenue).isEqualTo(1600.0);
    }
}
`
    },

    'advanced-streams-collectors': {
      className: 'AdvancedCollectorsAggregator',
      description: 'Demonstrates Collectors.groupingBy, partitioningBy, downstream collectors, and custom reduction.',
      source: `package io.javahub.level4.advancedstreamscollectors;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Advanced multi-level grouping and statistical aggregation with Java Collectors.
 */
public class AdvancedCollectorsAggregator {

    public record Transaction(String country, String currency, double amount) {}

    public Map<String, Double> sumAmountByCountry(List<Transaction> transactions) {
        return transactions.stream()
            .collect(Collectors.groupingBy(
                Transaction::country,
                Collectors.summingDouble(Transaction::amount)
            ));
    }

    public Map<Boolean, List<Transaction>> partitionHighValue(List<Transaction> transactions, double threshold) {
        return transactions.stream()
            .collect(Collectors.partitioningBy(tx -> tx.amount() >= threshold));
    }
}
`,
      test: `package io.javahub.level4.advancedstreamscollectors;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

public class AdvancedCollectorsAggregatorTest {

    private final AdvancedCollectorsAggregator aggregator = new AdvancedCollectorsAggregator();

    private final List<AdvancedCollectorsAggregator.Transaction> sampleData = List.of(
        new AdvancedCollectorsAggregator.Transaction("US", "USD", 500.0),
        new AdvancedCollectorsAggregator.Transaction("US", "USD", 300.0),
        new AdvancedCollectorsAggregator.Transaction("DE", "EUR", 700.0)
    );

    @Test
    @DisplayName("Should group and sum amounts per country")
    void testGroupingBy() {
        Map<String, Double> countrySums = aggregator.sumAmountByCountry(sampleData);

        assertThat(countrySums.get("US")).isEqualTo(800.0);
        assertThat(countrySums.get("DE")).isEqualTo(700.0);
    }

    @Test
    @DisplayName("Should partition transactions into high and low value sets")
    void testPartitioningBy() {
        var partitioned = aggregator.partitionHighValue(sampleData, 600.0);

        assertThat(partitioned.get(true)).hasSize(1);
        assertThat(partitioned.get(false)).hasSize(2);
    }
}
`
    },

    'optional-api': {
      className: 'MonadicOptionalNavigator',
      description: 'Demonstrates idiomatic Optional navigation with map, flatMap, and orElseThrow.',
      source: `package io.javahub.level4.optionalapi;

import java.util.Optional;

/**
 * Safe navigation and value transformations eliminating NullPointerException hazards.
 */
public class MonadicOptionalNavigator {

    public record Address(String city) {}
    public record User(String name, Address address) {}

    public String resolveCityOrDefault(Optional<User> userOpt, String fallback) {
        return userOpt
            .map(User::address)
            .map(Address::city)
            .filter(city -> !city.isBlank())
            .orElse(fallback);
    }
}
`,
      test: `package io.javahub.level4.optionalapi;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;

public class MonadicOptionalNavigatorTest {

    private final MonadicOptionalNavigator navigator = new MonadicOptionalNavigator();

    @Test
    @DisplayName("Should navigate nested address fields safely through Optional map")
    void testOptionalPresent() {
        var user = new MonadicOptionalNavigator.User("Alice", new MonadicOptionalNavigator.Address("Zurich"));
        String city = navigator.resolveCityOrDefault(Optional.of(user), "Unknown");

        assertThat(city).isEqualTo("Zurich");
    }

    @Test
    @DisplayName("Should return fallback when address or user is missing")
    void testOptionalFallback() {
        String city = navigator.resolveCityOrDefault(Optional.empty(), "Unknown");
        assertThat(city).isEqualTo("Unknown");
    }
}
`
    },

    'reactive-programming-basics': {
      className: 'ReactiveStreamSimulator',
      description: 'Simulates Reactive Streams flow control: Publisher, Subscriber, and demand-driven backpressure.',
      source: `package io.javahub.level4.reactiveprogrammingbasics;

import java.util.ArrayList;
import java.util.List;

/**
 * Flow control simulation adhering to Reactive Streams backpressure specifications.
 */
public class ReactiveStreamSimulator {

    public interface Subscriber<T> {
        void onNext(T item);
        void onComplete();
    }

    public static class SimplePublisher<T> {
        private final List<T> items;

        public SimplePublisher(List<T> items) {
            this.items = items;
        }

        public void subscribe(Subscriber<T> subscriber, int requestDemand) {
            int toEmit = Math.min(requestDemand, items.size());
            for (int i = 0; i < toEmit; i++) {
                subscriber.onNext(items.get(i));
            }
            if (toEmit == items.size()) {
                subscriber.onComplete();
            }
        }
    }
}
`,
      test: `package io.javahub.level4.reactiveprogrammingbasics;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class ReactiveStreamSimulatorTest {

    @Test
    @DisplayName("Publisher must honor subscriber request demand (backpressure)")
    void testBackpressureDemand() {
        List<String> events = List.of("e1", "e2", "e3", "e4", "e5");
        ReactiveStreamSimulator.SimplePublisher<String> publisher = new ReactiveStreamSimulator.SimplePublisher<>(events);

        List<String> received = new ArrayList<>();
        publisher.subscribe(new ReactiveStreamSimulator.Subscriber<>() {
            @Override
            public void onNext(String item) { received.add(item); }
            @Override
            public void onComplete() {}
        }, 2); // Request only 2 items

        assertThat(received).containsExactly("e1", "e2");
    }
}
`
    }
  }
};

