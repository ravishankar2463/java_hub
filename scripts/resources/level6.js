module.exports = {
  level: 6,
  topics: {
    'solid-principles-basics': {
      className: 'SolidOrderProcessor',
      description: 'Demonstrates all 5 SOLID principles: SRP, Open/Closed via Strategy, Liskov, Interface Segregation, and DIP.',
      source: `package io.javahub.level6.solidprinciplesbasics;

import java.math.BigDecimal;

/**
 * Clean enterprise ordering architecture adhering strictly to SOLID design principles.
 */
public class SolidOrderProcessor {

    // DIP & ISP: Fine-grained notification abstraction
    public interface NotificationService {
        void sendAlert(String message);
    }

    // OCP: Strategy interface open for extension, closed for modification
    public interface TaxStrategy {
        BigDecimal calculateTax(BigDecimal subtotal);
    }

    public static class StandardVatTax implements TaxStrategy {
        @Override
        public BigDecimal calculateTax(BigDecimal subtotal) {
            return subtotal.multiply(new BigDecimal("0.20")); // 20% VAT
        }
    }

    // SRP: Processor solely orchestrates order financial computation
    private final TaxStrategy taxStrategy;
    private final NotificationService notificationService;

    public SolidOrderProcessor(TaxStrategy taxStrategy, NotificationService notificationService) {
        this.taxStrategy = taxStrategy;
        this.notificationService = notificationService;
    }

    public BigDecimal processTotal(BigDecimal subtotal) {
        BigDecimal tax = taxStrategy.calculateTax(subtotal);
        BigDecimal total = subtotal.add(tax);
        notificationService.sendAlert("Processed order total: $" + total);
        return total;
    }
}
`,
      test: `package io.javahub.level6.solidprinciplesbasics;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class SolidOrderProcessorTest {

    @Test
    @DisplayName("Should process order total using injected TaxStrategy and notify listeners")
    void testSolidProcessing() {
        List<String> auditLog = new ArrayList<>();
        SolidOrderProcessor.NotificationService notifier = auditLog::add;
        SolidOrderProcessor.TaxStrategy vat = new SolidOrderProcessor.StandardVatTax();

        SolidOrderProcessor processor = new SolidOrderProcessor(vat, notifier);
        BigDecimal total = processor.processTotal(new BigDecimal("100.00"));

        assertThat(total).isEqualByComparingTo("120.00");
        assertThat(auditLog).hasSize(1);
        assertThat(auditLog.get(0)).contains("Processed order total: $120.00");
    }
}
`
    },

    'creational-patterns': {
      className: 'CreationalPatternFactory',
      description: 'Demonstrates the Factory Method and Object Pool patterns for efficient object reuse.',
      source: `package io.javahub.level6.creationalpatterns;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

/**
 * Factory Method and Object Pool creational design patterns.
 */
public class CreationalPatternFactory {

    public interface Transport {
        String deliver();
    }

    public static class DroneTransport implements Transport {
        @Override
        public String deliver() { return "Delivered via autonomous drone"; }
    }

    public static class TruckTransport implements Transport {
        @Override
        public String deliver() { return "Delivered via overland freight"; }
    }

    // Object Pool managing reusable expensive resources
    public static class TransportPool {
        private final BlockingQueue<Transport> pool;

        public TransportPool(int capacity) {
            pool = new ArrayBlockingQueue<>(capacity);
            for (int i = 0; i < capacity; i++) {
                pool.add(new DroneTransport());
            }
        }

        public Transport borrowTransport() throws InterruptedException {
            return pool.take();
        }

        public void returnTransport(Transport transport) {
            pool.offer(transport);
        }

        public int availableCount() {
            return pool.size();
        }
    }
}
`,
      test: `package io.javahub.level6.creationalpatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class CreationalPatternFactoryTest {

    @Test
    @DisplayName("Object Pool should lend resources and restore count on return")
    void testObjectPool() throws Exception {
        var pool = new CreationalPatternFactory.TransportPool(2);
        assertThat(pool.availableCount()).isEqualTo(2);

        var t1 = pool.borrowTransport();
        assertThat(pool.availableCount()).isEqualTo(1);
        assertThat(t1.deliver()).contains("autonomous drone");

        pool.returnTransport(t1);
        assertThat(pool.availableCount()).isEqualTo(2);
    }
}
`
    },

    'structural-patterns': {
      className: 'StructuralAdapterSuite',
      description: 'Demonstrates the Decorator pattern for metrics/logging and Adapter pattern for legacy API translation.',
      source: `package io.javahub.level6.structuralpatterns;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Structural Adapter and Decorator patterns.
 */
public class StructuralAdapterSuite {

    public interface MessageSender {
        String send(String message);
    }

    public static class DefaultSender implements MessageSender {
        @Override
        public String send(String message) {
            return "SENT: " + message;
        }
    }

    // Decorator adding metrics counting without modifying original sender
    public static class CountingSenderDecorator implements MessageSender {
        private final MessageSender delegate;
        private final AtomicInteger counter = new AtomicInteger(0);

        public CountingSenderDecorator(MessageSender delegate) {
            this.delegate = delegate;
        }

        @Override
        public String send(String message) {
            counter.incrementAndGet();
            return delegate.send(message);
        }

        public int getInvocationCount() {
            return counter.get();
        }
    }
}
`,
      test: `package io.javahub.level6.structuralpatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class StructuralAdapterSuiteTest {

    @Test
    @DisplayName("Decorator should wrap message sender and transparently count invocations")
    void testDecorator() {
        var base = new StructuralAdapterSuite.DefaultSender();
        var decorator = new StructuralAdapterSuite.CountingSenderDecorator(base);

        String out1 = decorator.send("Hello");
        String out2 = decorator.send("World");

        assertThat(out1).isEqualTo("SENT: Hello");
        assertThat(out2).isEqualTo("SENT: World");
        assertThat(decorator.getInvocationCount()).isEqualTo(2);
    }
}
`
    },

    'behavioral-patterns': {
      className: 'BehavioralWorkflowSuite',
      description: 'Demonstrates Strategy, Observer, and Command patterns for loosely-coupled workflows.',
      source: `package io.javahub.level6.behavioralpatterns;

import java.util.ArrayList;
import java.util.List;

/**
 * Behavioral Observer and Strategy patterns.
 */
public class BehavioralWorkflowSuite {

    public interface EventListener {
        void onEvent(String eventName);
    }

    public static class EventBroadcaster {
        private final List<EventListener> listeners = new ArrayList<>();

        public void subscribe(EventListener listener) {
            listeners.add(listener);
        }

        public void broadcast(String eventName) {
            for (EventListener l : listeners) {
                l.onEvent(eventName);
            }
        }
    }
}
`,
      test: `package io.javahub.level6.behavioralpatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class BehavioralWorkflowSuiteTest {

    @Test
    @DisplayName("Observer pattern should deliver events to all registered listeners")
    void testObserverBroadcast() {
        var broadcaster = new BehavioralWorkflowSuite.EventBroadcaster();
        List<String> audit1 = new ArrayList<>();
        List<String> audit2 = new ArrayList<>();

        broadcaster.subscribe(audit1::add);
        broadcaster.subscribe(audit2::add);

        broadcaster.broadcast("ORDER_PAID");

        assertThat(audit1).containsExactly("ORDER_PAID");
        assertThat(audit2).containsExactly("ORDER_PAID");
    }
}
`
    },

    'architectural-patterns': {
      className: 'HexagonalOrderCore',
      description: 'Demonstrates Hexagonal (Ports & Adapters) architecture decoupling pure domain logic from infrastructure.',
      source: `package io.javahub.level6.architecturalpatterns;

import java.util.Optional;

/**
 * Hexagonal / Clean Architecture domain core decoupled from external storage or messaging.
 */
public class HexagonalOrderCore {

    public record Order(String id, double amount) {}

    // Outbound Port (SPI) implemented by infrastructure database adapters
    public interface OrderRepositoryPort {
        void save(Order order);
        Optional<Order> findById(String id);
    }

    // Inbound Port (API) consumed by controllers or message listeners
    public interface OrderUseCase {
        Order createOrder(String id, double amount);
    }

    // Pure Domain Service without framework dependencies
    public static class OrderService implements OrderUseCase {
        private final OrderRepositoryPort repositoryPort;

        public OrderService(OrderRepositoryPort repositoryPort) {
            this.repositoryPort = repositoryPort;
        }

        @Override
        public Order createOrder(String id, double amount) {
            Order order = new Order(id, amount);
            repositoryPort.save(order);
            return order;
        }
    }
}
`,
      test: `package io.javahub.level6.architecturalpatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;

public class HexagonalOrderCoreTest {

    @Test
    @DisplayName("Domain service should execute through port abstraction without external framework code")
    void testHexagonalPortsAndAdapters() {
        Map<String, HexagonalOrderCore.Order> mockDb = new HashMap<>();

        HexagonalOrderCore.OrderRepositoryPort inMemoryRepo = new HexagonalOrderCore.OrderRepositoryPort() {
            @Override
            public void save(HexagonalOrderCore.Order order) { mockDb.put(order.id(), order); }
            @Override
            public Optional<HexagonalOrderCore.Order> findById(String id) { return Optional.ofNullable(mockDb.get(id)); }
        };

        HexagonalOrderCore.OrderService service = new HexagonalOrderCore.OrderService(inMemoryRepo);
        var created = service.createOrder("ORD-42", 250.0);

        assertThat(created.amount()).isEqualTo(250.0);
        assertThat(mockDb).containsKey("ORD-42");
    }
}
`
    },

    'domain-driven-design-tactical-patterns': {
      className: 'OrderAggregateRoot',
      description: 'Demonstrates DDD Aggregate Roots maintaining transactional invariants, Value Objects, and Domain Events.',
      source: `package io.javahub.level6.domaindrivendesigntacticalpatterns;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * DDD Tactical Aggregate Root encapsulating child entities and publishing Domain Events.
 */
public class OrderAggregateRoot {

    public record DomainEvent(String eventType, String orderId) {}

    private final String orderId;
    private double balanceDue;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    public OrderAggregateRoot(String orderId, double initialAmount) {
        if (initialAmount <= 0) throw new IllegalArgumentException("Order amount must be positive");
        this.orderId = orderId;
        this.balanceDue = initialAmount;
        domainEvents.add(new DomainEvent("ORDER_CREATED", orderId));
    }

    public void applyPayment(double paymentAmount) {
        if (paymentAmount <= 0) throw new IllegalArgumentException("Payment must be positive");
        if (paymentAmount > balanceDue) throw new IllegalStateException("Payment exceeds remaining balance");

        this.balanceDue -= paymentAmount;
        if (this.balanceDue == 0.0) {
            domainEvents.add(new DomainEvent("ORDER_PAID_IN_FULL", orderId));
        }
    }

    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }

    public double getBalanceDue() { return balanceDue; }
    public String getOrderId() { return orderId; }
}
`,
      test: `package io.javahub.level6.domaindrivendesigntacticalpatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class OrderAggregateRootTest {

    @Test
    @DisplayName("Aggregate Root must preserve transactional invariants and emit domain events")
    void testAggregateInvariants() {
        OrderAggregateRoot order = new OrderAggregateRoot("ORD-77", 100.0);
        order.applyPayment(100.0);

        assertThat(order.getBalanceDue()).isEqualTo(0.0);
        List<OrderAggregateRoot.DomainEvent> events = order.pullDomainEvents();

        assertThat(events).extracting(OrderAggregateRoot.DomainEvent::eventType)
                          .containsExactly("ORDER_CREATED", "ORDER_PAID_IN_FULL");
    }

    @Test
    @DisplayName("Should prevent overpayment violating aggregate invariant")
    void testOverpaymentRejection() {
        OrderAggregateRoot order = new OrderAggregateRoot("ORD-78", 50.0);

        assertThatThrownBy(() -> order.applyPayment(70.0))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Payment exceeds remaining balance");
    }
}
`
    }
  }
};

