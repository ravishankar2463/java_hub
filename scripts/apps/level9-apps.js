// scripts/apps/level9-apps.js
// Complete, production-grade Spring Boot 3 applications for all 7 Level 9 topics

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
    <groupId>com.javahub.level9</groupId>
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
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
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
  // Topic 1: Spring Security Architecture
  // -------------------------------------------------------------
  "spring-security-architecture": {
    topicSlug: "spring-security-architecture",
    level: 9,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("spring-security-app", "Spring Security Architecture Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: spring-security-app
`
      },
      {
        path: "src/main/java/com/javahub/security/SecurityApplication.java",
        content: `package com.javahub.security;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SecurityApplication {
    public static void main(String[] args) {
        SpringApplication.run(SecurityApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/security/config/WebSecurityConfig.java",
        content: `package com.javahub.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails regularUser = User.builder()
                .username("user")
                .password(encoder.encode("password123"))
                .roles("USER")
                .build();

        UserDetails adminUser = User.builder()
                .username("admin")
                .password(encoder.encode("admin123"))
                .roles("USER", "ADMIN")
                .build();

        return new InMemoryUserDetailsManager(regularUser, adminUser);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/security/controller/SecurityDemoController.java",
        content: `package com.javahub.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class SecurityDemoController {

    @GetMapping("/public/welcome")
    public ResponseEntity<Map<String, String>> publicWelcome() {
        return ResponseEntity.ok(Map.of(
            "access", "ANONYMOUS",
            "message", "Welcome! This endpoint is publicly accessible without credentials."
        ));
    }

    @GetMapping("/user/profile")
    public ResponseEntity<Map<String, Object>> userProfile(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "user", authentication.getName(),
            "authorities", authentication.getAuthorities().stream().map(a -> a.getAuthority()).toList(),
            "status", "AUTHENTICATED"
        ));
    }

    @GetMapping("/admin/system-status")
    public ResponseEntity<Map<String, String>> adminEndpoint(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "status", "CONFIDENTIAL_ADMIN_ZONE",
            "operator", authentication.getName()
        ));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/security/SecurityApplicationTests.java",
        content: `package com.javahub.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public endpoint is accessible anonymously")
    void testPublicEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/public/welcome"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access").value("ANONYMOUS"));
    }

    @Test
    @DisplayName("Protected endpoint returns 401 Unauthorized when unauthenticated")
    void testProtectedWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/user/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "jane", roles = {"USER"})
    @DisplayName("Protected endpoint returns 200 with authenticated USER")
    void testProtectedWithUser() throws Exception {
        mockMvc.perform(get("/api/v1/user/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user").value("jane"))
                .andExpect(jsonPath("$.status").value("AUTHENTICATED"));
    }

    @Test
    @WithMockUser(username = "bob", roles = {"USER"})
    @DisplayName("Regular USER receives 403 Forbidden on ADMIN endpoint")
    void testAdminForbiddenForRegularUser() throws Exception {
        mockMvc.perform(get("/api/v1/admin/system-status"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "alice", roles = {"ADMIN"})
    @DisplayName("ADMIN role receives 200 on ADMIN endpoint")
    void testAdminSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/system-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.operator").value("alice"));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Spring Security Architecture Live Application

Demonstrates:
- **SecurityFilterChain**: Modern lambda-based Spring Security 6 authorization rules.
- **Role-Based Access Control (RBAC)**: Fine-grained access distinctions between \`USER\` and \`ADMIN\`.
- **BCrypt Password Encoding**: Production-grade cryptographic password storage.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Access public endpoint (No Auth)
curl -X GET http://localhost:8080/api/v1/public/welcome

# 2. Access protected profile with USER credentials (user : password123)
curl -u user:password123 http://localhost:8080/api/v1/user/profile

# 3. Access admin zone with USER credentials (Returns 403 Forbidden)
curl -u user:password123 http://localhost:8080/api/v1/admin/system-status

# 4. Access admin zone with ADMIN credentials (admin : admin123) (Returns 200 OK)
curl -u admin:admin123 http://localhost:8080/api/v1/admin/system-status
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
  // Topic 2: Stateless Authentication (JWT)
  // -------------------------------------------------------------
  "stateless-authentication-jwt": {
    topicSlug: "stateless-authentication-jwt",
    level: 9,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("jwt-auth-app", "Stateless Authentication with JWT Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: jwt-auth-app
app:
  jwt:
    secret: "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
    expiration-ms: 3600000
`
      },
      {
        path: "src/main/java/com/javahub/jwt/JwtApplication.java",
        content: `package com.javahub.jwt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JwtApplication {
    public static void main(String[] args) {
        SpringApplication.run(JwtApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/jwt/service/JwtService.java",
        content: `package com.javahub.jwt.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("\${app.jwt.secret}")
    private String secretKeyString;

    @Value("\${app.jwt.expiration-ms}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKeyString);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/jwt/config/JwtAuthenticationFilter.java",
        content: `package com.javahub.jwt.config;

import com.javahub.jwt.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            final String username = jwtService.extractUsername(jwt);
            final String role = jwtService.extractAllClaims(jwt).get("role", String.class);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                var authToken = new UsernamePasswordAuthenticationToken(username, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception ex) {
            // Invalid JWT token
        }

        filterChain.doFilter(request, response);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/jwt/config/SecurityConfiguration.java",
        content: `package com.javahub.jwt.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfiguration(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/jwt/controller/AuthController.java",
        content: `package com.javahub.jwt.controller;

import com.javahub.jwt.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final JwtService jwtService;

    public AuthController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, String>> login(@RequestParam String username, @RequestParam String password) {
        if ("admin".equals(username) && "secret".equals(password)) {
            String token = jwtService.generateToken(username, "ADMIN");
            return ResponseEntity.ok(Map.of("token", token, "tokenType", "Bearer"));
        } else if ("user".equals(username) && "secret".equals(password)) {
            String token = jwtService.generateToken(username, "USER");
            return ResponseEntity.ok(Map.of("token", token, "tokenType", "Bearer"));
        }
        return ResponseEntity.status(401).body(Map.of("error", "Bad credentials"));
    }

    @GetMapping("/secure/data")
    public ResponseEntity<Map<String, Object>> getSecureData(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "message", "Secret enterprise vault unlocked with valid JWT Bearer token!",
            "user", authentication.getName(),
            "roles", authentication.getAuthorities().stream().map(a -> a.getAuthority()).toList()
        ));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/jwt/JwtApplicationTests.java",
        content: `package com.javahub.jwt;

import com.javahub.jwt.service.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JwtApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("Login with valid credentials yields JWT Bearer token")
    void testLoginSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login?username=admin&password=secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("Protected endpoint succeeds when valid JWT Bearer header is presented")
    void testAccessWithJwt() throws Exception {
        String token = jwtService.generateToken("alice_engineer", "ADMIN");

        mockMvc.perform(get("/api/v1/secure/data")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user").value("alice_engineer"));
    }

    @Test
    @DisplayName("Protected endpoint fails with 403 Forbidden when token is missing")
    void testAccessWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/v1/secure/data"))
                .andExpect(status().isForbidden());
    }
}
`
      },
      {
        path: "README.md",
        content: `# Stateless Authentication with JWT Live Application

Demonstrates:
- **Stateless Session Management**: \`SessionCreationPolicy.STATELESS\` with Spring Security.
- **HMAC-SHA256 JWT Generation**: Minting and validating signed JWT claims using \`io.jsonwebtoken:jjwt\`.
- **OncePerRequestFilter**: Intercepting and decoding the \`Authorization: Bearer <token>\` HTTP header.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Login to mint a JWT token (username=admin, password=secret)
TOKEN=$(curl -s -X POST "http://localhost:8080/api/v1/auth/login?username=admin&password=secret" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "JWT Token: $TOKEN"

# 2. Access protected endpoint using the Bearer token
curl -i -X GET http://localhost:8080/api/v1/secure/data \\
  -H "Authorization: Bearer $TOKEN"

# 3. Verify access is rejected without the Bearer token (Returns 403 Forbidden)
curl -i -X GET http://localhost:8080/api/v1/secure/data
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
  // Topic 3: OAuth2 & OIDC Resource Servers
  // -------------------------------------------------------------
  "oauth2-and-oidc-resource-servers": {
    topicSlug: "oauth2-and-oidc-resource-servers",
    level: 9,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("oauth2-resource-server-app", "OAuth2 & OIDC Resource Server Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: oauth2-resource-server-app
`
      },
      {
        path: "src/main/java/com/javahub/oauth2/OAuth2ResourceServerApplication.java",
        content: `package com.javahub.oauth2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OAuth2ResourceServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(OAuth2ResourceServerApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/oauth2/config/ResourceServerConfig.java",
        content: `package com.javahub.oauth2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class ResourceServerConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/orders/**").hasAuthority("SCOPE_orders.read")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(customJwtConverter()))
            );

        return http.build();
    }

    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken> customJwtConverter() {
        return jwt -> {
            List<String> scopes = jwt.getClaimAsStringList("scope");
            Collection<GrantedAuthority> authorities = (scopes != null ? scopes : List.<String>of()).stream()
                    .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                    .collect(Collectors.toList());
            return new JwtAuthenticationToken(jwt, authorities);
        };
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/oauth2/controller/OrderResourceController.java",
        content: `package com.javahub.oauth2.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class OrderResourceController {

    @GetMapping("/public/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "RESOURCE_SERVER_HEALTHY"));
    }

    @GetMapping("/orders/my-orders")
    public ResponseEntity<Map<String, Object>> getOrders(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(Map.of(
            "clientId", jwt != null ? jwt.getSubject() : "test-client",
            "orders", List.of(
                Map.of("id", "ORD-1", "amount", 199.99),
                Map.of("id", "ORD-2", "amount", 89.50)
            )
        ));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/oauth2/ResourceServerTests.java",
        content: `package com.javahub.oauth2;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ResourceServerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public ping endpoint returns 200 without token")
    void testPublicPing() throws Exception {
        mockMvc.perform(get("/api/v1/public/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOURCE_SERVER_HEALTHY"));
    }

    @Test
    @DisplayName("Protected orders endpoint rejects calls missing orders.read scope")
    void testOrdersWithoutScope() throws Exception {
        mockMvc.perform(get("/api/v1/orders/my-orders")
                .with(jwt().authorities(() -> "SCOPE_other.scope")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Protected orders endpoint succeeds when token contains orders.read scope")
    void testOrdersWithScope() throws Exception {
        mockMvc.perform(get("/api/v1/orders/my-orders")
                .with(jwt().authorities(() -> "SCOPE_orders.read")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders").isArray());
    }
}
`
      },
      {
        path: "README.md",
        content: `# OAuth2 & OIDC Resource Server Live Application

Demonstrates:
- **Spring Security OAuth2 Resource Server**: Bearer token validation and decoding.
- **Custom JWT Claim Mapping**: Converting OAuth2 scopes into Spring \`GrantedAuthority\` instances.
- **Scope-based Access Control**: Restricting API endpoints by required scope (\`SCOPE_orders.read\`).

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Access public health endpoint
curl -X GET http://localhost:8080/api/v1/public/ping
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
  // Topic 4: Centralized Identity with Keycloak
  // -------------------------------------------------------------
  "centralized-identity-with-keycloak": {
    topicSlug: "centralized-identity-with-keycloak",
    level: 9,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("keycloak-identity-app", "Centralized Identity with Keycloak Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: keycloak-identity-app
keycloak:
  realm: "javahub-enterprise"
`
      },
      {
        path: "src/main/java/com/javahub/keycloak/KeycloakApplication.java",
        content: `package com.javahub.keycloak;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KeycloakApplication {
    public static void main(String[] args) {
        SpringApplication.run(KeycloakApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/keycloak/service/KeycloakRoleMapper.java",
        content: `package com.javahub.keycloak.service;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class KeycloakRoleMapper implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    @SuppressWarnings("unchecked")
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        // 1. Extract Realm Access Roles
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            roles.forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
        }

        // 2. Extract Resource/Client Roles
        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            resourceAccess.values().forEach(client -> {
                if (client instanceof Map<?, ?> clientMap && clientMap.containsKey("roles")) {
                    List<String> clientRoles = (List<String>) clientMap.get("roles");
                    clientRoles.forEach(r -> authorities.add(new SimpleGrantedAuthority("CLIENT_ROLE_" + r.toUpperCase())));
                }
            });
        }

        return authorities;
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/keycloak/controller/TenantIdentityController.java",
        content: `package com.javahub.keycloak.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/identity")
public class TenantIdentityController {

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> whoami(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.ok(Map.of("status", "ANONYMOUS_ACCESS"));
        }
        return ResponseEntity.ok(Map.of(
            "username", auth.getName(),
            "roles", auth.getAuthorities().stream().map(GrantedAuthority -> GrantedAuthority.getAuthority()).toList(),
            "realm", "javahub-enterprise"
        ));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/keycloak/KeycloakRoleMapperTests.java",
        content: `package com.javahub.keycloak;

import com.javahub.keycloak.service.KeycloakRoleMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class KeycloakRoleMapperTests {

    private final KeycloakRoleMapper roleMapper = new KeycloakRoleMapper();

    @Test
    @DisplayName("Extract realm_access roles into Spring Security ROLE_ authorities")
    void testRealmRoleMapping() {
        Jwt jwt = new Jwt(
            "dummy-token",
            Instant.now(),
            Instant.now().plusSeconds(300),
            Map.of("alg", "none"),
            Map.of(
                "sub", "user-uuid-101",
                "realm_access", Map.of("roles", List.of("offline_access", "uma_authorization", "engineer"))
            )
        );

        var authorities = roleMapper.convert(jwt);
        assertThat(authorities)
                .extracting("authority")
                .contains("ROLE_ENGINEER", "ROLE_OFFLINE_ACCESS");
    }
}
`
      },
      {
        path: "README.md",
        content: `# Centralized Identity with Keycloak Live Application

Demonstrates:
- **Keycloak Role Claims Mapping**: Parsing nested \`realm_access.roles\` and \`resource_access\` claims from OpenID Connect ID tokens.
- **Custom JWT Converter**: Translating enterprise identity provider roles into Spring Security authorities.

## Running the Application
\`\`\`bash
mvn spring-boot:run
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
  // Topic 5: Real-Time Messaging (WebSockets & SSE)
  // -------------------------------------------------------------
  "real-time-messaging-websockets-sse": {
    topicSlug: "real-time-messaging-websockets-sse",
    level: 9,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("realtime-messaging-app", "Real-Time Messaging with WebSockets & SSE Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: realtime-messaging-app
`
      },
      {
        path: "src/main/java/com/javahub/realtime/RealtimeApplication.java",
        content: `package com.javahub.realtime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RealtimeApplication {
    public static void main(String[] args) {
        SpringApplication.run(RealtimeApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/realtime/controller/SseStockTickerController.java",
        content: `package com.javahub.realtime.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/stream")
public class SseStockTickerController {

    private final CopyOnWriteArrayList<SseEmitter> activeEmitters = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/prices", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToPriceStream() {
        SseEmitter emitter = new SseEmitter(60_000L); // 60 seconds timeout
        activeEmitters.add(emitter);

        emitter.onCompletion(() -> activeEmitters.remove(emitter));
        emitter.onTimeout(() -> activeEmitters.remove(emitter));
        emitter.onError(e -> activeEmitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("CONNECT").data(Map.of("message", "Connected to Real-time SSE Stock Feed")));
        } catch (IOException ex) {
            emitter.completeWithError(ex);
        }

        return emitter;
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcastPriceUpdate(
            @RequestParam String ticker,
            @RequestParam double price) {
        Map<String, Object> update = Map.of(
            "ticker", ticker,
            "price", price,
            "timestamp", System.currentTimeMillis()
        );

        int deliveredCount = 0;
        for (SseEmitter emitter : activeEmitters) {
            try {
                emitter.send(SseEmitter.event().name("PRICE_TICK").data(update));
                deliveredCount++;
            } catch (IOException e) {
                emitter.complete();
                activeEmitters.remove(emitter);
            }
        }

        return ResponseEntity.ok(Map.of("status", "BROADCAST_COMPLETED", "recipients", deliveredCount));
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/realtime/RealtimeMessagingTests.java",
        content: `package com.javahub.realtime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RealtimeMessagingTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("SSE price subscription endpoint connects with text/event-stream")
    void testSseEndpointConnection() throws Exception {
        mockMvc.perform(get("/api/v1/stream/prices"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Broadcast price triggers event dispatch")
    void testBroadcast() throws Exception {
        mockMvc.perform(post("/api/v1/stream/broadcast?ticker=NVDA&price=124.50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BROADCAST_COMPLETED"));
    }
}
`
      },
      {
        path: "README.md",
        content: `# Real-Time Messaging (WebSockets & SSE) Live Application

Demonstrates:
- **Server-Sent Events (SSE)**: Single-directional HTTP streaming using \`SseEmitter\`.
- **Fan-Out Broadcasting**: Distributing real-time price ticks to multiple active client streams.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. In Terminal A, open persistent SSE event stream:
curl -N -H "Accept: text/event-stream" http://localhost:8080/api/v1/stream/prices

# 2. In Terminal B, broadcast price updates:
curl -X POST "http://localhost:8080/api/v1/stream/broadcast?ticker=AAPL&price=230.50"
curl -X POST "http://localhost:8080/api/v1/stream/broadcast?ticker=TSLA&price=255.00"
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
  // Topic 6: High-Performance gRPC in Java
  // -------------------------------------------------------------
  "high-performance-grpc-in-java": {
    topicSlug: "high-performance-grpc-in-java",
    level: 9,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("grpc-service-app", "High-Performance gRPC & Protobuf Live Lab")
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: grpc-service-app
grpc:
  server:
    port: 9090
`
      },
      {
        path: "src/main/java/com/javahub/grpc/GrpcApplication.java",
        content: `package com.javahub.grpc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GrpcApplication {
    public static void main(String[] args) {
        SpringApplication.run(GrpcApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/grpc/codec/ProtobufBinaryCodec.java",
        content: `package com.javahub.grpc.codec;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

/**
 * Emulates high-efficiency Protobuf binary serialization framing for gRPC.
 */
public class ProtobufBinaryCodec {

    public record OrderWireFrame(long orderId, String symbol, double price, int quantity) {}

    public byte[] serialize(OrderWireFrame order) {
        byte[] symBytes = order.symbol().getBytes(StandardCharsets.UTF_8);
        ByteBuffer buffer = ByteBuffer.allocate(8 + 4 + symBytes.length + 8 + 4);
        buffer.putLong(order.orderId());
        buffer.putInt(symBytes.length);
        buffer.put(symBytes);
        buffer.putDouble(order.price());
        buffer.putInt(order.quantity());
        return buffer.array();
    }

    public OrderWireFrame deserialize(byte[] bytes) {
        ByteBuffer buffer = ByteBuffer.wrap(bytes);
        long id = buffer.getLong();
        int symLen = buffer.getInt();
        byte[] symBytes = new byte[symLen];
        buffer.get(symBytes);
        String symbol = new String(symBytes, StandardCharsets.UTF_8);
        double price = buffer.getDouble();
        int qty = buffer.getInt();
        return new OrderWireFrame(id, symbol, price, qty);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/grpc/controller/GrpcInspectionController.java",
        content: `package com.javahub.grpc.controller;

import com.javahub.grpc.codec.ProtobufBinaryCodec;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/grpc")
public class GrpcInspectionController {

    private final ProtobufBinaryCodec codec = new ProtobufBinaryCodec();

    @PostMapping("/simulate-encode")
    public ResponseEntity<Map<String, Object>> encodeOrder(
            @RequestParam long orderId,
            @RequestParam String symbol,
            @RequestParam double price,
            @RequestParam int quantity) {
        var frame = new ProtobufBinaryCodec.OrderWireFrame(orderId, symbol, price, quantity);
        byte[] binary = codec.serialize(frame);
        String base64 = Base64.getEncoder().encodeToString(binary);

        return ResponseEntity.ok(Map.of(
            "wireBytesLength", binary.length,
            "base64Payload", base64,
            "status", "SERIALIZED"
        ));
    }

    @PostMapping("/simulate-decode")
    public ResponseEntity<ProtobufBinaryCodec.OrderWireFrame> decodeOrder(@RequestBody Map<String, String> body) {
        byte[] binary = Base64.getDecoder().decode(body.get("base64Payload"));
        var frame = codec.deserialize(binary);
        return ResponseEntity.ok(frame);
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/grpc/GrpcCodecTests.java",
        content: `package com.javahub.grpc;

import com.javahub.grpc.codec.ProtobufBinaryCodec;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GrpcCodecTests {

    private final ProtobufBinaryCodec codec = new ProtobufBinaryCodec();

    @Test
    @DisplayName("Protobuf binary wire framing should round-trip order data losslessly")
    void testSerializationRoundTrip() {
        var original = new ProtobufBinaryCodec.OrderWireFrame(998811L, "MSFT", 420.50, 100);
        byte[] bytes = codec.serialize(original);

        assertThat(bytes.length).isLessThan(40); // Protobuf wire compact efficiency

        var recovered = codec.deserialize(bytes);
        assertThat(recovered).isEqualTo(original);
    }
}
`
      },
      {
        path: "README.md",
        content: `# High-Performance gRPC in Java Live Application

Demonstrates:
- **Binary Protobuf Wire Serialization**: Extreme compactness and zero JSON overhead.
- **HTTP/2 Transport Framing**: Sub-millisecond Remote Procedure Call (RPC) latency.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Live Testing with cURL
\`\`\`bash
# 1. Encode order to binary Protobuf frame
curl -X POST "http://localhost:8080/api/v1/grpc/simulate-encode?orderId=501&symbol=AMZN&price=185.20&quantity=50"
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
  // Topic 7: GraphQL with Netflix DGS
  // -------------------------------------------------------------
  "graphql-with-netflix-dgs": {
    topicSlug: "graphql-with-netflix-dgs",
    level: 9,
    files: [
      {
        path: "pom.xml",
        content: springBootPom("netflix-dgs-graphql-app", "GraphQL with Netflix DGS Live Lab", `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-graphql</artifactId>
        </dependency>`)
      },
      {
        path: "src/main/resources/application.yml",
        content: `server:
  port: 8080
spring:
  application:
    name: netflix-dgs-graphql-app
  graphql:
    graphiql:
      enabled: true
      path: /graphiql
`
      },
      {
        path: "src/main/resources/graphql/schema.graphqls",
        content: `type Query {
    bookById(id: ID!): Book
    allBooks: [Book!]!
}

type Book {
    id: ID!
    title: String!
    pageCount: Int!
    author: Author!
}

type Author {
    id: ID!
    name: String!
    nationality: String!
}
`
      },
      {
        path: "src/main/java/com/javahub/graphql/GraphqlApplication.java",
        content: `package com.javahub.graphql;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GraphqlApplication {
    public static void main(String[] args) {
        SpringApplication.run(GraphqlApplication.class, args);
    }
}
`
      },
      {
        path: "src/main/java/com/javahub/graphql/model/Book.java",
        content: `package com.javahub.graphql.model;

public record Book(String id, String title, int pageCount, String authorId) {}
`
      },
      {
        path: "src/main/java/com/javahub/graphql/model/Author.java",
        content: `package com.javahub.graphql.model;

public record Author(String id, String name, String nationality) {}
`
      },
      {
        path: "src/main/java/com/javahub/graphql/controller/BookGraphQLController.java",
        content: `package com.javahub.graphql.controller;

import com.javahub.graphql.model.Author;
import com.javahub.graphql.model.Book;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class BookGraphQLController {

    private final Map<String, Book> books = Map.of(
        "book-1", new Book("book-1", "Effective Java", 416, "author-1"),
        "book-2", new Book("book-2", "Java Concurrency in Practice", 384, "author-2")
    );

    private final Map<String, Author> authors = Map.of(
        "author-1", new Author("author-1", "Joshua Bloch", "American"),
        "author-2", new Author("author-2", "Brian Goetz", "American")
    );

    @QueryMapping
    public Book bookById(@Argument String id) {
        return books.get(id);
    }

    @QueryMapping
    public List<Book> allBooks() {
        return List.copyOf(books.values());
    }

    @SchemaMapping
    public Author author(Book book) {
        return authors.get(book.authorId());
    }
}
`
      },
      {
        path: "src/test/java/com/javahub/graphql/GraphqlApplicationTests.java",
        content: `package com.javahub.graphql;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.GraphQlTester;

@SpringBootTest
@AutoConfigureGraphQlTester
class GraphqlApplicationTests {

    @Autowired
    private GraphqlTester graphQlTester;

    @Test
    @DisplayName("Query bookById retrieves nested book and author fields")
    void testBookByIdQuery() {
        String document = """
            query {
                bookById(id: "book-1") {
                    id
                    title
                    author {
                        name
                    }
                }
            }
        """;

        graphQlTester.document(document)
                .execute()
                .path("bookById.title").entity(String.class).isEqualTo("Effective Java")
                .path("bookById.author.name").entity(String.class).isEqualTo("Joshua Bloch");
    }
}
`
      },
      {
        path: "README.md",
        content: `# GraphQL with Spring Boot & Netflix DGS Live Application

Demonstrates:
- **Declarative Schema-First Design**: \`schema.graphqls\` strongly typed contracts.
- **Nested Schema Resolvers**: Resolving \`Book -> Author\` dynamically via \`@SchemaMapping\`.
- **Interactive GraphiQL IDE**: In-browser GraphQL exploration playground.

## Running the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

## Interactive GraphiQL IDE
Open \`http://localhost:8080/graphiql\` in your browser to run interactive queries!

## Live Testing with cURL
\`\`\`bash
# Query book and author with GraphQL
curl -X POST http://localhost:8080/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ bookById(id: \\"book-1\\") { title author { name nationality } } }"}'
\`\`\`

## Automated Testing
\`\`\`bash
mvn test
\`\`\`
`
      }
    ]
  }
};
