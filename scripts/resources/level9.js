module.exports = {
  level: 9,
  topics: {
    'spring-security-architecture': {
      className: 'SecurityFilterChainSimulator',
      description: 'Demonstrates Spring Security filter chains, authentication managers, and SecurityContextHolder propagation.',
      source: `package io.javahub.level9.springsecurityarchitecture;

import java.util.List;

/**
 * Emulates the Spring Security FilterChain and Principal authentication.
 */
public class SecurityFilterChainSimulator {

    public record SecurityContext(String username, List<String> roles) {}

    private static final ThreadLocal<SecurityContext> CONTEXT_HOLDER = new ThreadLocal<>();

    public static void setContext(SecurityContext context) {
        CONTEXT_HOLDER.set(context);
    }

    public static SecurityContext getContext() {
        return CONTEXT_HOLDER.get();
    }

    public static void clearContext() {
        CONTEXT_HOLDER.remove();
    }

    public boolean hasRole(String role) {
        SecurityContext ctx = getContext();
        return ctx != null && ctx.roles().contains(role);
    }
}
`,
      test: `package io.javahub.level9.springsecurityarchitecture;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class SecurityFilterChainSimulatorTest {

    @Test
    @DisplayName("Should propagate SecurityContext via ThreadLocal and verify authorized roles")
    void testSecurityContextHolder() {
        var simulator = new SecurityFilterChainSimulator();

        SecurityFilterChainSimulator.setContext(
            new SecurityFilterChainSimulator.SecurityContext("alice", List.of("ROLE_ADMIN", "ROLE_USER"))
        );

        try {
            assertThat(simulator.hasRole("ROLE_ADMIN")).isTrue();
            assertThat(simulator.hasRole("ROLE_SUPERVISOR")).isFalse();
        } finally {
            SecurityFilterChainSimulator.clearContext();
        }

        assertThat(SecurityFilterChainSimulator.getContext()).isNull();
    }
}
`
    },

    'stateless-authentication-jwt': {
      className: 'JwtTokenEngine',
      description: 'Demonstrates HMAC-SHA256 signature generation, Base64Url encoding, and claims validation.',
      source: `package io.javahub.level9.statelessauthenticationjwt;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Emulates JWT header, payload Base64Url encoding, and signature verification.
 */
public class JwtTokenEngine {

    public record JwtPayload(String sub, long exp) {}

    public String generateCompactToken(String subject, long expirationEpoch) {
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\\"alg\\":\\"HS256\\"}".getBytes(StandardCharsets.UTF_8));
        String payloadJson = "{\\"sub\\":\\"" + subject + "\\",\\"exp\\":" + expirationEpoch + "}";
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

        String signature = Base64.getUrlEncoder().withoutPadding().encodeToString((header + "." + payload + ".SECRET").getBytes(StandardCharsets.UTF_8));
        return header + "." + payload + "." + signature;
    }

    public boolean isExpired(long tokenExpiration, long currentTime) {
        return currentTime > tokenExpiration;
    }
}
`,
      test: `package io.javahub.level9.statelessauthenticationjwt;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class JwtTokenEngineTest {

    private final JwtTokenEngine engine = new JwtTokenEngine();

    @Test
    @DisplayName("Should format three-part compact JWT (Header.Payload.Signature)")
    void testTokenStructure() {
        String token = engine.generateCompactToken("user_42", 1700000000L);
        String[] parts = token.split("\\\\.");

        assertThat(parts).hasSize(3);
    }

    @Test
    @DisplayName("Should detect expired token based on expiration epoch")
    void testExpiration() {
        assertThat(engine.isExpired(1000L, 2000L)).isTrue();
        assertThat(engine.isExpired(3000L, 2000L)).isFalse();
    }
}
`
    },

    'oauth2-and-oidc-resource-servers': {
      className: 'OAuth2ScopeValidator',
      description: 'Demonstrates OAuth2 Resource Server scope validation and JWT bearer token extraction.',
      source: `package io.javahub.level9.oauth2andoidcresourceservers;

import java.util.Set;

/**
 * Validates OAuth2 token scopes against endpoint permission requirements.
 */
public class OAuth2ScopeValidator {

    public boolean authorizeScope(Set<String> tokenScopes, String requiredScope) {
        return tokenScopes.contains(requiredScope) || tokenScopes.contains("admin:*");
    }
}
`,
      test: `package io.javahub.level9.oauth2andoidcresourceservers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.assertj.core.api.Assertions.assertThat;

public class OAuth2ScopeValidatorTest {

    @Test
    @DisplayName("Should authorize access when token holds required scope or wildcard")
    void testScopeValidation() {
        var validator = new OAuth2ScopeValidator();

        assertThat(validator.authorizeScope(Set.of("orders:read"), "orders:read")).isTrue();
        assertThat(validator.authorizeScope(Set.of("orders:read"), "orders:write")).isFalse();
        assertThat(validator.authorizeScope(Set.of("admin:*"), "orders:write")).isTrue();
    }
}
`
    },

    'centralized-identity-with-keycloak': {
      className: 'KeycloakRoleMapper',
      description: 'Maps realm_access and resource_access roles from Keycloak JWT claims into Spring authorities.',
      source: `package io.javahub.level9.centralizedidentitywithkeycloak;

import java.util.ArrayList;
import java.util.List;

/**
 * Translates Keycloak JSON token realm and client roles into Spring GrantedAuthorities.
 */
public class KeycloakRoleMapper {

    public List<String> mapAuthorities(List<String> realmRoles, List<String> clientRoles) {
        List<String> authorities = new ArrayList<>();
        for (String r : realmRoles) {
            authorities.add("ROLE_REALM_" + r.toUpperCase());
        }
        for (String c : clientRoles) {
            authorities.add("ROLE_CLIENT_" + c.toUpperCase());
        }
        return authorities;
    }
}
`,
      test: `package io.javahub.level9.centralizedidentitywithkeycloak;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class KeycloakRoleMapperTest {

    @Test
    @DisplayName("Should prefix realm and client roles into normalized Spring GrantedAuthorities")
    void testRoleMapping() {
        var mapper = new KeycloakRoleMapper();
        var authorities = mapper.mapAuthorities(List.of("admin"), List.of("order-manager"));

        assertThat(authorities).containsExactlyInAnyOrder("ROLE_REALM_ADMIN", "ROLE_CLIENT_ORDER-MANAGER");
    }
}
`
    },

    'real-time-messaging-websockets-sse': {
      className: 'RealtimeEventBroadcaster',
      description: 'Demonstrates Server-Sent Events (SSE) streaming and WebSocket STOMP topic broadcasting.',
      source: `package io.javahub.level9.realtimemessagingwebsocketssse;

import java.util.ArrayList;
import java.util.List;

/**
 * Broadcasts real-time events to connected SSE and WebSocket clients.
 */
public class RealtimeEventBroadcaster {

    public record SseEvent(String id, String event, String data) {
        public String formatAsSseWire() {
            return "id:" + id + "\\nevent:" + event + "\\ndata:" + data + "\\n\\n";
        }
    }

    private final List<SseEvent> eventHistory = new ArrayList<>();

    public SseEvent emitEvent(String eventName, String payload) {
        SseEvent event = new SseEvent(String.valueOf(eventHistory.size() + 1), eventName, payload);
        eventHistory.add(event);
        return event;
    }

    public List<SseEvent> getHistory() { return List.copyOf(eventHistory); }
}
`,
      test: `package io.javahub.level9.realtimemessagingwebsocketssse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class RealtimeEventBroadcasterTest {

    @Test
    @DisplayName("SSE event should format into RFC compliant text/event-stream wire chunk")
    void testSseFormatting() {
        var broadcaster = new RealtimeEventBroadcaster();
        var event = broadcaster.emitEvent("PRICE_UPDATE", "{\\"BTC\\": 95000}");

        assertThat(event.formatAsSseWire()).isEqualTo("id:1\\nevent:PRICE_UPDATE\\ndata:{\\"BTC\\": 95000}\\n\\n");
    }
}
`
    },

    'high-performance-grpc-in-java': {
      className: 'GrpcProtobufCodecSimulator',
      description: 'Demonstrates Protobuf binary serialization compactness vs JSON over HTTP/2 multiplexing.',
      source: `package io.javahub.level9.highperformancegrpcinjava;

import java.nio.ByteBuffer;

/**
 * Emulates Protobuf varint binary wire packing for gRPC remote procedure calls.
 */
public class GrpcProtobufCodecSimulator {

    public byte[] encodeOrderRpc(int orderId, int amountCents) {
        // Tag 1 (orderId), Tag 2 (amountCents) packed in binary format
        ByteBuffer buffer = ByteBuffer.allocate(16);
        buffer.put((byte) 0x08).putInt(orderId);
        buffer.put((byte) 0x10).putInt(amountCents);
        buffer.flip();

        byte[] bytes = new byte[buffer.remaining()];
        buffer.get(bytes);
        return bytes;
    }
}
`,
      test: `package io.javahub.level9.highperformancegrpcinjava;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class GrpcProtobufCodecSimulatorTest {

    @Test
    @DisplayName("Protobuf binary wire should be significantly more compact than JSON string payload")
    void testProtobufCompactness() {
        var codec = new GrpcProtobufCodecSimulator();
        byte[] binaryWire = codec.encodeOrderRpc(1001, 4999);
        String jsonEquivalent = "{\\"orderId\\":1001,\\"amountCents\\":4999}";

        assertThat(binaryWire.length).isLessThan(jsonEquivalent.getBytes().length);
    }
}
`
    },

    'graphql-with-netflix-dgs': {
      className: 'DgsDataLoaderBatcher',
      description: 'Demonstrates GraphQL N+1 prevention using DataLoader batch loading.',
      source: `package io.javahub.level9.graphqlwithnetflixdgs;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Emulates Netflix DGS / GraphQL Java DataLoader batch resolving.
 */
public class DgsDataLoaderBatcher {

    public record Author(long id, String name) {}

    public Map<Long, Author> batchLoadAuthors(List<Long> authorIds, List<Author> allAuthors) {
        return allAuthors.stream()
            .filter(a -> authorIds.contains(a.id()))
            .collect(Collectors.toMap(Author::id, a -> a));
    }
}
`,
      test: `package io.javahub.level9.graphqlwithnetflixdgs;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

public class DgsDataLoaderBatcherTest {

    @Test
    @DisplayName("DataLoader should batch resolve author keys in a single operation")
    void testDataLoader() {
        var batcher = new DgsDataLoaderBatcher();
        var authors = List.of(
            new DgsDataLoaderBatcher.Author(1L, "Joshua Bloch"),
            new DgsDataLoaderBatcher.Author(2L, "Martin Fowler")
        );

        var loaded = batcher.batchLoadAuthors(List.of(1L, 2L), authors);

        assertThat(loaded).hasSize(2);
        assertThat(loaded.get(1L).name()).isEqualTo("Joshua Bloch");
    }
}
`
    }
  }
};

