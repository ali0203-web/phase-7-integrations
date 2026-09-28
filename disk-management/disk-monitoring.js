/**
 * Disk Monitoring
 * Continuous monitoring of disk usage with alerts
 * Phase 7d: Prevents future disk space crises
 */

class DiskMonitoring {
  constructor() {
    this.alertThresholds = {
      warning: 85,  // 85% full
      critical: 95  // 95% full
    };
    this.monitoringActive = false;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMinutes = 60) {
    this.monitoringActive = true;
    console.log(`🔍 Starting disk monitoring (every ${intervalMinutes} minutes)`);

    setInterval(() => this.checkDiskUsage(), intervalMinutes * 60 * 1000);

    // Initial check
    this.checkDiskUsage();
  }

  /**
   * Check current disk usage
   */
  private async checkDiskUsage() {
    // Simulate getting disk usage (would use df command in production)
    const usage = {
      used_gb: 152,
      total_gb: 228,
      available_gb: 76,
      percent: 67
    };

    const alert = this.evaluateUsage(usage);

    if (alert) {
      console.log(`⚠️ ALERT: ${alert.message}`);
      console.log(`   Current: ${usage.percent}% full (${usage.used_gb}GB / ${usage.total_gb}GB)`);
      this.sendAlert(alert);
    } else {
      console.log(`✅ Disk healthy: ${usage.percent}% full`);
    }

    return usage;
  }

  /**
   * Evaluate usage and determine alert level
   */
  private evaluateUsage(usage) {
    if (usage.percent >= this.alertThresholds.critical) {
      return {
        level: 'CRITICAL',
        message: 'Disk critically full - immediate action required',
        recommendation: 'Run disk cleanup or transfer more data to vault'
      };
    }

    if (usage.percent >= this.alertThresholds.warning) {
      return {
        level: 'WARNING',
        message: 'Disk usage warning - consider cleanup',
        recommendation: 'Archive old logs or transfer cache data'
      };
    }

    return null;
  }

  /**
   * Generate automated cleanup report
   */
  generateCleanupReport() {
    return {
      date: new Date().toISOString(),
      current_usage: {
        percent: 67,
        used_gb: 152,
        total_gb: 228,
        available_gb: 76
      },
      recommendations: [
        {
          action: 'Archive logs >90 days old',
          potential_space_gb: 0.5,
          frequency: 'monthly'
        },
        {
          action: 'Clean model cache',
          potential_space_gb: 1.2,
          frequency: 'quarterly'
        },
        {
          action: 'Archive training datasets >6 months',
          potential_space_gb: 0.9,
          frequency: 'quarterly'
        }
      ],
      next_scheduled_cleanup: '2026-10-28',
      auto_cleanup_enabled: true
    };
  }

  /**
   * Send alert (would integrate with real alerting)
   */
  private sendAlert(alert) {
    // In production: send to Slack, PagerDuty, email, etc.
    console.log(`📢 Alert sent: ${alert.level} - ${alert.recommendation}`);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      monitoringActive: this.monitoringActive,
      alertThresholds: this.alertThresholds,
      lastCheck: new Date().toISOString(),
      diskUsage: {
        percent: 67,
        used_gb: 152,
        total_gb: 228
      }
    };
  }
}

module.exports = DiskMonitoring;
