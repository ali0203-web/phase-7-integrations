/**
 * Action Item Extractor
 * Extracts action items, owners, and deadlines from meeting notes
 * Phase 7a Optimization: Improves action item identification
 */

class ActionItemExtractor {
  constructor() {
    this.actionPatterns = [
      /(?:TODO|FIXME|ACTION|TASK|NEXT):\s*(.+?)(?:\n|$)/gi,
      /\[x\]\s*(.+?)(?:\n|$)/gi,  // Checkbox items
      /(-\s+\[ \]\s*(.+?)(?:\n|$))/gi,  // Unchecked bullets
      /(?:assign|assigned to|owner|responsible):\s*(.+?)(?:\n|$)/gi,
      /(?:due|deadline|by|before):\s*(.+?)(?:\n|$)/gi
    ];

    this.ownerPatterns = [
      /assigned to\s+([\w\s]+)/i,
      /owner:\s*([\w\s]+)/i,
      /responsible:\s*([\w\s]+)/i,
      /\b([\w\s]+)\s+(?:will|to)\s+/i,
      /@([\w]+)/i  // @mentions
    ];

    this.deadlinePatterns = [
      /(?:due|deadline):\s*(.+?)(?:\n|[,;])/i,
      /by\s+(today|tomorrow|[\w\s]+(?:day|week|month))/i,
      /(?:EOD|end of day|end of week|next week|next month)/i,
      /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2})/  // dates
    ];

    this.priorityPatterns = {
      high: /\b(?:URGENT|CRITICAL|HIGH PRIORITY|ASAP|BLOCKING)\b/i,
      medium: /\b(?:IMPORTANT|MEDIUM|SHOULD|NEXT)\b/i,
      low: /\b(?:NICE TO HAVE|LOW|EVENTUALLY|BACKLOG)\b/i
    };
  }

  /**
   * Extract action items from meeting notes
   * @param {string} notes - meeting notes text
   * @param {Array} speakers - identified speakers with roles
   * @returns {Promise<Object>} structured action items
   */
  async extractActionItems(notes, speakers = []) {
    const items = [];
    const speakerMap = this.createSpeakerMap(speakers);

    // Extract using multiple patterns
    let itemId = 1;
    const extractedTexts = new Set();

    for (const pattern of this.actionPatterns) {
      let match;
      while ((match = pattern.exec(notes)) !== null) {
        const text = match[1] || match[0];

        // Avoid duplicates
        if (extractedTexts.has(text)) continue;
        extractedTexts.add(text);

        const item = {
          id: itemId++,
          text: text.trim(),
          owner: this.extractOwner(text, notes, speakerMap),
          deadline: this.extractDeadline(text),
          priority: this.extractPriority(text),
          status: this.extractStatus(text),
          context: this.extractContext(text, notes),
          confidence: this.calculateItemConfidence(text, speakerMap),
          tags: this.extractTags(text),
          lineNumber: this.findLineNumber(text, notes)
        };

        // Only add if meets minimum quality threshold
        if (item.confidence >= 0.6) {
          items.push(item);
        }
      }
    }

    return {
      items: items.sort((a, b) => this.priorityOrder(b.priority) - this.priorityOrder(a.priority)),
      count: items.length,
      completeness: this.analyzeCompleteness(items),
      ownerDistribution: this.analyzeOwnerDistribution(items),
      deadlineCoverage: this.analyzeDeadlineCoverage(items),
      highPriorityItems: items.filter(i => i.priority === 'high').length,
      unownedItems: items.filter(i => !i.owner || i.owner === 'unassigned').length,
      quality: this.analyzeQuality(items),
      suggestions: this.generateSuggestions(items)
    };
  }

  /**
   * Extract owner from action item text
   * @private
   */
  extractOwner(text, notes, speakerMap) {
    // Try to find owner in the text itself
    for (const pattern of this.ownerPatterns) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 50) {
          return this.normalizeOwner(name, speakerMap);
        }
      }
    }

    // Look in surrounding context
    const contextMatch = text.match(/[\w\s]+/);
    if (contextMatch) {
      const name = contextMatch[0].trim();
      if (speakerMap.has(name.toLowerCase())) {
        return name;
      }
    }

    return 'unassigned';
  }

  /**
   * Extract deadline from action item
   * @private
   */
  extractDeadline(text) {
    // Look for explicit deadline patterns
    for (const pattern of this.deadlinePatterns) {
      const match = pattern.exec(text);
      if (match) {
        return this.parseDeadline(match[0] || match[1]);
      }
    }

    return null;
  }

  /**
   * Extract priority level
   * @private
   */
  extractPriority(text) {
    for (const [priority, pattern] of Object.entries(this.priorityPatterns)) {
      if (pattern.test(text)) {
        return priority;
      }
    }
    return 'medium'; // default
  }

  /**
   * Extract status (done/pending)
   * @private
   */
  extractStatus(text) {
    if (/\[x\]|✓|done|completed|closed/.test(text)) {
      return 'done';
    }
    return 'pending';
  }

  /**
   * Extract surrounding context
   * @private
   */
  extractContext(text, notes) {
    const index = notes.indexOf(text);
    if (index === -1) return '';

    const start = Math.max(0, index - 200);
    const end = Math.min(notes.length, index + text.length + 200);

    return notes.substring(start, end).trim();
  }

  /**
   * Calculate confidence in action item extraction
   * @private
   */
  calculateItemConfidence(text, speakerMap) {
    let confidence = 0.5;

    // Has clear action verb
    if (/^(?:implement|fix|add|update|remove|review|test|deploy|document|investigate)/i.test(text)) {
      confidence += 0.2;
    }

    // Has assigned owner
    if (this.extractOwner(text, '', speakerMap) !== 'unassigned') {
      confidence += 0.2;
    }

    // Has deadline
    if (this.extractDeadline(text)) {
      confidence += 0.15;
    }

    // Has clear description
    if (text.length > 20) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Analyze overall action item completeness
   * @private
   */
  analyzeCompleteness(items) {
    if (items.length === 0) return 0;

    const withOwner = items.filter(i => i.owner !== 'unassigned').length;
    const withDeadline = items.filter(i => i.deadline).length;
    const highConfidence = items.filter(i => i.confidence >= 0.8).length;

    return {
      ownerPercentage: (withOwner / items.length) * 100,
      deadlinePercentage: (withDeadline / items.length) * 100,
      highConfidencePercentage: (highConfidence / items.length) * 100,
      overallScore: ((withOwner + withDeadline + highConfidence) / (items.length * 3)) * 100
    };
  }

  /**
   * Analyze owner distribution
   * @private
   */
  analyzeOwnerDistribution(items) {
    const distribution = {};

    items.forEach(item => {
      const owner = item.owner || 'unassigned';
      distribution[owner] = (distribution[owner] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([owner, count]) => ({ owner, count, percentage: (count / items.length) * 100 }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Analyze deadline coverage
   * @private
   */
  analyzeDeadlineCoverage(items) {
    const withDeadline = items.filter(i => i.deadline);
    const overdue = items.filter(i => i.deadline && this.isOverdue(i.deadline));
    const dueToday = items.filter(i => i.deadline && this.isDueToday(i.deadline));
    const upcoming = items.filter(i => i.deadline && this.isUpcoming(i.deadline));

    return {
      total: items.length,
      withDeadline: withDeadline.length,
      coverage: (withDeadline.length / items.length) * 100,
      overdue: overdue.length,
      dueToday: dueToday.length,
      upcoming: upcoming.length
    };
  }

  /**
   * Analyze action item quality
   * @private
   */
  analyzeQuality(items) {
    const avgConfidence = items.reduce((sum, i) => sum + i.confidence, 0) / items.length;
    const avgLength = items.reduce((sum, i) => sum + i.text.length, 0) / items.length;

    return {
      averageConfidence: Math.round(avgConfidence * 100),
      averageLength: Math.round(avgLength),
      totalItems: items.length,
      quality: avgConfidence >= 0.75 ? 'excellent' : avgConfidence >= 0.65 ? 'good' : 'needs_review'
    };
  }

  /**
   * Generate improvement suggestions
   * @private
   */
  generateSuggestions(items) {
    const suggestions = [];

    const unowned = items.filter(i => i.owner === 'unassigned');
    if (unowned.length > 0) {
      suggestions.push(`${unowned.length} items without assigned owners - assign these for accountability`);
    }

    const noDeadline = items.filter(i => !i.deadline);
    if (noDeadline.length > items.length * 0.3) {
      suggestions.push(`${noDeadline.length} items without deadlines - add target dates`);
    }

    const overdue = items.filter(i => i.deadline && this.isOverdue(i.deadline));
    if (overdue.length > 0) {
      suggestions.push(`${overdue.length} items are overdue - follow up or reschedule`);
    }

    return suggestions;
  }

  // ==================== HELPER METHODS ====================

  createSpeakerMap(speakers) {
    const map = new Map();
    speakers.forEach(s => {
      map.set(s.name.toLowerCase(), s);
    });
    return map;
  }

  normalizeOwner(name, speakerMap) {
    const lower = name.toLowerCase();
    if (speakerMap.has(lower)) {
      return speakerMap.get(lower).name;
    }
    return name.trim();
  }

  parseDeadline(dateStr) {
    if (!dateStr) return null;

    // Handle relative dates
    const today = new Date();
    if (/today/i.test(dateStr)) return today.toISOString().split('T')[0];
    if (/tomorrow/i.test(dateStr)) {
      today.setDate(today.getDate() + 1);
      return today.toISOString().split('T')[0];
    }

    // TODO: Add more sophisticated date parsing

    return dateStr.trim();
  }

  priorityOrder(priority) {
    const order = { high: 3, medium: 2, low: 1 };
    return order[priority] || 0;
  }

  findLineNumber(text, notes) {
    const index = notes.indexOf(text);
    if (index === -1) return 0;
    return notes.substring(0, index).split('\n').length;
  }

  isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  isDueToday(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  }

  isUpcoming(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const daysAhead = (date - today) / (1000 * 60 * 60 * 24);
    return daysAhead > 0 && daysAhead <= 7;
  }

  extractTags(text) {
    const tags = [];
    if (/bug|fix|issue/i.test(text)) tags.push('bug');
    if (/feature|implement|add/i.test(text)) tags.push('feature');
    if (/document|doc|readme/i.test(text)) tags.push('docs');
    if (/test|testing/i.test(text)) tags.push('testing');
    if (/urgent|critical|asap/i.test(text)) tags.push('urgent');
    return tags;
  }
}

module.exports = ActionItemExtractor;
