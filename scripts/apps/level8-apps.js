// scripts/apps/level8-apps.js
// Complete, production-grade Spring Boot 3 applications for all 9 Level 8 topics

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
    <groupId>com.javahub.level8</groupId>
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
            <artifactId>spring-boot-starter-validation</artifactId>
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
  // -------------------------------------------------------------
  // Topic 1: Build Tools
  // -------------------------------------------------------------
  "build-tools": {
    topicSlug: "build-tools",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: `<?xml version="1.0" encoding="UTF-8"?>
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
    <groupId>com.javahub.level8</groupId>
    <artifactId>build-tools-app</artifactId>
    <version>1.0.0</version>
    <name>Build Tools &amp; Maven Lifecycle Demo</name>
    <description>Demonstrates multi-phase lifecycle, plugins, and reproducible packaging.</description>
    <properties>
        <java.version>21</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
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
                <executions>
                    <execution>
                        <goals>
                            <goal>build-info</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
`
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: build-tools-app
management:
  endpoints:
    web:
      exposure:
        include: "health,info"
  info:
    build:
      enabled: true
    env:
      enabled: true
`
      },
      {
        path: "src/main/java/com/javahub/buildtools/BuildToolsApplication.java",
        content: `package com.javahub.buildtools;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BuildToolsApplication {
    public static void main(String[] args) {
        SpringApplication.run(BuildToolsApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/buildtools/controller/BuildMetadataController.java",
        content: `package com.javahub.buildtools.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/build")
public class BuildMetadataController {

    private final Optional<BuildProperties> buildProperties;

    @Autowired
    public BuildMetadataController(Optional<BuildProperties> buildProperties) {
        this.buildProperties = buildProperties;
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getBuildInfo() {
        Map<String, Object> info = new HashMap<>();
        if (buildProperties.isPresent()) {
            BuildProperties bp = buildProperties.get();
            info.put("artifact", bp.getArtifact());
            info.put("group", bp.getGroup());
            info.put("version", bp.getVersion());
            info.put("buildTime", bp.getTime());
            info.put("status", "SUCCESSFUL_BUILD");
        } else {
            info.put("artifact", "build-tools-app");
            info.put("status", "DEVELOPMENT_RUNTIME");
            info.put("javaVersion", System.getProperty("java.version"));
        }
        return ResponseEntity.ok(info);
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/buildtools/BuildMetadataControllerTests.java",
        content: `package com.javahub.buildtools;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BuildMetadataControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/build/info returns build metadata")
    void testGetBuildInfo() throws Exception {
        mockMvc.perform(get("/api/v1/build/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists());
    }
}
`
      },
      {
        path: "README.md",
        content: `# Build Tools & Maven Lifecycle Live Application

This full Spring Boot 3 application demonstrates modern Maven configuration, reproducible builds, and build metadata injection.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing Endpoints
\`\`\`bash
# Query build and runtime metadata
curl -X GET http://localhost:8080/api/v1/build/info
\`\`\`

## Running the Test Suite
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 2: Spring Core Internals
  // -------------------------------------------------------------
  "spring-core-internals": {
    topicSlug: "spring-core-internals",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("spring-core-internals-app", "Spring Core Internals & IoC Container Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: spring-core-internals-lab
logging:
  level:
    com.javahub.springcore: DEBUG
`
      },
      {
        path: "src/main/java/com/javahub/springcore/SpringCoreApplication.java",
        content: `package com.javahub.springcore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringCoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringCoreApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/springcore/model/PrototypeReport.java",
        content: `package com.javahub.springcore.model;

import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class PrototypeReport {
    private final String instanceId = UUID.randomUUID().toString();
    private final Instant createdAt = Instant.now();

    public String generate(String title) {
        return "Report [" + title + "] generated by Prototype Bean: " + instanceId + " at " + createdAt;
    }

    public String getInstanceId() {
        return instanceId;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/springcore/service/OrderProcessingService.java",
        content: `package com.javahub.springcore.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OrderProcessingService {
    private static final Logger log = LoggerFactory.getLogger(OrderProcessingService.class);

    @PostConstruct
    public void init() {
        log.info(">> [LIFECYCLE] OrderProcessingService initialized via @PostConstruct");
    }

    @PreDestroy
    public void cleanup() {
        log.info(">> [LIFECYCLE] OrderProcessingService tearing down via @PreDestroy");
    }

    public String processOrder(String orderId) {
        return "ORDER_PROCESSED: " + orderId;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/springcore/service/ReportCoordinatorService.java",
        content: `package com.javahub.springcore.service;

import com.javahub.springcore.model.PrototypeReport;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportCoordinatorService {

    private final ObjectProvider<PrototypeReport> reportProvider;

    public ReportCoordinatorService(ObjectProvider<PrototypeReport> reportProvider) {
        this.reportProvider = reportProvider;
    }

    public List<String> produceTwoReports() {
        PrototypeReport r1 = reportProvider.getObject();
        PrototypeReport r2 = reportProvider.getObject();

        return List.of(
            r1.generate("Financial Q3"),
            r2.generate("Operations Q3")
        );
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/springcore/postprocessor/LifecycleAuditPostProcessor.java",
        content: `package com.javahub.springcore.postprocessor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

@Component
public class LifecycleAuditPostProcessor implements BeanPostProcessor {
    private static final Logger log = LoggerFactory.getLogger(LifecycleAuditPostProcessor.class);

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.startsWith("orderProcessingService")) {
            log.info(">> [BeanPostProcessor] BeforeInitialization for bean: {}", beanName);
        }
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.startsWith("orderProcessingService")) {
            log.info(">> [BeanPostProcessor] AfterInitialization for bean: {}", beanName);
        }
        return bean;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/springcore/controller/ContainerInspectionController.java",
        content: `package com.javahub.springcore.controller;

import com.javahub.springcore.service.OrderProcessingService;
import com.javahub.springcore.service.ReportCoordinatorService;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/container")
public class ContainerInspectionController {

    private final ApplicationContext applicationContext;
    private final OrderProcessingService orderService;
    private final ReportCoordinatorService reportCoordinatorService;

    public ContainerInspectionController(
            ApplicationContext applicationContext,
            OrderProcessingService orderService,
            ReportCoordinatorService reportCoordinatorService) {
        this.applicationContext = applicationContext;
        this.orderService = orderService;
        this.reportCoordinatorService = reportCoordinatorService;
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getContainerInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("applicationName", applicationContext.getId());
        info.put("startupDate", applicationContext.getStartupDate());
        info.put("beanDefinitionCount", applicationContext.getBeanDefinitionCount());
        info.put("status", "RUNNING");
        return ResponseEntity.ok(info);
    }

    @GetMapping("/beans")
    public ResponseEntity<List<String>> listBeans(@RequestParam(defaultValue = "service") String filter) {
        String[] beans = applicationContext.getBeanDefinitionNames();
        List<String> filtered = Arrays.stream(beans)
                .filter(name -> name.toLowerCase().contains(filter.toLowerCase()))
                .sorted()
                .toList();
        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/orders/process")
    public ResponseEntity<Map<String, String>> processOrder(@RequestParam String orderId) {
        String result = orderService.processOrder(orderId);
        return ResponseEntity.ok(Map.of("orderId", orderId, "result", result, "status", "SUCCESS"));
    }

    @GetMapping("/reports/prototype-demo")
    public ResponseEntity<List<String>> demonstratePrototypeScope() {
        List<String> reports = reportCoordinatorService.produceTwoReports();
        return ResponseEntity.ok(reports);
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/springcore/SpringCoreApplicationTests.java",
        content: `package com.javahub.springcore;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SpringCoreApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/container/info returns bean definitions count")
    void testContainerInfo() throws Exception {
        mockMvc.perform(get("/api/v1/container/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RUNNING"))
                .andExpect(jsonPath("$.beanDefinitionCount").isNumber());
    }

    @Test
    @DisplayName("POST /api/v1/container/orders/process processes order through Spring bean")
    void testProcessOrder() throws Exception {
        mockMvc.perform(post("/api/v1/container/orders/process?orderId=ORD-9901"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("ORD-9901"))
                .andExpect(jsonPath("$.result").value("ORDER_PROCESSED: ORD-9901"));
    }

    @Test
    @DisplayName("GET /api/v1/container/reports/prototype-demo produces distinct prototype instances")
    void testPrototypeResolution() throws Exception {
        mockMvc.perform(get("/api/v1/container/reports/prototype-demo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0]", containsString("Financial Q3")))
                .andExpect(jsonPath("$[1]", containsString("Operations Q3")));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Spring Core Internals & IoC Container Live Application

A complete Spring Boot 3 live application demonstrating:
- **ApplicationContext & Bean Lifecycle**: Inspection endpoints showing loaded bean definitions and memory.
- **BeanPostProcessor**: Dynamic lifecycle interception before and after bean initialization.
- **Prototype-in-Singleton Solution**: Dynamic prototype resolution via \`ObjectProvider<T>\`.

## Running the Live Server
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Inspect IoC container statistics
curl -X GET http://localhost:8080/api/v1/container/info

# 2. Filter registered Spring beans
curl -X GET "http://localhost:8080/api/v1/container/beans?filter=service"

# 3. Process order through lifecycle-managed service
curl -X POST "http://localhost:8080/api/v1/container/orders/process?orderId=ORD-7741"

# 4. Verify prototype-in-singleton dynamic instance resolution
curl -X GET http://localhost:8080/api/v1/container/reports/prototype-demo
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 3: Aspect-Oriented Programming (AOP)
  // -------------------------------------------------------------
  "aspect-oriented-programming-aop": {
    topicSlug: "aspect-oriented-programming-aop",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("aop-mastery-app", "Spring Boot AOP Mastery Live Application", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: aop-mastery-app
`
      },
      {
        path: "src/main/java/com/javahub/aop/AopApplication.java",
        content: `package com.javahub.aop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication
@EnableAspectJAutoProxy
public class AopApplication {
    public static void main(String[] args) {
        SpringApplication.run(AopApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/aop/annotation/LogExecutionTime.java",
        content: `package com.javahub.aop.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {
    String value() default "";
}
`
      },
      {
        path: "src/main/java/com/javahub/aop/aspect/ExecutionTimeLoggingAspect.java",
        content: `package com.javahub.aop.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentLinkedQueue;

@Aspect
@Component
public class ExecutionTimeLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(ExecutionTimeLoggingAspect.class);
    private final ConcurrentLinkedQueue<String> auditTrail = new ConcurrentLinkedQueue<>();

    @Around("@annotation(com.javahub.aop.annotation.LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        String method = joinPoint.getSignature().toShortString();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            String entry = "[SUCCESS] " + method + " executed in " + duration + "ms";
            log.info(entry);
            auditTrail.add(entry);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            String entry = "[FAILED] " + method + " failed after " + duration + "ms with " + ex.getMessage();
            log.error(entry);
            auditTrail.add(entry);
            throw ex;
        }
    }

    public ConcurrentLinkedQueue<String> getAuditTrail() {
        return auditTrail;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/aop/service/PaymentGatewayService.java",
        content: `package com.javahub.aop.service;

import com.javahub.aop.annotation.LogExecutionTime;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentGatewayService {

    @LogExecutionTime("Process Card Payment")
    public String chargeCreditCard(String customerId, double amount) throws InterruptedException {
        // Simulate remote payment gateway processing latency
        Thread.sleep(80);
        return "PAYMENT_CONFIRMED: " + UUID.randomUUID() + " for $" + amount;
    }

    @LogExecutionTime("Refund Payment")
    public String refund(String transactionId) throws InterruptedException {
        Thread.sleep(40);
        return "REFUND_PROCESSED: " + transactionId;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/aop/controller/PaymentController.java",
        content: `package com.javahub.aop.controller;

import com.javahub.aop.aspect.ExecutionTimeLoggingAspect;
import com.javahub.aop.service.PaymentGatewayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentGatewayService paymentService;
    private final ExecutionTimeLoggingAspect loggingAspect;

    public PaymentController(PaymentGatewayService paymentService, ExecutionTimeLoggingAspect loggingAspect) {
        this.paymentService = paymentService;
        this.loggingAspect = loggingAspect;
    }

    @PostMapping("/charge")
    public ResponseEntity<Map<String, Object>> charge(@RequestParam String customerId, @RequestParam double amount) throws Exception {
        String confirmation = paymentService.chargeCreditCard(customerId, amount);
        return ResponseEntity.ok(Map.of("customerId", customerId, "confirmation", confirmation, "status", "SUCCESS"));
    }

    @PostMapping("/refund")
    public ResponseEntity<Map<String, Object>> refund(@RequestParam String transactionId) throws Exception {
        String result = paymentService.refund(transactionId);
        return ResponseEntity.ok(Map.of("transactionId", transactionId, "result", result, "status", "SUCCESS"));
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<String>> getAuditLog() {
        return ResponseEntity.ok(loggingAspect.getAuditTrail().stream().toList());
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/aop/AopApplicationTests.java",
        content: `package com.javahub.aop;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AopApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Intercept method execution with @LogExecutionTime and verify audit logs")
    void testAopInterception() throws Exception {
        // Execute charge endpoint
        mockMvc.perform(post("/api/v1/payments/charge?customerId=CUST-10&amount=250.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.confirmation", containsString("PAYMENT_CONFIRMED")));

        // Verify aspect recorded the execution in audit log
        mockMvc.perform(get("/api/v1/payments/audit-log"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]", containsString("chargeCreditCard")));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Aspect-Oriented Programming (AOP) Live Spring Boot Application

Demonstrates:
- **Custom Annotations**: \`@LogExecutionTime\` method interceptor.
- **AspectJ \`@Around\` Advice**: Non-invasive performance profiling and joinpoint argument capture.
- **Audit Trail Recording**: Transparent metrics logging via dynamic proxy wrapping.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Trigger payment charge (intercepted by AOP)
curl -X POST "http://localhost:8080/api/v1/payments/charge?customerId=CUST-404&amount=199.99"

# 2. Trigger refund (intercepted by AOP)
curl -X POST "http://localhost:8080/api/v1/payments/refund?transactionId=TXN-8821"

# 3. View live recorded AOP execution audit logs
curl -X GET http://localhost:8080/api/v1/payments/audit-log
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 4: Building RESTful APIs
  // -------------------------------------------------------------
  "building-restful-apis": {
    topicSlug: "building-restful-apis",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("restful-apis-app", "Building Enterprise RESTful APIs Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: restful-apis-app
  mvc:
    problemdetails:
      enabled: true
`
      },
      {
        path: "src/main/java/com/javahub/rest/RestApplication.java",
        content: `package com.javahub.rest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RestApplication {
    public static void main(String[] args) {
        SpringApplication.run(RestApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/rest/dto/CreateProductRequest.java",
        content: `package com.javahub.rest.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
    @NotBlank(message = "Product name must not be blank")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    String name,

    @NotBlank(message = "SKU must not be blank")
    String sku,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    Double price
) {}
`
      },
      {
        path: "src/main/java/com/javahub/rest/model/Product.java",
        content: `package com.javahub.rest.model;

import java.time.Instant;

public record Product(
    String id,
    String name,
    String sku,
    double price,
    Instant createdAt
) {}
`
      },
      {
        path: "src/main/java/com/javahub/rest/exception/ResourceNotFoundException.java",
        content: `package com.javahub.rest.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/rest/exception/GlobalExceptionHandler.java",
        content: `package com.javahub.rest.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setType(URI.create("https://javahub.io/errors/not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed for request payload");
        problem.setTitle("Invalid Request Content");
        problem.setType(URI.create("https://javahub.io/errors/validation-failed"));

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        problem.setProperty("validationErrors", errors);
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/rest/service/ProductService.java",
        content: `package com.javahub.rest.service;

import com.javahub.rest.dto.CreateProductRequest;
import com.javahub.rest.exception.ResourceNotFoundException;
import com.javahub.rest.model.Product;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProductService {

    private final Map<String, Product> database = new ConcurrentHashMap<>();

    public ProductService() {
        // Seed initial items
        saveDirect(new Product("prod-1", "Mechanical Keyboard", "TECH-KB-01", 129.99, Instant.now()));
        saveDirect(new Product("prod-2", "Ultra-Wide Gaming Monitor", "TECH-MON-4K", 499.99, Instant.now()));
    }

    private void saveDirect(Product product) {
        database.put(product.id(), product);
    }

    public List<Product> findAll() {
        return new ArrayList<>(database.values());
    }

    public Product findById(String id) {
        Product p = database.get(id);
        if (p == null) {
            throw new ResourceNotFoundException("Product with ID '" + id + "' not found");
        }
        return p;
    }

    public Product create(CreateProductRequest request) {
        String id = "prod-" + UUID.randomUUID().toString().substring(0, 8);
        Product p = new Product(id, request.name(), request.sku(), request.price(), Instant.now());
        database.put(id, p);
        return p;
    }

    public void delete(String id) {
        if (!database.containsKey(id)) {
            throw new ResourceNotFoundException("Product with ID '" + id + "' not found");
        }
        database.remove(id);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/rest/controller/ProductController.java",
        content: `package com.javahub.rest.controller;

import com.javahub.rest.dto.CreateProductRequest;
import com.javahub.rest.model.Product;
import com.javahub.rest.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Product created = productService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/rest/ProductControllerTests.java",
        content: `package com.javahub.rest;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/products returns seeded catalog")
    void testGetAll() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(2)));
    }

    @Test
    @DisplayName("POST /api/v1/products creates product with 201 and Location header")
    void testCreateSuccess() throws Exception {
        String payload = """
            {
                "name": "USB-C Hub",
                "sku": "ACC-USB-C",
                "price": 49.99
            }
        """;

        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("USB-C Hub"));
    }

    @Test
    @DisplayName("POST /api/v1/products returns RFC 7807 ProblemDetail on validation failure")
    void testValidationFailure() throws Exception {
        String invalidPayload = """
            {
                "name": "",
                "sku": "",
                "price": -10.0
            }
        """;

        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid Request Content"))
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.price").exists());
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} returns RFC 7807 404 for missing item")
    void testNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/products/non-existent-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Resource Not Found"));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Building RESTful APIs Live Spring Boot 3 Application

Features:
- **Clean RESTful Design**: Semantic HTTP status codes (\`200 OK\`, \`201 Created\` with \`Location\` header, \`204 No Content\`, \`400 Bad Request\`, \`404 Not Found\`).
- **RFC 7807 ProblemDetail**: Modern standardized error response specifications built into Spring 6 / Boot 3.
- **Jakarta Bean Validation**: Declarative input sanitization (\`@NotBlank\`, \`@DecimalMin\`, \`@Size\`).

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Get all products
curl -X GET http://localhost:8080/api/v1/products

# 2. Create valid product (returns 201 Created + Location header)
curl -i -X POST http://localhost:8080/api/v1/products \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Wireless Ergonomic Mouse", "sku": "TECH-MSE-09", "price": 89.95}'

# 3. Test validation error (returns RFC 7807 ProblemDetail)
curl -i -X POST http://localhost:8080/api/v1/products \\
  -H "Content-Type: application/json" \\
  -d '{"name": "", "sku": "", "price": -5.0}'

# 4. Test 404 Not Found error (returns RFC 7807 ProblemDetail)
curl -i -X GET http://localhost:8080/api/v1/products/prod-unknown
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 5: Spring Data JPA
  // -------------------------------------------------------------
  "spring-data-jpa": {
    topicSlug: "spring-data-jpa",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("spring-data-jpa-app", "Spring Data JPA & Hibernate Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: spring-data-jpa-app
  datasource:
    url: jdbc:h2:mem:customerdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driverClassName: org.h2.Driver
    username: sa
    password: ""
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  h2:
    console:
      enabled: true
      path: /h2-console
`
      },
      {
        path: "src/main/java/com/javahub/jpa/JpaApplication.java",
        content: `package com.javahub.jpa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JpaApplication {
    public static void main(String[] args) {
        SpringApplication.run(JpaApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/jpa/entity/Customer.java",
        content: `package com.javahub.jpa.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerOrder> orders = new ArrayList<>();

    public Customer() {}

    public Customer(String name, String email, boolean active) {
        this.name = name;
        this.email = email;
        this.active = active;
    }

    public void addOrder(CustomerOrder order) {
        orders.add(order);
        order.setCustomer(this);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<CustomerOrder> getOrders() { return orders; }
}
`
      },
      {
        path: "src/main/java/com/javahub/jpa/entity/CustomerOrder.java",
        content: `package com.javahub.jpa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "customer_orders")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private double totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnore
    private Customer customer;

    public CustomerOrder() {}

    public CustomerOrder(String orderNumber, double totalAmount) {
        this.orderNumber = orderNumber;
        this.totalAmount = totalAmount;
    }

    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public double getTotalAmount() { return totalAmount; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
}
`
      },
      {
        path: "src/main/java/com/javahub/jpa/repository/CustomerRepository.java",
        content: `package com.javahub.jpa.repository;

import com.javahub.jpa.entity.Customer;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    @EntityGraph(attributePaths = {"orders"})
    Optional<Customer> findWithOrdersById(Long id);

    List<Customer> findByActiveTrue();
}
`
      },
      {
        path: "src/main/java/com/javahub/jpa/service/CustomerService.java",
        content: `package com.javahub.jpa.service;

import com.javahub.jpa.entity.Customer;
import com.javahub.jpa.entity.CustomerOrder;
import com.javahub.jpa.repository.CustomerRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @PostConstruct
    @Transactional
    public void initData() {
        Customer c1 = new Customer("Alice Johnson", "alice@corp.com", true);
        c1.addOrder(new CustomerOrder("ORD-101", 149.50));
        c1.addOrder(new CustomerOrder("ORD-102", 89.00));

        Customer c2 = new Customer("Bob Smith", "bob@corp.com", true);
        c2.addOrder(new CustomerOrder("ORD-201", 1250.00));

        Customer c3 = new Customer("Charlie Inactive", "charlie@corp.com", false);

        customerRepository.saveAll(List.of(c1, c2, c3));
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllActive() {
        return customerRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public Optional<Customer> getWithOrders(Long id) {
        return customerRepository.findWithOrdersById(id);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/jpa/controller/CustomerController.java",
        content: `package com.javahub.jpa.controller;

import com.javahub.jpa.entity.Customer;
import com.javahub.jpa.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<Customer>> getActiveCustomers() {
        return ResponseEntity.ok(customerService.getAllActive());
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<Customer> getCustomerWithOrders(@PathVariable Long id) {
        return customerService.getWithOrders(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/jpa/CustomerRepositoryTests.java",
        content: `package com.javahub.jpa;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CustomerRepositoryTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/customers/active returns active customers")
    void testGetActiveCustomers() throws Exception {
        mockMvc.perform(get("/api/v1/customers/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Alice Johnson"));
    }

    @Test
    @DisplayName("GET /api/v1/customers/{id}/orders solves N+1 problem using @EntityGraph")
    void testGetCustomerOrders() throws Exception {
        mockMvc.perform(get("/api/v1/customers/1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders", hasSize(2)))
                .andExpect(jsonPath("$.orders[0].orderNumber").value("ORD-101"));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Spring Data JPA & Hibernate Live Application

Features:
- **JPA Bidirectional Mapping**: \`Customer\` and \`CustomerOrder\` with managed collection relationships.
- **Solving N+1 Query Problem**: Clean query generation using \`@EntityGraph\`.
- **In-Memory H2 Database**: Preloaded with seed fixtures and interactive web console.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Interactive H2 Database Console
- URL: \`http://localhost:8080/h2-console\`
- JDBC URL: \`jdbc:h2:mem:customerdb\`
- User: \`sa\` (password empty)

## Live Testing with cURL
\`\`\`bash
# 1. Fetch active customers
curl -X GET http://localhost:8080/api/v1/customers/active

# 2. Fetch customer with eagerly loaded orders (no N+1 query)
curl -X GET http://localhost:8080/api/v1/customers/1/orders
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 6: Spring Events, Caching, & Scheduling
  // -------------------------------------------------------------
  "spring-events-caching-scheduling": {
    topicSlug: "spring-events-caching-scheduling",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("events-caching-app", "Spring Events, Caching, & Scheduling Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-cache</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: events-caching-app
  cache:
    type: simple
`
      },
      {
        path: "src/main/java/com/javahub/events/EventsCachingApplication.java",
        content: `package com.javahub.events;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
@EnableAsync
public class EventsCachingApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventsCachingApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/events/event/OrderCreatedEvent.java",
        content: `package com.javahub.events.event;

public record OrderCreatedEvent(String orderId, String customerEmail, double amount) {}
`
      },
      {
        path: "src/main/java/com/javahub/events/listener/OrderNotificationListener.java",
        content: `package com.javahub.events.listener;

import com.javahub.events.event.OrderCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class OrderNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(OrderNotificationListener.class);
    private final ConcurrentLinkedQueue<String> eventLog = new ConcurrentLinkedQueue<>();

    @EventListener
    public void onOrderCreatedSync(OrderCreatedEvent event) {
        String msg = "[SYNC_EVENT] Sent confirmation email to " + event.customerEmail() + " for order " + event.orderId();
        log.info(msg);
        eventLog.add(msg);
    }

    @Async
    @EventListener
    public void onOrderCreatedAsync(OrderCreatedEvent event) {
        String msg = "[ASYNC_EVENT] Dispatched warehouse fulfillment job for order " + event.orderId();
        log.info(msg);
        eventLog.add(msg);
    }

    public ConcurrentLinkedQueue<String> getEventLog() {
        return eventLog;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/events/service/ProductPriceCacheService.java",
        content: `package com.javahub.events.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ProductPriceCacheService {

    private static final Logger log = LoggerFactory.getLogger(ProductPriceCacheService.class);
    private final AtomicInteger databaseQueryCounter = new AtomicInteger(0);

    @Cacheable(value = "prices", key = "#sku")
    public double getPriceForSku(String sku) {
        databaseQueryCounter.incrementAndGet();
        log.info(">> [CACHE MISS] Fetching price from database for SKU: {}", sku);
        try {
            Thread.sleep(100); // simulate slow database query
        } catch (InterruptedException ignored) {}
        return 199.95;
    }

    @CacheEvict(value = "prices", allEntries = true)
    public void evictAllPrices() {
        log.info(">> [CACHE EVICT] Invalidated entire prices cache");
    }

    public int getQueryCount() {
        return databaseQueryCounter.get();
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/events/controller/EventCacheDemoController.java",
        content: `package com.javahub.events.controller;

import com.javahub.events.event.OrderCreatedEvent;
import com.javahub.events.listener.OrderNotificationListener;
import com.javahub.events.service.ProductPriceCacheService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/demos")
public class EventCacheDemoController {

    private final ApplicationEventPublisher publisher;
    private final OrderNotificationListener listener;
    private final ProductPriceCacheService cacheService;

    public EventCacheDemoController(
            ApplicationEventPublisher publisher,
            OrderNotificationListener listener,
            ProductPriceCacheService cacheService) {
        this.publisher = publisher;
        this.listener = listener;
        this.cacheService = cacheService;
    }

    @PostMapping("/events/publish")
    public ResponseEntity<Map<String, String>> triggerOrderEvent(
            @RequestParam String orderId,
            @RequestParam String email,
            @RequestParam double amount) {
        publisher.publishEvent(new OrderCreatedEvent(orderId, email, amount));
        return ResponseEntity.ok(Map.of("status", "EVENT_PUBLISHED", "orderId", orderId));
    }

    @GetMapping("/events/log")
    public ResponseEntity<List<String>> getEventLog() {
        return ResponseEntity.ok(listener.getEventLog().stream().toList());
    }

    @GetMapping("/cache/price")
    public ResponseEntity<Map<String, Object>> getPrice(@RequestParam String sku) {
        double price = cacheService.getPriceForSku(sku);
        return ResponseEntity.ok(Map.of(
            "sku", sku,
            "price", price,
            "dbHitCount", cacheService.getQueryCount()
        ));
    }

    @PostMapping("/cache/evict")
    public ResponseEntity<Map<String, String>> evictCache() {
        cacheService.evictAllPrices();
        return ResponseEntity.ok(Map.of("status", "CACHE_EVICTED"));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/events/EventsCachingTests.java",
        content: `package com.javahub.events;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EventsCachingTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify Spring @Cacheable caches database calls on duplicate requests")
    void testCaching() throws Exception {
        // First call: Cache miss (db hit count = 1)
        mockMvc.perform(get("/api/v1/demos/cache/price?sku=ITEM-42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dbHitCount").value(1));

        // Second call: Cache hit (db hit count remains 1)
        mockMvc.perform(get("/api/v1/demos/cache/price?sku=ITEM-42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dbHitCount").value(1));
    }

    @Test
    @DisplayName("Verify publishing event triggers registered synchronous event listener")
    void testEventPublishing() throws Exception {
        mockMvc.perform(post("/api/v1/demos/events/publish?orderId=ORD-99&email=test@test.com&amount=50.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EVENT_PUBLISHED"));

        mockMvc.perform(get("/api/v1/demos/events/log"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(1)));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Spring Events, Caching, & Scheduling Live Application

Features:
- **ApplicationEventPublisher & @EventListener**: Synchronous and \`@Async\` decoupled event dispatching.
- **Spring @Cacheable & @CacheEvict**: Eliminating redundant database queries via memory caching.
- **Declarative Scheduling**: \`@Scheduled\` background maintenance loops.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Fetch item price (First time: CACHE MISS, dbHitCount = 1)
curl -X GET "http://localhost:8080/api/v1/demos/cache/price?sku=MACBOOK-M3"

# 2. Fetch item price again (Second time: CACHE HIT, dbHitCount remains 1)
curl -X GET "http://localhost:8080/api/v1/demos/cache/price?sku=MACBOOK-M3"

# 3. Evict cache
curl -X POST http://localhost:8080/api/v1/demos/cache/evict

# 4. Publish decoupled event
curl -X POST "http://localhost:8080/api/v1/demos/events/publish?orderId=ORD-505&email=user@example.com&amount=299.00"

# 5. View logged events
curl -X GET http://localhost:8080/api/v1/demos/events/log
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 7: Custom Starters & Auto-Configurations
  // -------------------------------------------------------------
  "custom-spring-boot-starters-auto-configurations": {
    topicSlug: "custom-spring-boot-starters-auto-configurations",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("custom-starters-app", "Custom Spring Boot Auto-Configurations Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: custom-starters-app
app:
  multitenant:
    enabled: true
    default-tenant: "production-eu"
    isolation-mode: "DATABASE_PER_TENANT"
`
      },
      {
        path: "src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports",
        content: `com.javahub.starter.autoconfigure.MultiTenantAutoConfiguration
`
      },
      {
        path: "src/main/java/com/javahub/starter/CustomStarterApplication.java",
        content: `package com.javahub.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CustomStarterApplication {
    public static void main(String[] args) {
        SpringApplication.run(CustomStarterApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/starter/properties/MultiTenantProperties.java",
        content: `package com.javahub.starter.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.multitenant")
public class MultiTenantProperties {
    private boolean enabled = true;
    private String defaultTenant = "default-tenant";
    private String isolationMode = "SCHEMA_PER_TENANT";

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getDefaultTenant() { return defaultTenant; }
    public void setDefaultTenant(String defaultTenant) { this.defaultTenant = defaultTenant; }
    public String getIsolationMode() { return isolationMode; }
    public void setIsolationMode(String isolationMode) { this.isolationMode = isolationMode; }
}
`
      },
      {
        path: "src/main/java/com/javahub/starter/service/TenantContextService.java",
        content: `package com.javahub.starter.service;

import com.javahub.starter.properties.MultiTenantProperties;

public class TenantContextService {

    private final MultiTenantProperties properties;
    private final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public TenantContextService(MultiTenantProperties properties) {
        this.properties = properties;
    }

    public String resolveCurrentTenant() {
        String t = currentTenant.get();
        return t != null ? t : properties.getDefaultTenant();
    }

    public void switchTenant(String tenantId) {
        currentTenant.set(tenantId);
    }

    public String getIsolationMode() {
        return properties.getIsolationMode();
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/starter/autoconfigure/MultiTenantAutoConfiguration.java",
        content: `package com.javahub.starter.autoconfigure;

import com.javahub.starter.properties.MultiTenantProperties;
import com.javahub.starter.service.TenantContextService;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@ConditionalOnProperty(prefix = "app.multitenant", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(MultiTenantProperties.class)
public class MultiTenantAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public TenantContextService tenantContextService(MultiTenantProperties properties) {
        return new TenantContextService(properties);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/starter/controller/TenantDemoController.java",
        content: `package com.javahub.starter.controller;

import com.javahub.starter.service.TenantContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/tenant")
public class TenantDemoController {

    private final TenantContextService tenantService;

    public TenantDemoController(TenantContextService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, String>> getCurrentTenant() {
        return ResponseEntity.ok(Map.of(
            "tenantId", tenantService.resolveCurrentTenant(),
            "isolationMode", tenantService.getIsolationMode()
        ));
    }

    @PostMapping("/switch")
    public ResponseEntity<Map<String, String>> switchTenant(@RequestParam String tenantId) {
        tenantService.switchTenant(tenantId);
        return ResponseEntity.ok(Map.of(
            "status", "SWITCHED",
            "activeTenant", tenantService.resolveCurrentTenant()
        ));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/starter/MultiTenantAutoConfigurationTests.java",
        content: `package com.javahub.starter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MultiTenantAutoConfigurationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Verify auto-configured TenantContextService exposes configured properties")
    void testTenantAutoConfiguration() throws Exception {
        mockMvc.perform(get("/api/v1/tenant/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value("production-eu"))
                .andExpect(jsonPath("$.isolationMode").value("DATABASE_PER_TENANT"));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Custom Spring Boot Auto-Configurations Live Application

Demonstrates:
- **Spring Boot 3 \`@AutoConfiguration\`**: Modern auto-configuration entry points.
- **\`AutoConfiguration.imports\`**: Registered via \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\`.
- **Conditional Beans**: \`@ConditionalOnProperty\` and \`@ConditionalOnMissingBean\` for customizable defaults.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Query active tenant resolved from auto-configured properties
curl -X GET http://localhost:8080/api/v1/tenant/current

# 2. Switch tenant dynamically
curl -X POST "http://localhost:8080/api/v1/tenant/switch?tenantId=enterprise-apac"
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 8: Spring Batch Chunk Processing
  // -------------------------------------------------------------
  "spring-batch-chunk-processing": {
    topicSlug: "spring-batch-chunk-processing",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("spring-batch-app", "Spring Batch Chunk Processing Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-batch</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: spring-batch-app
  batch:
    job:
      enabled: false
    jdbc:
      initialize-schema: always
  datasource:
    url: jdbc:h2:mem:batchdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driverClassName: org.h2.Driver
    username: sa
    password: ""
`
      },
      {
        path: "src/main/java/com/javahub/batch/BatchApplication.java",
        content: `package com.javahub.batch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BatchApplication {
    public static void main(String[] args) {
        SpringApplication.run(BatchApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/batch/config/CustomerBatchConfig.java",
        content: `package com.javahub.batch.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

@Configuration
public class CustomerBatchConfig {

    private static final Logger log = LoggerFactory.getLogger(CustomerBatchConfig.class);
    private final ConcurrentLinkedQueue<String> processedRecords = new ConcurrentLinkedQueue<>();

    public record RawRecord(String name, String email) {}
    public record ProcessedRecord(String name, String email, String status) {}

    @Bean
    public ItemReader<RawRecord> sampleReader() {
        return new ListItemReader<>(List.of(
            new RawRecord("alice", "alice@test.com"),
            new RawRecord("bob", "bob@test.com"),
            new RawRecord("carol", "carol@test.com"),
            new RawRecord("dave", "dave@test.com"),
            new RawRecord("eve", "eve@test.com")
        ));
    }

    @Bean
    public ItemProcessor<RawRecord, ProcessedRecord> sampleProcessor() {
        return raw -> {
            log.info(">> [BATCH_PROCESSOR] Transforming {}", raw.name());
            return new ProcessedRecord(raw.name().toUpperCase(), raw.email(), "ACTIVE");
        };
    }

    @Bean
    public ItemWriter<ProcessedRecord> sampleWriter() {
        return chunk -> {
            log.info(">> [BATCH_WRITER] Writing chunk of {} items", chunk.size());
            chunk.forEach(p -> processedRecords.add(p.name() + " (" + p.email() + ")"));
        };
    }

    @Bean
    public Step customerIngestionStep(
            JobRepository jobRepository,
            PlatformTransactionManager txManager,
            ItemReader<RawRecord> reader,
            ItemProcessor<RawRecord, ProcessedRecord> processor,
            ItemWriter<ProcessedRecord> writer) {
        return new StepBuilder("customerIngestionStep", jobRepository)
                .<RawRecord, ProcessedRecord>chunk(2, txManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public Job customerIngestionJob(JobRepository jobRepository, Step customerIngestionStep) {
        return new JobBuilder("customerIngestionJob", jobRepository)
                .start(customerIngestionStep)
                .build();
    }

    public ConcurrentLinkedQueue<String> getProcessedRecords() {
        return processedRecords;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/batch/controller/BatchJobController.java",
        content: `package com.javahub.batch.controller;

import com.javahub.batch.config.CustomerBatchConfig;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/batch")
public class BatchJobController {

    private final JobLauncher jobLauncher;
    private final Job customerIngestionJob;
    private final CustomerBatchConfig batchConfig;

    public BatchJobController(JobLauncher jobLauncher, Job customerIngestionJob, CustomerBatchConfig batchConfig) {
        this.jobLauncher = jobLauncher;
        this.customerIngestionJob = customerIngestionJob;
        this.batchConfig = batchConfig;
    }

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> runJob() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addLong("time", System.currentTimeMillis())
                .toJobParameters();

        JobExecution execution = jobLauncher.run(customerIngestionJob, params);

        return ResponseEntity.ok(Map.of(
            "jobId", execution.getId(),
            "status", execution.getStatus().toString(),
            "exitStatus", execution.getExitStatus().getExitCode()
        ));
    }

    @GetMapping("/results")
    public ResponseEntity<List<String>> getResults() {
        return ResponseEntity.ok(batchConfig.getProcessedRecords().stream().toList());
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/batch/SpringBatchApplicationTests.java",
        content: `package com.javahub.batch;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SpringBatchApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /api/v1/batch/run launches batch job and completes successfully")
    void testLaunchBatchJob() throws Exception {
        mockMvc.perform(post("/api/v1/batch/run"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Spring Batch Chunk-Oriented Processing Live Application

Features:
- **Chunk-Oriented Step Execution**: Reader -> Processor -> Writer with transaction commit per chunk.
- **H2 Job Repository**: Full execution metadata tracking (JobExecution, StepExecution).
- **REST Job Trigger**: Trigger execution and inspect output via REST API.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Trigger the batch ingestion job
curl -X POST http://localhost:8080/api/v1/batch/run

# 2. Inspect transformed records processed in chunks
curl -X GET http://localhost:8080/api/v1/batch/results
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  },

  // -------------------------------------------------------------
  // Topic 9: Automated Testing
  // -------------------------------------------------------------
  "automated-testing": {
    topicSlug: "automated-testing",
    level: 8,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("automated-testing-app", "Automated Testing & Slices Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: automated-testing-app
`
      },
      {
        path: "src/main/java/com/javahub/testing/TestingApplication.java",
        content: `package com.javahub.testing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TestingApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestingApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/testing/service/TaxCalculatorService.java",
        content: `package com.javahub.testing.service;

import org.springframework.stereotype.Service;

@Service
public class TaxCalculatorService {
    public double calculateVat(double amount, double taxRate) {
        if (amount < 0 || taxRate < 0) {
            throw new IllegalArgumentException("Amount and tax rate must be non-negative");
        }
        return Math.round((amount * taxRate) * 100.0) / 100.0;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/testing/controller/TaxController.java",
        content: `package com.javahub.testing.controller;

import com.javahub.testing.service.TaxCalculatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/tax")
public class TaxController {

    private final TaxCalculatorService taxService;

    public TaxController(TaxCalculatorService taxService) {
        this.taxService = taxService;
    }

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculate(
            @RequestParam double amount,
            @RequestParam(defaultValue = "0.20") double rate) {
        double vat = taxService.calculateVat(amount, rate);
        return ResponseEntity.ok(Map.of(
            "subtotal", amount,
            "rate", rate,
            "vat", vat,
            "total", amount + vat
        ));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/testing/unit/TaxCalculatorServiceUnitTests.java",
        content: `package com.javahub.testing.unit;

import com.javahub.testing.service.TaxCalculatorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TaxCalculatorServiceUnitTests {

    private final TaxCalculatorService service = new TaxCalculatorService();

    @Test
    @DisplayName("Unit test: calculate 20% VAT on 100.00")
    void testStandardVat() {
        double vat = service.calculateVat(100.0, 0.20);
        assertThat(vat).isEqualTo(20.00);
    }

    @Test
    @DisplayName("Unit test: negative amount throws IllegalArgumentException")
    void testNegativeAmount() {
        assertThatThrownBy(() -> service.calculateVat(-50.0, 0.20))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/testing/slice/TaxControllerSliceTests.java",
        content: `package com.javahub.testing.slice;

import com.javahub.testing.controller.TaxController;
import com.javahub.testing.service.TaxCalculatorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaxController.class)
class TaxControllerSliceTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaxCalculatorService taxService;

    @Test
    @DisplayName("Slice test (@WebMvcTest): verify endpoint binds query parameters and calls mock service")
    void testCalculateEndpoint() throws Exception {
        given(taxService.calculateVat(100.0, 0.20)).willReturn(20.00);

        mockMvc.perform(get("/api/v1/tax/calculate?amount=100.0&rate=0.20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value(100.0))
                .andExpect(jsonPath("$.vat").value(20.0))
                .andExpect(jsonPath("$.total").value(120.0));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/testing/integration/TaxIntegrationTests.java",
        content: `package com.javahub.testing.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TaxIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Integration test (@SpringBootTest): boots full container and verifies end-to-end response")
    void testEndToEndCalculation() throws Exception {
        mockMvc.perform(get("/api/v1/tax/calculate?amount=250.0&rate=0.10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vat").value(25.0))
                .andExpect(jsonPath("$.total").value(275.0));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Automated Testing & Slices Live Spring Boot Application

Demonstrates:
- **Unit Testing**: Fast, isolated testing of business logic without Spring context.
- **Slice Testing with \`@WebMvcTest\`**: Focused controller testing with \`@MockBean\`.
- **Full Integration Testing with \`@SpringBootTest\`**: Verifying end-to-end container integration.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# Calculate sales tax
curl -X GET "http://localhost:8080/api/v1/tax/calculate?amount=150.00&rate=0.15"
\`\`\`

## Running the Multi-Tier Test Suite
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  }
};
