---
name: lovable_alternatives_setup
description: "Multi-tool UI generation setup using v0.dev, Cursor IDE, and open-source tools"
metadata:
  node_type: memory
  type: reference
  originSessionId: 15b0b7fb-c224-46af-af0a-3e2fac73073d
  modified: 2026-09-23T23:55:03.047Z
---

# Free Tier UI Generation Setup — All 3 Tools

## 1. v0.dev (Vercel) — Design to Code
**Status:** Ready to use  
**Free Tier:** 10 generations/month (upgradeable)  
**Best For:** Quick prototypes, component generation

### Setup Steps:
1. Go to https://v0.dev
2. Sign up with GitHub account
3. Create new project "vertex-markets"
4. Upload design mockups or describe UI
5. Generate React/Tailwind code
6. Copy generated code → paste into this project

### Workflow:
- Design in v0.dev → Export → Use in Claude Code
- Repeat for each section (charts, order panels, watchlists)

---

## 2. Cursor IDE + Claude API — Full Development
**Status:** Setup required  
**Cost:** Free trial or use existing Claude API credits  
**Best For:** End-to-end development, full IDE integration

### Setup Steps:
1. Download Cursor: https://www.cursor.com
2. Install Cursor (replaces VS Code)
3. In Cursor Settings → API Keys → Add Claude API key
4. Set model to claude-3-5-sonnet
5. Open dfm-trading-platform project
6. Use Cursor's AI features:
   - `Ctrl+K` → Generate code
   - `Ctrl+L` → Inline edits
   - Chat panel for questions

### Workflow:
- Use Cursor for all development in this project
- Claude Haiku here for guidance + Cursor for coding
- Best for iterative refinement

---

## 3. Open-Source Tools — Self-Hosted Freedom

### OpenUI (Local AI-powered UI)
**Setup:**
```bash
cd ~/projects
git clone https://github.com/wandb/openui.git
cd openui
npm install
npm start
# Opens at http://localhost:3000
```
**Use For:** Generate UI components locally, no rate limits

### Penpot (Design Tool)
**Setup:**
```bash
# Docker required
docker run -d --name=penpot -p 80:80 penpotapp/penpot
# Opens at http://localhost
```
**Use For:** Design mockups, collaborative design, export to code

### Plasmic (Free Tier CMS)
**Setup:**
1. Go to https://plasmic.app
2. Sign up free
3. Create "Vertex Markets" project
4. Design in visual editor
5. Export code or use codegen

---

## Recommended Workflow

### For Rapid Development:
1. **v0.dev** → Quick component generation
2. **Cursor IDE** → Local development & refinement
3. **Claude Code** (here) → Architecture decisions & guidance

### For Complex Features:
1. **Penpot** → Design mockups
2. **OpenUI** → Generate initial code
3. **Cursor** → Refine & integrate
4. **Claude Code** → Final QA

### For Collaboration:
1. **Penpot** → Share designs with team
2. **Plasmic** → CMS for content management
3. **Cursor** → Team development
4. **Claude Code** → Code review & verification

---

## API Keys & Credentials Needed

### v0.dev
- GitHub account (free)
- Vercel account (free)

### Cursor IDE
- Claude API key (from https://console.anthropic.com)
- Add to Cursor settings

### OpenUI
- None (runs locally)

### Penpot
- None (free tier available)

### Plasmic
- Free account (plasmic.app)

---

## Next Steps

1. **Today:** Set up Cursor IDE (5 min)
2. **Today:** Create v0.dev account (2 min)
3. **This week:** Run OpenUI locally (optional, if you want more control)
4. **As needed:** Use Penpot for complex designs
5. **Always:** Use Claude Code here for guidance + verification

All three run in parallel — use whichever is best for each task!
