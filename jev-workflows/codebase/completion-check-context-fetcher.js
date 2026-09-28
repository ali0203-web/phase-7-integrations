/**
 * Completion Check Context Fetcher
 * Fetches 90-day test history and completion patterns
 * Phase 7a Optimization: Provides context for improved decision accuracy
 */

const HistoryCache = require('../../../jev-core/history-cache');

class CompletionCheckContextFetcher {
  constructor() {
    this.cache = new HistoryCache(90); // 90-day retention
    this.minSamples = 10; // need at least 10 samples for patterns
  }

  /**
   * Fetch test history and completion patterns
   * @param {string} taskId - task identifier
   * @param {string} repoName - repository name
   * @returns {Promise<Object>} context object with historical patterns
   */
  async fetchContext(taskId, repoName) {
    const [testHistory, completionPatterns, similarTasks] = await Promise.all([
      this.fetchTestHistory(repoName, 90),
      this.fetchCompletionPatterns(repoName, 90),
      this.fetchSimilarTasks(taskId, repoName, 20)
    ]);

    return {
      testHistory: this.analyzeTestHistory(testHistory),
      completionPatterns: this.analyzeCompletionPatterns(completionPatterns),
      similarTasks: this.rankSimilarTasks(similarTasks),
      confidence_boost: this.calculateConfidenceBoost(completionPatterns),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Fetch test results for repository from past 90 days
   * @private
   */
  async fetchTestHistory(repoName, days) {
    try {
      const cached = await this.cache.get(`test_history:${repoName}`);
      if (cached && cached.age < days) {
        return cached.data;
      }

      // Simulate fetching from CI/CD system (GitHub Actions, GitLab CI, etc.)
      const testRuns = await this.queryTestDatabase(repoName, days);
      await this.cache.set(`test_history:${repoName}`, testRuns);
      return testRuns;
    } catch (error) {
      console.warn(`Failed to fetch test history for ${repoName}:`, error);
      return { runs: [], error: error.message };
    }
  }

  /**
   * Fetch completion patterns (successful task completions)
   * @private
   */
  async fetchCompletionPatterns(repoName, days) {
    try {
      const patterns = await this.cache.get(`completion_patterns:${repoName}`);
      if (patterns && patterns.age < days) {
        return patterns.data;
      }

      // Query successful PR merges and their completion characteristics
      const completedPRs = await this.queryCompletedPRs(repoName, days);

      // Extract patterns from successful completions
      const extracted = this.extractCompletionPatterns(completedPRs);
      await this.cache.set(`completion_patterns:${repoName}`, extracted);
      return extracted;
    } catch (error) {
      console.warn(`Failed to fetch completion patterns for ${repoName}:`, error);
      return { patterns: [], error: error.message };
    }
  }

  /**
   * Fetch similar tasks to identify patterns
   * @private
   */
  async fetchSimilarTasks(taskId, repoName, limit) {
    try {
      const similar = await this.cache.get(`similar_tasks:${taskId}`);
      if (similar) {
        return similar.data.slice(0, limit);
      }

      // Query task database for similar task descriptions
      const tasks = await this.querySimilarTasksDB(taskId, repoName, limit * 2);
      const ranked = tasks.slice(0, limit);
      await this.cache.set(`similar_tasks:${taskId}`, ranked);
      return ranked;
    } catch (error) {
      console.warn(`Failed to fetch similar tasks for ${taskId}:`, error);
      return [];
    }
  }

  /**
   * Analyze test history to identify success/failure patterns
   * @private
   */
  analyzeTestHistory(testHistory) {
    if (!testHistory.runs || testHistory.runs.length < this.minSamples) {
      return { passRate: 0.5, samples: testHistory.runs?.length || 0 };
    }

    const passed = testHistory.runs.filter(r => r.status === 'passed').length;
    const total = testHistory.runs.length;

    return {
      passRate: passed / total,
      samples: total,
      averageTestCount: testHistory.runs.reduce((sum, r) => sum + (r.testCount || 0), 0) / total,
      flakeyTests: this.identifyFlakyTests(testHistory.runs),
      trends: this.analyzeTrends(testHistory.runs)
    };
  }

  /**
   * Analyze completion patterns to identify success characteristics
   * @private
   */
  analyzeCompletionPatterns(completionData) {
    if (!completionData.patterns || completionData.patterns.length < this.minSamples) {
      return { confidence: 0.5, samples: completionData.patterns?.length || 0 };
    }

    const patterns = completionData.patterns;
    const successful = patterns.filter(p => p.merged === true);

    return {
      successRate: successful.length / patterns.length,
      samples: patterns.length,
      avgFilesChanged: patterns.reduce((sum, p) => sum + (p.filesChanged || 0), 0) / patterns.length,
      avgLinesAdded: patterns.reduce((sum, p) => sum + (p.additions || 0), 0) / patterns.length,
      commonKeywords: this.extractCommonKeywords(successful),
      averageTimeToMerge: this.calculateAverageMergeTime(successful)
    };
  }

  /**
   * Rank similar tasks by relevance
   * @private
   */
  rankSimilarTasks(tasks) {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    return tasks
      .map(t => ({
        ...t,
        relevanceScore: this.calculateRelevanceScore(t)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  }

  /**
   * Calculate confidence boost based on historical patterns
   * @private
   */
  calculateConfidenceBoost(completionPatterns) {
    if (!completionPatterns.patterns) {
      return 0;
    }

    const baseBoost = completionPatterns.successRate * 0.15; // up to 15% boost
    return Math.min(baseBoost, 0.15); // cap at 15%
  }

  /**
   * Identify flakey tests from history
   * @private
   */
  identifyFlakyTests(runs) {
    const testResults = {};

    runs.forEach(run => {
      if (run.tests) {
        run.tests.forEach(test => {
          if (!testResults[test.name]) {
            testResults[test.name] = { passed: 0, failed: 0, total: 0 };
          }
          testResults[test.name].total++;
          if (test.status === 'passed') testResults[test.name].passed++;
          else testResults[test.name].failed++;
        });
      }
    });

    // Identify flakey: pass rate between 50% and 99%
    return Object.entries(testResults)
      .filter(([_, stats]) => {
        const passRate = stats.passed / stats.total;
        return passRate > 0.5 && passRate < 0.99;
      })
      .map(([name, stats]) => ({
        name,
        passRate: stats.passed / stats.total,
        flakeyCount: stats.failed
      }));
  }

  /**
   * Analyze trends in test history
   * @private
   */
  analyzeTrends(runs) {
    if (runs.length < 5) return { trend: 'insufficient_data' };

    const recent = runs.slice(-5);
    const older = runs.slice(0, 5);

    const recentPass = recent.filter(r => r.status === 'passed').length / recent.length;
    const olderPass = older.filter(r => r.status === 'passed').length / older.length;

    return {
      trend: recentPass > olderPass ? 'improving' : recentPass < olderPass ? 'declining' : 'stable',
      recentPassRate: recentPass,
      olderPassRate: olderPass
    };
  }

  /**
   * Extract common keywords from successful tasks
   * @private
   */
  extractCommonKeywords(successfulTasks) {
    const keywords = {};

    successfulTasks.forEach(task => {
      const words = (task.description || '').split(/\s+/).filter(w => w.length > 3);
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });

    return Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, frequency: count }));
  }

  /**
   * Calculate average time from PR creation to merge
   * @private
   */
  calculateAverageMergeTime(tasks) {
    if (tasks.length === 0) return 0;

    const times = tasks
      .filter(t => t.createdAt && t.mergedAt)
      .map(t => (new Date(t.mergedAt) - new Date(t.createdAt)) / (1000 * 60)); // minutes

    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * Calculate relevance score for similar task
   * @private
   */
  calculateRelevanceScore(task) {
    let score = 0;
    if (task.sameRepository) score += 0.4;
    if (task.similarTags) score += task.similarTags * 0.1;
    if (task.merged) score += 0.3;
    return Math.min(score, 1.0);
  }

  /**
   * Stub: Query test database
   * @private
   */
  async queryTestDatabase(repoName, days) {
    // In production: query GitHub Actions, Jenkins, CircleCI, etc.
    return { runs: [], totalRuns: 0 };
  }

  /**
   * Stub: Query completed PRs
   * @private
   */
  async queryCompletedPRs(repoName, days) {
    // In production: query GitHub API for merged PRs
    return [];
  }

  /**
   * Stub: Query similar tasks
   * @private
   */
  async querySimilarTasksDB(taskId, repoName, limit) {
    // In production: query task/issue database with similarity search
    return [];
  }
}

module.exports = CompletionCheckContextFetcher;
