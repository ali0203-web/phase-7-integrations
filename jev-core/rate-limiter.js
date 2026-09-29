/**
 * Rate Limiter & Circuit Breaker
 * Prevents cascading failures and manages API quota
 * Phase 7c: Supports 100K+/day throughput
 */

class RateLimiter {
  constructor(options = {}) {
    this.capacity = options.capacity || 10000;  // 10K req/sec
    this.tokens = this.capacity;
    this.refillRate = options.refillRate || 10000 / 1000;  // per ms
    this.lastRefill = Date.now();

    this.circuitBreaker = {
      state: 'closed',  // closed, open, half-open
      failureCount: 0,
      failureThreshold: 5,
      resetTimeout: 60000,  // 1 minute
      lastFailureTime: null
    };
  }

  /**
   * Check if request can proceed (token bucket algorithm)
   */
  async checkLimit(requestId, weight = 1) {
    this.refillBucket();

    if (this.tokens >= weight) {
      this.tokens -= weight;
      return { allowed: true, waitTime: 0 };
    }

    // Calculate wait time
    const tokensNeeded = weight - this.tokens;
    const waitTime = tokensNeeded / this.refillRate;

    return { allowed: false, waitTime };
  }

  /**
   * Record failure and update circuit breaker
   */
  recordFailure(error) {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
      this.circuitBreaker.state = 'open';
      console.warn(`⚠️ Circuit breaker OPEN after ${this.circuitBreaker.failureCount} failures`);
    }

    return {
      state: this.circuitBreaker.state,
      failureCount: this.circuitBreaker.failureCount,
      nextRetry: this.circuitBreaker.state === 'open' ? this.circuitBreaker.resetTimeout : 0
    };
  }

  /**
   * Record success and reset failure count
   */
  recordSuccess() {
    this.circuitBreaker.failureCount = Math.max(0, this.circuitBreaker.failureCount - 1);

    if (this.circuitBreaker.failureCount === 0 && this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.state = 'closed';
      console.log('✅ Circuit breaker CLOSED - recovered');
    }
  }

  /**
   * Check circuit breaker status
   */
  isCircuitOpen() {
    if (this.circuitBreaker.state === 'open') {
      const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      if (timeSinceFailure > this.circuitBreaker.resetTimeout) {
        this.circuitBreaker.state = 'half-open';
        console.log('🔄 Circuit breaker HALF-OPEN - testing recovery');
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Exponential backoff for retries
   */
  calculateBackoff(attemptNumber) {
    const baseDelay = 100;  // 100ms
    const maxDelay = 30000;  // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
    const jitter = Math.random() * delay * 0.1;  // 10% jitter
    return delay + jitter;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refillBucket() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      availableTokens: Math.floor(this.tokens),
      capacity: this.capacity,
      circuitState: this.circuitBreaker.state,
      failureCount: this.circuitBreaker.failureCount,
      utilizationPercent: Math.round((1 - this.tokens / this.capacity) * 100)
    };
  }
}

module.exports = RateLimiter;
