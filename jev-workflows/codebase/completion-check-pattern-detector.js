/**
 * Completion Check Pattern Detector
 * Analyzes task completion patterns and predicts success probability
 * Phase 7a Optimization: Detects patterns in successful completions
 */

class CompletionCheckPatternDetector {
  constructor() {
    this.patterns = new Map();
    this.successThreshold = 0.75;
  }

  /**
   * Detect completion patterns from a diff and task context
   * @param {Object} diff - the code diff
   * @param {Object} task - the task description and context
   * @param {Object} context - historical context from fetcher
   * @returns {Promise<Object>} pattern analysis with confidence score
   */
  async detectPatterns(diff, task, context) {
    const patterns = {
      coverage: this.analyzeCoverage(diff, task),
      requirements: this.analyzeRequirementsCoverage(diff, task),
      quality: this.analyzeCodeQuality(diff),
      testing: this.analyzeTestCoverage(diff),
      documentation: this.analyzeDocumentation(diff, task),
      history: this.analyzeHistoricalPatterns(context)
    };

    const confidence = this.calculateConfidence(patterns, context);

    return {
      patterns,
      confidence,
      decision: confidence >= 0.65 ? 'approve' : 'escalate',
      reasoning: this.generateReasoning(patterns, confidence),
      suggestions: this.generateSuggestions(patterns)
    };
  }

  /**
   * Analyze whether diff addresses task coverage
   * @private
   */
  analyzeCoverage(diff, task) {
    const filesTouched = diff.files ? diff.files.length : 0;
    const linesChanged = (diff.additions || 0) + (diff.deletions || 0);
    const complexity = this.calculateComplexity(diff);

    // Check if changes align with task requirements
    const taskKeywords = this.extractKeywords(task.description || '');
    const codeKeywords = this.extractKeywordsFromDiff(diff);
    const alignment = this.calculateKeywordAlignment(taskKeywords, codeKeywords);

    return {
      filesChanged: filesTouched,
      linesChanged,
      complexity,
      alignment,
      isAdequate: alignment >= 0.85 && linesChanged > 0
    };
  }

  /**
   * Analyze whether all requirements are addressed
   * @private
   */
  analyzeRequirementsCoverage(diff, task) {
    const requirements = this.extractRequirements(task.description || '');
    const addressed = [];
    const unaddressed = [];

    requirements.forEach(req => {
      const isCovered = this.isRequirementCovered(req, diff);
      if (isCovered) {
        addressed.push(req);
      } else {
        unaddressed.push(req);
      }
    });

    return {
      total: requirements.length,
      addressed: addressed.length,
      unaddressed: unaddressed.length,
      coveragePercentage: requirements.length > 0 ? (addressed.length / requirements.length) : 0,
      missingRequirements: unaddressed,
      isComplete: unaddressed.length === 0
    };
  }

  /**
   * Analyze code quality aspects
   * @private
   */
  analyzeCodeQuality(diff) {
    return {
      hasComments: this.detectComments(diff),
      hasTests: this.detectTestChanges(diff),
      hasDocumentation: this.detectDocumentation(diff),
      followsStyle: this.checkStyleCompliance(diff),
      noBreakingChanges: this.checkBreakingChanges(diff),
      complexity: this.calculateComplexity(diff),
      qualityScore: this.calculateQualityScore(diff)
    };
  }

  /**
   * Analyze test coverage
   * @private
   */
  analyzeTestCoverage(diff) {
    const hasTestChanges = this.detectTestChanges(diff);
    const testCoverage = this.extractCoveragePercentage(diff);
    const newTestsAdded = this.countNewTests(diff);

    return {
      hasTestChanges,
      coverage: testCoverage,
      newTestsAdded,
      isSufficient: testCoverage >= 0.90 || newTestsAdded > 0,
      coverageImproved: this.checkCoverageImprovement(diff)
    };
  }

