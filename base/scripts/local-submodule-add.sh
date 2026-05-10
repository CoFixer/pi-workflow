#!/bin/bash
# local-submodule-add.sh
# Adds a git submodule that stays local-only (never pushed to remote).
#
# Usage: bash scripts/local-submodule-add.sh <repo-url> <path>
#
# What this does:
#   1. Runs 'git submodule add <url> <path>'
#   2. Unstages .gitmodules and the gitlink from the index
#   3. Adds .gitmodules and <path> to .git/info/exclude (local-only ignore)
#
# The submodule remains fully functional via .git/config and .git/modules/<path>/
# and 'git submodule update --remote' still works for pulling updates.

set -e

REPO_URL="$1"
FRAMEWORK_PATH="$2"

if [ -z "$REPO_URL" ] || [ -z "$FRAMEWORK_PATH" ]; then
  echo "Usage: bash scripts/local-submodule-add.sh <repo-url> <path>"
  exit 1
fi

# Check if directory already exists
if [ -d "$FRAMEWORK_PATH" ]; then
  echo "Directory '$FRAMEWORK_PATH' already exists. Skipping."
  exit 0
fi

echo "Adding local-only submodule: $FRAMEWORK_PATH -> $REPO_URL"

# Step 1: Add the submodule (this stages .gitmodules and the gitlink)
git submodule add "$REPO_URL" "$FRAMEWORK_PATH"

# Step 2: Unstage .gitmodules and the gitlink entry
git reset HEAD .gitmodules "$FRAMEWORK_PATH" 2>/dev/null || true

# Step 3: Add to .git/info/exclude if not already there
EXCLUDE_FILE=".git/info/exclude"

if [ ! -f "$EXCLUDE_FILE" ]; then
  mkdir -p .git/info
  touch "$EXCLUDE_FILE"
fi

# Add .gitmodules to exclude (only once)
if ! grep -qF ".gitmodules" "$EXCLUDE_FILE" 2>/dev/null; then
  echo "" >> "$EXCLUDE_FILE"
  echo "# Local-only submodules - never commit these" >> "$EXCLUDE_FILE"
  echo ".gitmodules" >> "$EXCLUDE_FILE"
fi

# Add framework path to exclude
if ! grep -qF "$FRAMEWORK_PATH" "$EXCLUDE_FILE" 2>/dev/null; then
  echo "$FRAMEWORK_PATH" >> "$EXCLUDE_FILE"
fi

echo "  Submodule added locally (not staged for commit)"
echo "  Config stored in .git/config and .git/modules/$FRAMEWORK_PATH/"
echo "  Excluded from git tracking via .git/info/exclude"
