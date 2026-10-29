module.exports = {
  level: 1,
  topics: {
    'classes-and-objects': {
      className: 'UserProfile',
      description: 'Demonstrates the Builder pattern, constructor validation invariants, and preventing the "this-escape" hazard.',
      source: `package io.javahub.level1.classesandobjects;

import java.util.Objects;

/**
 * Immutable user profile constructed via a validated fluent Builder.
 */
public final class UserProfile {

    private final String userId;
    private final String email;
    private final int age;
    private final boolean active;

    private UserProfile(Builder builder) {
        this.userId = builder.userId;
        this.email = builder.email;
        this.age = builder.age;
        this.active = builder.active;
    }

    public static class Builder {
        private final String userId;
        private String email;
        private int age;
        private boolean active = true;

        public Builder(String userId) {
            this.userId = Objects.requireNonNull(userId, "User ID cannot be null");
        }

        public Builder email(String email) {
            if (email == null || !email.contains("@")) {
                throw new IllegalArgumentException("Invalid email format: " + email);
            }
            this.email = email;
            return this;
        }

        public Builder age(int age) {
            if (age < 0 || age > 150) {
                throw new IllegalArgumentException("Age out of legal bounds: " + age);
            }
            this.age = age;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        public UserProfile build() {
            Objects.requireNonNull(email, "Email is mandatory before build()");
            return new UserProfile(this);
        }
    }

    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public int getAge() { return age; }
    public boolean isActive() { return active; }
}
`,
      test: `package io.javahub.level1.classesandobjects;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class UserProfileTest {

    @Test
    @DisplayName("Should build immutable UserProfile with valid fields")
    void testBuilderSuccess() {
        UserProfile profile = new UserProfile.Builder("USR-101")
            .email("alice@javahub.io")
            .age(30)
            .active(true)
            .build();

        assertThat(profile.getUserId()).isEqualTo("USR-101");
        assertThat(profile.getEmail()).isEqualTo("alice@javahub.io");
        assertThat(profile.getAge()).isEqualTo(30);
        assertThat(profile.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should fail when email format is invalid")
    void testInvalidEmail() {
        assertThatThrownBy(() -> new UserProfile.Builder("USR-102").email("not-an-email"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid email format");
    }
}
`
    },

    'the-static-keyword': {
      className: 'BillPughSingleton',
      description: 'Demonstrates lazy thread-safe initialization via inner static helper class without synchronized overhead.',
      source: `package io.javahub.level1.thestatickeyword;

import java.util.concurrent.atomic.AtomicLong;

/**
 * High-performance, thread-safe Singleton using the Bill Pugh Holder idiom and static atomics.
 */
public class BillPughSingleton {

    private static final AtomicLong INSTANCE_COUNTER = new AtomicLong(0);

    private BillPughSingleton() {
        INSTANCE_COUNTER.incrementAndGet();
    }

    // Holder class loaded ONLY when getInstance() is called
    private static class Holder {
        private static final BillPughSingleton INSTANCE = new BillPughSingleton();
    }

    public static BillPughSingleton getInstance() {
        return Holder.INSTANCE;
    }

    public static long getTotalAllocations() {
        return INSTANCE_COUNTER.get();
    }

    public String computeGreeting(String name) {
        return "Hello from Singleton to " + name;
    }
}
`,
      test: `package io.javahub.level1.thestatickeyword;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BillPughSingletonTest {

    @Test
    @DisplayName("Multiple calls to getInstance() must yield the exact same heap reference")
    void testSingletonIdentity() {
        BillPughSingleton first = BillPughSingleton.getInstance();
        BillPughSingleton second = BillPughSingleton.getInstance();

        assertThat(first).isSameAs(second);
        assertThat(BillPughSingleton.getTotalAllocations()).isEqualTo(1L);
    }
}
`
    },

    'memory-references-copying': {
      className: 'PassByValueProof',
      description: 'Proves Java strict pass-by-value: parameter reassignment has zero caller effect, but internal mutation alters heap state.',
      source: `package io.javahub.level1.memoryreferencescopying;

import java.util.Date;

/**
 * Proof of Java 100% pass-by-value semantics and defensive copy patterns.
 */
public class PassByValueProof {

    public static class Car {
        private String color;
        public Car(String color) { this.color = color; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }

    // Reassignment does NOT affect caller reference
    public static void attemptReassign(Car c) {
        c = new Car("Yellow");
    }

    // Internal mutation DOES affect caller object on heap
    public static void mutateColor(Car c, String newColor) {
        c.setColor(newColor);
    }

    // Defensive copy protecting internal mutable state
    public static final class SecurePeriod {
        private final Date start;
        private final Date end;

        public SecurePeriod(Date start, Date end) {
            // Defensive copy on entry
            this.start = new Date(start.getTime());
            this.end = new Date(end.getTime());
            if (this.start.after(this.end)) {
                throw new IllegalArgumentException("Start after end");
            }
        }

        public Date getStart() {
            // Defensive copy on exit
            return new Date(start.getTime());
        }
    }
}
`,
      test: `package io.javahub.level1.memoryreferencescopying;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.Date;
import static org.assertj.core.api.Assertions.assertThat;

public class PassByValueProofTest {

    @Test
    @DisplayName("Parameter reassignment must NOT alter caller's reference variable")
    void testPassByValueReassignment() {
        PassByValueProof.Car original = new PassByValueProof.Car("Red");
        PassByValueProof.attemptReassign(original);

        assertThat(original.getColor()).isEqualTo("Red");
    }

    @Test
    @DisplayName("Calling setter on reference parameter must alter shared heap object")
    void testPassByValueMutation() {
        PassByValueProof.Car original = new PassByValueProof.Car("Red");
        PassByValueProof.mutateColor(original, "Green");

        assertThat(original.getColor()).isEqualTo("Green");
    }

    @Test
    @DisplayName("Defensive copies must prevent external date mutation from corrupting state")
    void testDefensiveCopy() {
        Date start = new Date(1000L);
        Date end = new Date(5000L);

        PassByValueProof.SecurePeriod period = new PassByValueProof.SecurePeriod(start, end);

        // Mutate original external date
        start.setTime(999999L);
        assertThat(period.getStart().getTime()).isEqualTo(1000L);

        // Mutate returned date
        Date retrieved = period.getStart();
        retrieved.setTime(888888L);
        assertThat(period.getStart().getTime()).isEqualTo(1000L);
    }
}
`
    },

    'encapsulation-access-modifiers': {
      className: 'EncapsulatedWallet',
      description: 'Demonstrates the Tell-Dont-Ask principle, invariant preservation, and package-private encapsulation.',
      source: `package io.javahub.level1.encapsulationaccessmodifiers;

import java.math.BigDecimal;

/**
 * Encapsulated financial wallet adhering to the Tell-Don't-Ask principle.
 */
public class EncapsulatedWallet {

    private BigDecimal balance;
    private final String currency;

    public EncapsulatedWallet(BigDecimal initialBalance, String currency) {
        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.balance = initialBalance;
        this.currency = currency;
    }

    public synchronized void pay(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds to complete payment");
        }
        this.balance = this.balance.subtract(amount);
    }

    public synchronized void topUp(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Top-up amount must be positive");
        }
        this.balance = this.balance.add(amount);
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getCurrency() {
        return currency;
    }
}
`,
      test: `package io.javahub.level1.encapsulationaccessmodifiers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class EncapsulatedWalletTest {

    @Test
    @DisplayName("Should execute valid payments reducing balance")
    void testWalletPayment() {
        EncapsulatedWallet wallet = new EncapsulatedWallet(new BigDecimal("100.00"), "USD");
        wallet.pay(new BigDecimal("40.00"));

        assertThat(wallet.getBalance()).isEqualByComparingTo("60.00");
    }

    @Test
    @DisplayName("Should throw IllegalStateException on insufficient funds")
    void testOverdraftFailure() {
        EncapsulatedWallet wallet = new EncapsulatedWallet(new BigDecimal("20.00"), "USD");

        assertThatThrownBy(() -> wallet.pay(new BigDecimal("50.00")))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Insufficient funds");
    }
}
`
    },

    'inheritance': {
      className: 'EmployeeHierarchy',
      description: 'Demonstrates constructor chaining via super(), polymorphic method overrides, and covariant return types.',
      source: `package io.javahub.level1.inheritance;

import java.math.BigDecimal;

/**
 * Demonstrates inheritance, constructor chaining, and polymorphic compensation calculations.
 */
public class EmployeeHierarchy {

    public static class Employee {
        private final String name;
        private final BigDecimal baseSalary;

        public Employee(String name, BigDecimal baseSalary) {
            this.name = name;
            this.baseSalary = baseSalary;
        }

        public BigDecimal calculateTotalPay() {
            return baseSalary;
        }

        public String getName() { return name; }
        public BigDecimal getBaseSalary() { return baseSalary; }
    }

    public static class Manager extends Employee {
        private final BigDecimal bonus;

        public Manager(String name, BigDecimal baseSalary, BigDecimal bonus) {
            super(name, baseSalary);
            this.bonus = bonus;
        }

        @Override
        public BigDecimal calculateTotalPay() {
            return getBaseSalary().add(bonus);
        }

        public BigDecimal getBonus() { return bonus; }
    }
}
`,
      test: `package io.javahub.level1.inheritance;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

public class EmployeeHierarchyTest {

    @Test
    @DisplayName("Subclass should correctly invoke super constructor and override polymorphic pay calculation")
    void testPolymorphicPay() {
        EmployeeHierarchy.Employee emp = new EmployeeHierarchy.Employee("John", new BigDecimal("50000.00"));
        EmployeeHierarchy.Employee mgr = new EmployeeHierarchy.Manager("Sarah", new BigDecimal("80000.00"), new BigDecimal("20000.00"));

        assertThat(emp.calculateTotalPay()).isEqualByComparingTo("50000.00");
        assertThat(mgr.calculateTotalPay()).isEqualByComparingTo("100000.00");
    }
}
`
    },

    'abstraction': {
      className: 'PaymentGateway',
      description: 'Demonstrates interface evolution, default/static methods, and sealed interfaces for contract clarity.',
      source: `package io.javahub.level1.abstraction;

import java.math.BigDecimal;

/**
 * Demonstrates interface abstraction, default methods, and static factory helpers.
 */
public interface PaymentGateway {

    boolean processPayment(String transactionId, BigDecimal amount);

    default String generateReceipt(String transactionId, BigDecimal amount) {
        return "Receipt for Tx: " + transactionId + ", Amount: $" + amount;
    }

    static PaymentGateway createMockGateway(boolean alwaysSucceed) {
        return (txId, amount) -> alwaysSucceed;
    }
}
`,
      test: `package io.javahub.level1.abstraction;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

public class PaymentGatewayTest {

    @Test
    @DisplayName("Should use default method implementation and static factory method")
    void testGatewayDefaultAndStatic() {
        PaymentGateway gateway = PaymentGateway.createMockGateway(true);

        boolean result = gateway.processPayment("TX-999", new BigDecimal("150.00"));
        String receipt = gateway.generateReceipt("TX-999", new BigDecimal("150.00"));

        assertThat(result).isTrue();
        assertThat(receipt).contains("Receipt for Tx: TX-999");
    }
}
`
    },

    'composition-over-inheritance': {
      className: 'InstrumentedSet',
      description: 'Demonstrates the Forwarding Wrapper / Decorator pattern solving the Fragile Base Class problem.',
      source: `package io.javahub.level1.compositionoverinheritance;

import java.util.Collection;
import java.util.Set;

/**
 * Forwarding wrapper (Decorator) cleanly tracking added elements without inheriting fragile parent internals.
 */
public class InstrumentedSet<E> {

    private final Set<E> delegate;
    private int addCount = 0;

    public InstrumentedSet(Set<E> delegate) {
        this.delegate = delegate;
    }

    public boolean add(E element) {
        addCount++;
        return delegate.add(element);
    }

    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return delegate.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }

    public int size() {
        return delegate.size();
    }
}
`,
      test: `package io.javahub.level1.compositionoverinheritance;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.HashSet;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class InstrumentedSetTest {

    @Test
    @DisplayName("InstrumentedSet must accurately track additions without double-counting on addAll")
    void testAccurateAddCount() {
        InstrumentedSet<String> set = new InstrumentedSet<>(new HashSet<>());
        set.addAll(List.of("Snap", "Crackle", "Pop"));

        assertThat(set.getAddCount()).isEqualTo(3);
        assertThat(set.size()).isEqualTo(3);
    }
}
`
    },

    'polymorphism': {
      className: 'DynamicDispatchSimulator',
      description: 'Demonstrates Virtual Method Table (vtable) dispatch, monomorphic call site inlining, and polymorphism.',
      source: `package io.javahub.level1.polymorphism;

/**
 * Demonstrates polymorphic vtable method dispatch.
 */
public class DynamicDispatchSimulator {

    public interface Shape {
        double calculateArea();
    }

    public record Circle(double radius) implements Shape {
        @Override
        public double calculateArea() {
            return Math.PI * radius * radius;
        }
    }

    public record Rectangle(double width, double height) implements Shape {
        @Override
        public double calculateArea() {
            return width * height;
        }
    }

    public double aggregateAreas(Shape[] shapes) {
        double total = 0;
        for (Shape shape : shapes) {
            total += shape.calculateArea(); // Dynamic vtable dispatch
        }
        return total;
    }
}
`,
      test: `package io.javahub.level1.polymorphism;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

public class DynamicDispatchSimulatorTest {

    @Test
    @DisplayName("Should aggregate areas through dynamic vtable method dispatch")
    void testDynamicDispatch() {
        DynamicDispatchSimulator simulator = new DynamicDispatchSimulator();
        DynamicDispatchSimulator.Shape[] shapes = {
            new DynamicDispatchSimulator.Circle(10),
            new DynamicDispatchSimulator.Rectangle(4, 5)
        };

        double totalArea = simulator.aggregateAreas(shapes);
        double expected = (Math.PI * 100) + 20;

        assertThat(totalArea).isCloseTo(expected, within(0.001));
    }
}
`
    },

    'advanced-class-design': {
      className: 'CacheManager',
      description: 'Demonstrates static nested classes, inner class memory leaks, and local anonymous classes.',
      source: `package io.javahub.level1.advancedclassdesign;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Demonstrates static nested classes vs inner classes to eliminate synthetic memory leak hazards.
 */
public class CacheManager {

    // Static nested class has NO hidden pointer to the enclosing CacheManager
    public static class CacheEntry<V> {
        private final V value;
        private final long timestamp;

        public CacheEntry(V value) {
            this.value = value;
            this.timestamp = System.currentTimeMillis();
        }

        public V getValue() { return value; }
        public long getTimestamp() { return timestamp; }
    }

    private final Map<String, CacheEntry<String>> storage = new ConcurrentHashMap<>();

    public void put(String key, String value) {
        storage.put(key, new CacheEntry<>(value));
    }

    public String get(String key) {
        CacheEntry<String> entry = storage.get(key);
        return entry != null ? entry.getValue() : null;
    }
}
`,
      test: `package io.javahub.level1.advancedclassdesign;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class CacheManagerTest {

    @Test
    @DisplayName("Static nested CacheEntry should store and retrieve values cleanly")
    void testStaticNestedCache() {
        CacheManager manager = new CacheManager();
        manager.put("session_101", "active_payload");

        assertThat(manager.get("session_101")).isEqualTo("active_payload");
    }
}
`
    },

    'sealed-classes-and-pattern-matching': {
      className: 'PaymentEventProcessor',
      description: 'Demonstrates Java 21 sealed hierarchies with permits, record patterns, and exhaustive switch expressions.',
      source: `package io.javahub.level1.sealedclassesandpatternmatching;

import java.math.BigDecimal;

/**
 * Demonstrates Java 21 sealed hierarchies and record pattern deconstruction without default branches.
 */
public class PaymentEventProcessor {

    public sealed interface PaymentEvent permits Authorized, Captured, Refunded {}

    public record Authorized(String txId, BigDecimal amount, String cardLast4) implements PaymentEvent {}
    public record Captured(String txId, BigDecimal amount, String settlementBatch) implements PaymentEvent {}
    public record Refunded(String txId, BigDecimal amount, String reason) implements PaymentEvent {}

    public String summarize(PaymentEvent event) {
        // Compiler guarantees 100% exhaustive matching without needing a 'default' branch
        return switch (event) {
            case Authorized(var tx, var amt, var card) -> "Authorized $" + amt + " on card ending in " + card;
            case Captured(var tx, var amt, var batch) -> "Captured $" + amt + " in batch " + batch;
            case Refunded(var tx, var amt, var reason) -> "Refunded $" + amt + " due to: " + reason;
        };
    }
}
`,
      test: `package io.javahub.level1.sealedclassesandpatternmatching;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

public class PaymentEventProcessorTest {

    private final PaymentEventProcessor processor = new PaymentEventProcessor();

    @Test
    @DisplayName("Should deconstruct Authorized record via pattern matching")
    void testPatternDeconstruction() {
        var event = new PaymentEventProcessor.Authorized("TX-1", new BigDecimal("120.00"), "4242");
        String summary = processor.summarize(event);

        assertThat(summary).isEqualTo("Authorized $120.00 on card ending in 4242");
    }

    @Test
    @DisplayName("Should deconstruct Refunded record via pattern matching")
    void testRefundedDeconstruction() {
        var event = new PaymentEventProcessor.Refunded("TX-2", new BigDecimal("50.00"), "Damaged item");
        String summary = processor.summarize(event);

        assertThat(summary).isEqualTo("Refunded $50.00 due to: Damaged item");
    }
}
`
    }
  }
};

