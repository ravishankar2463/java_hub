module.exports = {
  level: 0,
  topics: {
    'environment-setup': {
      className: 'JdkEnvironmentDiagnostics',
      description: 'Inspects runtime JVM architecture, vendor specifications, memory limits, and GC subsystems.',
      source: `package io.javahub.level0.environmentsetup;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.util.List;

/**
 * Diagnostic utility demonstrating JVM architecture inspection at runtime.
 */
public class JdkEnvironmentDiagnostics {

    public record JvmSpecs(
        String javaVersion,
        String javaVendor,
        String osArch,
        int availableProcessors,
        long maxHeapMemoryBytes,
        List<String> garbageCollectorNames
    ) {}

    public JvmSpecs captureCurrentSpecs() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        List<String> gcNames = ManagementFactory.getGarbageCollectorMXBeans()
                .stream()
                .map(gc -> gc.getName())
                .toList();

        return new JvmSpecs(
            System.getProperty("java.version"),
            System.getProperty("java.vendor"),
            System.getProperty("os.arch"),
            Runtime.getRuntime().availableProcessors(),
            memoryBean.getHeapMemoryUsage().getMax(),
            gcNames
        );
    }

    public boolean isJava21OrHigher() {
        String version = System.getProperty("java.version");
        int majorVersion = Runtime.version().feature();
        return majorVersion >= 21;
    }
}
`,
      test: `package io.javahub.level0.environmentsetup;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class JdkEnvironmentDiagnosticsTest {

    private final JdkEnvironmentDiagnostics diagnostics = new JdkEnvironmentDiagnostics();

    @Test
    @DisplayName("Should detect Java 21 or higher runtime")
    void testJavaVersion() {
        assertThat(diagnostics.isJava21OrHigher())
            .as("Java runtime feature version must be at least 21")
            .isTrue();
    }

    @Test
    @DisplayName("Should inspect heap memory and available processor cores")
    void testJvmSpecsCapture() {
        JdkEnvironmentDiagnostics.JvmSpecs specs = diagnostics.captureCurrentSpecs();

        assertThat(specs.availableProcessors()).isGreaterThan(0);
        assertThat(specs.maxHeapMemoryBytes()).isGreaterThan(0L);
        assertThat(specs.garbageCollectorNames()).isNotEmpty();
        assertThat(specs.osArch()).isNotBlank();
    }
}
`
    },

    'git-version-control': {
      className: 'GitObjectStore',
      description: 'Simulates Git internal content-addressable storage: Blobs, Trees, and Commits using SHA-1 hashing.',
      source: `package io.javahub.level0.gitversioncontrol;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

/**
 * Emulates Git's SHA-1 content-addressable object database (Blobs, Trees, Commits).
 */
public class GitObjectStore {

    public sealed interface GitObject permits Blob, Tree, Commit {
        String sha1();
    }

    public record Blob(String sha1, byte[] content) implements GitObject {
        public static Blob create(String text) {
            byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
            String headerAndData = "blob " + bytes.length + "\\0" + text;
            return new Blob(computeSha1(headerAndData), bytes);
        }
    }

    public record TreeEntry(String mode, String name, String targetSha1) {}

    public record Tree(String sha1, List<TreeEntry> entries) implements GitObject {
        public static Tree create(List<TreeEntry> entries) {
            StringBuilder sb = new StringBuilder();
            for (TreeEntry entry : entries) {
                sb.append(entry.mode()).append(" ").append(entry.name()).append("\\0").append(entry.targetSha1());
            }
            return new Tree(computeSha1("tree " + sb.length() + "\\0" + sb), List.copyOf(entries));
        }
    }

    public record Commit(String sha1, String treeSha1, Optional<String> parentSha1, String author, String message) implements GitObject {
        public static Commit create(String treeSha1, Optional<String> parentSha1, String author, String message) {
            String payload = "tree " + treeSha1 + "\\n" +
                             parentSha1.map(p -> "parent " + p + "\\n").orElse("") +
                             "author " + author + "\\n\\n" + message;
            return new Commit(computeSha1("commit " + payload.length() + "\\0" + payload), treeSha1, parentSha1, author, message);
        }
    }

    private final Map<String, GitObject> database = new HashMap<>();

    public void put(GitObject obj) {
        database.put(obj.sha1(), obj);
    }

    public Optional<GitObject> get(String sha1) {
        return Optional.ofNullable(database.get(sha1));
    }

    public static String computeSha1(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-1 algorithm unavailable", e);
        }
    }
}
`,
      test: `package io.javahub.level0.gitversioncontrol;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;

public class GitObjectStoreTest {

    @Test
    @DisplayName("Should create Blob and compute identical SHA-1 for identical content")
    void testBlobHashing() {
        GitObjectStore store = new GitObjectStore();
        GitObjectStore.Blob b1 = GitObjectStore.Blob.create("Hello, Git!");
        GitObjectStore.Blob b2 = GitObjectStore.Blob.create("Hello, Git!");

        assertThat(b1.sha1()).isEqualTo(b2.sha1());
        store.put(b1);
        assertThat(store.get(b1.sha1())).isPresent();
    }

    @Test
    @DisplayName("Should link Commit to Tree and Parent Commit in DAG")
    void testCommitHistoryDag() {
        GitObjectStore store = new GitObjectStore();

        GitObjectStore.Blob blob = GitObjectStore.Blob.create("int x = 42;");
        store.put(blob);

        GitObjectStore.Tree tree1 = GitObjectStore.Tree.create(List.of(
            new GitObjectStore.TreeEntry("100644", "Main.java", blob.sha1())
        ));
        store.put(tree1);

        GitObjectStore.Commit initialCommit = GitObjectStore.Commit.create(
            tree1.sha1(), Optional.empty(), "Developer <dev@javahub.io>", "Initial commit"
        );
        store.put(initialCommit);

        GitObjectStore.Commit secondCommit = GitObjectStore.Commit.create(
            tree1.sha1(), Optional.of(initialCommit.sha1()), "Developer <dev@javahub.io>", "Second commit"
        );
        store.put(secondCommit);

        assertThat(secondCommit.parentSha1()).contains(initialCommit.sha1());
        assertThat(store.get(secondCommit.sha1())).contains(secondCommit);
    }
}
`
    },

    'anatomy-of-a-java-program': {
      className: 'OrderProcessingApp',
      description: 'Demonstrates Java application anatomy: package scoping, class encapsulation, main entrypoints, and records.',
      source: `package io.javahub.level0.anatomyofajavaprogram;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/**
 * Enterprise order processing application demonstrating the anatomy of a complete Java file.
 */
public class OrderProcessingApp {

    public record OrderLine(String sku, int quantity, BigDecimal unitPrice) {
        public OrderLine {
            Objects.requireNonNull(sku, "SKU cannot be null");
            if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
            if (unitPrice.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Price cannot be negative");
        }

        public BigDecimal total() {
            return unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    public record Order(String orderId, List<OrderLine> lines) {
        public BigDecimal calculateGrandTotal() {
            return lines.stream()
                .map(OrderLine::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }

    // Standard JVM Entry Point
    public static void main(String[] args) {
        Order order = new Order("ORD-1001", List.of(
            new OrderLine("BOOK-JAVA-21", 2, new BigDecimal("49.99")),
            new OrderLine("MUG-COFFEE", 1, new BigDecimal("14.50"))
        ));
        System.out.println("Processing Order " + order.orderId() + " -> Total: $" + order.calculateGrandTotal());
    }

    // Overloaded main method for programmatic invocation
    public static BigDecimal main(Order order) {
        return order.calculateGrandTotal();
    }
}
`,
      test: `package io.javahub.level0.anatomyofajavaprogram;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class OrderProcessingAppTest {

    @Test
    @DisplayName("Should correctly compute order grand total from order lines")
    void testOrderCalculation() {
        OrderProcessingApp.Order order = new OrderProcessingApp.Order("ORD-42", List.of(
            new OrderProcessingApp.OrderLine("SKU-1", 3, new BigDecimal("10.00")),
            new OrderProcessingApp.OrderLine("SKU-2", 1, new BigDecimal("5.50"))
        ));

        BigDecimal total = OrderProcessingApp.main(order);
        assertThat(total).isEqualByComparingTo("35.50");
    }

    @Test
    @DisplayName("Should reject invalid order line parameters")
    void testValidationInvariants() {
        assertThatThrownBy(() -> new OrderProcessingApp.OrderLine("SKU-1", -1, BigDecimal.TEN))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Quantity must be positive");
    }
}
`
    },

    'variables-and-data-types': {
      className: 'NumericTypeMechanics',
      description: 'Demonstrates primitive types, Integer caching bounds (-128 to 127), and IEEE 754 floating point accuracy.',
      source: `package io.javahub.level0.variablesanddatatypes;

import java.math.BigDecimal;

/**
 * Demonstrates the physics of Java data types: Integer caching, float precision, and overflow.
 */
public class NumericTypeMechanics {

    public boolean isCachedInteger(int value) {
        Integer first = Integer.valueOf(value);
        Integer second = Integer.valueOf(value);
        // Direct reference equality checks if both reference the JVM IntegerCache object
        return first == second;
    }

    public boolean demonstrateDoublePrecisionLoss() {
        double a = 0.1;
        double b = 0.2;
        // In IEEE 754 floating point arithmetic, 0.1 + 0.2 equals 0.30000000000000004
        return (a + b) != 0.3;
    }

    public BigDecimal computeAccurateDecimal(String a, String b) {
        BigDecimal num1 = new BigDecimal(a);
        BigDecimal num2 = new BigDecimal(b);
        return num1.add(num2);
    }

    public int simulateIntegerOverflow(int initial, int increment) {
        return initial + increment;
    }
}
`,
      test: `package io.javahub.level0.variablesanddatatypes;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

public class NumericTypeMechanicsTest {

    private final NumericTypeMechanics mechanics = new NumericTypeMechanics();

    @Test
    @DisplayName("Integer cache should return identical reference between -128 and 127")
    void testIntegerCacheRange() {
        assertThat(mechanics.isCachedInteger(100)).isTrue();
        assertThat(mechanics.isCachedInteger(-128)).isTrue();
        assertThat(mechanics.isCachedInteger(127)).isTrue();
        assertThat(mechanics.isCachedInteger(128)).isFalse();
        assertThat(mechanics.isCachedInteger(1000)).isFalse();
    }

    @Test
    @DisplayName("IEEE 754 floating point arithmetic should lose precision for 0.1 + 0.2")
    void testFloatingPointAnomaly() {
        assertThat(mechanics.demonstrateDoublePrecisionLoss()).isTrue();
    }

    @Test
    @DisplayName("BigDecimal must guarantee exact financial precision")
    void testBigDecimalAccuracy() {
        BigDecimal result = mechanics.computeAccurateDecimal("0.1", "0.2");
        assertThat(result).isEqualByComparingTo("0.3");
    }

    @Test
    @DisplayName("Integer max value overflow should wrap to Integer.MIN_VALUE")
    void testIntegerOverflow() {
        int overflowed = mechanics.simulateIntegerOverflow(Integer.MAX_VALUE, 1);
        assertThat(overflowed).isEqualTo(Integer.MIN_VALUE);
    }
}
`
    },

    'control-flow': {
      className: 'ModernSwitchClassifier',
      description: 'Demonstrates Java 21 switch expressions, pattern matching, guarded patterns, and yield statements.',
      source: `package io.javahub.level0.controlflow;

/**
 * Demonstrates modern Java 21 switch patterns and branch prediction optimizations.
 */
public class ModernSwitchClassifier {

    public sealed interface PaymentMethod permits CreditCard, Crypto, BankTransfer {}
    public record CreditCard(String cardNumber, double limit) implements PaymentMethod {}
    public record Crypto(String walletAddress, String coinType) implements PaymentMethod {}
    public record BankTransfer(String iban, boolean isVerified) implements PaymentMethod {}

    public String classifyPayment(PaymentMethod payment) {
        return switch (payment) {
            case CreditCard cc when cc.limit() > 50000 -> "VIP Credit Card with limit: $" + cc.limit();
            case CreditCard cc -> "Standard Credit Card";
            case Crypto c when c.coinType().equalsIgnoreCase("BTC") -> "Bitcoin On-Chain Payment";
            case Crypto c -> "Altcoin Payment: " + c.coinType();
            case BankTransfer bt when bt.isVerified() -> "Verified Instant Wire";
            case BankTransfer bt -> "Pending Manual Wire Verification";
        };
    }

    public int calculateRiskScore(int initialScore, boolean isForeignIp, boolean isVpn) {
        int score = initialScore;
        if (isForeignIp) score += 30;
        if (isVpn) score += 50;
        return score;
    }
}
`,
      test: `package io.javahub.level0.controlflow;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ModernSwitchClassifierTest {

    private final ModernSwitchClassifier classifier = new ModernSwitchClassifier();

    @Test
    @DisplayName("Should evaluate guarded pattern matching for high limit credit card")
    void testGuardedSwitch() {
        var card = new ModernSwitchClassifier.CreditCard("4111-2222-3333-4444", 75000);
        String label = classifier.classifyPayment(card);
        assertThat(label).contains("VIP Credit Card");
    }

    @Test
    @DisplayName("Should match Bitcoin crypto record pattern")
    void testCryptoMatch() {
        var crypto = new ModernSwitchClassifier.Crypto("0x123abc", "BTC");
        String label = classifier.classifyPayment(crypto);
        assertThat(label).isEqualTo("Bitcoin On-Chain Payment");
    }

    @Test
    @DisplayName("Should compute cumulative risk scores correctly")
    void testRiskScore() {
        int risk = classifier.calculateRiskScore(10, true, true);
        assertThat(risk).isEqualTo(90);
    }
}
`
    },

    'arrays-2d-matrices': {
      className: 'MatrixLocalitySimulator',
      description: 'Demonstrates memory address arithmetic, cache-friendly row-major traversal vs column-major cache misses.',
      source: `package io.javahub.level0.arrays2dmatrices;

/**
 * Demonstrates contiguous memory layouts, L1 cache line exploitation, and arraycopy.
 */
public class MatrixLocalitySimulator {

    public long calculateTargetAddress(long baseAddress, int index, int dataTypeBytes) {
        return baseAddress + ((long) index * dataTypeBytes);
    }

    public long sumRowMajor(int[][] matrix) {
        long sum = 0;
        for (int row = 0; row < matrix.length; row++) {
            for (int col = 0; col < matrix[row].length; col++) {
                sum += matrix[row][col];
            }
        }
        return sum;
    }

    public long sumColumnMajor(int[][] matrix) {
        long sum = 0;
        int rows = matrix.length;
        int cols = matrix[0].length;
        for (int col = 0; col < cols; col++) {
            for (int row = 0; row < rows; row++) {
                sum += matrix[row][col];
            }
        }
        return sum;
    }

    public int[] copySubArray(int[] source, int start, int length) {
        int[] destination = new int[length];
        System.arraycopy(source, start, destination, 0, length);
        return destination;
    }
}
`,
      test: `package io.javahub.level0.arrays2dmatrices;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class MatrixLocalitySimulatorTest {

    private final MatrixLocalitySimulator simulator = new MatrixLocalitySimulator();

    @Test
    @DisplayName("Should calculate byte target address using base + (index * size)")
    void testAddressArithmetic() {
        long address = simulator.calculateTargetAddress(0x5010L, 3, 4);
        assertThat(address).isEqualTo(0x501CL);
    }

    @Test
    @DisplayName("Row-major and column-major traversals must yield identical sums")
    void testMatrixTraversalEquality() {
        int[][] matrix = {
            { 1, 2, 3 },
            { 4, 5, 6 },
            { 7, 8, 9 }
        };

        long sumRow = simulator.sumRowMajor(matrix);
        long sumCol = simulator.sumColumnMajor(matrix);

        assertThat(sumRow).isEqualTo(45L);
        assertThat(sumCol).isEqualTo(45L);
    }

    @Test
    @DisplayName("System.arraycopy should copy contiguous memory segments quickly")
    void testSubArrayCopy() {
        int[] original = { 10, 20, 30, 40, 50 };
        int[] slice = simulator.copySubArray(original, 1, 3);

        assertThat(slice).containsExactly(20, 30, 40);
    }
}
`
    },

    'intro-to-oops': {
      className: 'BankAccount',
      description: 'Demonstrates OOP encapsulation, invariant validation, state mutation defense, and the `this` reference.',
      source: `package io.javahub.level0.introtooops;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Demonstrates encapsulation, class invariants, and stack-to-heap object references.
 */
public class BankAccount {

    private final String accountNumber;
    private BigDecimal balance;

    public BankAccount(String accountNumber, BigDecimal initialBalance) {
        this.accountNumber = Objects.requireNonNull(accountNumber, "Account number required");
        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.balance = initialBalance;
    }

    public synchronized void deposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be strictly positive");
        }
        this.balance = this.balance.add(amount);
    }

    public synchronized void withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be strictly positive");
        }
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds: balance $" + balance + ", requested $" + amount);
        }
        this.balance = this.balance.subtract(amount);
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
`,
      test: `package io.javahub.level0.introtooops;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class BankAccountTest {

    @Test
    @DisplayName("Should successfully deposit and withdraw maintaining balance invariants")
    void testDepositAndWithdraw() {
        BankAccount account = new BankAccount("ACC-9001", new BigDecimal("100.00"));
        account.deposit(new BigDecimal("50.00"));
        account.withdraw(new BigDecimal("30.00"));

        assertThat(account.getBalance()).isEqualByComparingTo("120.00");
    }

    @Test
    @DisplayName("Should reject withdrawal exceeding available balance")
    void testOverdraftProtection() {
        BankAccount account = new BankAccount("ACC-9002", new BigDecimal("50.00"));

        assertThatThrownBy(() -> account.withdraw(new BigDecimal("100.00")))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Insufficient funds");
    }
}
`
    }
  }
};

