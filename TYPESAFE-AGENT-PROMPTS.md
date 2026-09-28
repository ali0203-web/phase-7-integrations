# TypeSafe Agent - Claude Code Setup & Prompts
**Status:** 🟢 READY TO DEPLOY  
**Date:** 2026-09-28  
**Command:** `/typesafe:typesafe-ai`  

---

## 🚀 QUICK START IN CLAUDE CODE

After installing TypeSafe skill, use these agent prompts:

---

## PROMPT 1: Initialize All 20 Workflows

```
Using the TypeSafe skill, initialize and test all 20 workflows 
for our system. Verify TYPESAFE_API_KEY is set correctly, 
confirm API connectivity, and report status for each workflow:

CODEBASE WORKFLOWS (5):
- PR Triage
- Flaky Test Detection
- Commit Type Classification
- Dependency Risk Assessment
- Completion Validation

SUPPORT WORKFLOWS (4):
- Ticket Routing
- Urgency Detection
- Refund Eligibility
- Spam Detection

CONTENT WORKFLOWS (3):
- Video Ideas Worth Pursuing
- Hook Selection
- Comment Moderation

DATA/ADMIN WORKFLOWS (4):
- Duplicate Detection
- Expense Categories
- Lead Scoring
- Meeting Notes Classification

PHASE 5 ENHANCEMENT WORKFLOWS (4):
- Trade Pre-Validation
- Lead Quality Scoring
- Content Decision Filtering
- Support Urgency Routing

For each workflow, create a test query and verify confidence 
scoring works. Report success/failure for all 20.
```

---

## PROMPT 2: Test Lead Quality Scoring (Highest Value - $500K)

```
Using the TypeSafe skill, test the Lead Quality Scoring workflow 
with these test cases:

TEST 1: Hot Lead
- Company: TechCorp, Series B, $50M ARR
- Budget: $500K
- Engagement: 8 email opens, 2 webinars, requested pricing
- Decision: Should rate 8-10

TEST 2: Cold Lead
- Company: Unknown startup
- Budget: Unknown
- Engagement: 1 email open
- Decision: Should rate 2-4

TEST 3: Borderline Lead
- Company: Mid-market, $10M ARR
- Budget: $250K
- Engagement: 3 email opens, no webinars
- Decision: Should rate 5-7

For each test, capture:
- Confidence score
- Recommended action
- Any risk flags

If all tests pass with confidence > 0.75, report "READY FOR 
PRODUCTION" with savings calculation ($500K/year).
```

---

## PROMPT 3: Test Trade Pre-Validation (Trading System - $180K)

```
Using the TypeSafe skill, test the Trade Pre-Validation workflow 
with these market scenarios:

TEST 1: Safe Trade
- Symbol: NVDA
- Quantity: 100 shares
- Price: $119.50 (current $119.50 - limit $120)
- Volume: 45M shares
- VIX: 18
- Decision: Should approve with high confidence

TEST 2: Risky Trade
- Symbol: PENNY_STOCK
- Quantity: 1000 shares
- Price: $2.00
- Volume: 100K shares
- VIX: 28
- Decision: Should flag with low confidence (escalate)

TEST 3: Invalid Trade
- Symbol: NVDA
- Quantity: 100
- Price: $50 (stock at $119)
- Volume: 45M
- Decision: Should reject

For each test, capture:
- Valid/Invalid decision
- Confidence score
- Risk assessment
- Execution priority

If all tests pass, report "TRADING SYSTEM READY" and savings 
of $180K/year.
```

---

## PROMPT 4: Test Content Decision Filtering (Video - $400K)

