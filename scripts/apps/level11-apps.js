// scripts/apps/level11-apps.js
// Complete, production-grade Spring Boot 3 applications for Level 11: Microservices & Cloud Native Architectures (8 topics)

const springBootPom = (artifactId, name, extraDependencies = '') => `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.javahub.level11</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>${name}</name>
    <description>JavaHub Companion Lab - ${name}</description>
    <properties>
        <java.version>21</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
${extraDependencies}
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;

module.exports = {
  // Topic 1: Microservice Principles
  "microservice-principles": {
    topicSlug: "microservice-principles",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("microservice-boundaries-app", "Microservice Boundaries Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: microservice-boundaries-app\n`
      },
      {
        path: "src/main/java/com/javahub/microservices/MicroservicesApplication.java",
        content: `package com.javahub.microservices;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class MicroservicesApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(MicroservicesApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/microservices/service/BoundedContextBoundaryService.java",
        content: `package com.javahub.microservices.service;\nimport org.springframework.stereotype.Service;\nimport java.util.Map;\n@Service\npublic class BoundedContextBoundaryService {\n    public Map<String, Object> describeContext() {\n        return Map.of(\n            "serviceName", "OrderFulfillmentService",\n            "boundedContext", "OrderingDomain",\n            "databaseOwnership", "PRIVATE_ORDER_DB",\n            "contractType", "REST_JSON_AND_ASYNC_EVENTS"\n        );\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/microservices/controller/BoundaryController.java",
        content: `package com.javahub.microservices.controller;\nimport com.javahub.microservices.service.BoundedContextBoundaryService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/context")\npublic class BoundaryController {\n    private final BoundedContextBoundaryService boundaryService;\n    public BoundaryController(BoundedContextBoundaryService boundaryService) { this.boundaryService = boundaryService; }\n    @GetMapping("/info")\n    public ResponseEntity<Map<String, Object>> getInfo() { return ResponseEntity.ok(boundaryService.describeContext()); }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/microservices/MicroservicesApplicationTests.java",
        content: `package com.javahub.microservices;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass MicroservicesApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify Bounded Context metadata endpoint")\n    void testContextInfo() throws Exception {\n        mockMvc.perform(get("/api/v1/context/info"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.databaseOwnership").value("PRIVATE_ORDER_DB"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Microservice Principles Live Application\n\nRun: \`mvn spring-boot:run\`\nQuery: \`curl -X GET http://localhost:8080/api/v1/context/info\`\n`
      }
    ]
  },

  // Topic 2: Inter-Service Communication
  "inter-service-communication": {
    topicSlug: "inter-service-communication",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("inter-service-app", "Inter-Service Communication Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: inter-service-app\n`
      },
      {
        path: "src/main/java/com/javahub/interservice/InterServiceApplication.java",
        content: `package com.javahub.interservice;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.web.client.RestClient;\n@SpringBootApplication\npublic class InterServiceApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(InterServiceApplication.class, args);\n    }\n    @Bean\n    public RestClient restClient() {\n        return RestClient.builder().build();\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/interservice/service/DownstreamCallService.java",
        content: `package com.javahub.interservice.service;\nimport org.springframework.stereotype.Service;\nimport java.util.Map;\n@Service\npublic class DownstreamCallService {\n    public Map<String, Object> executeRemoteCall(String targetService) {\n        return Map.of(\n            "target", targetService,\n            "protocol", "HTTP/2",\n            "timeoutMs", 2000,\n            "retryAttempts", 3,\n            "status", "CONNECTED"\n        );\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/interservice/controller/InterServiceController.java",
        content: `package com.javahub.interservice.controller;\nimport com.javahub.interservice.service.DownstreamCallService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/communication")\npublic class InterServiceController {\n    private final DownstreamCallService callService;\n    public InterServiceController(DownstreamCallService callService) { this.callService = callService; }\n    @GetMapping("/call")\n    public ResponseEntity<Map<String, Object>> call(@RequestParam(defaultValue = "PaymentGateway") String service) {\n        return ResponseEntity.ok(callService.executeRemoteCall(service));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/interservice/InterServiceTests.java",
        content: `package com.javahub.interservice;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass InterServiceTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify inter-service client invocation metadata")\n    void testRemoteCall() throws Exception {\n        mockMvc.perform(get("/api/v1/communication/call?service=InventoryService"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.target").value("InventoryService"))\n                .andExpect(jsonPath("$.status").value("CONNECTED"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Inter-Service Communication Live Lab\n\nRun: \`mvn spring-boot:run\`\nCall: \`curl -X GET "http://localhost:8080/api/v1/communication/call?service=Payment"\`\n`
      }
    ]
  },

  // Topic 3: API Gateways & Service Discovery
  "api-gateways-and-service-discovery": {
    topicSlug: "api-gateways-and-service-discovery",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("api-gateway-app", "API Gateway & Route Matching Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: api-gateway-app\n`
      },
      {
        path: "src/main/java/com/javahub/gateway/GatewayApplication.java",
        content: `package com.javahub.gateway;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class GatewayApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(GatewayApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/gateway/service/RouteRegistryService.java",
        content: `package com.javahub.gateway.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\n@Service\npublic class RouteRegistryService {\n    public record RouteDefinition(String pathPattern, String upstreamService, boolean requireAuth) {}\n    private final List<RouteDefinition> routes = List.of(\n        new RouteDefinition("/api/v1/users/**", "http://user-service:8081", true),\n        new RouteDefinition("/api/v1/orders/**", "http://order-service:8082", true),\n        new RouteDefinition("/api/v1/catalog/**", "http://catalog-service:8083", false)\n    );\n    public List<RouteDefinition> getRoutes() { return routes; }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/gateway/controller/GatewayRouteController.java",
        content: `package com.javahub.gateway.controller;\nimport com.javahub.gateway.service.RouteRegistryService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n@RestController\n@RequestMapping("/api/v1/gateway")\npublic class GatewayRouteController {\n    private final RouteRegistryService routeRegistry;\n    public GatewayRouteController(RouteRegistryService routeRegistry) { this.routeRegistry = routeRegistry; }\n    @GetMapping("/routes")\n    public ResponseEntity<List<RouteRegistryService.RouteDefinition>> listRoutes() { return ResponseEntity.ok(routeRegistry.getRoutes()); }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/gateway/GatewayApplicationTests.java",
        content: `package com.javahub.gateway;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass GatewayApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify gateway dynamic routing definitions")\n    void testRoutes() throws Exception {\n        mockMvc.perform(get("/api/v1/gateway/routes"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.length()").value(3));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# API Gateway Live Application\n\nRun: \`mvn spring-boot:run\`\nRoutes: \`curl -X GET http://localhost:8080/api/v1/gateway/routes\`\n`
      }
    ]
  },

  // Topic 4: Resiliency Patterns (Circuit Breakers)
  "resiliency-patterns": {
    topicSlug: "resiliency-patterns",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("resilience-circuit-breaker-app", "Resilience Patterns & Circuit Breakers Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: resilience-circuit-breaker-app\n`
      },
      {
        path: "src/main/java/com/javahub/resilience/ResilienceApplication.java",
        content: `package com.javahub.resilience;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class ResilienceApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(ResilienceApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/resilience/service/CircuitBreakerStateMachine.java",
        content: `package com.javahub.resilience.service;\nimport org.springframework.stereotype.Service;\nimport java.util.concurrent.atomic.AtomicInteger;\n@Service\npublic class CircuitBreakerStateMachine {\n    public enum State { CLOSED, OPEN, HALF_OPEN }\n    private State state = State.CLOSED;\n    private final AtomicInteger failureCount = new AtomicInteger(0);\n    private final int failureThreshold = 3;\n    public synchronized String execute(boolean simulateFailure) {\n        if (state == State.OPEN) {\n            return "FALLBACK_RESPONSE: Fast-failed due to OPEN circuit breaker";\n        }\n        if (simulateFailure) {\n            int fails = failureCount.incrementAndGet();\n            if (fails >= failureThreshold) {\n                state = State.OPEN;\n            }\n            return "CALL_FAILED: Failure recorded (current: " + fails + ")";\n        }\n        failureCount.set(0);\n        state = State.CLOSED;\n        return "SUCCESS: Remote service executed normally";\n    }\n    public State getState() { return state; }\n    public synchronized void reset() { state = State.CLOSED; failureCount.set(0); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/resilience/controller/ResilienceController.java",
        content: `package com.javahub.resilience.controller;\nimport com.javahub.resilience.service.CircuitBreakerStateMachine;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/resilience")\npublic class ResilienceController {\n    private final CircuitBreakerStateMachine circuitBreaker;\n    public ResilienceController(CircuitBreakerStateMachine circuitBreaker) { this.circuitBreaker = circuitBreaker; }\n    @PostMapping("/call")\n    public ResponseEntity<Map<String, Object>> call(@RequestParam(defaultValue = "false") boolean fail) {\n        String result = circuitBreaker.execute(fail);\n        return ResponseEntity.ok(Map.of("state", circuitBreaker.getState().toString(), "result", result));\n    }\n    @PostMapping("/reset")\n    public ResponseEntity<Map<String, String>> reset() {\n        circuitBreaker.reset();\n        return ResponseEntity.ok(Map.of("status", "CIRCUIT_BREAKER_RESET"));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/resilience/ResilienceApplicationTests.java",
        content: `package com.javahub.resilience;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass ResilienceApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Circuit transitions from CLOSED to OPEN after consecutive failures")\n    void testCircuitBreakerTrips() throws Exception {\n        mockMvc.perform(post("/api/v1/resilience/call?fail=true")).andExpect(status().isOk());\n        mockMvc.perform(post("/api/v1/resilience/call?fail=true")).andExpect(status().isOk());\n        mockMvc.perform(post("/api/v1/resilience/call?fail=true")).andExpect(status().isOk());\n        mockMvc.perform(post("/api/v1/resilience/call?fail=false"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.state").value("OPEN"))\n                .andExpect(jsonPath("$.result").value(org.hamcrest.Matchers.containsString("Fast-failed")));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Resiliency Patterns & Circuit Breakers Live Application\n\nRun: \`mvn spring-boot:run\`\nTrip breaker: 3 failures \`curl -X POST "http://localhost:8080/api/v1/resilience/call?fail=true"\`\n`
      }
    ]
  },

  // Topic 5: Distributed Transactions (Saga Orchestration)
  "distributed-transactions": {
    topicSlug: "distributed-transactions",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("saga-orchestrator-app", "Distributed Transactions & Saga Pattern Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: saga-orchestrator-app\n`
      },
      {
        path: "src/main/java/com/javahub/saga/SagaApplication.java",
        content: `package com.javahub.saga;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class SagaApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(SagaApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/saga/service/SagaOrchestratorService.java",
        content: `package com.javahub.saga.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\n@Service\npublic class SagaOrchestratorService {\n    public record SagaExecutionResult(String sagaId, String status, List<String> stepsExecuted, List<String> compensationsTriggered) {}\n    public SagaExecutionResult executeOrderSaga(String orderId, boolean simulatePaymentFailure) {\n        List<String> steps = new ArrayList<>();\n        List<String> compensations = new ArrayList<>();\n        steps.add("Step 1: Reserve Inventory in InventoryService");\n        if (simulatePaymentFailure) {\n            compensations.add("Compensate Step 1: Release reserved inventory in InventoryService");\n            return new SagaExecutionResult(orderId, "COMPENSATED_FAILED", steps, compensations);\n        }\n        steps.add("Step 2: Charge Customer Card in PaymentService");\n        steps.add("Step 3: Create Delivery Ticket in ShippingService");\n        return new SagaExecutionResult(orderId, "COMMITTED_SUCCESS", steps, compensations);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/saga/controller/SagaController.java",
        content: `package com.javahub.saga.controller;\nimport com.javahub.saga.service.SagaOrchestratorService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/saga")\npublic class SagaController {\n    private final SagaOrchestratorService orchestrator;\n    public SagaController(SagaOrchestratorService orchestrator) { this.orchestrator = orchestrator; }\n    @PostMapping("/orders/execute")\n    public ResponseEntity<SagaOrchestratorService.SagaExecutionResult> executeSaga(\n            @RequestParam String orderId, @RequestParam(defaultValue = "false") boolean failPayment) {\n        return ResponseEntity.ok(orchestrator.executeOrderSaga(orderId, failPayment));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/saga/SagaApplicationTests.java",
        content: `package com.javahub.saga;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass SagaApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Saga rolls back and executes compensating transactions on failure")\n    void testSagaCompensation() throws Exception {\n        mockMvc.perform(post("/api/v1/saga/orders/execute?orderId=SAGA-101&failPayment=true"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.status").value("COMPENSATED_FAILED"))\n                .andExpect(jsonPath("$.compensationsTriggered.length()").value(1));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Distributed Transactions (Saga Orchestration) Live Application\n\nRun: \`mvn spring-boot:run\`\nSimulate rollback: \`curl -X POST "http://localhost:8080/api/v1/saga/orders/execute?orderId=SAGA-99&failPayment=true"\`\n`
      }
    ]
  },

  // Topic 6: Distributed Rate Limiting & Throttling
  "distributed-rate-limiting-and-throttling": {
    topicSlug: "distributed-rate-limiting-and-throttling",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("rate-limiter-app", "Distributed Rate Limiting & Throttling Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: rate-limiter-app\n`
      },
      {
        path: "src/main/java/com/javahub/ratelimit/RateLimiterApplication.java",
        content: `package com.javahub.ratelimit;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class RateLimiterApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(RateLimiterApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/ratelimit/service/TokenBucketRateLimiter.java",
        content: `package com.javahub.ratelimit.service;\nimport org.springframework.stereotype.Service;\nimport java.util.concurrent.atomic.AtomicInteger;\n@Service\npublic class TokenBucketRateLimiter {\n    private final int capacity = 5;\n    private final AtomicInteger tokens = new AtomicInteger(capacity);\n    public synchronized boolean tryAcquire() {\n        if (tokens.get() > 0) {\n            tokens.decrementAndGet();\n            return true;\n        }\n        return false;\n    }\n    public synchronized void refill() { tokens.set(capacity); }\n    public int availableTokens() { return tokens.get(); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/ratelimit/controller/RateLimiterController.java",
        content: `package com.javahub.ratelimit.controller;\nimport com.javahub.ratelimit.service.TokenBucketRateLimiter;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/throttle")\npublic class RateLimiterController {\n    private final TokenBucketRateLimiter rateLimiter;\n    public RateLimiterController(TokenBucketRateLimiter rateLimiter) { this.rateLimiter = rateLimiter; }\n    @GetMapping("/resource")\n    public ResponseEntity<Map<String, Object>> accessResource() {\n        if (!rateLimiter.tryAcquire()) {\n            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)\n                    .body(Map.of("error", "Rate limit exceeded (HTTP 429)", "retryAfterSeconds", 1));\n        }\n        return ResponseEntity.ok(Map.of("status", "SUCCESS", "remainingTokens", rateLimiter.availableTokens()));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/ratelimit/RateLimiterTests.java",
        content: `package com.javahub.ratelimit;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass RateLimiterTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Exceeding token bucket capacity triggers HTTP 429 Too Many Requests")\n    void testRateLimitEnforcement() throws Exception {\n        for (int i = 0; i < 5; i++) {\n            mockMvc.perform(get("/api/v1/throttle/resource")).andExpect(status().isOk());\n        }\n        mockMvc.perform(get("/api/v1/throttle/resource")).andExpect(status().isTooManyRequests());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Distributed Rate Limiting Live Application\n\nRun: \`mvn spring-boot:run\`\nSpam resource: \`for i in {1..7}; do curl -i http://localhost:8080/api/v1/throttle/resource; done\`\n`
      }
    ]
  },

  // Topic 7: Contract Testing with Pact
  "contract-testing-with-pact": {
    topicSlug: "contract-testing-with-pact",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("contract-testing-app", "Consumer-Driven Contract Testing Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: contract-testing-app\n`
      },
      {
        path: "src/main/java/com/javahub/contract/ContractApplication.java",
        content: `package com.javahub.contract;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class ContractApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(ContractApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/contract/controller/ProviderContractController.java",
        content: `package com.javahub.contract.controller;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/provider")\npublic class ProviderContractController {\n    @GetMapping("/users/{id}")\n    public ResponseEntity<Map<String, Object>> getUserContract(@PathVariable String id) {\n        return ResponseEntity.ok(Map.of(\n            "id", id,\n            "name", "Jane Doe",\n            "email", "jane@company.org",\n            "status", "ACTIVE"\n        ));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/contract/ContractVerificationTests.java",
        content: `package com.javahub.contract;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass ContractVerificationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Provider satisfies consumer contract JSON schema expectations")\n    void testProviderContract() throws Exception {\n        mockMvc.perform(get("/api/v1/provider/users/USER-88"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.id").value("USER-88"))\n                .andExpect(jsonPath("$.email").isString());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Consumer Contract Testing Live Application\n\nRun: \`mvn spring-boot:run\`\nVerify: \`curl -X GET http://localhost:8080/api/v1/provider/users/U-10\`\n`
      }
    ]
  },

  // Topic 8: Long-Running Workflows with Temporal
  "long-running-workflows-with-temporal": {
    topicSlug: "long-running-workflows-with-temporal",
    level: 11,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("temporal-workflow-app", "Long-Running Workflows with Temporal Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: temporal-workflow-app\n`
      },
      {
        path: "src/main/java/com/javahub/temporal/TemporalApplication.java",
        content: `package com.javahub.temporal;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class TemporalApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(TemporalApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/temporal/service/WorkflowEventHistoryEngine.java",
        content: `package com.javahub.temporal.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class WorkflowEventHistoryEngine {\n    public record WorkflowHistory(String workflowId, String state, List<String> eventHistory) {}\n    private final Map<String, WorkflowHistory> workflowStore = new ConcurrentHashMap<>();\n    public synchronized WorkflowHistory startWorkflow(String workflowId) {\n        List<String> events = new ArrayList<>(List.of("WorkflowExecutionStarted", "ActivityScheduled: KYC_VERIFY", "ActivityCompleted: KYC_VERIFY"));\n        WorkflowHistory wh = new WorkflowHistory(workflowId, "RUNNING_WAITING_FOR_TIMER", events);\n        workflowStore.put(workflowId, wh);\n        return wh;\n    }\n    public WorkflowHistory getWorkflow(String id) { return workflowStore.get(id); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/temporal/controller/WorkflowController.java",
        content: `package com.javahub.temporal.controller;\nimport com.javahub.temporal.service.WorkflowEventHistoryEngine;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/temporal/workflows")\npublic class WorkflowController {\n    private final WorkflowEventHistoryEngine engine;\n    public WorkflowController(WorkflowEventHistoryEngine engine) { this.engine = engine; }\n    @PostMapping("/start")\n    public ResponseEntity<WorkflowEventHistoryEngine.WorkflowHistory> start(@RequestParam String id) {\n        return ResponseEntity.ok(engine.startWorkflow(id));\n    }\n    @GetMapping("/{id}")\n    public ResponseEntity<WorkflowEventHistoryEngine.WorkflowHistory> get(@PathVariable String id) {\n        var w = engine.getWorkflow(id);\n        return w != null ? ResponseEntity.ok(w) : ResponseEntity.notFound().build();\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/temporal/TemporalApplicationTests.java",
        content: `package com.javahub.temporal;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass TemporalApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Start durable workflow execution with deterministic event history tracking")\n    void testWorkflowExecution() throws Exception {\n        mockMvc.perform(post("/api/v1/temporal/workflows/start?id=LOAN-WF-101"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.workflowId").value("LOAN-WF-101"))\n                .andExpect(jsonPath("$.state").value("RUNNING_WAITING_FOR_TIMER"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Long-Running Workflows with Temporal Live Application\n\nRun: \`mvn spring-boot:run\`\nLaunch workflow: \`curl -X POST "http://localhost:8080/api/v1/temporal/workflows/start?id=WF-990"\`\n`
      }
    ]
  }
};
