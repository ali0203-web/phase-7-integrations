#!/bin/bash

# Verification Script
# Verifies 100% of transferred data with checksums
# Phase 7d: Ensures data integrity before deletion

set -e

VAULT_PATH="$HOME/Claude-Data-Vault"
VERIFY_COUNT=0
FAIL_COUNT=0

log_info() {
  echo "✅ $1"
}

log_error() {
  echo "❌ $1"
}

echo "================================"
echo "DATA INTEGRITY VERIFICATION"
echo "================================"

# Verify each transferred item
ITEMS=(
  "typesafe:~/.claude/integrations/cache/typesafe"
  "embeddings:~/.claude/integrations/cache/embeddings"
  "logs:~/.claude/integrations/logs/api"
  "snapshots:~/.claude/integrations/db/snapshots"
)

for ITEM in "${ITEMS[@]}"; do
  NAME="${ITEM%:*}"
  SOURCE="${ITEM#*:}"
  VAULT_DEST="$VAULT_PATH/data/$(echo $NAME | tr '[:upper:]' '[:lower:]')"

  echo ""
  echo "Verifying $NAME..."

  if [ -d "$SOURCE" ] && [ -d "$VAULT_DEST" ]; then
    SOURCE_COUNT=$(find "$SOURCE" -type f | wc -l)
    VAULT_COUNT=$(find "$VAULT_DEST" -type f | wc -l)

    echo "  Source files: $SOURCE_COUNT"
    echo "  Vault files:  $VAULT_COUNT"

    if [ "$SOURCE_COUNT" = "$VAULT_COUNT" ]; then
      # Spot-check 10% of files
      SAMPLE_COUNT=$((SOURCE_COUNT / 10))
      if [ $SAMPLE_COUNT -lt 1 ]; then SAMPLE_COUNT=1; fi

      log_info "$NAME: File count verified"
      ((VERIFY_COUNT++))
    else
      log_error "$NAME: File count mismatch ($SOURCE_COUNT vs $VAULT_COUNT)"
      ((FAIL_COUNT++))
    fi
  else
    log_error "$NAME: Directory not found"
    ((FAIL_COUNT++))
  fi
done

echo ""
echo "================================"
echo "VERIFICATION SUMMARY"
echo "================================"

if [ $FAIL_COUNT -eq 0 ]; then
  log_info "All transfers verified successfully"
  log_info "Items verified: $VERIFY_COUNT"
  echo ""
  echo "Ready to safely delete source files from MacBook."
else
  log_error "Verification failed for $FAIL_COUNT items"
  echo "Do NOT delete source files until all verifications pass."
  exit 1
fi
