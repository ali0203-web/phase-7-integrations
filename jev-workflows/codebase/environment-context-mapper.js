/**
 * Environment Context Mapper
 * Maps environment factors that affect test flakiness
 * Phase 7a: Identifies environment-related test failures
 */

class EnvironmentContextMapper {
  constructor() {
    this.contextFactors = [
      'os', 'os_version', 'node_version', 'browser', 'browser_version',
      'parallel_workers', 'network_latency', 'disk_space', 'memory',
      'timezone', 'time_of_day', 'day_of_week', 'ci_provider'
    ];
  }

  /**
   * Extract environment context from test run
   */
  extractContext(testRun) {
    return {
      os: testRun.os || 'unknown',
      nodeVersion: testRun.node_version || 'unknown',
      browser: testRun.browser || null,
      parallelWorkers: testRun.parallel_workers || 1,
      networkLatency: testRun.network_latency || null,
      memory: testRun.memory_usage || null,
      timezone: testRun.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeOfDay: this.extractTimeOfDay(testRun.timestamp),
      dayOfWeek: this.extractDayOfWeek(testRun.timestamp),
      ciProvider: testRun.ci_provider || 'unknown',
      networkConditions: testRun.network || 'normal'
    };
  }

  /**
   * Correlate failures with environment factors
   */
  correlateFailures(runs) {
    const failuresByEnv = new Map();

    runs.forEach(run => {
      if (!run.passed) {
        const context = this.extractContext(run);
        const key = JSON.stringify(context);

        if (!failuresByEnv.has(key)) {
          failuresByEnv.set(key, { context, count: 0, runs: [] });
        }

        const entry = failuresByEnv.get(key);
        entry.count++;
        entry.runs.push(run);
      }
    });

    return Array.from(failuresByEnv.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)  // top 5 problematic environments
      .map(entry => ({
        ...entry,
        correlation: entry.count / runs.length
      }));
  }

  /**
   * Check if current failure is environment-related
   */
  isEnvironmentRelated(currentRun, historicalFailures) {
    const currentContext = this.extractContext(currentRun);
    const problematicEnvs = this.correlateFailures(historicalFailures);

    for (const env of problematicEnvs) {
      if (this.contextsMatch(currentContext, env.context, 0.8)) {
        return { isEnvRelated: true, confidence: env.correlation, environment: env.context };
      }
    }

    return { isEnvRelated: false, confidence: 0, environment: currentContext };
  }

  /**
   * Generate environment-specific recommendations
   */
  generateRecommendations(testRun, historicalData) {
    const context = this.extractContext(testRun);
    const suggestions = [];

    // Node version issues
    if (this.hasVersionIssues(context.nodeVersion, historicalData)) {
      suggestions.push(`Node ${context.nodeVersion} has known issues - consider upgrading`);
    }

    // Parallel execution issues
    if (context.parallelWorkers > 4) {
      suggestions.push(`High parallel workers (${context.parallelWorkers}) - may cause flakiness`);
    }

    // Network issues
    if (context.networkLatency && context.networkLatency > 100) {
      suggestions.push(`High network latency (${context.networkLatency}ms) - add timeouts or retry logic`);
    }

    // Memory issues
    if (context.memory && context.memory > 80) {
      suggestions.push(`High memory usage (${context.memory}%) - may cause timeouts`);
    }

    // OS-specific
    if (context.os === 'windows' && historicalData.some(r => r.os === 'windows' && !r.passed)) {
      suggestions.push(`Windows environment: Check for path separators or line ending issues`);
    }

    return suggestions;
  }

  // Private methods
  extractTimeOfDay(timestamp) {
    if (!timestamp) return 'unknown';
    const hour = new Date(timestamp).getHours();
    if (hour >= 22 || hour < 6) return 'night';
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  }

  extractDayOfWeek(timestamp) {
    if (!timestamp) return 'unknown';
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      new Date(timestamp).getDay()
    ];
  }

  contextsMatch(context1, context2, threshold) {
    let matches = 0;
    let total = 0;

    for (const key of this.contextFactors) {
      if (context1[key] !== undefined && context2[key] !== undefined) {
        total++;
        if (context1[key] === context2[key]) matches++;
      }
    }

    return total === 0 ? false : (matches / total) >= threshold;
  }

  hasVersionIssues(version, historicalData) {
    if (!historicalData) return false;
    const failures = historicalData.filter(r => r.node_version === version && !r.passed);
    const total = historicalData.filter(r => r.node_version === version).length;
    return total > 0 && (failures.length / total) > 0.5;
  }
}

module.exports = EnvironmentContextMapper;
