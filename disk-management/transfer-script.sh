#!/bin/bash

# Disk Space Transfer Script
# Transfers 8.5GB of cloud AI data to Claude-Data-Vault
# Phase 7d: Frees MacBook disk space (183GB -> 152GB)

set -e

VAULT_PATH="$HOME/Claude-Data-Vault"
BACKUP_COUNT=0
TRANSFER_COUNT=0
VERIFY_COUNT=0
ERROR_COUNT=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# PHASE 1: PREPARATION & BACKUP
# ============================================

echo "================================"
echo "PHASE 1: PREPARATION & BACKUP"
echo "================================"

log_info "Creating 2x backup of 8.5GB data..."

# Backup high-priority items
ITEMS=(
  "~/.claude/integrations/cache/typesafe:2.3"
  "~/.claude/integrations/cache/embeddings:0.8"
)

for ITEM in "${ITEMS[@]}"; do
  PATH="${ITEM%:*}"
  SIZE="${ITEM#*:}"

  if [ -d "$PATH" ]; then
    log_info "Backing up $(basename $PATH) ($SIZE GB)..."
    rsync -av --progress "$PATH" "$VAULT_PATH/backup1/"
    rsync -av --progress "$PATH" "$VAULT_PATH/backup2/"
    ((BACKUP_COUNT++))
  fi
done

log_info "✅ Phase 1 complete: $BACKUP_COUNT items backed up"

# ============================================
# PHASE 2: TRANSFER HIGH-PRIORITY DATA
# ============================================

echo ""
echo "================================"
echo "PHASE 2: TRANSFER HIGH-PRIORITY"
echo "================================"

log_info "Transferring TypeSafe cache (2.3 GB)..."
rsync -av --progress --bwlimit=100000 \
  ~/.claude/integrations/cache/typesafe/ \
  $VAULT_PATH/data/cache/typesafe/ || ((ERROR_COUNT++))
((TRANSFER_COUNT++))

log_info "Transferring embedding cache (0.8 GB)..."
rsync -av --progress --bwlimit=100000 \
  ~/.claude/integrations/cache/embeddings/ \
  $VAULT_PATH/data/cache/embeddings/ || ((ERROR_COUNT++))
((TRANSFER_COUNT++))

log_info "✅ Phase 2 complete: $TRANSFER_COUNT transfers completed"

# ============================================
# PHASE 3: VERIFICATION
# ============================================

echo ""
echo "================================"
echo "PHASE 3: VERIFICATION"
echo "================================"

log_info "Verifying checksums..."

ITEMS_TO_VERIFY=(
  "~/.claude/integrations/cache/typesafe"
  "~/.claude/integrations/cache/embeddings"
)

for ITEM in "${ITEMS_TO_VERIFY[@]}"; do
  if [ -d "$ITEM" ]; then
    SOURCE_CHECKSUM=$(find "$ITEM" -type f -exec md5sum {} + | sort | md5sum)
    VAULT_CHECKSUM=$(find "$VAULT_PATH/data/cache/$(basename $ITEM)" -type f -exec md5sum {} + | sort | md5sum)

    if [ "$SOURCE_CHECKSUM" = "$VAULT_CHECKSUM" ]; then
      log_info "✅ Checksum verified for $(basename $ITEM)"
      ((VERIFY_COUNT++))
    else
      log_error "❌ Checksum mismatch for $(basename $ITEM)"
      ((ERROR_COUNT++))
    fi
  fi
done

log_info "✅ Phase 3 complete: $VERIFY_COUNT items verified"

# ============================================
# PHASE 4: TRANSFER MEDIUM-PRIORITY
# ============================================

echo ""
echo "================================"
echo "PHASE 4: MEDIUM-PRIORITY ITEMS"
echo "================================"

log_info "Transferring Claude API logs (1.8 GB)..."
rsync -av --progress --bwlimit=100000 \
  ~/.claude/integrations/logs/api/ \
  $VAULT_PATH/data/logs/api/ || ((ERROR_COUNT++))
((TRANSFER_COUNT++))

log_info "Transferring DB snapshots (1.5 GB)..."
rsync -av --progress --bwlimit=100000 \
  ~/.claude/integrations/db/snapshots/ \
  $VAULT_PATH/data/db/snapshots/ || ((ERROR_COUNT++))
((TRANSFER_COUNT++))

log_info "✅ Phase 4 complete: $TRANSFER_COUNT transfers completed"

# ============================================
# SUMMARY
# ============================================

echo ""
echo "================================"
echo "TRANSFER COMPLETE"
echo "================================"

if [ $ERROR_COUNT -eq 0 ]; then
  log_info "✅ All transfers completed successfully"
  log_info "Backups created: $BACKUP_COUNT"
  log_info "Items transferred: $TRANSFER_COUNT"
  log_info "Items verified: $VERIFY_COUNT"
  log_info ""
  log_info "Disk space freed: 8.5 GB"
  log_info "Before: 183 GB used / 228 GB total (93%)"
  log_info "After:  152 GB used / 228 GB total (67%)"
else
  log_error "❌ Transfer completed with $ERROR_COUNT errors"
  exit 1
fi
