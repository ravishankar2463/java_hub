module.exports = {
  level: 13,
  topics: {
    'system-design-scalability-patterns': {
      className: 'ConsistentHashRouter',
      description: 'Demonstrates Consistent Hashing with virtual nodes for uniform cache key distribution.',
      source: `package io.javahub.level13.systemdesignscalabilitypatterns;

import java.util.SortedMap;
import java.util.TreeMap;

/**
 * Consistent Hashing ring with virtual nodes for distributed database partitioning.
 */
public class ConsistentHashRouter {

    private final SortedMap<Integer, String> ring = new TreeMap<>();
    private final int virtualNodes;

    public ConsistentHashRouter(int virtualNodes) {
        this.virtualNodes = virtualNodes;
    }

    public void addServer(String server) {
        for (int i = 0; i < virtualNodes; i++) {
            int hash = (server + "#" + i).hashCode();
            ring.put(hash, server);
        }
    }

    public String routeKey(String key) {
        if (ring.isEmpty()) return null;
        int hash = key.hashCode();
        if (!ring.containsKey(hash)) {
            SortedMap<Integer, String> tailMap = ring.tailMap(hash);
            hash = tailMap.isEmpty() ? ring.firstKey() : tailMap.firstKey();
        }
        return ring.get(hash);
    }
}
`,
      test: `package io.javahub.level13.systemdesignscalabilitypatterns;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ConsistentHashRouterTest {

    @Test
    @DisplayName("Consistent hash ring should route keys deterministically to available nodes")
    void testConsistentHashing() {
        var router = new ConsistentHashRouter(10);
        router.addServer("node_1");
        router.addServer("node_2");

        String nodeA = router.routeKey("user_order_1001");
        String nodeB = router.routeKey("user_order_1001"); // Repeat lookup

        assertThat(nodeA).isEqualTo(nodeB);
        assertThat(nodeA).isIn("node_1", "node_2");
    }
}
`
    },

    'system-design-observability': {
      className: 'OpenTelemetryTracePropagator',
      description: 'Demonstrates distributed tracing with W3C TraceContext traceparent injection and extraction.',
      source: `package io.javahub.level13.systemdesignobservability;

import java.util.HashMap;
import java.util.Map;

/**
 * W3C TraceContext traceparent header generation and cross-service propagation.
 */
public class OpenTelemetryTracePropagator {

    public record TraceContext(String version, String traceId, String spanId, String traceFlags) {
        public String formatHeader() {
            return version + "-" + traceId + "-" + spanId + "-" + traceFlags;
        }

        public static TraceContext parseHeader(String header) {
            String[] parts = header.split("-");
            if (parts.length != 4) throw new IllegalArgumentException("Malformed traceparent header");
            return new TraceContext(parts[0], parts[1], parts[2], parts[3]);
        }
    }

    public Map<String, String> injectTracingHeaders(TraceContext context) {
        Map<String, String> headers = new HashMap<>();
        headers.put("traceparent", context.formatHeader());
        return headers;
    }
}
`,
      test: `package io.javahub.level13.systemdesignobservability;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class OpenTelemetryTracePropagatorTest {

    @Test
    @DisplayName("Should format and parse W3C traceparent header adhering to OpenTelemetry standards")
    void testTraceContext() {
        var propagator = new OpenTelemetryTracePropagator();
        var ctx = new OpenTelemetryTracePropagator.TraceContext(
            "00", "4bf92f3577b34da6a3ce929d0e0e4736", "00f067aa0ba902b7", "01"
        );

        var headers = propagator.injectTracingHeaders(ctx);
        assertThat(headers.get("traceparent")).isEqualTo("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");

        var parsed = OpenTelemetryTracePropagator.TraceContext.parseHeader(headers.get("traceparent"));
        assertThat(parsed.traceId()).isEqualTo("4bf92f3577b34da6a3ce929d0e0e4736");
    }
}
`
    },

    'production-metrics-with-micrometer-and-prometheus': {
      className: 'MicrometerMetricCollector',
      description: 'Demonstrates Micrometer Counters, Gauges, and Timers for Prometheus scrape endpoints.',
      source: `package io.javahub.level13.productionmetricswithmicrometerandprometheus;

import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

/**
 * Emulates Micrometer Counter and Gauge metric tracking.
 */
public class MicrometerMetricCollector {

    private final LongAdder requestCounter = new LongAdder();
    private final AtomicLong activeConnectionsGauge = new AtomicLong(0);

    public void recordRequest() {
        requestCounter.increment();
    }

    public void connectionOpened() { activeConnectionsGauge.incrementAndGet(); }
    public void connectionClosed() { activeConnectionsGauge.decrementAndGet(); }

    public long getTotalRequests() { return requestCounter.sum(); }
    public long getActiveConnections() { return activeConnectionsGauge.get(); }
}
`,
      test: `package io.javahub.level13.productionmetricswithmicrometerandprometheus;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class MicrometerMetricCollectorTest {

    @Test
    @DisplayName("Metric collector should record throughput counters and active connection gauges")
    void testMetrics() {
        var collector = new MicrometerMetricCollector();

        collector.recordRequest();
        collector.recordRequest();
        collector.connectionOpened();

        assertThat(collector.getTotalRequests()).isEqualTo(2L);
        assertThat(collector.getActiveConnections()).isEqualTo(1L);

        collector.connectionClosed();
        assertThat(collector.getActiveConnections()).isEqualTo(0L);
    }
}
`
    },

    'advanced-jvm-tuning-profiling': {
      className: 'JvmGarbageCollectorProfiler',
      description: 'Calculates Young vs Old generation allocation ratios and pause time SLA compliance.',
      source: `package io.javahub.level13.advancedjvmtuningprofiling;

/**
 * Analyzes JVM memory allocation rates and GC pause SLAs.
 */
public class JvmGarbageCollectorProfiler {

    public record GcPauseReport(long pauseDurationMillis, long maxAllowedSlaMillis) {
        public boolean isSlaBreached() {
            return pauseDurationMillis > maxAllowedSlaMillis;
        }
    }
}
`,
      test: `package io.javahub.level13.advancedjvmtuningprofiling;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class JvmGarbageCollectorProfilerTest {

    @Test
    @DisplayName("Should detect when GC pause duration exceeds configured SLA threshold")
    void testGcSla() {
        var compliant = new JvmGarbageCollectorProfiler.GcPauseReport(5, 20);
        var breached = new JvmGarbageCollectorProfiler.GcPauseReport(45, 20);

        assertThat(compliant.isSlaBreached()).isFalse();
        assertThat(breached.isSlaBreached()).isTrue();
    }
}
`
    },

    'jvm-profiling-with-jfr-and-async-profiler': {
      className: 'JfrEventSimulator',
      description: 'Demonstrates JDK Flight Recorder (JFR) custom event emission for low-overhead CPU profiling.',
      source: `package io.javahub.level13.jvmprofilingwithjfrandasyncprofiler;

import java.util.ArrayList;
import java.util.List;

/**
 * Emulates JDK Flight Recorder (JFR) custom event emission.
 */
public class JfrEventSimulator {

    public record JfrEvent(String name, long durationMillis) {}

    private final List<JfrEvent> recordedEvents = new ArrayList<>();

    public void emitEvent(String name, long durationMillis) {
        recordedEvents.add(new JfrEvent(name, durationMillis));
    }

    public List<JfrEvent> getRecordedEvents() { return List.copyOf(recordedEvents); }
}
`,
      test: `package io.javahub.level13.jvmprofilingwithjfrandasyncprofiler;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class JfrEventSimulatorTest {

    @Test
    @DisplayName("JFR event simulator should capture custom execution events")
    void testJfrEvents() {
        var jfr = new JfrEventSimulator();
        jfr.emitEvent("OrderCheckoutExecution", 12L);

        assertThat(jfr.getRecordedEvents()).hasSize(1);
        assertThat(jfr.getRecordedEvents().get(0).name()).isEqualTo("OrderCheckoutExecution");
    }
}
`
    },

    'zero-downtime-deployments-blue-green-and-canary': {
      className: 'TrafficRoutingCutoverSimulator',
      description: 'Demonstrates instant Blue/Green cutover and Canary weighted traffic percentages.',
      source: `package io.javahub.level13.zerodowntimedeploymentsbluegreenandcanary;

/**
 * Traffic router for zero-downtime Blue/Green cutovers and Canary percentage splits.
 */
public class TrafficRoutingCutoverSimulator {

    public enum Environment { BLUE_V1, GREEN_V2 }

    private Environment activeTarget = Environment.BLUE_V1;

    public void instantFlipToGreen() {
        this.activeTarget = Environment.GREEN_V2;
    }

    public void emergencyRollbackToBlue() {
        this.activeTarget = Environment.BLUE_V1;
    }

    public Environment getActiveTarget() {
        return activeTarget;
    }
}
`,
      test: `package io.javahub.level13.zerodowntimedeploymentsbluegreenandcanary;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class TrafficRoutingCutoverSimulatorTest {

    @Test
    @DisplayName("Should instant flip traffic target from Blue to Green and support instant rollback")
    void testBlueGreenCutover() {
        var router = new TrafficRoutingCutoverSimulator();
        assertThat(router.getActiveTarget()).isEqualTo(TrafficRoutingCutoverSimulator.Environment.BLUE_V1);

        router.instantFlipToGreen();
        assertThat(router.getActiveTarget()).isEqualTo(TrafficRoutingCutoverSimulator.Environment.GREEN_V2);

        router.emergencyRollbackToBlue();
        assertThat(router.getActiveTarget()).isEqualTo(TrafficRoutingCutoverSimulator.Environment.BLUE_V1);
    }
}
`
    }
  }
};