  /**
   * Analyze documentation
   * @private
   */
  analyzeDocumentation(diff, task) {
    const hasReadmeUpdate = this.checkFileType(diff, /README/i);
    const hasDocsUpdate = this.checkFileType(diff, /docs?\//i);
    const hasInlineComments = this.detectComments(diff);
    const hasJSDoc = this.detectJSDoc(diff);

    return {
      readme: hasReadmeUpdate,
      docs: hasDocsUpdate,
      comments: hasInlineComments,
      jsdoc: hasJSDoc,
      isAdequate: hasInlineComments || hasJSDoc || hasDocsUpdate
    };
  }

  /**
   * Analyze against historical patterns from context
   * @private
   */
  analyzeHistoricalPatterns(context) {
    if (!context || !context.completionPatterns) {
      return { confidence: 0.5, samples: 0 };
    }

    const patterns = context.completionPatterns;
    const boost = context.confidence_boost || 0;

    return {
      historicalSuccessRate: patterns.successRate || 0.5,
      confidenceBoost: boost,
      similarTasksAvailable: (context.similarTasks || []).length > 0,
      trendingPositive: patterns.trends?.trend === 'improving'
    };
  }

  /**
   * Calculate overall confidence based on patterns
   * @private
   */
  calculateConfidence(patterns, context) {
    let confidence = 0.5; // base confidence

    // Coverage contribution (25%)
    if (patterns.coverage.isAdequate) {
      confidence += 0.25 * patterns.coverage.alignment;
    }

    // Requirements contribution (25%)
    confidence += 0.25 * patterns.requirements.coveragePercentage;

    // Quality contribution (20%)
    confidence += 0.20 * patterns.quality.qualityScore;

    // Testing contribution (15%)
    if (patterns.testing.isSufficient) {
      confidence += 0.15 * Math.min(patterns.testing.coverage, 1.0);
    }

    // Documentation contribution (10%)
    if (patterns.documentation.isAdequate) {
      confidence += 0.10;
    }

    // Historical boost (up to 15%)
    if (patterns.history && context && context.confidence_boost) {
      confidence += patterns.history.confidenceBoost;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate human-readable reasoning
   * @private
   */
  generateReasoning(patterns, confidence) {
    const reasons = [];

    if (patterns.coverage.isAdequate) {
      reasons.push(`✅ Coverage: ${Math.round(patterns.coverage.alignment * 100)}% keyword alignment`);
    } else {
      reasons.push(`⚠️ Coverage: Only ${Math.round(patterns.coverage.alignment * 100)}% keyword alignment`);
    }

    if (patterns.requirements.isComplete) {
      reasons.push(`✅ Requirements: All ${patterns.requirements.total} requirements addressed`);
    } else {
      reasons.push(`⚠️ Requirements: ${patterns.requirements.unaddressed.length} missing`);
    }

    if (patterns.testing.isSufficient) {
      reasons.push(`✅ Testing: ${Math.round(patterns.testing.coverage * 100)}% coverage`);
    } else {
      reasons.push(`⚠️ Testing: Only ${Math.round(patterns.testing.coverage * 100)}% coverage`);
    }

    if (patterns.documentation.isAdequate) {
      reasons.push(`✅ Documentation: Updated`);
    } else {
      reasons.push(`⚠️ Documentation: Missing or incomplete`);
    }

    reasons.push(`\n📊 Confidence: ${Math.round(confidence * 100)}%`);

    return reasons.join('\n');
  }

  /**
   * Generate improvement suggestions
   * @private
   */
  generateSuggestions(patterns) {
    const suggestions = [];

    if (patterns.requirements.unaddressed.length > 0) {
      suggestions.push(`Missing requirements: ${patterns.requirements.unaddressed.join(', ')}`);
    }

    if (!patterns.testing.isSufficient) {
      suggestions.push(`Increase test coverage: Currently ${Math.round(patterns.testing.coverage * 100)}%, target 90%+`);
    }

    if (!patterns.documentation.isAdequate) {
      suggestions.push(`Add documentation: Consider README/docs updates or inline comments`);
    }

    if (patterns.quality.noBreakingChanges === false) {
      suggestions.push(`Review breaking changes: Ensure backwards compatibility or version bump`);
    }

    if (patterns.quality.followsStyle === false) {
      suggestions.push(`Code style: Run linter to ensure consistency`);
    }

    return suggestions;
  }

  // ==================== HELPER METHODS ====================

  extractKeywords(text) {
    if (!text) return [];
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 3 && !this.isStopWord(w));
  }

  extractKeywordsFromDiff(diff) {
    if (!diff.files) return [];
    const names = diff.files.map(f => f.filename).join(' ');
    return this.extractKeywords(names);
  }

  calculateKeywordAlignment(required, actual) {
    if (required.length === 0) return 1.0;
    const matched = required.filter(r => actual.includes(r)).length;
    return matched / required.length;
  }

  extractRequirements(description) {
    // Simple heuristic: look for sentences with "must", "should", "implement", etc.
    const sentences = description.split(/[.!?]/);
    return sentences
      .filter(s => /must|should|implement|add|fix|remove|update/i.test(s))
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  isRequirementCovered(requirement, diff) {
    const diffText = (diff.files || []).map(f => f.content || '').join('\n').toLowerCase();
    const keywords = this.extractKeywords(requirement);
    const covered = keywords.filter(k => diffText.includes(k));
    return covered.length / keywords.length >= 0.6;
  }

  detectComments(diff) {
    if (!diff.files) return false;
    return diff.files.some(f =>
      /\/\/|\/\*|\*\/|<!--/i.test(f.content || '') &&
      /added|added|added/i.test(f.status)
    );
  }

  detectTestChanges(diff) {
    if (!diff.files) return false;
    return diff.files.some(f => /test|spec/i.test(f.filename) && f.status !== 'deleted');
  }

  detectDocumentation(diff) {
    if (!diff.files) return false;
    return diff.files.some(f => /readme|docs?|\.md/i.test(f.filename) && f.status !== 'deleted');
  }

  detectJSDoc(diff) {
    if (!diff.files) return false;
    return diff.files.some(f => /\*\*\s*\n\s*\*/i.test(f.content || ''));
  }

  checkStyleCompliance(diff) {
    // Simplified: check for common style issues
    if (!diff.files) return true;
    const issues = diff.files.filter(f =>
      /\t/i.test(f.content || '') || // tabs
      /\s+$/m.test(f.content || '')  // trailing spaces
    ).length;
    return issues === 0 || issues < diff.files.length * 0.1;
  }

  checkBreakingChanges(diff) {
    if (!diff.files) return true;
    const text = diff.files.map(f => f.content || '').join('\n');
    return !/breaking|deprecated|removed|private/i.test(text);
  }

  calculateComplexity(diff) {
    const linesChanged = (diff.additions || 0) + (diff.deletions || 0);
    const filesChanged = (diff.files || []).length;
    // Simple heuristic
    return Math.min(linesChanged / 500 + filesChanged / 10, 1.0);
  }

  calculateQualityScore(diff) {
    let score = 0.6; // base
    if (this.detectComments(diff)) score += 0.15;
    if (this.checkStyleCompliance(diff)) score += 0.15;
    if (this.checkBreakingChanges(diff)) score += 0.10;
    return Math.min(score, 1.0);
  }

  extractCoveragePercentage(diff) {
    if (!diff.files) return 0.5;
    // Heuristic: estimate coverage based on test files
    const testFiles = diff.files.filter(f => /test|spec/i.test(f.filename));
    const codeFiles = diff.files.filter(f => !/test|spec/i.test(f.filename));
    if (codeFiles.length === 0) return 0.5;
    return Math.min((testFiles.length / codeFiles.length) * 100, 1.0) / 100;
  }

  countNewTests(diff) {
    if (!diff.files) return 0;
    return diff.files.filter(f => /test|spec/i.test(f.filename) && f.status === 'added').length;
  }

  checkCoverageImprovement(diff) {
    // Check if new tests or coverage increased
    return this.detectTestChanges(diff) && (diff.additions || 0) > (diff.deletions || 0);
  }

  checkFileType(diff, pattern) {
    if (!diff.files) return false;
    return diff.files.some(f => pattern.test(f.filename) && f.status !== 'deleted');
  }

  isStopWord(word) {
    const stopWords = ['the', 'and', 'for', 'with', 'from', 'that', 'this', 'have'];
    return stopWords.includes(word);
  }
}

module.exports = CompletionCheckPatternDetector;
