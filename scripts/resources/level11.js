module.exports = {
  level: 11,
  topics: {
    'microservice-principles': {
      className: 'BoundedContextServiceBoundary',
      description: 'Demonstrates microservice bounded context isolation and shared-nothing database architectures.',
      source: `package io.javahub.level11.microserviceprinciples;

/**
 * Domain Bounded Context isolation verifying shared-nothing database boundaries.
 */
public class BoundedContextServiceBoundary {

    public record CustomerContextCustomer(String customerId, String email) {}
    public record BillingContextCustomer(String customerId, String billingAddress, String taxId) {}

    public String generateCrossContextEvent(CustomerContextCustomer c) {
        return "CUSTOMER_REGISTERED: " + c.customerId() + ", " + c.email();
    }
}
`,
      test: `package io.javahub.level11.microserviceprinciples;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BoundedContextServiceBoundaryTest {

    @Test
    @DisplayName("Bounded contexts should maintain independent models without coupling schemas")
    void testBoundedContexts() {
        var boundary = new BoundedContextServiceBoundary();
        var cust = new BoundedContextServiceBoundary.CustomerContextCustomer("C101", "dev@javahub.io");

        String event = boundary.generateCrossContextEvent(cust);
        assertThat(event).contains("CUSTOMER_REGISTERED: C101");
    }
}
`
    },

    'inter-service-communication': {
      className: 'ResilientHttpExecutor',
      description: 'Demonstrates connection pooling, client-side timeouts, and HTTP client error classification.',
      source: `package io.javahub.level11.interservicecommunication;

import java.time.Duration;

/**
 * Resilient HTTP client wrapper demonstrating connection timeouts and retry classification.
 */
public class ResilientHttpExecutor {

    public record RequestConfig(Duration connectTimeout, Duration readTimeout, int maxRetries) {}

    public boolean isRetryableHttpCode(int httpStatusCode) {
        // 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout are retryable
        return httpStatusCode == 502 || httpStatusCode == 503 || httpStatusCode == 504;
    }
}
`,
      test: `package io.javahub.level11.interservicecommunication;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ResilientHttpExecutorTest {

    @Test
    @DisplayName("Should classify 503 as retryable but 404 as non-retryable client error")
    void testHttpRetryClassification() {
        var executor = new ResilientHttpExecutor();

        assertThat(executor.isRetryableHttpCode(503)).isTrue();
        assertThat(executor.isRetryableHttpCode(504)).isTrue();
        assertThat(executor.isRetryableHttpCode(404)).isFalse();
        assertThat(executor.isRetryableHttpCode(400)).isFalse();
    }
}
`
    },

    'api-gateways-and-service-discovery': {
      className: 'ApiGatewayRouteMatcher',
      description: 'Demonstrates API gateway path predicates, header manipulation, and client-side load balancing.',
      source: `package io.javahub.level11.apigatewaysandservicediscovery;

import java.util.List;

/**
 * Emulates Spring Cloud Gateway path matching and upstream round-robin load balancing.
 */
public class ApiGatewayRouteMatcher {

    private final List<String> targetInstances = List.of("http://10.0.1.5:8080", "http://10.0.1.6:8080");
    private int counter = 0;

    public synchronized String routeToNextInstance(String requestPath) {
        if (!requestPath.startsWith("/api/orders")) {
            throw new IllegalArgumentException("No matching gateway route predicate for: " + requestPath);
        }
        String instance = targetInstances.get(counter % targetInstances.size());
        counter++;
        return instance + requestPath;
    }
}
`,
      test: `package io.javahub.level11.apigatewaysandservicediscovery;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class ApiGatewayRouteMatcherTest {

    @Test
    @DisplayName("Should route matched path round-robin across registered upstream pods")
    void testGatewayRouting() {
        var gateway = new ApiGatewayRouteMatcher();

        String url1 = gateway.routeToNextInstance("/api/orders/1");
        String url2 = gateway.routeToNextInstance("/api/orders/2");

        assertThat(url1).isEqualTo("http://10.0.1.5:8080/api/orders/1");
        assertThat(url2).isEqualTo("http://10.0.1.6:8080/api/orders/2");
    }

    @Test
    @DisplayName("Should reject path not matching gateway predicate")
    void testUnmatchedRoute() {
        var gateway = new ApiGatewayRouteMatcher();
        assertThatThrownBy(() -> gateway.routeToNextInstance("/api/unknown"))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
`
    },

    'resiliency-patterns': {
      className: 'CircuitBreakerStateMachine',
      description: 'Demonstrates Resilience4j Circuit Breaker state transitions: CLOSED, OPEN, and HALF_OPEN.',
      source: `package io.javahub.level11.resiliencypatterns;

/**
 * Emulates a finite state machine Circuit Breaker protecting services against cascading failures.
 */
public class CircuitBreakerStateMachine {

    public enum State { CLOSED, OPEN, HALF_OPEN }

    private State state = State.CLOSED;
    private int failureCount = 0;
    private final int failureThreshold;

    public CircuitBreakerStateMachine(int failureThreshold) {
        this.failureThreshold = failureThreshold;
    }

    public synchronized boolean allowRequest() {
        return state != State.OPEN;
    }

    public synchronized void recordSuccess() {
        failureCount = 0;
        state = State.CLOSED;
    }

    public synchronized void recordFailure() {
        failureCount++;
        if (failureCount >= failureThreshold) {
            state = State.OPEN; // Trip circuit breaker to OPEN
        }
    }

    public State getState() { return state; }
}
`,
      test: `package io.javahub.level11.resiliencypatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class CircuitBreakerStateMachineTest {

    @Test
    @DisplayName("Circuit breaker should trip to OPEN state upon reaching failure threshold")
    void testCircuitBreakerTripping() {
        var cb = new CircuitBreakerStateMachine(2);

        assertThat(cb.allowRequest()).isTrue();

        cb.recordFailure();
        assertThat(cb.getState()).isEqualTo(CircuitBreakerStateMachine.State.CLOSED);

        cb.recordFailure(); // Threshold 2 reached
        assertThat(cb.getState()).isEqualTo(CircuitBreakerStateMachine.State.OPEN);
        assertThat(cb.allowRequest()).isFalse(); // Sheds traffic to allow upstream recovery
    }
}
`
    },

    'distributed-transactions': {
      className: 'SagaOrchestrator',
      description: 'Demonstrates the Orchestrated Saga pattern with forward steps and compensating rollback actions.',
      source: `package io.javahub.level11.distributedtransactions;

import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates distributed sagas executing compensating transactions upon step failure.
 */
public class SagaOrchestrator {

    public interface SagaStep {
        String name();
        boolean execute();
        void compensate();
    }

    public boolean runSaga(List<SagaStep> steps, List<String> compensationLog) {
        List<SagaStep> executedSteps = new ArrayList<>();

        for (SagaStep step : steps) {
            boolean success = step.execute();
            if (!success) {
                // Failure detected: Roll back all previously executed steps in reverse order
                for (int i = executedSteps.size() - 1; i >= 0; i--) {
                    executedSteps.get(i).compensate();
                    compensationLog.add("COMPENSATED: " + executedSteps.get(i).name());
                }
                return false;
            }
            executedSteps.add(step);
        }
        return true;
    }
}
`,
      test: `package io.javahub.level11.distributedtransactions;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class SagaOrchestratorTest {

    @Test
    @DisplayName("Saga should invoke compensating transactions when a downstream step fails")
    void testSagaCompensations() {
        var orchestrator = new SagaOrchestrator();
        List<String> audit = new ArrayList<>();

        var step1 = new SagaOrchestrator.SagaStep() {
            public String name() { return "ReserveStock"; }
            public boolean execute() { return true; }
            public void compensate() { audit.add("RELEASE_STOCK"); }
        };

        var step2 = new SagaOrchestrator.SagaStep() {
            public String name() { return "DebitPayment"; }
            public boolean execute() { return false; } // Payment fails
            public void compensate() { audit.add("REFUND_PAYMENT"); }
        };

        boolean result = orchestrator.runSaga(List.of(step1, step2), audit);

        assertThat(result).isFalse();
        assertThat(audit).contains("RELEASE_STOCK", "COMPENSATED: ReserveStock");
    }
}
`
    },

    'distributed-rate-limiting-and-throttling': {
      className: 'TokenBucketRateLimiter',
      description: 'Demonstrates the Token Bucket algorithm for burst allowance and smooth rate limiting.',
      source: `package io.javahub.level11.distributedratelimitingandthrottling;

/**
 * Token Bucket rate limiter implementing burst tolerance and steady-state token refilling.
 */
public class TokenBucketRateLimiter {

    private final long capacity;
    private final double refillRatePerSecond;
    private double tokens;
    private long lastRefillTimestamp;

    public TokenBucketRateLimiter(long capacity, double refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRatePerSecond;
        this.tokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    public synchronized boolean tryAcquire() {
        refill();
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        double deltaSeconds = (now - lastRefillTimestamp) / 1000.0;
        tokens = Math.min(capacity, tokens + (deltaSeconds * refillRatePerSecond));
        lastRefillTimestamp = now;
    }
}
`,
      test: `package io.javahub.level11.distributedratelimitingandthrottling;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class TokenBucketRateLimiterTest {

    @Test
    @DisplayName("Token bucket should allow burst up to capacity and reject when tokens exhausted")
    void testTokenBucketBurst() {
        var limiter = new TokenBucketRateLimiter(2, 1.0); // Capacity 2, 1 token/sec

        assertThat(limiter.tryAcquire()).isTrue();
        assertThat(limiter.tryAcquire()).isTrue();
        assertThat(limiter.tryAcquire()).isFalse(); // Exhausted
    }
}
`
    },

    'contract-testing-with-pact': {
      className: 'ConsumerContractVerifier',
      description: 'Demonstrates Consumer-Driven Contract testing schema assertions matching Pact conventions.',
      source: `package io.javahub.level11.contracttestingwithpact;

import java.util.Map;

/**
 * Validates consumer-driven contracts between microservice APIs.
 */
public class ConsumerContractVerifier {

    public boolean verifyContractPayload(Map<String, Object> payload) {
        return payload.containsKey("orderId") &&
               payload.containsKey("total") &&
               payload.containsKey("status");
    }
}
`,
      test: `package io.javahub.level11.contracttestingwithpact;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

public class ConsumerContractVerifierTest {

    @Test
    @DisplayName("Should verify required contract schema fields")
    void testContractVerification() {
        var verifier = new ConsumerContractVerifier();

        var validPayload = Map.<String, Object>of("orderId", "123", "total", 99.0, "status", "CONFIRMED");
        var brokenPayload = Map.<String, Object>of("orderId", "123");

        assertThat(verifier.verifyContractPayload(validPayload)).isTrue();
        assertThat(verifier.verifyContractPayload(brokenPayload)).isFalse();
    }
}
`
    },

    'long-running-workflows-with-temporal': {
      className: 'TemporalWorkflowSimulator',
      description: 'Demonstrates deterministic durable execution, activity retries, and workflow event history replay.',
      source: `package io.javahub.level11.longrunningworkflowswithtemporal;

import java.util.ArrayList;
import java.util.List;

/**
 * Emulates Temporal deterministic workflow execution and activity history logging.
 */
public class TemporalWorkflowSimulator {

    private final List<String> eventHistory = new ArrayList<>();

    public void executeWorkflow(String workflowId) {
        recordEvent("WorkflowStarted: " + workflowId);
        executeActivity("ChargeCreditCard");
        executeActivity("SendConfirmationEmail");
        recordEvent("WorkflowCompleted: " + workflowId);
    }

    private void executeActivity(String activityName) {
        recordEvent("ActivityStarted: " + activityName);
        // Emulates activity execution
        recordEvent("ActivityCompleted: " + activityName);
    }

    private void recordEvent(String event) { eventHistory.add(event); }

    public List<String> getEventHistory() { return List.copyOf(eventHistory); }
}
`,
      test: `package io.javahub.level11.longrunningworkflowswithtemporal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class TemporalWorkflowSimulatorTest {

    @Test
    @DisplayName("Workflow should produce deterministic sequence of durable execution events")
    void testWorkflowExecutionHistory() {
        var workflow = new TemporalWorkflowSimulator();
        workflow.executeWorkflow("WF-1001");

        assertThat(workflow.getEventHistory()).containsSubsequence(
            "WorkflowStarted: WF-1001",
            "ActivityStarted: ChargeCreditCard",
            "ActivityCompleted: ChargeCreditCard",
            "ActivityStarted: SendConfirmationEmail",
            "ActivityCompleted: SendConfirmationEmail",
            "WorkflowCompleted: WF-1001"
        );
    }
}
`
    }
  }
};

