/**
 * Flaky Test History Cache
 * Maintains 90-day failure history for flakiness detection
 * Phase 7a: Provides historical patterns for accurate diagnosis
 */

class FlakyTestHistoryCache {
  constructor(days = 90) {
    this.retentionDays = days;
    this.cache = new Map();
    this.minSamples = 10;
  }

  /**
   * Get failure history for a test
   */
  async getTestHistory(testName, repoName) {
    const key = `${repoName}:${testName}`;
    let history = this.cache.get(key);

    if (!history || this.isStale(history)) {
      history = await this.fetchFromDatabase(testName, repoName);
      this.cache.set(key, history);
    }

    return history;
  }

  /**
   * Analyze flakiness probability
   */
  analyzeFlakiness(testName, repoName, testHistory) {
    if (!testHistory || testHistory.runs.length < this.minSamples) {
      return { isFlaky: false, confidence: 0.5, samples: testHistory?.runs?.length || 0 };
    }

    const passed = testHistory.runs.filter(r => r.passed).length;
    const total = testHistory.runs.length;
    const passRate = passed / total;

    // Flaky if pass rate between 50-99%
    const isFlaky = passRate > 0.50 && passRate < 0.99;

    return {
      isFlaky,
      passRate,
      failureRate: 1 - passRate,
      samples: total,
      lastFailure: testHistory.runs.find(r => !r.passed)?.timestamp,
      failurePeriod: this.analyzeFailurePeriod(testHistory.runs),
      confidence: Math.min(passRate, 1 - passRate) * 1.5  // higher confidence if clearly flaky
    };
  }

  /**
   * Predict failure likelihood based on pattern
   */
  predictFailure(testName, repoName, testHistory) {
    const flakiness = this.analyzeFlakiness(testName, repoName, testHistory);
    if (!flakiness.isFlaky) return { willFail: false, confidence: 0.9 };

    // Analyze recent trend
    const recent = testHistory.runs.slice(-10);
    const recentFailures = recent.filter(r => !r.passed).length;
    const trend = recentFailures / recent.length;

    return {
      willFail: trend > 0.3,
      confidence: Math.abs(trend - 0.5) * 2,  // higher confidence if trend is clear
      recentFailureRate: trend,
      recommendation: trend > 0.7 ? 'skip_test' : trend > 0.3 ? 'retry' : 'run'
    };
  }

  /**
   * Analyze if current failure matches historical pattern
   */
  matchesPattern(testName, repoName, currentFailure, testHistory) {
    if (!testHistory || testHistory.runs.length < this.minSamples) {
      return { matches: false, confidence: 0.5 };
    }

    const failurePatterns = this.extractPatterns(testHistory.runs);

    // Check if current failure matches known patterns
    let matchScore = 0;
    if (this.matchesErrorPattern(currentFailure, failurePatterns)) matchScore += 0.3;
    if (this.matchesTimingPattern(currentFailure, failurePatterns)) matchScore += 0.3;
    if (this.matchesEnvironmentPattern(currentFailure, failurePatterns)) matchScore += 0.4;

    return {
      matches: matchScore >= 0.6,
      score: matchScore,
      patterns: failurePatterns,
      recommendation: matchScore >= 0.8 ? 'definitely_flaky' : matchScore >= 0.5 ? 'probably_flaky' : 'likely_real'
    };
  }

  // Private methods
  isStale(history) {
    if (!history.timestamp) return true;
    const age = (Date.now() - new Date(history.timestamp)) / (1000 * 60 * 60);
    return age > 24;  // stale after 24 hours
  }

  async fetchFromDatabase(testName, repoName) {
    // Stub: would fetch from CI/test database
    return { runs: [], timestamp: new Date().toISOString() };
  }

  analyzeFailurePeriod(runs) {
    const failures = runs.filter(r => !r.passed);
    if (failures.length === 0) return 'never_fails';
    if (failures.length === runs.length) return 'always_fails';

    const timeSpan = failures.length / runs.length;
    if (timeSpan < 0.2) return 'rare';
    if (timeSpan < 0.5) return 'intermittent';
    return 'frequent';
  }

  extractPatterns(runs) {
    const patterns = {};
    runs.filter(r => !r.passed).forEach(run => {
      if (run.error) {
        patterns[run.error] = (patterns[run.error] || 0) + 1;
      }
    });
    return patterns;
  }

  matchesErrorPattern(failure, patterns) {
    if (!failure.error) return false;
    return failure.error in patterns;
  }

  matchesTimingPattern(failure, patterns) {
    // Check if failure occurs at specific times
    return false;  // Placeholder
  }

  matchesEnvironmentPattern(failure, patterns) {
    // Check if failure matches environment factors
    return false;  // Placeholder
  }
}

module.exports = FlakyTestHistoryCache;
