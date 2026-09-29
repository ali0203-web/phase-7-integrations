---
name: trading_agent_system
description: Autonomous cloud-based trading agent system on AWS for 24/7 order execution and portfolio rebalancing
metadata:
  node_type: memory
  type: project
  originSessionId: 9c042b75-1f3a-47a5-87cb-9585e3198ac7
  modified: 2026-09-26T20:54:35.215Z
---

# Trading Agent System - AWS Architecture

## Decision Point
**Pivoted from Trading OS web dashboard to autonomous cloud-based agents** because:
- UI dashboards don't execute trades automatically
- Needed 24/7 continuous operation without human intervention
- Required real-time order execution at scale (100s-1000s orders/day)
- Dashboard was "dirty" and didn't provide backend automation

## Architecture
**Primary Platform**: AWS (Lambda + EventBridge + SQS + DynamoDB)
**Data Layer**: Supabase (persistent) + Redis (real-time cache)
**Broker Integrations**: Interactive Brokers + Binance + Custom APIs
**Notifications**: Slack (real-time alerts)

## Agent Specialization
1. **Order Execution Engine** - Executes trades via IB/Binance/Custom API
2. **Portfolio Monitor & Rebalancer** - Auto-rebalances at custom drift thresholds
3. **Market Data Ingestion** - Real-time prices via Binance WebSocket + IB data API
4. **Risk Management & Compliance** - Position limits, leverage checks, trading hour enforcement
5. **Error Recovery & Circuit Breaker** - Automatic retry, failure detection, pause-on-failure
6. **Daily Reconciliation** - End-of-day accounting, P&L reporting, audit trail

## Operational Parameters
- **Trading Hours**: 24/7 continuous (crypto + traditional markets)
- **Rebalancing Triggers**: Custom per-position drift thresholds (to be defined in config)
- **Slack Alerts**: Comprehensive (all trades + errors + daily summary)
- **Order Execution Latency Target**: < 500ms
- **Rebalancing Accuracy Target**: > 99%

## Data Tables (Supabase)
- `orders` - Trade orders placed
- `positions` - Current holdings
- `rebalancing_rules` - Target allocations + drift thresholds
- `executions` - Confirmed fills
- `portfolio_snapshots` - Daily snapshots
- `error_log` - Failed operations

## Infrastructure
- **AWS Lambda**: Serverless compute (Node.js 20)
- **EventBridge**: Scheduling + event routing (24/7, timezone-aware)
- **SQS**: Order queue (reliable delivery, no lost orders)
- **DynamoDB**: Immutable transaction ledger
- **VPC**: Isolated network, security-hardened
- **Secrets Manager**: API key management

## Implementation Timeline
- **Phase 1 (Week 1)**: AWS setup, Supabase tables, IB Gateway deployment
- **Phase 2 (Week 2)**: Market data + risk management agents
- **Phase 3 (Week 2-3)**: Order execution engine
- **Phase 4 (Week 3)**: Portfolio rebalancing logic
- **Phase 5 (Week 4)**: Error recovery, reliability hardening
- **Phase 6 (Week 4+)**: Production deployment, live testing

## Why:** Autonomous agents provide 24/7 execution without UI overhead. Real-time processing at scale. Cost-effective (pay-per-execution on Lambda).

## How to apply:** Start Phase 1 foundation. Build incrementally. Define portfolio allocation rules during Phase 1. Test with small positions before going live.
