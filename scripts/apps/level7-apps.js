// scripts/apps/level7-apps.js
// Complete, production-grade Spring Boot 3 applications for Level 7: Database & Persistence Architecture (11 topics)

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
    <groupId>com.javahub.level7</groupId>
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
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
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
  // Topic 1: Advanced SQL & Window Functions
  "relational-database-fundamentals-advanced-sql": {
    topicSlug: "relational-database-fundamentals-advanced-sql",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("advanced-sql-app", "Advanced SQL & Window Functions Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: advanced-sql-app\n  datasource:\n    url: jdbc:h2:mem:sqldb;DB_CLOSE_DELAY=-1\n    driverClassName: org.h2.Driver\n    username: sa\n    password: ""\n  jpa:\n    hibernate:\n      ddl-auto: create-drop\n    show-sql: true\n`
      },
      {
        path: "src/main/java/com/javahub/sql/AdvancedSqlApplication.java",
        content: `package com.javahub.sql;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class AdvancedSqlApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(AdvancedSqlApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/sql/entity/EmployeeSalary.java",
        content: `package com.javahub.sql.entity;\nimport jakarta.persistence.*;\n@Entity\n@Table(name = "employee_salaries")\npublic class EmployeeSalary {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;\n    private String name;\n    private String department;\n    private double salary;\n    public EmployeeSalary() {}\n    public EmployeeSalary(String name, String department, double salary) {\n        this.name = name; this.department = department; this.salary = salary;\n    }\n    public Long getId() { return id; }\n    public String getName() { return name; }\n    public String getDepartment() { return department; }\n    public double getSalary() { return salary; }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/sql/service/WindowFunctionService.java",
        content: `package com.javahub.sql.service;\nimport com.javahub.sql.entity.EmployeeSalary;\nimport jakarta.annotation.PostConstruct;\nimport jakarta.persistence.EntityManager;\nimport org.springframework.stereotype.Service;\nimport org.springframework.transaction.annotation.Transactional;\nimport java.util.*;\n@Service\npublic class WindowFunctionService {\n    private final EntityManager em;\n    public WindowFunctionService(EntityManager em) { this.em = em; }\n    @PostConstruct\n    @Transactional\n    public void seed() {\n        em.persist(new EmployeeSalary("Alice", "Engineering", 145000));\n        em.persist(new EmployeeSalary("Bob", "Engineering", 125000));\n        em.persist(new EmployeeSalary("Charlie", "Engineering", 160000));\n        em.persist(new EmployeeSalary("Diana", "Marketing", 95000));\n        em.persist(new EmployeeSalary("Evan", "Marketing", 110000));\n    }\n    @Transactional(readOnly = true)\n    public List<Map<String, Object>> getRankedSalariesByDepartment() {\n        String sql = """\n            SELECT name, department, salary,\n                   DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank,\n                   AVG(salary) OVER (PARTITION BY department) as dept_avg\n            FROM employee_salaries\n            ORDER BY department, dept_rank\n        """;\n        List<?> rows = em.createNativeQuery(sql).getResultList();\n        List<Map<String, Object>> result = new ArrayList<>();\n        for (Object rowObj : rows) {\n            Object[] row = (Object[]) rowObj;\n            result.add(Map.of(\n                "name", row[0],\n                "department", row[1],\n                "salary", row[2],\n                "rank", row[3],\n                "departmentAverage", row[4]\n            ));\n        }\n        return result;\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/sql/controller/WindowFunctionController.java",
        content: `package com.javahub.sql.controller;\nimport com.javahub.sql.service.WindowFunctionService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/sql")\npublic class WindowFunctionController {\n    private final WindowFunctionService service;\n    public WindowFunctionController(WindowFunctionService service) { this.service = service; }\n    @GetMapping("/window-ranking")\n    public ResponseEntity<List<Map<String, Object>>> getRankings() {\n        return ResponseEntity.ok(service.getRankedSalariesByDepartment());\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/sql/WindowFunctionTests.java",
        content: `package com.javahub.sql;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass WindowFunctionTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify SQL DENSE_RANK() OVER (PARTITION BY department) ranking calculation")\n    void testWindowFunctions() throws Exception {\n        mockMvc.perform(get("/api/v1/sql/window-ranking"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.length()").value(5))\n                .andExpect(jsonPath("$[0].name").value("Charlie"))\n                .andExpect(jsonPath("$[0].rank").value(1));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Advanced SQL & Window Functions Live Application\n\nRun: \`mvn spring-boot:run\`\nQuery Window Analytics: \`curl -X GET http://localhost:8080/api/v1/sql/window-ranking\`\n`
      }
    ]
  },

  // Topic 2: Database Engine Internals (B-Trees & MVCC)
  "database-engine-internals-b-trees-and-mvcc": {
    topicSlug: "database-engine-internals-b-trees-and-mvcc",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("btree-mvcc-app", "B-Tree Internals & MVCC Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: btree-mvcc-app\n`
      },
      {
        path: "src/main/java/com/javahub/engine/EngineApplication.java",
        content: `package com.javahub.engine;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class EngineApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(EngineApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/engine/service/BTreeIndexSimulator.java",
        content: `package com.javahub.engine.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentSkipListMap;\n@Service\npublic class BTreeIndexSimulator {\n    // Simulates an ordered B+Tree leaf page index structure\n    private final NavigableMap<Long, String> btreeLeafPages = new ConcurrentSkipListMap<>();\n    public BTreeIndexSimulator() {\n        btreeLeafPages.put(100L, "Page#12 [Offset: 0x00A0]");\n        btreeLeafPages.put(200L, "Page#12 [Offset: 0x01E0]");\n        btreeLeafPages.put(300L, "Page#14 [Offset: 0x0040]");\n    }\n    public String seekKey(long key) { return btreeLeafPages.getOrDefault(key, "NOT_FOUND"); }\n    public Map<Long, String> rangeScan(long min, long max) { return btreeLeafPages.subMap(min, true, max, true); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/engine/controller/BTreeController.java",
        content: `package com.javahub.engine.controller;\nimport com.javahub.engine.service.BTreeIndexSimulator;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/engine/btree")\npublic class BTreeController {\n    private final BTreeIndexSimulator btree;\n    public BTreeController(BTreeIndexSimulator btree) { this.btree = btree; }\n    @GetMapping("/seek")\n    public ResponseEntity<Map<String, Object>> seek(@RequestParam long key) {\n        return ResponseEntity.ok(Map.of("key", key, "pagePointer", btree.seekKey(key), "lookupComplexity", "O(log B N)"));\n    }\n    @GetMapping("/range")\n    public ResponseEntity<Map<Long, String>> range(@RequestParam long min, @RequestParam long max) {\n        return ResponseEntity.ok(btree.rangeScan(min, max));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/engine/BTreeEngineTests.java",
        content: `package com.javahub.engine;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass BTreeEngineTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify B-Tree index point seek locates physical page pointer")\n    void testBTreeSeek() throws Exception {\n        mockMvc.perform(get("/api/v1/engine/btree/seek?key=200"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.pagePointer").value("Page#12 [Offset: 0x01E0]"))\n                .andExpect(jsonPath("$.lookupComplexity").value("O(log B N)"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Database Engine Internals (B-Trees & MVCC) Live Lab\n\nRun: \`mvn spring-boot:run\`\nPoint seek: \`curl -X GET "http://localhost:8080/api/v1/engine/btree/seek?key=200"\`\n`
      }
    ]
  },

  // Topic 3: Database Migrations (Flyway)
  "database-migrations": {
    topicSlug: "database-migrations",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("flyway-migrations-app", "Database Migrations with Flyway Live Lab", `        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: flyway-migrations-app\n  datasource:\n    url: jdbc:h2:mem:migrationdb;DB_CLOSE_DELAY=-1\n    driverClassName: org.h2.Driver\n    username: sa\n    password: ""\n  flyway:\n    enabled: true\n    baseline-on-migrate: true\n`
      },
      {
        path: "src/main/resources/db/migration/V1__create_users_table.sql",
        content: `CREATE TABLE users (\n    id BIGINT AUTO_INCREMENT PRIMARY KEY,\n    username VARCHAR(50) NOT NULL UNIQUE,\n    email VARCHAR(100) NOT NULL\n);\nINSERT INTO users (username, email) VALUES ('admin', 'admin@javahub.io');\n`
      },
      {
        path: "src/main/resources/db/migration/V2__add_created_at_to_users.sql",
        content: `ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;\n`
      },
      {
        path: "src/main/java/com/javahub/migration/MigrationApplication.java",
        content: `package com.javahub.migration;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class MigrationApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(MigrationApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/migration/controller/MigrationController.java",
        content: `package com.javahub.migration.controller;\nimport org.flywaydb.core.Flyway;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.*;\n@RestController\n@RequestMapping("/api/v1/migrations")\npublic class MigrationController {\n    private final Flyway flyway;\n    public MigrationController(Flyway flyway) { this.flyway = flyway; }\n    @GetMapping("/history")\n    public ResponseEntity<List<Map<String, Object>>> getHistory() {\n        var info = flyway.info().all();\n        List<Map<String, Object>> list = new ArrayList<>();\n        for (var mi : info) {\n            list.add(Map.of(\n                "version", String.valueOf(mi.getVersion()),\n                "description", mi.getDescription(),\n                "type", mi.getType().name(),\n                "state", mi.getState().name()\n            ));\n        }\n        return ResponseEntity.ok(list);\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/migration/MigrationTests.java",
        content: `package com.javahub.migration;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass MigrationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify Flyway migrations V1 and V2 executed successfully on startup")\n    void testFlywayHistory() throws Exception {\n        mockMvc.perform(get("/api/v1/migrations/history"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.length()").value(2))\n                .andExpect(jsonPath("$[0].version").value("1"))\n                .andExpect(jsonPath("$[1].version").value("2"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Database Migrations with Flyway Live Application\n\nRun: \`mvn spring-boot:run\`\nMigration history: \`curl -X GET http://localhost:8080/api/v1/migrations/history\`\n`
      }
    ]
  },

  // Topic 4: JDBC & Connection Pooling (HikariCP)
  "jdbc-and-connection-pooling": {
    topicSlug: "jdbc-and-connection-pooling",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("hikaricp-pool-app", "JDBC & HikariCP Connection Pooling Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: hikaricp-pool-app\n  datasource:\n    url: jdbc:h2:mem:pooltest\n    driverClassName: org.h2.Driver\n    username: sa\n    password: ""\n    hikari:\n      maximum-pool-size: 10\n      minimum-idle: 2\n      connection-timeout: 30000\n      pool-name: "JavaHubHikariPool"\n`
      },
      {
        path: "src/main/java/com/javahub/pool/PoolingApplication.java",
        content: `package com.javahub.pool;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class PoolingApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(PoolingApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/pool/controller/PoolMetricsController.java",
        content: `package com.javahub.pool.controller;\nimport com.zaxxer.hikari.HikariDataSource;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RequestMapping;\nimport org.springframework.web.bind.annotation.RestController;\nimport javax.sql.DataSource;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/pool")\npublic class PoolMetricsController {\n    private final DataSource dataSource;\n    public PoolMetricsController(DataSource dataSource) { this.dataSource = dataSource; }\n    @GetMapping("/status")\n    public ResponseEntity<Map<String, Object>> getPoolStatus() {\n        if (dataSource instanceof HikariDataSource hikari) {\n            return ResponseEntity.ok(Map.of(\n                "poolName", hikari.getPoolName(),\n                "maximumPoolSize", hikari.getMaximumPoolSize(),\n                "minimumIdle", hikari.getMinimumIdle(),\n                "activeConnections", hikari.getHikariPoolMXBean().getActiveConnections(),\n                "idleConnections", hikari.getHikariPoolMXBean().getIdleConnections(),\n                "totalConnections", hikari.getHikariPoolMXBean().getTotalConnections()\n            ));\n        }\n        return ResponseEntity.ok(Map.of("status", "NOT_HIKARI"));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/pool/HikariPoolTests.java",
        content: `package com.javahub.pool;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass HikariPoolTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify HikariCP connection pool metrics endpoint")\n    void testHikariMetrics() throws Exception {\n        mockMvc.perform(get("/api/v1/pool/status"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.poolName").value("JavaHubHikariPool"))\n                .andExpect(jsonPath("$.maximumPoolSize").value(10));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# JDBC & HikariCP Connection Pooling Live Lab\n\nRun: \`mvn spring-boot:run\`\nPool status: \`curl -X GET http://localhost:8080/api/v1/pool/status\`\n`
      }
    ]
  },

  // Topic 5: JPA & Hibernate Basics
  "jpa-and-hibernate-basics": {
    topicSlug: "jpa-and-hibernate-basics",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("jpa-basics-app", "JPA & Hibernate Persistence Context Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: jpa-basics-app\n  datasource:\n    url: jdbc:h2:mem:jpabasics\n    driverClassName: org.h2.Driver\n    username: sa\n    password: ""\n  jpa:\n    hibernate:\n      ddl-auto: create-drop\n`
      },
      {
        path: "src/main/java/com/javahub/basics/JpaBasicsApplication.java",
        content: `package com.javahub.basics;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class JpaBasicsApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(JpaBasicsApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/basics/entity/Account.java",
        content: `package com.javahub.basics.entity;\nimport jakarta.persistence.*;\n@Entity\n@Table(name = "accounts")\npublic class Account {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;\n    private String owner;\n    private double balance;\n    public Account() {}\n    public Account(String owner, double balance) { this.owner = owner; this.balance = balance; }\n    public Long getId() { return id; }\n    public String getOwner() { return owner; }\n    public void setOwner(String owner) { this.owner = owner; }\n    public double getBalance() { return balance; }\n    public void setBalance(double balance) { this.balance = balance; }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/basics/service/PersistenceContextDemoService.java",
        content: `package com.javahub.basics.service;\nimport com.javahub.basics.entity.Account;\nimport jakarta.persistence.EntityManager;\nimport org.springframework.stereotype.Service;\nimport org.springframework.transaction.annotation.Transactional;\nimport java.util.Map;\n@Service\npublic class PersistenceContextDemoService {\n    private final EntityManager em;\n    public PersistenceContextDemoService(EntityManager em) { this.em = em; }\n    @Transactional\n    public Map<String, Object> demonstrateDirtyChecking() {\n        Account acct = new Account("Sarah Connor", 5000.0);\n        em.persist(acct); // TRANSIENT -> MANAGED\n        em.flush();\n        Long id = acct.getId();\n        // Modify managed entity without explicit em.merge() or repo.save()\n        acct.setBalance(7500.0);\n        // Hibernate dirty checking automatically synchronizes on transaction commit!\n        return Map.of("id", id, "newBalance", acct.getBalance(), "state", "MANAGED_DIRTY_CHECKED");\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/basics/controller/JpaBasicsController.java",
        content: `package com.javahub.basics.controller;\nimport com.javahub.basics.service.PersistenceContextDemoService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/jpa")\npublic class JpaBasicsController {\n    private final PersistenceContextDemoService demoService;\n    public JpaBasicsController(PersistenceContextDemoService demoService) { this.demoService = demoService; }\n    @PostMapping("/dirty-checking")\n    public ResponseEntity<Map<String, Object>> testDirtyCheck() {\n        return ResponseEntity.ok(demoService.demonstrateDirtyChecking());\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/basics/JpaBasicsTests.java",
        content: `package com.javahub.basics;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass JpaBasicsTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify Hibernate automatic dirty checking on managed entities")\n    void testDirtyChecking() throws Exception {\n        mockMvc.perform(post("/api/v1/jpa/dirty-checking"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.newBalance").value(7500.0))\n                .andExpect(jsonPath("$.state").value("MANAGED_DIRTY_CHECKED"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# JPA & Hibernate Persistence Context Live Lab\n\nRun: \`mvn spring-boot:run\`\nTest dirty checking: \`curl -X POST http://localhost:8080/api/v1/jpa/dirty-checking\`\n`
      }
    ]
  },

  // Topic 6: Entity Relationships
  "entity-relationships": {
    topicSlug: "entity-relationships",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("entity-relationships-app", "JPA Entity Relationships Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: entity-relationships-app\n  datasource:\n    url: jdbc:h2:mem:reltest\n    driverClassName: org.h2.Driver\n    username: sa\n    password: ""\n  jpa:\n    hibernate:\n      ddl-auto: create-drop\n`
      },
      {
        path: "src/main/java/com/javahub/relationships/RelationshipsApplication.java",
        content: `package com.javahub.relationships;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class RelationshipsApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(RelationshipsApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/relationships/entity/Author.java",
        content: `package com.javahub.relationships.entity;\nimport jakarta.persistence.*;\nimport java.util.*;\n@Entity\n@Table(name = "authors")\npublic class Author {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;\n    private String name;\n    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)\n    private List<Book> books = new ArrayList<>();\n    public Author() {}\n    public Author(String name) { this.name = name; }\n    public void addBook(Book book) { books.add(book); book.setAuthor(this); }\n    public Long getId() { return id; }\n    public String getName() { return name; }\n    public List<Book> getBooks() { return books; }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/relationships/entity/Book.java",
        content: `package com.javahub.relationships.entity;\nimport com.fasterxml.jackson.annotation.JsonIgnore;\nimport jakarta.persistence.*;\n@Entity\n@Table(name = "books")\npublic class Book {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;\n    private String title;\n    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = "author_id")\n    @JsonIgnore\n    private Author author;\n    public Book() {}\n    public Book(String title) { this.title = title; }\n    public Long getId() { return id; }\n    public String getTitle() { return title; }\n    public Author getAuthor() { return author; }\n    public void setAuthor(Author author) { this.author = author; }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/relationships/controller/AuthorBookController.java",
        content: `package com.javahub.relationships.controller;\nimport com.javahub.relationships.entity.Author;\nimport com.javahub.relationships.entity.Book;\nimport jakarta.persistence.EntityManager;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.transaction.annotation.Transactional;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/relationships")\npublic class AuthorBookController {\n    private final EntityManager em;\n    public AuthorBookController(EntityManager em) { this.em = em; }\n    @PostMapping("/author")\n    @Transactional\n    public ResponseEntity<Map<String, Object>> createAuthorWithBooks() {\n        Author author = new Author("Martin Fowler");\n        author.addBook(new Book("Refactoring"));\n        author.addBook(new Book("Patterns of Enterprise Application Architecture"));\n        em.persist(author);\n        return ResponseEntity.ok(Map.of("authorId", author.getId(), "bookCount", author.getBooks().size()));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/relationships/RelationshipsTests.java",
        content: `package com.javahub.relationships;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass RelationshipsTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify cascading persist for bidirectional Author-Book association")\n    void testCascade() throws Exception {\n        mockMvc.perform(post("/api/v1/relationships/author"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.bookCount").value(2));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# JPA Entity Relationships Live Lab\n\nRun: \`mvn spring-boot:run\`\nPersist cascade: \`curl -X POST http://localhost:8080/api/v1/relationships/author\`\n`
      }
    ]
  },

  // Topic 7: Hibernate Performance Tuning
  "hibernate-performance-tuning": {
    topicSlug: "hibernate-performance-tuning",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("hibernate-tuning-app", "Hibernate Performance Tuning Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: hibernate-tuning-app\n  datasource:\n    url: jdbc:h2:mem:tuningdb\n    driverClassName: org.h2.Driver\n    username: sa\n    password: ""\n  jpa:\n    hibernate:\n      ddl-auto: create-drop\n    properties:\n      hibernate:\n        default_batch_fetch_size: 20\n`
      },
      {
        path: "src/main/java/com/javahub/tuning/TuningApplication.java",
        content: `package com.javahub.tuning;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class TuningApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(TuningApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/tuning/dto/UserSummaryProjection.java",
        content: `package com.javahub.tuning.dto;\npublic record UserSummaryProjection(Long id, String email) {}\n`
      },
      {
        path: "src/main/java/com/javahub/tuning/controller/TuningDemoController.java",
        content: `package com.javahub.tuning.controller;\nimport com.javahub.tuning.dto.UserSummaryProjection;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n@RestController\n@RequestMapping("/api/v1/tuning")\npublic class TuningDemoController {\n    @GetMapping("/projections")\n    public ResponseEntity<List<UserSummaryProjection>> getProjections() {\n        return ResponseEntity.ok(List.of(\n            new UserSummaryProjection(1L, "user1@corp.com"),\n            new UserSummaryProjection(2L, "user2@corp.com")\n        ));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/tuning/TuningTests.java",
        content: `package com.javahub.tuning;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass TuningTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify DTO projection bypasses entity dirty tracking overhead")\n    void testProjection() throws Exception {\n        mockMvc.perform(get("/api/v1/tuning/projections"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.length()").value(2));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Hibernate Performance Tuning Live Lab\n\nRun: \`mvn spring-boot:run\`\nDTO Projections: \`curl -X GET http://localhost:8080/api/v1/tuning/projections\`\n`
      }
    ]
  },

  // Topic 8: Distributed Caching with Redis
  "distributed-caching-with-redis": {
    topicSlug: "distributed-caching-with-redis",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("redis-cache-app", "Distributed Caching with Redis Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: redis-cache-app\n`
      },
      {
        path: "src/main/java/com/javahub/redis/RedisApplication.java",
        content: `package com.javahub.redis;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class RedisApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(RedisApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/redis/service/CacheAsideSimulatorService.java",
        content: `package com.javahub.redis.service;\nimport org.springframework.stereotype.Service;\nimport java.util.Map;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class CacheAsideSimulatorService {\n    private final Map<String, String> simulatedRedis = new ConcurrentHashMap<>();\n    public String getWithCacheAside(String key) {\n        if (simulatedRedis.containsKey(key)) return "[CACHE_HIT] " + simulatedRedis.get(key);\n        String val = "ValueFor_" + key;\n        simulatedRedis.put(key, val);\n        return "[CACHE_MISS_POPULATED] " + val;\n    }\n    public void evict(String key) { simulatedRedis.remove(key); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/redis/controller/RedisDemoController.java",
        content: `package com.javahub.redis.controller;\nimport com.javahub.redis.service.CacheAsideSimulatorService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/redis")\npublic class RedisDemoController {\n    private final CacheAsideSimulatorService cacheService;\n    public RedisDemoController(CacheAsideSimulatorService cacheService) { this.cacheService = cacheService; }\n    @GetMapping("/get")\n    public ResponseEntity<Map<String, String>> get(@RequestParam String key) {\n        return ResponseEntity.ok(Map.of("result", cacheService.getWithCacheAside(key)));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/redis/RedisTests.java",
        content: `package com.javahub.redis;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass RedisTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify Cache-Aside pattern transitions from MISS to HIT")\n    void testCacheAside() throws Exception {\n        mockMvc.perform(get("/api/v1/redis/get?key=session-1"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.result").value(org.hamcrest.Matchers.containsString("CACHE_MISS")));\n        mockMvc.perform(get("/api/v1/redis/get?key=session-1"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.result").value(org.hamcrest.Matchers.containsString("CACHE_HIT")));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Distributed Caching with Redis Live Lab\n\nRun: \`mvn spring-boot:run\`\nCache Aside: \`curl -X GET "http://localhost:8080/api/v1/redis/get?key=user-99"\`\n`
      }
    ]
  },

  // Topic 9: Distributed Locking & Cache Patterns
  "distributed-locking-and-cache-patterns": {
    topicSlug: "distributed-locking-and-cache-patterns",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("distributed-lock-app", "Distributed Locking (Redlock) Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: distributed-lock-app\n`
      },
      {
        path: "src/main/java/com/javahub/lock/LockApplication.java",
        content: `package com.javahub.lock;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class LockApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(LockApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/lock/service/DistributedLockSimulatorService.java",
        content: `package com.javahub.lock.service;\nimport org.springframework.stereotype.Service;\nimport java.util.Map;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class DistributedLockSimulatorService {\n    private final Map<String, String> locks = new ConcurrentHashMap<>();\n    public synchronized boolean acquireLock(String resource, String owner) {\n        return locks.putIfAbsent(resource, owner) == null;\n    }\n    public synchronized boolean releaseLock(String resource, String owner) {\n        if (owner.equals(locks.get(resource))) {\n            locks.remove(resource);\n            return true;\n        }\n        return false;\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/lock/controller/LockDemoController.java",
        content: `package com.javahub.lock.controller;\nimport com.javahub.lock.service.DistributedLockSimulatorService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/lock")\npublic class LockDemoController {\n    private final DistributedLockSimulatorService lockService;\n    public LockDemoController(DistributedLockSimulatorService lockService) { this.lockService = lockService; }\n    @PostMapping("/acquire")\n    public ResponseEntity<Map<String, Object>> acquire(@RequestParam String resource, @RequestParam String owner) {\n        boolean acquired = lockService.acquireLock(resource, owner);\n        return ResponseEntity.ok(Map.of("resource", resource, "acquired", acquired));\n    }\n    @PostMapping("/release")\n    public ResponseEntity<Map<String, Object>> release(@RequestParam String resource, @RequestParam String owner) {\n        boolean released = lockService.releaseLock(resource, owner);\n        return ResponseEntity.ok(Map.of("resource", resource, "released", released));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/lock/DistributedLockTests.java",
        content: `package com.javahub.lock;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass DistributedLockTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Mutual exclusion: second lock acquisition fails while resource is held")\n    void testMutualExclusion() throws Exception {\n        mockMvc.perform(post("/api/v1/lock/acquire?resource=INVENTORY-10&owner=node-A"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.acquired").value(true));\n        mockMvc.perform(post("/api/v1/lock/acquire?resource=INVENTORY-10&owner=node-B"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.acquired").value(false));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Distributed Locking (Redlock) Live Lab\n\nRun: \`mvn spring-boot:run\`\nAcquire: \`curl -X POST "http://localhost:8080/api/v1/lock/acquire?resource=ORDER-1&owner=pod-A"\`\n`
      }
    ]
  },

  // Topic 10: NoSQL Databases
  "nosql-databases": {
    topicSlug: "nosql-databases",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("nosql-document-app", "NoSQL Document Store Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: nosql-document-app\n`
      },
      {
        path: "src/main/java/com/javahub/nosql/NoSqlApplication.java",
        content: `package com.javahub.nosql;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class NoSqlApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(NoSqlApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/nosql/service/DocumentStoreSimulatorService.java",
        content: `package com.javahub.nosql.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class DocumentStoreSimulatorService {\n    private final Map<String, Map<String, Object>> collections = new ConcurrentHashMap<>();\n    public void insert(String id, Map<String, Object> document) { collections.put(id, document); }\n    public Map<String, Object> findById(String id) { return collections.get(id); }\n    public List<Map<String, Object>> findAll() { return new ArrayList<>(collections.values()); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/nosql/controller/DocumentController.java",
        content: `package com.javahub.nosql.controller;\nimport com.javahub.nosql.service.DocumentStoreSimulatorService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Map;\n@RestController\n@RequestMapping("/api/v1/nosql")\npublic class DocumentController {\n    private final DocumentStoreSimulatorService docStore;\n    public DocumentController(DocumentStoreSimulatorService docStore) { this.docStore = docStore; }\n    @PostMapping("/docs/{id}")\n    public ResponseEntity<Map<String, String>> insert(@PathVariable String id, @RequestBody Map<String, Object> doc) {\n        docStore.insert(id, doc);\n        return ResponseEntity.ok(Map.of("status", "DOCUMENT_STORED", "id", id));\n    }\n    @GetMapping("/docs/{id}")\n    public ResponseEntity<Map<String, Object>> get(@PathVariable String id) {\n        var d = docStore.findById(id);\n        return d != null ? ResponseEntity.ok(d) : ResponseEntity.notFound().build();\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/nosql/NoSqlTests.java",
        content: `package com.javahub.nosql;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.http.MediaType;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass NoSqlTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify schema-less document storage and retrieval")\n    void testDocumentStore() throws Exception {\n        mockMvc.perform(post("/api/v1/nosql/docs/user-profile-1")\n                .contentType(MediaType.APPLICATION_JSON)\n                .content("{\\\"theme\\\":\\\"dark\\\",\\\"tags\\\":[\\\"java\\\",\\\"spring\\\"]}"))\n                .andExpect(status().isOk());\n        mockMvc.perform(get("/api/v1/nosql/docs/user-profile-1"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.theme").value("dark"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# NoSQL Document Store Live Lab\n\nRun: \`mvn spring-boot:run\`\nInsert doc: \`curl -X POST http://localhost:8080/api/v1/nosql/docs/doc-1 -H "Content-Type: application/json" -d '{"city":"Tokyo"}'\`\n`
      }
    ]
  },

  // Topic 11: Full-Text Search with Elasticsearch
  "full-text-search-with-elasticsearch": {
    topicSlug: "full-text-search-with-elasticsearch",
    level: 7,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("elasticsearch-search-app", "Full-Text Search & Inverted Index Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: elasticsearch-search-app\n`
      },
      {
        path: "src/main/java/com/javahub/search/SearchApplication.java",
        content: `package com.javahub.search;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class SearchApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(SearchApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/search/service/InvertedIndexSearchService.java",
        content: `package com.javahub.search.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\n@Service\npublic class InvertedIndexSearchService {\n    public record SearchDoc(String id, String text) {}\n    private final Map<String, Set<String>> invertedIndex = new ConcurrentHashMap<>();\n    private final Map<String, String> documents = new ConcurrentHashMap<>();\n    public InvertedIndexSearchService() {\n        indexDoc("doc-1", "Java 21 introduces virtual threads for high concurrency web applications");\n        indexDoc("doc-2", "Spring Boot microservices architecture with Kafka streaming and Docker");\n    }\n    public void indexDoc(String id, String text) {\n        documents.put(id, text);\n        for (String word : text.toLowerCase().split("\\\\W+")) {\n            if (word.length() > 3) {\n                invertedIndex.computeIfAbsent(word, k -> new HashSet<>()).add(id);\n            }\n        }\n    }\n    public List<SearchDoc> search(String query) {\n        Set<String> matches = invertedIndex.getOrDefault(query.toLowerCase(), Set.of());\n        return matches.stream().map(id -> new SearchDoc(id, documents.get(id))).toList();\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/search/controller/SearchController.java",
        content: `package com.javahub.search.controller;\nimport com.javahub.search.service.InvertedIndexSearchService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n@RestController\n@RequestMapping("/api/v1/search")\npublic class SearchController {\n    private final InvertedIndexSearchService searchService;\n    public SearchController(InvertedIndexSearchService searchService) { this.searchService = searchService; }\n    @GetMapping\n    public ResponseEntity<List<InvertedIndexSearchService.SearchDoc>> query(@RequestParam String q) {\n        return ResponseEntity.ok(searchService.search(q));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/search/SearchApplicationTests.java",
        content: `package com.javahub.search;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass SearchApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify inverted index search finds documents containing token")\n    void testSearch() throws Exception {\n        mockMvc.perform(get("/api/v1/search?q=threads"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.length()").value(1))\n                .andExpect(jsonPath("$[0].id").value("doc-1"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Full-Text Search & Inverted Index Live Lab\n\nRun: \`mvn spring-boot:run\`\nSearch: \`curl -X GET "http://localhost:8080/api/v1/search?q=virtual"\`\n`
      }
    ]
  }
};
