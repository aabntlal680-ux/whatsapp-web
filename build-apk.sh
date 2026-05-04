#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
# WhatsApp Business Dashboard — Android APK builder
# Usage:
#   EXPO_TOKEN=<your_token> ./build-apk.sh
#
# Get your token at: https://expo.dev/accounts/-/settings/access-tokens
# ──────────────────────────────────────────────────────────────

if [ -z "${EXPO_TOKEN:-}" ]; then
  echo ""
  echo "  ERROR: EXPO_TOKEN is not set."
  echo ""
  echo "  Generate one at:"
  echo "    https://expo.dev/accounts/-/settings/access-tokens"
  echo ""
  echo "  Then run:"
  echo "    EXPO_TOKEN=<your_token> ./build-apk.sh"
  echo ""
  exit 1
fi

export EXPO_TOKEN

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$SCRIPT_DIR/artifacts/mobile"

echo ""
echo "==> Changing to mobile directory: $MOBILE_DIR"
cd "$MOBILE_DIR"

echo ""
echo "==> Checking for eas-cli..."
if ! command -v eas &>/dev/null; then
  echo "    eas-cli not found — installing globally..."
  npm install -g eas-cli
else
  echo "    eas-cli already installed: $(eas --version)"
fi

echo ""
echo "==> Verifying Expo login..."
eas whoami

echo ""
echo "==> Starting Android preview build (APK)..."
eas build \
  --platform android \
  --profile preview \
  --non-interactive

echo ""
echo "==> Build submitted! Monitor progress and download your APK at:"
echo "    https://expo.dev/accounts/-/builds"
echo ""
