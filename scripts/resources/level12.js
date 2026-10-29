module.exports = {
  level: 12,
  topics: {
    'docker-and-containerization': {
      className: 'ContainerCgroupDetector',
      description: 'Demonstrates Linux container cgroup memory limits detection and JVM Ergonomics.',
      source: `package io.javahub.level12.dockerandcontainerization;

/**
 * Detects whether the JVM is properly honoring cgroup container memory constraints.
 */
public class ContainerCgroupDetector {

    public record MemorySpec(long maxHeapBytes, int availableProcessors) {}

    public MemorySpec getEffectiveRuntimeLimits() {
        return new MemorySpec(
            Runtime.getRuntime().maxMemory(),
            Runtime.getRuntime().availableProcessors()
        );
    }
}
`,
      test: `package io.javahub.level12.dockerandcontainerization;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ContainerCgroupDetectorTest {

    @Test
    @DisplayName("JVM should detect available cores and heap memory constraints")
    void testContainerDetection() {
        var detector = new ContainerCgroupDetector();
        var spec = detector.getEffectiveRuntimeLimits();

        assertThat(spec.availableProcessors()).isGreaterThan(0);
        assertThat(spec.maxHeapBytes()).isGreaterThan(0L);
    }
}
`
    },

    'google-jib-daemonless-containers': {
      className: 'JibContainerMetadata',
      description: 'Demonstrates Google Jib layer splitting (dependencies, resources, classes) and reproducible timestamps.',
      source: `package io.javahub.level12.googlejibdaemonlesscontainers;

import java.util.List;

/**
 * Models Google Jib reproducible container layer splitting.
 */
public class JibContainerMetadata {

    public List<String> getContainerLayers() {
        return List.of(
            "layer-1: dependencies (cached across all builds)",
            "layer-2: resources (application configuration)",
            "layer-3: classes (frequently modified bytecode)"
        );
    }
}
`,
      test: `package io.javahub.level12.googlejibdaemonlesscontainers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class JibContainerMetadataTest {

    @Test
    @DisplayName("Jib layer strategy should prioritize heavy dependencies for caching")
    void testLayerStrategy() {
        var jib = new JibContainerMetadata();
        assertThat(jib.getContainerLayers()).hasSize(3);
        assertThat(jib.getContainerLayers().get(0)).contains("dependencies");
    }
}
`
    },

    'kubernetes-k8s-for-java-devs': {
      className: 'K8sHealthProbeManager',
      description: 'Demonstrates Kubernetes Liveness, Readiness, and Startup probe state transitions.',
      source: `package io.javahub.level12.kubernetesk8sforjavadevs;

/**
 * Emulates Spring Boot Actuator Kubernetes health probe lifecycle.
 */
public class K8sHealthProbeManager {

    private boolean startupComplete = false;
    private boolean dbReachable = true;

    public void completeStartup() { this.startupComplete = true; }
    public void setDbReachable(boolean reachable) { this.dbReachable = reachable; }

    public boolean isStartupProbeHealthy() { return startupComplete; }
    public boolean isLivenessProbeHealthy() { return startupComplete; } // Fails only on deadlock
    public boolean isReadinessProbeHealthy() { return startupComplete && dbReachable; } // Pulls pod from service endpoints if DB down
}
`,
      test: `package io.javahub.level12.kubernetesk8sforjavadevs;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class K8sHealthProbeManagerTest {

    @Test
    @DisplayName("Readiness probe should fail when database connection drops without killing pod")
    void testK8sProbes() {
        var probes = new K8sHealthProbeManager();
        probes.completeStartup();

        assertThat(probes.isLivenessProbeHealthy()).isTrue();
        assertThat(probes.isReadinessProbeHealthy()).isTrue();

        probes.setDbReachable(false);
        assertThat(probes.isLivenessProbeHealthy()).isTrue(); // Pod NOT killed
        assertThat(probes.isReadinessProbeHealthy()).isFalse(); // Traffic unrouted
    }
}
`
    },

    'helm-package-management-in-k8s': {
      className: 'HelmValuesInterpolator',
      description: 'Demonstrates Helm values.yaml parameter substitution and environment templating.',
      source: `package io.javahub.level12.helmpackagemanagementink8s;

import java.util.Map;

/**
 * Emulates Helm values.yaml parameter interpolation for K8s manifests.
 */
public class HelmValuesInterpolator {

    public String renderDeploymentYaml(String imageTag, int replicaCount) {
        return "replicas: " + replicaCount + "\\n" +
               "containers:\\n" +
               "  - image: javahub/app:" + imageTag;
    }
}
`,
      test: `package io.javahub.level12.helmpackagemanagementink8s;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class HelmValuesInterpolatorTest {

    @Test
    @DisplayName("Should interpolate Helm parameters into deployment manifest template")
    void testHelmTemplate() {
        var helm = new HelmValuesInterpolator();
        String yaml = helm.renderDeploymentYaml("v2.1.0", 3);

        assertThat(yaml).contains("replicas: 3");
        assertThat(yaml).contains("image: javahub/app:v2.1.0");
    }
}
`
    },

    'cloud-native-serverless-java': {
      className: 'SnapStartOptimizationDetector',
      description: 'Demonstrates AWS Lambda SnapStart / Project CRaC checkpoint and restore optimizations.',
      source: `package io.javahub.level12.cloudnativeserverlessjava;

/**
 * Models AWS Lambda SnapStart / CRaC (Coordinated Restore at Checkpoint) initialization.
 */
public class SnapStartOptimizationDetector {

    private boolean preWarmed = false;

    public void beforeCheckpoint() {
        // Pre-warm class loading and database connections prior to snapshot
        this.preWarmed = true;
    }

    public boolean isOptimizedForInstantRestore() {
        return preWarmed;
    }
}
`,
      test: `package io.javahub.level12.cloudnativeserverlessjava;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class SnapStartOptimizationDetectorTest {

    @Test
    @DisplayName("CRaC beforeCheckpoint hook should prewarm runtime before microsecond restore")
    void testSnapStart() {
        var optimizer = new SnapStartOptimizationDetector();
        assertThat(optimizer.isOptimizedForInstantRestore()).isFalse();

        optimizer.beforeCheckpoint();
        assertThat(optimizer.isOptimizedForInstantRestore()).isTrue();
    }
}
`
    },

    'cicd-and-infrastructure-as-code': {
      className: 'CiPipelineQualityGate',
      description: 'Demonstrates CI/CD automated test verification, SonarQube quality gates, and artifact deployment.',
      source: `package io.javahub.level12.cicdandinfrastructureascode;

/**
 * Automated CI/CD pipeline quality gate evaluator.
 */
public class CiPipelineQualityGate {

    public record BuildReport(int totalTests, int failedTests, double codeCoverage) {}

    public boolean passesQualityGate(BuildReport report) {
        return report.failedTests() == 0 && report.codeCoverage() >= 80.0;
    }
}
`,
      test: `package io.javahub.level12.cicdandinfrastructureascode;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class CiPipelineQualityGateTest {

    @Test
    @DisplayName("Quality gate should pass only with 0 failed tests and adequate code coverage")
    void testQualityGate() {
        var gate = new CiPipelineQualityGate();

        var passing = new CiPipelineQualityGate.BuildReport(100, 0, 85.5);
        var failingTests = new CiPipelineQualityGate.BuildReport(100, 1, 90.0);
        var lowCoverage = new CiPipelineQualityGate.BuildReport(100, 0, 65.0);

        assertThat(gate.passesQualityGate(passing)).isTrue();
        assertThat(gate.passesQualityGate(failingTests)).isFalse();
        assertThat(gate.passesQualityGate(lowCoverage)).isFalse();
    }
}
`
    }
  }
};

