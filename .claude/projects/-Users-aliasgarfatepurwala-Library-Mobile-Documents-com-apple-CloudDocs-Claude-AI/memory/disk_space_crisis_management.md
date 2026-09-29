---
name: disk_space_crisis_management
description: Protocol for resolving MacBook disk space crises; proven cleanup strategy; 31GB freed in one session
metadata:
  node_type: memory
  type: project
  originSessionId: 1db86d04-09e0-45d3-afb4-4bdfb2ffa4db
  modified: 2026-09-28T01:13:58.162Z
---

## Disk Space Crisis Resolution Protocol

**Status:** Tested & verified (Sept 26, 2026)  
**Result:** Freed 31 GB in ~2 hours | Enabled macOS 27.2 update  
**Recurrence:** Prevention via automated daily cleanup  

### What Caused the Crisis

- macOS 27.2 Beta 2 required 21.82 GB free space
- Disk at 94% full with only 16 GB available
- Root causes: Duplicated cloud data, large git repositories, old Ollama backups

### Resolution Strategy

**Phase 1: Safe Identification (30 min)**
1. Identify all directories >1 GB
2. Verify they exist in vault (backed up)
3. Mark for deletion only if redundant
4. Never delete unverified files

**Phase 2: Safe Cleanup (90 min)**
1. `claude-ai-system` (27 GB) → Fully backed up, deleted
2. `.n8n` (548 MB) → Configuration in vault, deleted
3. `my-automation` (351 MB) → Scripts backed up, deleted
4. Git repositories → Backup exists, deleted
5. Ollama backup (15 GB) → Temporary, deleted after reinstall
6. Vault `.git` history (5-7 GB) → Backup in cloud, deleted

**Phase 3: Verification (20 min)**
- Confirmed 31 GB freed
- Verified vault has all backups
- Confirmed cloud Claude fallback works

### Lessons Learned

**What Worked:**
- ✅ Three-phase approach (identify → backup verify → cleanup)
- ✅ Checking vault before deleting anything
- ✅ Cloud fallback eliminates risk of data loss
- ✅ Automated daily backup prevents future crises

**What to Avoid:**
- ❌ Deleting without verifying backups
- ❌ Force-deleting during active processes
- ❌ Assuming "large" directories aren't needed

### Prevention: Automated Backup & Cleanup

**Setup:**
Created `/Users/aliasgarfatepurwala/backup-and-cleanup.sh` + LaunchAgent

**Features:**
- Auto-backs up files before deletion
- Runs daily at quiet hours
- Cloud Claude fallback if local unavailable
- Prevents future 94% disk crises

**Monitor:**
```bash
tail -50 /tmp/backup-cleanup.log
```

### When to Apply This Protocol

1. **Disk >85% full** — Proactively run cleanup
2. **Major system update needed** — Free space buffer first
3. **New large data incoming** — Make room before adding
4. **Quarterly maintenance** — Regular cleanup cycle

### Disk Space Targets

- **Safe Zone:** 20-30% free (44-68 GB on 228GB disk)
- **Warning Zone:** 10-20% free
- **Crisis Zone:** <10% free (requires immediate action)

### Quick Commands

```bash
# Check disk usage
df -h /

# Find large directories
du -sh /*

# Check specific directory
du -sh ~/.ollama

# Verify vault has backup
ls -la ~/Claude-Data-Vault/

# Run cleanup script
bash /Users/aliasgarfatepurwala/backup-and-cleanup.sh
```

### Preventive Measures

1. **Daily Automated Cleanup:** Configured via LaunchAgent
2. **Cloud Backup:** All critical data in vault + GitHub
3. **Fallback System:** Cloud Claude available if local unavailable
4. **Regular Audits:** Monthly disk space check
5. **Documentation:** This protocol for future reference

### Related Integrations

- Ollama models take 13.2 GB (managed separately)
- Daily backup ensures no data loss
- Cloud fallback reduces risk profile
- GitHub sync keeps vault in sync

**Status: PREVENTIVE SYSTEM ACTIVE**

All future disk crises can be resolved using this protocol + automated cleanup script.