```
Using the TypeSafe skill, test the Content Decision workflow 
with these content ideas:

TEST 1: High-Value Content
- Topic: "AI Safety for Enterprise Leaders"
- Audience: Tech executives (high-value)
- Trend: Rising (6 months)
- Competitors: 5 similar videos
- Estimated ROI: 7x
- Decision: Should greenlight with high confidence

TEST 2: Saturated Topic
- Topic: "How to Use ChatGPT"
- Audience: General
- Trend: Declining (over-produced)
- Competitors: 500+ similar videos
- Estimated ROI: 0.8x
- Decision: Should reject

TEST 3: Borderline Topic
- Topic: "TypeSafe Use Cases"
- Audience: Developers
- Trend: Stable
- Competitors: 2 similar videos
- Estimated ROI: 2.5x
- Decision: Should rate medium confidence

For each test, capture:
- Worth producing? (Yes/No/Maybe)
- Confidence score
- Priority level
- Reasoning

If all tests pass, report "CONTENT PIPELINE READY" and savings 
of $400K/year.
```

---

## PROMPT 5: Continuous Monitoring (First Week)

```
Using the TypeSafe skill, set up continuous monitoring for all 
20 workflows. Track the following metrics over the next 7 days:

METRICS TO LOG:
1. Total decisions made per workflow
2. Average confidence score per workflow
3. Escalation rate (decisions flagged for human review)
4. Response time per workflow
5. False positive/negative rates (estimated)

DAILY REPORT TEMPLATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATE: [date]

SUMMARY:
- Total decisions: [#]
- Avg confidence: [0.0-1.0]
- Escalation rate: [%]
- Avg response time: [ms]
- API cost today: $[amount]

TOP PERFORMERS:
1. [workflow] - [score] confidence, [decisions] decisions
2. [workflow] - [score] confidence, [decisions] decisions
3. [workflow] - [score] confidence, [decisions] decisions

OPTIMIZATION NEEDED:
- [workflow] has [#] escalations - consider lowering threshold
- [workflow] has [#] low confidence - needs better input data
- [workflow] is [ms] slow - check API latency

PROJECTED DAILY VALUE:
- Lead quality saves: $[amount]
- Content decisions save: $[amount]
- Trade validation saves: $[amount]
- Support routing saves: $[amount]
TOTAL DAILY: $[amount]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

End of Week 7: Compile all daily reports and recommend 
threshold adjustments.
```

---

## PROMPT 6: Integrate with Grok Bot Trading (Phase 5)

```
Using the TypeSafe skill, set up the Trade Pre-Validation 
integration with our Grok Bot autonomous trading system.

Create a routing logic that:

1. Grok Bot proposes trade
2. TypeSafe validates trade
3. Route based on confidence:
   - If confidence > 0.85: Execute immediately (risk: low)
   - If 0.75 < confidence ≤ 0.85: Execute with alerts (risk: med)
   - If confidence ≤ 0.75: Escalate to human (risk: high)

Example workflow:
Grok: "Buy 100 NVDA @ $120"
TypeSafe: Valid, confidence 0.92, risk medium
Action: Execute immediately with stop loss at $115

Test this with 5 different trade scenarios and verify:
- Fast execution (<500ms)
- Correct escalation logic
- Proper risk classification

If successful, report "AUTONOMOUS TRADING READY" and potential 
$180K+/year profit protection.
```

---

## PROMPT 7: Integrate with Lead Generator (Phase 5)

```
Using the TypeSafe skill, integrate Lead Quality Scoring 
with our Lead Generator system.

Create a lead routing pipeline that:

1. New lead captured → TypeSafe quality score
2. Route based on score:
   - Score 9-10: Sales team (close immediately)
   - Score 7-8: Sales nurture (follow up in 48h)
   - Score 5-6: Research team (verify fit)
   - Score < 5: Archive (low potential)

Example workflow:
Lead: Sarah Chen, TechCorp, $500K budget, 8 email opens
TypeSafe: Score 8, confidence 0.87
Action: Route to sales, SLA 24 hours

Test with 10 different lead profiles:
- 3 hot leads (score should be 8-10)
- 3 cold leads (score should be 1-4)
- 4 borderline leads (score should be 5-7)

Verify:
- Correct score ranges
- High confidence (> 0.75)
- Proper routing
- Fast processing (< 200ms)

If successful, report "LEAD ROUTING READY" and potential 
$500K/year revenue improvement.
```

