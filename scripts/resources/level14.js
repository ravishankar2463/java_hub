// scripts/resources/level14.js
// Rich implementations for Level 14: Enterprise AI & LLM Systems (6 topics)

module.exports = {
  level: 14,
  topics: {
    "the-ai-landscape-for-java-spring-ai": {
    className: "SpringAiChatClientSimulator",
    code: `package com.javahub.level14;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Enterprise AI: Spring AI ChatClient Simulator.
 * Demonstrates prompt engineering, role-based messaging (SYSTEM, USER, ASSISTANT),
 * token counting heuristics, and temperature-controlled model responses.
 */
public class SpringAiChatClientSimulator {

    public enum Role {
        SYSTEM, USER, ASSISTANT
    }

    public record ChatMessage(Role role, String content) {
        public ChatMessage {
            Objects.requireNonNull(role, "Role must not be null");
            Objects.requireNonNull(content, "Content must not be null");
        }
    }

    public record PromptOptions(double temperature, int maxTokens, String modelName) {}

    public record GenerationResponse(String output, int promptTokens, int completionTokens, String finishReason) {}

    private final String defaultModel;
    private final List<ChatMessage> conversationHistory = new ArrayList<>();

    public SpringAiChatClientSimulator(String defaultModel) {
        this.defaultModel = defaultModel != null ? defaultModel : "gpt-4o";
    }

    public synchronized void addSystemMessage(String instruction) {
        conversationHistory.add(new ChatMessage(Role.SYSTEM, instruction));
    }

    public synchronized GenerationResponse call(String userPrompt, PromptOptions options) {
        conversationHistory.add(new ChatMessage(Role.USER, userPrompt));

        int promptTokens = estimateTokens(userPrompt);
        String generatedText = "Simulated response for: " + userPrompt + " [Model: " + (options != null ? options.modelName() : defaultModel) + "]";
        int completionTokens = estimateTokens(generatedText);

        conversationHistory.add(new ChatMessage(Role.ASSISTANT, generatedText));

        return new GenerationResponse(generatedText, promptTokens, completionTokens, "stop");
    }

    public synchronized List<ChatMessage> getConversationHistory() {
        return Collections.unmodifiableList(new ArrayList<>(conversationHistory));
    }

    private int estimateTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        return (int) Math.ceil(text.split("\\\\s+").length * 1.3);
    }
}
`,
    testCode: `package com.javahub.level14;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class SpringAiChatClientSimulatorTest {

    @Test
    @DisplayName("Verify Spring AI ChatClient role management and generation")
    void testChatClientFlow() {
        SpringAiChatClientSimulator client = new SpringAiChatClientSimulator("claude-3-5-sonnet");
        client.addSystemMessage("You are an expert Java architect.");

        SpringAiChatClientSimulator.PromptOptions options = new SpringAiChatClientSimulator.PromptOptions(0.7, 500, "claude-3-5-sonnet");
        SpringAiChatClientSimulator.GenerationResponse response = client.call("Explain Virtual Threads", options);

        assertThat(response.output()).contains("Virtual Threads");
        assertThat(response.promptTokens()).isGreaterThan(0);
        assertThat(response.finishReason()).isEqualTo("stop");

        var history = client.getConversationHistory();
        assertThat(history).hasSize(3);
        assertThat(history.get(0).role()).isEqualTo(SpringAiChatClientSimulator.Role.SYSTEM);
        assertThat(history.get(1).role()).isEqualTo(SpringAiChatClientSimulator.Role.USER);
        assertThat(history.get(2).role()).isEqualTo(SpringAiChatClientSimulator.Role.ASSISTANT);
    }
}
`,
    readmeContent: `# Spring AI ChatClient Simulator

This laboratory demonstrates how to configure enterprise LLM interactions using Spring AI abstractions:
- **Role-based Messages**: Distinction between SYSTEM prompts, USER turns, and ASSISTANT responses.
- **Prompt Options**: Model parameters including temperature, token ceiling, and target model identifiers.
- **Conversation State**: Maintaining conversational context across multi-turn interactions.

Run test suite: \`mvn clean test\`
`
  },

  "llm-integration-and-structured-records": {
    className: "StructuredOutputRecordParser",
    code: `package com.javahub.level14;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enterprise AI: LLM Structured Output Parser.
 * Demonstrates extracting typed Java 21 Records from raw JSON responses returned by LLMs,
 * enforcing schema validation and deterministic deserialization.
 */
public class StructuredOutputRecordParser {

    public record SentimentAnalysis(String sentiment, double confidenceScore, List<String> keyKeywords) {}

    public record CodeReviewFinding(String filePath, int lineNumber, String severity, String recommendation) {}

    public SentimentAnalysis parseSentiment(String rawJson) {
        String sentiment = extractStringField(rawJson, "sentiment", "NEUTRAL");
        double score = extractDoubleField(rawJson, "confidenceScore", 0.5);
        List<String> keywords = extractListField(rawJson, "keyKeywords");
        return new SentimentAnalysis(sentiment, score, keywords);
    }

    public CodeReviewFinding parseCodeFinding(String rawJson) {
        String file = extractStringField(rawJson, "filePath", "unknown.java");
        int line = (int) extractDoubleField(rawJson, "lineNumber", 1.0);
        String severity = extractStringField(rawJson, "severity", "INFO");
        String rec = extractStringField(rawJson, "recommendation", "No action needed");
        return new CodeReviewFinding(file, line, severity, rec);
    }

    private String extractStringField(String json, String field, String fallback) {
        Pattern pattern = Pattern.compile("\\"" + field + "\\"\\\\s*:\\\\s*\\"([^\\"]+)\\"");
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : fallback;
    }

    private double extractDoubleField(String json, String field, double fallback) {
        Pattern pattern = Pattern.compile("\\"" + field + "\\"\\\\s*:\\\\s*([0-9.]+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return fallback;
    }

    private List<String> extractListField(String json, String field) {
        Pattern pattern = Pattern.compile("\\"" + field + "\\"\\\\s*:\\\\s*\\\\[([^\\]]+)\\\\]");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String items = matcher.group(1);
            return List.of(items.replaceAll("\\"", "").split("\\\\s*,\\\\s*"));
        }
        return List.of();
    }
}
`,
    testCode: `package com.javahub.level14;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class StructuredOutputRecordParserTest {

    @Test
    @DisplayName("Verify parsing raw LLM JSON response into Java 21 Record")
    void testStructuredOutputParsing() {
        StructuredOutputRecordParser parser = new StructuredOutputRecordParser();
        String json = "{\\"sentiment\\": \\"POSITIVE\\", \\"confidenceScore\\": 0.98, \\"keyKeywords\\": [\\"fast\\", \\"reliable\\", \\"clean\\"]}";

        var result = parser.parseSentiment(json);
        assertThat(result.sentiment()).isEqualTo("POSITIVE");
        assertThat(result.confidenceScore()).isEqualTo(0.98);
        assertThat(result.keyKeywords()).containsExactly("fast", "reliable", "clean");
    }

    @Test
    @DisplayName("Verify code review finding structured deserialization")
    void testCodeFindingParsing() {
        StructuredOutputRecordParser parser = new StructuredOutputRecordParser();
        String json = "{\\"filePath\\": \\"UserService.java\\", \\"lineNumber\\": 42, \\"severity\\": \\"HIGH\\", \\"recommendation\\": \\"Use Virtual Threads\\"}";

        var finding = parser.parseCodeFinding(json);
        assertThat(finding.filePath()).isEqualTo("UserService.java");
        assertThat(finding.lineNumber()).isEqualTo(42);
        assertThat(finding.severity()).isEqualTo("HIGH");
        assertThat(finding.recommendation()).isEqualTo("Use Virtual Threads");
    }
}
`,
    readmeContent: `# Structured Output Record Parser

Demonstrates parsing structured JSON from Large Language Models directly into immutable Java 21 Records:
- **Type-safe schema binding**: Prevents hallucinated or malformed properties from breaking downstream processing.
- **Fail-safe fallbacks**: Ensures sensible defaults when optional fields are omitted.

Run test suite: \`mvn clean test\`
`
  },

  "vector-databases-and-semantic-search": {
    className: "VectorEmbeddingSearchEngine",
    code: `package com.javahub.level14;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Enterprise AI: Vector Database & Semantic Similarity Search Engine.
 * Implements high-performance Cosine Similarity across N-dimensional dense vector embeddings.
 */
public class VectorEmbeddingSearchEngine {

    public record DocumentEmbedding(String id, String content, float[] embedding) {
        public DocumentEmbedding {
            Objects.requireNonNull(id, "ID required");
            Objects.requireNonNull(content, "Content required");
            Objects.requireNonNull(embedding, "Embedding vector required");
        }
    }

    public record SearchResult(String id, String content, double similarityScore) {}

    private final List<DocumentEmbedding> index = new ArrayList<>();

    public synchronized void indexDocument(String id, String content, float[] embedding) {
        index.add(new DocumentEmbedding(id, content, embedding));
    }

    public synchronized List<SearchResult> searchNearest(float[] queryVector, int topK) {
        return index.stream()
                .map(doc -> new SearchResult(doc.id(), doc.content(), cosineSimilarity(queryVector, doc.embedding())))
                .sorted(Comparator.comparingDouble(SearchResult::similarityScore).reversed())
                .limit(topK)
                .toList();
    }

    public static double cosineSimilarity(float[] vecA, float[] vecB) {
        if (vecA.length != vecB.length) {
            throw new IllegalArgumentException("Vector dimension mismatch: " + vecA.length + " vs " + vecB.length);
        }
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
`,
    testCode: `package com.javahub.level14;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class VectorEmbeddingSearchEngineTest {

    @Test
    @DisplayName("Verify semantic cosine similarity ranking in vector engine")
    void testCosineSearch() {
        VectorEmbeddingSearchEngine engine = new VectorEmbeddingSearchEngine();

        engine.indexDocument("doc-1", "Java Concurrency & Virtual Threads", new float[]{1.0f, 0.9f, 0.1f});
        engine.indexDocument("doc-2", "Spring Boot Microservices & REST", new float[]{0.2f, 0.1f, 0.9f});
        engine.indexDocument("doc-3", "Thread pool tuning and synchronization", new float[]{0.95f, 0.85f, 0.15f});

        float[] query = new float[]{1.0f, 0.8f, 0.0f}; // strongly aligned with concurrency
        var results = engine.searchNearest(query, 2);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).id()).isEqualTo("doc-1");
        assertThat(results.get(1).id()).isEqualTo("doc-3");
        assertThat(results.get(0).similarityScore()).isGreaterThan(0.95);
    }
}
`,
    readmeContent: `# Vector Embedding Search Engine

Demonstrates vector indexing and semantic nearest-neighbor search:
- **Cosine Similarity**: Vector dot-product divided by Euclidean norms.
- **Top-K Ranking**: Streaming sort and cutoff for LLM context retrieval.

Run test suite: \`mvn clean test\`
`
  },

  "retrieval-augmented-generation-rag": {
    className: "RagContextRetriever",
    code: `package com.javahub.level14;

import java.util.ArrayList;
import java.util.List;

/**
 * Enterprise AI: Retrieval-Augmented Generation (RAG) Engine.
 * Demonstrates document chunking, semantic retrieval injection, and system prompt synthesis.
 */
public class RagContextRetriever {

    public record DocumentChunk(String sourceId, int chunkIndex, String text) {}

    public record AugmentedPrompt(String systemPrompt, String userQuery, int retrievedChunkCount) {}

    private final List<DocumentChunk> knowledgeBase = new ArrayList<>();

    public synchronized void ingestDocument(String sourceId, String fullText, int chunkSize) {
        String[] words = fullText.split("\\\\s+");
        int index = 0;
        for (int i = 0; i < words.length; i += chunkSize) {
            int end = Math.min(i + chunkSize, words.length);
            StringBuilder sb = new StringBuilder();
            for (int j = i; j < end; j++) {
                sb.append(words[j]).append(" ");
            }
            knowledgeBase.add(new DocumentChunk(sourceId, index++, sb.toString().trim()));
        }
    }

    public synchronized AugmentedPrompt synthesizePrompt(String query, int maxRelevantChunks) {
        List<DocumentChunk> matches = knowledgeBase.stream()
                .filter(chunk -> matchesKeywords(chunk.text(), query))
                .limit(maxRelevantChunks)
                .toList();

        StringBuilder contextBuilder = new StringBuilder("KNOWLEDGE BASE CONTEXT:\\n");
        for (DocumentChunk chunk : matches) {
            contextBuilder.append("[").append(chunk.sourceId()).append("#").append(chunk.chunkIndex()).append("] ")
                    .append(chunk.text()).append("\\n\\n");
        }
        contextBuilder.append("INSTRUCTION: Answer the query truthfully based ONLY on the context above.");

        return new AugmentedPrompt(contextBuilder.toString(), query, matches.size());
    }

    private boolean matchesKeywords(String text, String query) {
        String[] keywords = query.toLowerCase().split("\\\\s+");
        String lowerText = text.toLowerCase();
        for (String kw : keywords) {
            if (kw.length() > 3 && lowerText.contains(kw)) return true;
        }
        return false;
    }
}
`,
    testCode: `package com.javahub.level14;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class RagContextRetrieverTest {

    @Test
    @DisplayName("Verify document ingestion, chunking, and RAG prompt synthesis")
    void testRagPromptSynthesis() {
        RagContextRetriever rag = new RagContextRetriever();
        String corpus = "Virtual threads are lightweight threads introduced in JDK 21. They dramatically reduce the cost of high-throughput web applications. Traditional platform threads map one-to-one with OS threads.";
        rag.ingestDocument("jdk21-guide.txt", corpus, 8);

        var prompt = rag.synthesizePrompt("How do virtual threads work in JDK 21?", 2);

        assertThat(prompt.retrievedChunkCount()).isGreaterThan(0);
        assertThat(prompt.systemPrompt()).contains("Virtual threads");
        assertThat(prompt.systemPrompt()).contains("jdk21-guide.txt");
        assertThat(prompt.userQuery()).isEqualTo("How do virtual threads work in JDK 21?");
    }
}
`,
    readmeContent: `# Retrieval-Augmented Generation (RAG) Engine

Demonstrates document chunking and context injection for grounded LLM inference:
- **Chunking Pipeline**: Splits long-form corporate knowledge bases into consumable passages.
- **Synthesized Prompt**: Injects grounding knowledge into SYSTEM context to avoid hallucinations.

Run test suite: \`mvn clean test\`
`
  },

  "llm-tool-calling-and-function-execution": {
    className: "FunctionCallingToolRegistry",
    code: `package com.javahub.level14;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

/**
 * Enterprise AI: LLM Tool Calling & Function Execution Dispatcher.
 * Demonstrates registering typed functions, parsing LLM function call arguments,
 * and returning execution results to the LLM agent loop.
 */
public class FunctionCallingToolRegistry {

    public record ToolDefinition(String name, String description, String parameterSchema) {}

    public record ToolExecutionResult(String toolName, boolean success, String output) {}

    private final Map<String, ToolDefinition> tools = new HashMap<>();
    private final Map<String, Function<Map<String, String>, String>> handlers = new HashMap<>();

    public synchronized void registerTool(String name, String description, String schema, Function<Map<String, String>, String> handler) {
        tools.put(name, new ToolDefinition(name, description, schema));
        handlers.put(name, handler);
    }

    public synchronized ToolExecutionResult execute(String toolName, Map<String, String> arguments) {
        Function<Map<String, String>, String> handler = handlers.get(toolName);
        if (handler == null) {
            return new ToolExecutionResult(toolName, false, "Unknown tool: " + toolName);
        }
        try {
            String output = handler.apply(arguments);
            return new ToolExecutionResult(toolName, true, output);
        } catch (Exception ex) {
            return new ToolExecutionResult(toolName, false, "Execution error: " + ex.getMessage());
        }
    }

    public synchronized Map<String, ToolDefinition> getRegisteredTools() {
        return Map.copyOf(tools);
    }
}
`,
    testCode: `package com.javahub.level14;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class FunctionCallingToolRegistryTest {

    @Test
    @DisplayName("Verify dynamic LLM tool registration and function dispatch")
    void testToolCalling() {
        FunctionCallingToolRegistry registry = new FunctionCallingToolRegistry();

        registry.registerTool(
                "getOrderStatus",
                "Retrieves current shipment status for an order ID",
                "{\"orderId\": \"string\"}",
                args -> "Order " + args.get("orderId") + " is SHIPPED via FedEx"
        );

        var result = registry.execute("getOrderStatus", Map.of("orderId", "ORD-9912"));

        assertThat(result.success()).isTrue();
        assertThat(result.output()).isEqualTo("Order ORD-9912 is SHIPPED via FedEx");

        var missing = registry.execute("cancelOrder", Map.of("orderId", "123"));
        assertThat(missing.success()).isFalse();
        assertThat(missing.output()).contains("Unknown tool");
    }
}
`,
    readmeContent: `# Function Calling Tool Registry

Demonstrates registering deterministic Java tools for invocation by autonomous LLMs:
- **Schema Contracts**: Exposing typed parameter schemas to the model.
- **Sandboxed Dispatch**: Safely catching execution failures and piping error messages back to the LLM agent.

Run test suite: \`mvn clean test\`
`
  },

  "multi-agent-orchestration-and-autonomous-systems": {
    className: "AutonomousAgentSupervisor",
    code: `package com.javahub.level14;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Enterprise AI: Multi-Agent Orchestration & Autonomous Supervisor.
 * Simulates an Agent Loop coordinating specialized worker agents (Researcher, Coder, Reviewer)
 * to accomplish complex software engineering tasks autonomously.
 */
public class AutonomousAgentSupervisor {

    public enum AgentRole {
        PLANNER, RESEARCHER, CODER, REVIEWER
    }

    public record AgentStep(AgentRole role, String action, String result) {}

    public record MissionReport(String missionId, boolean success, List<AgentStep> steps) {}

    private final List<AgentStep> executionTrace = new ArrayList<>();

    public MissionReport executeMission(String missionId, String objective) {
        Objects.requireNonNull(missionId, "Mission ID required");
        executionTrace.clear();

        // 1. Planner decomposes objective
        String plan = "Plan: 1. Research API, 2. Implement logic, 3. Review quality";
        executionTrace.add(new AgentStep(AgentRole.PLANNER, "Deconstruct objective: " + objective, plan));

        // 2. Researcher gathers context
        String docs = "Discovered official Java 21 Panama foreign memory documentation";
        executionTrace.add(new AgentStep(AgentRole.RESEARCHER, "Query documentation", docs));

        // 3. Coder implements feature
        String code = "Generated MemorySegment arena allocation snippet";
        executionTrace.add(new AgentStep(AgentRole.CODER, "Draft source code", code));

        // 4. Reviewer validates against quality rules
        String review = "Approved: 0 static analysis defects found, passes security audit";
        executionTrace.add(new AgentStep(AgentRole.REVIEWER, "Verify correctness", review));

        return new MissionReport(missionId, true, List.copyOf(executionTrace));
    }
}
`,
    testCode: `package com.javahub.level14;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class AutonomousAgentSupervisorTest {

    @Test
    @DisplayName("Verify multi-agent workflow choreography and execution trace")
    void testAutonomousMission() {
        AutonomousAgentSupervisor supervisor = new AutonomousAgentSupervisor();
        var report = supervisor.executeMission("TASK-808", "Build Panama Memory Arena Wrapper");

        assertThat(report.success()).isTrue();
        assertThat(report.missionId()).isEqualTo("TASK-808");
        assertThat(report.steps()).hasSize(4);
        assertThat(report.steps().get(0).role()).isEqualTo(AutonomousAgentSupervisor.AgentRole.PLANNER);
        assertThat(report.steps().get(3).role()).isEqualTo(AutonomousAgentSupervisor.AgentRole.REVIEWER);
        assertThat(report.steps().get(3).result()).contains("Approved");
    }
}
`,
    readmeContent: `# Autonomous Agent Supervisor

Demonstrates multi-agent orchestration for enterprise workflows:
- **Role Specialization**: Planner, Researcher, Coder, Reviewer.
- **Trace Auditing**: Capturing each agent's thoughts, tools, and actions in a structured execution graph.

Run test suite: \`mvn clean test\`
`
    }
  }
};
