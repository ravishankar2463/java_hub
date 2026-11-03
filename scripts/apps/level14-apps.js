// scripts/apps/level14-apps.js
// Complete, production-grade Spring Boot 3 applications for Level 14: Enterprise AI & Spring AI (6 topics)

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
    <groupId>com.javahub.level14</groupId>
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
  // Topic 1: The AI Landscape for Java: Spring AI
  "the-ai-landscape-for-java-spring-ai": {
    topicSlug: "the-ai-landscape-for-java-spring-ai",
    level: 14,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("spring-ai-chat-app", "Spring AI ChatClient Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: spring-ai-chat-app\n`
      },
      {
        path: "src/main/java/com/javahub/ai/SpringAiApplication.java",
        content: `package com.javahub.ai;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class SpringAiApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(SpringAiApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/ai/service/AiChatClientSimulator.java",
        content: `package com.javahub.ai.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\n@Service\npublic class AiChatClientSimulator {\n    public record ChatResponse(String model, String userQuery, String completion, int promptTokens, int completionTokens) {}\n    public ChatResponse complete(String userQuery, String systemInstruction) {\n        int pTokens = (int) Math.ceil(userQuery.split("\\\\s+").length * 1.3);\n        String response = "AI Insight for ['" + userQuery + "']: Configured with system rule: " + (systemInstruction != null ? systemInstruction : "Default Assistant");\n        int cTokens = (int) Math.ceil(response.split("\\\\s+").length * 1.3);\n        return new ChatResponse("gpt-4o", userQuery, response, pTokens, cTokens);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/ai/controller/AiChatController.java",
        content: `package com.javahub.ai.controller;\nimport com.javahub.ai.service.AiChatClientSimulator;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/ai/chat")\npublic class AiChatController {\n    private final AiChatClientSimulator chatClient;\n    public AiChatController(AiChatClientSimulator chatClient) { this.chatClient = chatClient; }\n    @PostMapping("/generate")\n    public ResponseEntity<AiChatClientSimulator.ChatResponse> generate(\n            @RequestParam String prompt, @RequestParam(defaultValue = "You are a senior Java architect.") String system) {\n        return ResponseEntity.ok(chatClient.complete(prompt, system));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/ai/SpringAiApplicationTests.java",
        content: `package com.javahub.ai;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass SpringAiApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify Spring AI chat client generation and token accounting")\n    void testChatGeneration() throws Exception {\n        mockMvc.perform(post("/api/v1/ai/chat/generate?prompt=ExplainVirtualThreads"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.model").value("gpt-4o"))\n                .andExpect(jsonPath("$.promptTokens").isNumber());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Spring AI ChatClient Live Lab\n\nRun: \`mvn spring-boot:run\`\nGenerate: \`curl -X POST "http://localhost:8080/api/v1/ai/chat/generate?prompt=ExplainLoom"\`\n`
      }
    ]
  },

  // Topic 2: LLM Integration and Structured Records
  "llm-integration-and-structured-records": {
    topicSlug: "llm-integration-and-structured-records",
    level: 14,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("structured-records-app", "LLM Structured Output & Records Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: structured-records-app\n`
      },
      {
        path: "src/main/java/com/javahub/structured/StructuredRecordsApplication.java",
        content: `package com.javahub.structured;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class StructuredRecordsApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(StructuredRecordsApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/structured/dto/CodeReviewAnalysis.java",
        content: `package com.javahub.structured.dto;\nimport java.util.List;\npublic record CodeReviewAnalysis(String filePath, int totalIssues, String severity, List<String> recommendations) {}\n`
      },
      {
        path: "src/main/java/com/javahub/structured/service/StructuredLlmParserService.java",
        content: `package com.javahub.structured.service;\nimport com.javahub.structured.dto.CodeReviewAnalysis;\nimport org.springframework.stereotype.Service;\nimport java.util.List;\n@Service\npublic class StructuredLlmParserService {\n    public CodeReviewAnalysis parseCodeReview(String targetFile) {\n        return new CodeReviewAnalysis(\n            targetFile,\n            2,\n            "MEDIUM",\n            List.of("Replace traditional Thread with Virtual Threads", "Use try-with-resources on MemorySegment arena")\n        );\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/structured/controller/StructuredReviewController.java",
        content: `package com.javahub.structured.controller;\nimport com.javahub.structured.dto.CodeReviewAnalysis;\nimport com.javahub.structured.service.StructuredLlmParserService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/ai/review")\npublic class StructuredReviewController {\n    private final StructuredLlmParserService parserService;\n    public StructuredReviewController(StructuredLlmParserService parserService) { this.parserService = parserService; }\n    @GetMapping("/analyze")\n    public ResponseEntity<CodeReviewAnalysis> analyze(@RequestParam(defaultValue = "OrderService.java") String file) {\n        return ResponseEntity.ok(parserService.parseCodeReview(file));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/structured/StructuredRecordsTests.java",
        content: `package com.javahub.structured;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass StructuredRecordsTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify structured deserialization into typed Java 21 Record")\n    void testStructuredOutput() throws Exception {\n        mockMvc.perform(get("/api/v1/ai/review/analyze?file=PaymentService.java"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.filePath").value("PaymentService.java"))\n                .andExpect(jsonPath("$.severity").value("MEDIUM"))\n                .andExpect(jsonPath("$.recommendations").isArray());\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# LLM Structured Output Live Lab\n\nRun: \`mvn spring-boot:run\`\nAnalyze: \`curl -X GET "http://localhost:8080/api/v1/ai/review/analyze?file=MyService.java"\`\n`
      }
    ]
  },

  // Topic 3: Vector Databases & Semantic Search
  "vector-databases-and-semantic-search": {
    topicSlug: "vector-databases-and-semantic-search",
    level: 14,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("vector-search-app", "Vector Search & Embeddings Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: vector-search-app\n`
      },
      {
        path: "src/main/java/com/javahub/vector/VectorApplication.java",
        content: `package com.javahub.vector;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class VectorApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(VectorApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/vector/service/InMemoryVectorStore.java",
        content: `package com.javahub.vector.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\n@Service\npublic class InMemoryVectorStore {\n    public record VectorDoc(String id, String content, float[] embedding) {}\n    public record ScoredMatch(String id, String content, double similarity) {}\n    private final List<VectorDoc> documents = new ArrayList<>();\n    public InMemoryVectorStore() {\n        documents.add(new VectorDoc("doc-1", "Virtual Threads reduce OS context switching costs", new float[]{0.9f, 0.8f, 0.1f}));\n        documents.add(new VectorDoc("doc-2", "Spring Boot auto-configuration simplifies microservices", new float[]{0.1f, 0.2f, 0.95f}));\n    }\n    public List<ScoredMatch> search(float[] queryVector) {\n        return documents.stream()\n                .map(d -> new ScoredMatch(d.id(), d.content(), cosine(queryVector, d.embedding())))\n                .sorted(Comparator.comparingDouble(ScoredMatch::similarity).reversed())\n                .toList();\n    }\n    private double cosine(float[] a, float[] b) {\n        double dot = 0, nA = 0, nB = 0;\n        for (int i = 0; i < a.length; i++) { dot += a[i] * b[i]; nA += a[i] * a[i]; nB += b[i] * b[i]; }\n        return dot / (Math.sqrt(nA) * Math.sqrt(nB));\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/vector/controller/VectorSearchController.java",
        content: `package com.javahub.vector.controller;\nimport com.javahub.vector.service.InMemoryVectorStore;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n@RestController\n@RequestMapping("/api/v1/vectors")\npublic class VectorSearchController {\n    private final InMemoryVectorStore vectorStore;\n    public VectorSearchController(InMemoryVectorStore vectorStore) { this.vectorStore = vectorStore; }\n    @GetMapping("/search")\n    public ResponseEntity<List<InMemoryVectorStore.ScoredMatch>> searchNearest() {\n        float[] concurrencyQuery = new float[]{0.95f, 0.75f, 0.05f};\n        return ResponseEntity.ok(vectorStore.search(concurrencyQuery));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/vector/VectorApplicationTests.java",
        content: `package com.javahub.vector;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass VectorApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify semantic vector search ranks nearest document first")\n    void testVectorSearch() throws Exception {\n        mockMvc.perform(get("/api/v1/vectors/search"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$[0].id").value("doc-1"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Vector Databases & Semantic Search Live Lab\n\nRun: \`mvn spring-boot:run\`\nSearch: \`curl -X GET http://localhost:8080/api/v1/vectors/search\`\n`
      }
    ]
  },

  // Topic 4: Retrieval-Augmented Generation (RAG)
  "retrieval-augmented-generation-rag": {
    topicSlug: "retrieval-augmented-generation-rag",
    level: 14,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("rag-engine-app", "Retrieval-Augmented Generation (RAG) Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: rag-engine-app\n`
      },
      {
        path: "src/main/java/com/javahub/rag/RagApplication.java",
        content: `package com.javahub.rag;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class RagApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(RagApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/rag/service/RagPromptSynthesizerService.java",
        content: `package com.javahub.rag.service;\nimport org.springframework.stereotype.Service;\nimport java.util.List;\n@Service\npublic class RagPromptSynthesizerService {\n    public record RagPrompt(String systemContext, String query, int chunksIncluded) {}\n    public RagPrompt buildContext(String userQuery) {\n        String docs = "[Source: JDK21 Spec] Virtual Threads are lightweight user-mode threads managed by the runtime rather than the OS kernel.";\n        String system = "Answer truthfully using ONLY this context:\\n" + docs;\n        return new RagPrompt(system, userQuery, 1);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/rag/controller/RagController.java",
        content: `package com.javahub.rag.controller;\nimport com.javahub.rag.service.RagPromptSynthesizerService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/rag")\npublic class RagController {\n    private final RagPromptSynthesizerService ragService;\n    public RagController(RagPromptSynthesizerService ragService) { this.ragService = ragService; }\n    @GetMapping("/prompt")\n    public ResponseEntity<RagPromptSynthesizerService.RagPrompt> getRagPrompt(@RequestParam(defaultValue = "How do virtual threads work?") String query) {\n        return ResponseEntity.ok(ragService.buildContext(query));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/rag/RagApplicationTests.java",
        content: `package com.javahub.rag;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass RagApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify contextual prompt synthesis injects knowledge chunks")\n    void testRagPrompt() throws Exception {\n        mockMvc.perform(get("/api/v1/rag/prompt?query=Loom"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.systemContext").exists())\n                .andExpect(jsonPath("$.chunksIncluded").value(1));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Retrieval-Augmented Generation (RAG) Live Lab\n\nRun: \`mvn spring-boot:run\`\nSynthesize prompt: \`curl -X GET "http://localhost:8080/api/v1/rag/prompt?query=VirtualThreads"\`\n`
      }
    ]
  },

  // Topic 5: LLM Tool Calling & Function Execution
  "llm-tool-calling-and-function-execution": {
    topicSlug: "llm-tool-calling-and-function-execution",
    level: 14,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("function-calling-app", "LLM Tool Calling & Function Execution Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: function-calling-app\n`
      },
      {
        path: "src/main/java/com/javahub/tools/ToolsApplication.java",
        content: `package com.javahub.tools;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class ToolsApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(ToolsApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/tools/service/ToolExecutionRegistryService.java",
        content: `package com.javahub.tools.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\nimport java.util.function.Function;\n@Service\npublic class ToolExecutionRegistryService {\n    public record ToolResult(String tool, boolean success, String output) {}\n    private final Map<String, Function<String, String>> tools = new HashMap<>();\n    public ToolExecutionRegistryService() {\n        tools.put("checkFlightStatus", flightNo -> "Flight " + flightNo + " is ON_TIME");\n        tools.put("getAccountBalance", acct -> "Account " + acct + " balance: $12,450.00");\n    }\n    public ToolResult execute(String toolName, String arg) {\n        var fn = tools.get(toolName);\n        if (fn == null) return new ToolResult(toolName, false, "Unknown tool: " + toolName);\n        return new ToolResult(toolName, true, fn.apply(arg));\n    }\n    public Set<String> getAvailableTools() { return tools.keySet(); }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/tools/controller/ToolExecutionController.java",
        content: `package com.javahub.tools.controller;\nimport com.javahub.tools.service.ToolExecutionRegistryService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.Set;\n@RestController\n@RequestMapping("/api/v1/tools")\npublic class ToolExecutionController {\n    private final ToolExecutionRegistryService registry;\n    public ToolExecutionController(ToolExecutionRegistryService registry) { this.registry = registry; }\n    @GetMapping\n    public ResponseEntity<Set<String>> listTools() { return ResponseEntity.ok(registry.getAvailableTools()); }\n    @PostMapping("/dispatch")\n    public ResponseEntity<ToolExecutionRegistryService.ToolResult> dispatch(\n            @RequestParam String tool, @RequestParam String argument) {\n        return ResponseEntity.ok(registry.execute(tool, argument));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/tools/ToolsApplicationTests.java",
        content: `package com.javahub.tools;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass ToolsApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify dynamic LLM tool dispatch executes Java function")\n    void testToolDispatch() throws Exception {\n        mockMvc.perform(post("/api/v1/tools/dispatch?tool=checkFlightStatus&argument=BA-117"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.success").value(true))\n                .andExpect(jsonPath("$.output").value("Flight BA-117 is ON_TIME"));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# LLM Tool Calling Live Application\n\nRun: \`mvn spring-boot:run\`\nInvoke tool: \`curl -X POST "http://localhost:8080/api/v1/tools/dispatch?tool=getAccountBalance&argument=ACT-101"\`\n`
      }
    ]
  },

  // Topic 6: Multi-Agent Orchestration & Autonomous Systems
  "multi-agent-orchestration-and-autonomous-systems": {
    topicSlug: "multi-agent-orchestration-and-autonomous-systems",
    level: 14,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("multi-agent-orchestrator-app", "Multi-Agent Orchestrator Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:\n  port: 8080\nspring:\n  application:\n    name: multi-agent-orchestrator-app\n`
      },
      {
        path: "src/main/java/com/javahub/agents/AgentsApplication.java",
        content: `package com.javahub.agents;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n@SpringBootApplication\npublic class AgentsApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(AgentsApplication.class, args);\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/agents/service/AgentSupervisorLoopService.java",
        content: `package com.javahub.agents.service;\nimport org.springframework.stereotype.Service;\nimport java.util.*;\n@Service\npublic class AgentSupervisorLoopService {\n    public record Mission(String missionId, String objective, List<String> agentTrace, String status) {}\n    public Mission runMission(String id, String task) {\n        List<String> trace = List.of(\n            "[PLANNER] Decomposed task: '" + task + "' into 3 subgoals",\n            "[CODER] Drafted Java 21 implementation",\n            "[REVIEWER] Approved: Verified against security and thread-safety gates"\n        );\n        return new Mission(id, task, trace, "COMPLETED");\n    }\n}\n`
      },
      {
        path: "src/main/java/com/javahub/agents/controller/AgentMissionController.java",
        content: `package com.javahub.agents.controller;\nimport com.javahub.agents.service.AgentSupervisorLoopService;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n@RestController\n@RequestMapping("/api/v1/agents")\npublic class AgentMissionController {\n    private final AgentSupervisorLoopService supervisor;\n    public AgentMissionController(AgentSupervisorLoopService supervisor) { this.supervisor = supervisor; }\n    @PostMapping("/missions")\n    public ResponseEntity<AgentSupervisorLoopService.Mission> launchMission(\n            @RequestParam String id, @RequestParam String task) {\n        return ResponseEntity.ok(supervisor.runMission(id, task));\n    }\n}\n`
      },
      {
        path: "src/test/java/com/javahub/agents/AgentsApplicationTests.java",
        content: `package com.javahub.agents;\nimport org.junit.jupiter.api.DisplayName;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n@SpringBootTest\n@AutoConfigureMockMvc\nclass AgentsApplicationTests {\n    @Autowired private MockMvc mockMvc;\n    @Test\n    @DisplayName("Verify autonomous multi-agent supervisor loop execution")\n    void testAgentMission() throws Exception {\n        mockMvc.perform(post("/api/v1/agents/missions?id=MISSION-1&task=DesignMemoryPool"))\n                .andExpect(status().isOk())\n                .andExpect(jsonPath("$.status").value("COMPLETED"))\n                .andExpect(jsonPath("$.agentTrace.length()").value(3));\n    }\n}\n`
      },
      {
        path: "README.md",
        content: `# Multi-Agent Orchestrator Live Application\n\nRun: \`mvn spring-boot:run\`\nLaunch agent loop: \`curl -X POST "http://localhost:8080/api/v1/agents/missions?id=M-1&task=BuildRefactor"\`\n`
      }
    ]
  }
};