---

## PROMPT 8: Brainstorm New Opportunities

```
Using the TypeSafe skill, explore the project and find 
opportunities for using intelligent judgement to stand in 
for complex parsing or other fragile code.

Focus on:
1. Where do we have manual decision-making?
2. Where do we have if/else chains?
3. Where do we have regex/string parsing?
4. Where are we doing heuristic matching?

For each opportunity found:
- Describe the current approach
- Estimate complexity (1-10)
- Estimate potential automation savings (yearly)
- Rate feasibility (1-10)
- Suggest TypeSafe workflow type

Rank by potential ROI and report top 5 opportunities.
```

---

## PROMPT 9: Validate All Test Queries Work

```
Using the TypeSafe skill, create a comprehensive test suite 
that validates all 20 workflows are functional.

For each workflow, create:
1. A test query (realistic input)
2. Expected output (decision type + range)
3. Pass/fail criteria
4. Confidence threshold

Then run all 20 tests and report:
- Tests passed: [#]/20
- Average confidence: [score]
- Average response time: [ms]
- API call cost: $[amount]
- Estimated accuracy: [%]

If all 20 tests pass:
Report "PRODUCTION READY - All 20 workflows operational"

If any fail:
- Diagnose the failure
- Suggest fix
- Recommend remediation steps
```

---

## PROMPT 10: Generate Weekly Optimization Report

```
Using the TypeSafe skill, generate a weekly optimization 
report for all 20 workflows.

Include:

1. PERFORMANCE METRICS
   - Total decisions: [#]
   - Avg confidence: [score]
   - Escalation rate: [%]
   - Response time: [ms]

2. WORKFLOW RANKINGS
   - Top 5 by volume
   - Top 5 by confidence
   - Top 5 by speed
   - Bottom 5 by confidence (need attention)

3. OPTIMIZATION RECOMMENDATIONS
   - Increase threshold on: [workflows]
   - Decrease threshold on: [workflows]
   - Improve input data for: [workflows]
   - Consider retiring: [workflows]

4. FINANCIAL IMPACT
   - Week's decisions: [#]
   - Estimated value: $[amount]
   - Cost: $[amount]
   - Net profit: $[amount]

5. NEXT WEEK ACTION ITEMS
   - [Action 1]
   - [Action 2]
   - [Action 3]
```

---

## 📋 COMMAND REFERENCE

In Claude Code, after installing TypeSafe skill:

```
# Initialize skill
/typesafe:typesafe-ai

# Then use any of the prompts above, for example:
"Initialize all 20 workflows and verify TYPESAFE_API_KEY works"

# Or use in regular conversation:
/typesafe:typesafe-ai analyze this code for TypeSafe opportunities
```

---

## ✅ INSTALLATION CHECKLIST

- [ ] TypeSafe account created at typesafe.ai
- [ ] API key generated
- [ ] TYPESAFE_API_KEY environment variable set
- [ ] Ran: `claude plugin marketplace add typesafe-ai/skills`
- [ ] Ran: `claude plugin install typesafe@typesafe-ai`
- [ ] Claude Code restarted
- [ ] /typesafe:typesafe-ai command works
- [ ] First test query successful
- [ ] All 20 workflows initialized
- [ ] Daily monitoring set up

---

## 🚀 NEXT STEPS

1. **Right Now:** Copy any prompt above into Claude Code
2. **First Run:** Use PROMPT 1 to initialize all 20 workflows
3. **Testing:** Run PROMPT 2-7 to test each major workflow
4. **Monitoring:** Set up PROMPT 5 for continuous tracking
5. **Optimization:** Weekly reports with PROMPT 10

---

**Authority:** Claude Haiku 4.5 (Command Center)  
**Status:** READY FOR ACTIVATION  
**Deployment:** Immediate (upon API key + env var setup)

