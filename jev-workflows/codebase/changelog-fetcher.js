/**
 * Changelog Fetcher
 * Fetches release notes and changelog from GitHub/npm
 * Phase 7a: Provides context for dependency risk assessment
 */

class ChangelogFetcher {
  constructor() {
    this.cacheDir = new Map();
  }

  /**
   * Fetch changelog for a package version
   */
  async fetchChangelog(packageName, version, fromVersion) {
    const cacheKey = `${packageName}:${fromVersion}->${version}`;

    if (this.cacheDir.has(cacheKey)) {
      return this.cacheDir.get(cacheKey);
    }

    const changelog = await this.getChangelog(packageName, version, fromVersion);
    this.cacheDir.set(cacheKey, changelog);
    return changelog;
  }

  /**
   * Analyze changelog for risk indicators
   */
  analyzeChangelog(changelog) {
    if (!changelog) {
      return { hasChangelog: false, risk: 3, confidence: 0.4 };
    }

    let riskScore = 0;
    const indicators = [];

    // Check for breaking changes keywords
    if (/breaking|incompatible|deprecated|removed/i.test(changelog)) {
      riskScore += 40;
      indicators.push('breaking_changes');
    }

    // Check for major feature additions
    if (/major|major feature|significant|complete rewrite/i.test(changelog)) {
      riskScore += 20;
      indicators.push('major_refactor');
    }

    // Check for security patches
    if (/security|vulnerability|cve|fix.*security/i.test(changelog)) {
      riskScore -= 10;  // reduce risk for security patches
      indicators.push('security_patch');
    }

    // Check for bug fixes
    if (/bug.*fix|fixed.*issue|resolve/i.test(changelog)) {
      riskScore -= 5;
      indicators.push('bug_fixes');
    }

    // Check for deprecation warnings
    if (/deprecated|will be removed|legacy/i.test(changelog)) {
      riskScore += 15;
      indicators.push('deprecations');
    }

    return {
      riskScore: Math.max(0, Math.min(100, riskScore)),
      indicators,
      severity: this.scoreSeverity(riskScore),
      changes: this.extractChanges(changelog)
    };
  }

  /**
   * Compare two versions
   */
  compareVersions(version1, version2) {
    const v1 = this.parseVersion(version1);
    const v2 = this.parseVersion(version2);

    return {
      majorBump: v2.major > v1.major,
      minorBump: v2.minor > v1.minor && v2.major === v1.major,
      patchBump: v2.patch > v1.patch && v2.major === v1.major && v2.minor === v1.minor,
      prerelease: /alpha|beta|rc/i.test(version2),
      versionJump: v2.major - v1.major + (v2.minor - v1.minor) / 10
    };
  }

  // Private methods
  async getChangelog(packageName, version, fromVersion) {
    // Try multiple sources
    let changelog = await this.fetchFromGitHub(packageName, version);
    if (!changelog) {
      changelog = await this.fetchFromNPM(packageName, version);
    }
    if (!changelog) {
      changelog = await this.fetchFromGitTag(packageName, version, fromVersion);
    }
    return changelog;
  }

  async fetchFromGitHub(packageName, version) {
    // Stub: would call GitHub API
    return null;
  }

  async fetchFromNPM(packageName, version) {
    // Stub: would call npm registry API
    return null;
  }

  async fetchFromGitTag(packageName, version, fromVersion) {
    // Stub: would check git tags
    return null;
  }

  scoreSeverity(score) {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    if (score >= 10) return 'low';
    return 'minimal';
  }

  extractChanges(changelog) {
    if (!changelog) return [];

    const lines = changelog.split('\n');
    return lines
      .filter(line => /^[-*+]|^#+/.test(line.trim()))
      .slice(0, 10)  // top 10 changes
      .map(line => line.trim());
  }

  parseVersion(version) {
    const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version);
    if (!match) return { major: 0, minor: 0, patch: 0 };
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }
}

module.exports = ChangelogFetcher;
