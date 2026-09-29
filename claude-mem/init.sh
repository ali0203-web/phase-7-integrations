#!/bin/bash
# Claude-mem initialization
mkdir -p ~/.claude/memory/claude-mem
echo "Claude-mem initialized at $(date)" > ~/.claude/memory/claude-mem/.init
chmod 755 ~/.claude/memory/claude-mem
