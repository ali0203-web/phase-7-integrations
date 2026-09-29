---
name: linkedin-automation-project-overview
description: "LinkedIn automation system - 100% free tier, Windsor.ai OAuth, moving from Ollama to OpenRouter"
metadata: 
  node_type: memory
  type: project
  originSessionId: 73ad6641-b622-45ae-a187-1619f09570d5
  modified: 2026-09-21T19:33:27.585Z
---

# LinkedIn Automation System - Project Overview

## Current Status
- **Location**: `/Users/aliasgarfatepurwala/my-automation`
- **Status**: Core automation working, Ollama causing performance issues on M2 MacBook
- **Next Step**: Replace Ollama with OpenRouter, finalize Slack + Airtable integration

## System Architecture

### Core Components
- **Automation Engine**: Runs daily at 09:00 AM Dubai (05:00 UTC)
- **LLM**: Moving from Ollama (local) → OpenRouter (API-based)
- **Prospect Source**: Windsor.ai (OAuth-authenticated LinkedIn API)
- **Tracking**: Airtable (response logging)
- **Notifications**: Slack (daily summary)
- **Database**: SQLite (local, 90-day retention)
- **API Server**: FastAPI at http://localhost:8000 (dashboard)

### Daily Processing (95 items)
- 40 prospects (worldwide)
- 20 jobs (UAE/Oman)
- 10 recruiters (UAE/Oman)
- 15 personalized emails (AI-generated)
- 10 LinkedIn posts (AI-generated)

### Auto-Send Logic
- Confidence ≥90% → Auto-send via Windsor.ai OAuth
- Confidence 70-89% → Manual review queue
- Confidence <70% → Low confidence (informational)

## Credentials Configured

### Windsor.ai
- **Token**: Configured in .env
- **Function**: Prospect scraping + email sending via official LinkedIn API

### Airtable
- **API Token**: `patTE10Gp8VDABKoq.1c95d12e430d75a1910acf2e10239c8b1d52b7fc7375a34298910fabb42b7268`
- **Base ID**: `appqyMQdqnVBfpW34`
- **Table**: `Email_Sends` (columns: Name, Email, Subject, Sent At, Auto Sent, Confidence Score, Status)

### Slack
- **Webhook URL**: `https://hooks.slack.com/services/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`
- **Status**: Tested & working (test message verified)

## Code Files

### Main Files
- `main.py` (600+ lines): Core automation orchestrator
- `config.py` (250+ lines): Configuration management
- `database.py` (400+ lines): SQLite ORM + schema
- `dashboard.py` (500+ lines): FastAPI web UI
- `windsor_integration.py`: OAuth API client for Windsor.ai + Airtable + Slack
- `requirements.txt`: Dependencies (updated, simplified - removed spaCy/Playwright)

### Schema Fix Applied
- Removed `UNIQUE(execution_date)` constraint from automation_logs table
- Allows multiple runs per day (for testing)

## Technology Stack (All Free/Open-Source)
- Python 3.14
- FastAPI + Uvicorn
- SQLAlchemy + SQLite
- APScheduler (daily runner)
- Requests (API calls)
- PyAirtable (Airtable SDK)
- Slack SDK

## Current Issues & Solutions

### Issue 1: Ollama Performance ❌
- Local LLM hanging on M2 MacBook
- **Solution**: Replace with OpenRouter ($5 credit lasts months)
- **Action**: Remove Ollama, add OpenRouter integration

### Issue 2: Database Constraint ✅ FIXED
- UNIQUE constraint on execution_date blocked multiple runs
- **Solution**: Removed constraint from schema

### Issue 3: Slack/Airtable Integration 🔧 IN PROGRESS
- Webhook tested & working
- Airtable credentials correct
- Need to verify full end-to-end integration

## Next Steps (IMMEDIATE)

1. **Get OpenRouter API Key** (user will provide)
2. **Remove Ollama** from requirements.txt + config.py
3. **Add OpenRouter integration** to main.py
4. **Update requirements.txt** with openrouter package
5. **Test Slack notifications** end-to-end
6. **Test Airtable logging** end-to-end
7. **Run full automation** and verify all pieces
8. **Document setup** clearly for user (beginner-friendly)

## Setup Instructions (For Reference)
- Cron job: `0 5 * * * cd ~/my-automation && source venv/bin/activate && python main.py`
- Virtual env: `.venv/bin/activate`
- Dashboard: http://localhost:8000
- Logs: `logs/automation.log`

## Cost Analysis
- **Ollama**: Free but strains M2 MacBook (unacceptable)
- **OpenRouter**: $5 = ~500k tokens = 3-6 months usage
- **Windsor.ai**: Free (1 account)
- **Airtable**: Free tier
- **Slack**: Free tier
- **SQLite**: Free
- **Total Monthly Cost**: $0-1 (if needed to top up OpenRouter)

## User Profile
- New to automation/APIs
- Needs beginner-friendly setup
- Prefers minimal manual steps
- Wants everything working perfectly
- Prefers easy-to-understand interfaces for Slack/Airtable

---

**Action Required**: User obtaining OpenRouter API key, then full integration begins.
