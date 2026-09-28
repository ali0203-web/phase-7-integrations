/**
 * Metrics Collector
 * Real-time metrics per workflow for monitoring dashboard
 * Phase 7c: Enables production-grade observability
 */

class MetricsCollector {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.alertThresholds = {
      latency: 250,  // ms
      errorRate: 1,  // %
      lowConfidence: 0.70,
      highEscalation: 25  // %
    };
  }

  /**
   * Record decision metric
   */
  recordDecision(workflow, decision) {
    const key = `workflow:${workflow}`;

    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        decisionsPerHour: 0,
        confidence: 0,
        escalationRate: 0,
        avgLatency: 0,
        errorCount: 0
      });
    }

    const metric = this.metrics.get(key);
    metric.decisionsPerHour++;
    metric.avgLatency = (metric.avgLatency + decision.latency) / 2;

    if (decision.escalated) {
      metric.escalationRate = (metric.escalationRate + 1) / 2;
    }

    // Check alerts
    this.checkAlerts(workflow, decision);
  }

  /**
   * Check if metrics exceed alert thresholds
   */
  private checkAlerts(workflow, decision) {
    if (decision.latency > this.alertThresholds.latency) {
      this.alerts.push({
        workflow,
        type: 'HIGH_LATENCY',
        value: decision.latency,
        threshold: this.alertThresholds.latency,
        timestamp: new Date().toISOString()
      });
    }

    if (decision.confidence < this.alertThresholds.lowConfidence) {
      this.alerts.push({
        workflow,
        type: 'LOW_CONFIDENCE',
        value: decision.confidence,
        threshold: this.alertThresholds.lowConfidence,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get metrics for dashboard
   */
  getDashboardMetrics() {
    const workflows = [];

    for (const [key, metric] of this.metrics.entries()) {
      workflows.push({
        name: key.replace('workflow:', ''),
        decisionsPerHour: metric.decisionsPerHour,
        avgLatency: Math.round(metric.avgLatency),
        escalationRate: Math.round(metric.escalationRate * 100),
        status: this.getWorkflowStatus(metric)
      });
    }

    return {
      workflows: workflows.sort((a, b) => b.decisionsPerHour - a.decisionsPerHour),
      alerts: this.alerts.slice(-10),  // Recent alerts
      totalDecisions: Array.from(this.metrics.values()).reduce((sum, m) => sum + m.decisionsPerHour, 0)
    };
  }

  private getWorkflowStatus(metric) {
    if (metric.escalationRate > this.alertThresholds.highEscalation) return 'warning';
    if (metric.avgLatency > this.alertThresholds.latency) return 'warning';
    return 'healthy';
  }
}

module.exports = MetricsCollector;
