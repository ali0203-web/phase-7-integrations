#!/bin/bash
# TypeSafe AI Environment Setup Script
# Run this after getting your API key from typesafe.ai

echo "════════════════════════════════════════════════════════════════"
echo "  TypeSafe AI - Environment Variable Setup"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if API key provided
if [ -z "$1" ]; then
    echo "❌ Usage: ./TYPESAFE-ENV-SETUP.sh <your-api-key>"
    echo ""
    echo "Steps to get your API key:"
    echo "1. Go to https://typesafe.ai"
    echo "2. Sign up with your email"
    echo "3. Click 'TypeSafe Console' (top right)"
    echo "4. Settings → API Keys → Create New Key"
    echo "5. Copy the key"
    echo ""
    echo "Then run: ./TYPESAFE-ENV-SETUP.sh your-key-here"
    exit 1
fi

API_KEY="$1"

# Validate key format (basic check)
if [ ${#API_KEY} -lt 20 ]; then
    echo "❌ API key seems too short. Please verify it's correct."
    exit 1
fi

echo "✓ API Key received (length: ${#API_KEY} chars)"
echo ""

# Option 1: Temporary (current session only)
echo "📝 Setting environment variable for current session..."
export TYPESAFE_API_KEY="$API_KEY"
echo "✅ Temporary: export TYPESAFE_API_KEY='$API_KEY'"
echo ""

# Option 2: Permanent (add to ~/.zshrc)
echo "📝 Do you want to save this permanently? (y/n)"
read -r save_permanent

if [ "$save_permanent" = "y" ] || [ "$save_permanent" = "Y" ]; then
    # Backup existing .zshrc
    if [ -f ~/.zshrc ]; then
        cp ~/.zshrc ~/.zshrc.backup.$(date +%s)
        echo "✓ Backed up ~/.zshrc"
    fi

    # Add to .zshrc
    echo "" >> ~/.zshrc
    echo "# TypeSafe AI API Key ($(date +%Y-%m-%d))" >> ~/.zshrc
    echo "export TYPESAFE_API_KEY='$API_KEY'" >> ~/.zshrc

    # Reload shell
    source ~/.zshrc

    echo "✅ Permanent: Added to ~/.zshrc"
    echo "✓ Shell reloaded"
else
    echo "⏭️  Skipping permanent setup"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ ENVIRONMENT SETUP COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Verify the setup:"
echo "  echo \$TYPESAFE_API_KEY"
echo ""
echo "Next steps:"
echo "  1. Install Claude Code skill: claude plugin install typesafe@typesafe-ai"
echo "  2. Use /typesafe-typesafe-ai in Claude Code"
echo "  3. Deploy workflows when ready"
echo ""

# Verify it's set
if [ ! -z "$TYPESAFE_API_KEY" ]; then
    echo "✅ API Key is active: $(echo $TYPESAFE_API_KEY | cut -c1-10)...$(echo $TYPESAFE_API_KEY | cut -c-10 | tail -c 5)"
else
    echo "❌ API Key not set. Please check ~/.zshrc"
fi
