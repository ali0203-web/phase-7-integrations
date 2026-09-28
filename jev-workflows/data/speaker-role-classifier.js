/**
 * Speaker Role Classifier
 * Identifies speakers and their roles in meeting notes
 * Phase 7a Optimization: Improves meeting notes analysis accuracy
 */

class SpeakerRoleClassifier {
  constructor() {
    this.rolePatterns = {
      manager: /manager|lead|lead|director|head of|principal/i,
      engineer: /engineer|developer|dev|software|architect|tech lead/i,
      designer: /designer|design|ux|ui/i,
      product: /product|pm|product manager/i,
      other: /consultant|analyst|support|sales|marketing/i
    };

    this.speakerPatterns = {
      explicit: /^([\w\s]+):\s*(.+)$/m,  // Name: comment
      bracketed: /\[([\w\s]+)\]\s*(.+)/,  // [Name] comment
      hashtag: /@([\w]+)\s*(.+)/  // @Name comment
    };
  }

  /**
   * Classify speakers and their roles from meeting notes
   * @param {string} notes - meeting notes text
   * @returns {Promise<Object>} speakers with identified roles
   */
  async classifySpeakers(notes) {
    const speakers = this.extractSpeakers(notes);
    const classified = [];

    for (const speaker of speakers) {
      const role = this.classifyRole(speaker.name, notes);
      const confidence = this.calculateRoleConfidence(speaker.name, notes, role);
      const contributions = this.countContributions(speaker.name, notes);

      classified.push({
        name: speaker.name,
        role,
        confidence,
        contributions,
        dominance: this.calculateDominance(contributions, speaker.totalLines),
        isDecisionMaker: this.isDecisionMaker(role, notes),
        actionItems: this.countAssignedItems(speaker.name, notes)
      });
    }

    return {
      speakers: classified.sort((a, b) => b.dominance - a.dominance),
      keyDecisionMakers: classified.filter(s => s.isDecisionMaker),
      dominantSpeaker: classified[0] || null,
      teamDiversity: this.calculateDiversity(classified),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract speakers from notes using various patterns
   * @private
   */
  extractSpeakers(notes) {
    const speakers = new Map();

    // Try each pattern
    const patterns = Object.values(this.speakerPatterns);
    const lines = notes.split('\n');

    lines.forEach(line => {
      let match = null;
      let name = null;

      for (const pattern of patterns) {
        const m = pattern.exec(line);
        if (m && m[1]) {
          match = m;
          name = m[1].trim();
          break;
        }
      }

      if (name && name.length > 2 && name.length < 50) {
        if (!speakers.has(name)) {
          speakers.set(name, {
            name,
            lines: [],
            firstAppearance: lines.indexOf(line),
            totalLines: 0
          });
        }

        const speaker = speakers.get(name);
        speaker.lines.push(line);
        speaker.totalLines++;
      }
    });

    return Array.from(speakers.values());
  }

  /**
   * Classify a person's role based on context
   * @private
   */
  classifyRole(name, notes) {
    // Look for explicit role mentions in context
    const contextRadius = 500; // characters
    const nameIndex = notes.indexOf(name);
    if (nameIndex === -1) return 'other';

    const start = Math.max(0, nameIndex - contextRadius);
    const end = Math.min(notes.length, nameIndex + contextRadius);
    const context = notes.substring(start, end).toLowerCase();

    // Score each role based on pattern matches
    const scores = {};
    for (const [role, pattern] of Object.entries(this.rolePatterns)) {
      const matches = (context.match(pattern) || []).length;
      scores[role] = matches;
    }

    // Return highest scoring role
    const topRole = Object.entries(scores).reduce((a, b) =>
      b[1] > a[1] ? b : a, ['other', 0]
    )[0];

    return topRole;
  }

  /**
   * Calculate confidence in role classification
   * @private
   */
  calculateRoleConfidence(name, notes, role) {
    const context = this.getContext(name, notes, 300);
    const lowerContext = context.toLowerCase();

    const rolePattern = this.rolePatterns[role];
    if (!rolePattern) return 0.5;

    const matches = (lowerContext.match(rolePattern) || []).length;
    const confidence = Math.min(matches * 0.3, 1.0);

    // Boost confidence if role appears in intro or early mentions
    if (notes.substring(0, 500).toLowerCase().includes(name.toLowerCase())) {
      return Math.min(confidence + 0.2, 1.0);
    }

    return confidence || 0.5;
  }

  /**
   * Count how many times speaker contributed
   * @private
   */
  countContributions(name, notes) {
    const pattern = new RegExp(`\\b${name.replace(/\s/g, '\\s*')}\\b`, 'gi');
    const matches = notes.match(pattern) || [];
    return matches.length;
  }

  /**
   * Calculate speaker dominance (percentage of total mentions)
   * @private
   */
  calculateDominance(contributions, totalLines) {
    if (totalLines === 0) return 0;
    return Math.min(contributions / totalLines, 1.0);
  }

  /**
   * Determine if person is a decision maker
   * @private
   */
  isDecisionMaker(role, notes) {
    const leadershipRoles = ['manager', 'product', 'architect'];
    return leadershipRoles.includes(role);
  }

  /**
   * Count action items assigned to person
   * @private
   */
  countAssignedItems(name, notes) {
    const patterns = [
      new RegExp(`${name}[:\\s]+(.*?)[\\n]`, 'gi'),
      new RegExp(`assigned to ${name}`, 'gi'),
      new RegExp(`${name} will`, 'gi'),
      new RegExp(`${name} to`, 'gi')
    ];

    let count = 0;
    patterns.forEach(pattern => {
      const matches = notes.match(pattern) || [];
      count += matches.length;
    });

    return count;
  }

  /**
   * Calculate team diversity
   * @private
   */
  calculateDiversity(speakers) {
    if (speakers.length === 0) return 0;

    const roles = {};
    speakers.forEach(s => {
      roles[s.role] = (roles[s.role] || 0) + 1;
    });

    const uniqueRoles = Object.keys(roles).length;
    return Math.min(uniqueRoles / 5, 1.0); // normalize to 0-1
  }

  /**
   * Get context around a person's mention
   * @private
   */
  getContext(name, notes, radius) {
    const index = notes.indexOf(name);
    if (index === -1) return '';

    const start = Math.max(0, index - radius);
    const end = Math.min(notes.length, index + radius);
    return notes.substring(start, end);
  }
}

module.exports = SpeakerRoleClassifier;
