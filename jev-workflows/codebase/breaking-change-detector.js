/**
 * Breaking Change Detector
 * Detects API breaking changes between versions
 * Phase 7a: Identifies incompatible updates
 */

class BreakingChangeDetector {
  constructor() {
    this.patterns = {
      functionRemoved: /removed|deprecated|no longer|delete/i,
      parameterChanged: /parameter|argument|signature|api.*changed/i,
      typeChanged: /type.*changed|return.*type|changed.*return/i,
      defaultChanged: /default.*changed|default.*value/i,
      methodRenamed: /renamed|moved to|replace.*with/i
    };
  }

  /**
   * Detect breaking changes between versions
   */
  async detectBreakingChanges(packageName, fromVersion, toVersion) {
    const changelog = await this.fetchChangelog(packageName, fromVersion, toVersion);
    const apiDiff = await this.compareAPIs(packageName, fromVersion, toVersion);

    return {
      breaking: this.analyzeBreakingChanges(changelog, apiDiff),
      apiChanges: apiDiff,
      recommendation: this.getRecommendation(changelog, apiDiff)
    };
  }

  /**
   * Analyze changelog for breaking changes
   */
  analyzeBreakingChanges(changelog, apiDiff) {
    if (!changelog && !apiDiff) {
      return { hasBreakingChanges: false, confidence: 0.5, changes: [] };
    }

    const changes = [];

    // Check changelog keywords
    if (changelog) {
      for (const [type, pattern] of Object.entries(this.patterns)) {
        if (pattern.test(changelog)) {
          changes.push({ type, source: 'changelog', description: this.extractDescription(changelog, pattern) });
        }
      }
    }

    // Check API differences
    if (apiDiff) {
      if (apiDiff.removedFunctions) {
        changes.push({ type: 'function_removed', source: 'api', description: apiDiff.removedFunctions.join(', ') });
      }
      if (apiDiff.changedSignatures) {
        changes.push({ type: 'signature_changed', source: 'api', description: apiDiff.changedSignatures.join(', ') });
      }
    }

    return {
      hasBreakingChanges: changes.length > 0,
      confidence: Math.min(changes.length * 0.2, 0.95),
      count: changes.length,
      changes
    };
  }

  /**
   * Get upgrade recommendation
   */
  getRecommendation(changelog, apiDiff) {
    const breaking = this.analyzeBreakingChanges(changelog, apiDiff);

    if (breaking.hasBreakingChanges) {
      return {
        action: 'requires_code_changes',
        risk: 'high',
        steps: [
          'Review breaking changes',
          'Update dependent code',
          'Run full test suite',
          'Incremental upgrade if possible'
        ]
      };
    }

    if (changelog && /security|vulnerability/i.test(changelog)) {
      return {
        action: 'upgrade_immediately',
        risk: 'security',
        reason: 'Security update available'
      };
    }

    return {
      action: 'safe_to_upgrade',
      risk: 'low',
      reason: 'No breaking changes detected'
    };
  }

  // Private methods
  async fetchChangelog(packageName, fromVersion, toVersion) {
    // Stub: would fetch actual changelog
    return null;
  }

  async compareAPIs(packageName, fromVersion, toVersion) {
    // Stub: would compare API signatures
    return null;
  }

  extractDescription(text, pattern) {
    const lines = text.split('\n');
    return lines
      .filter(line => pattern.test(line))
      .slice(0, 3)
      .map(line => line.trim())
      .join('; ');
  }
}

module.exports = BreakingChangeDetector;
