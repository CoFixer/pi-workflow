---
description: Manage technology stacks (enable/disable react, nestjs, etc.)
argument-hint: "[list|enable|disable|status|refresh] [stack-name...] [--deinit]"
---

# Stack Management Command

Manage which technology stacks are loaded in your .claude configuration.

**Available stacks:** base, react, react-native, nestjs, content

---

## Phase 1: Parse Arguments

Parse command arguments to determine action.

```bash
# Default to list action
ACTION="list"
STACKS=()
DEINIT=false

# Parse arguments if provided
if [ -n "$ARGUMENTS" ]; then
    # Extract first word as action
    ACTION=$(echo "$ARGUMENTS" | awk '{print $1}' | tr '[:upper:]' '[:lower:]')

    # Extract remaining words as stack names (excluding flags)
    STACKS=($(echo "$ARGUMENTS" | awk '{for(i=2;i<=NF;i++)if($i!~"^--")print $i}'))

    # Check for --deinit flag
    if echo "$ARGUMENTS" | grep -q -- "--deinit"; then
        DEINIT=true
    fi
fi

# Normalize action aliases
case "$ACTION" in
    show) ACTION="status" ;;
    ls) ACTION="list" ;;
esac

echo "Action: $ACTION"
[ ${#STACKS[@]} -gt 0 ] && echo "Stacks: ${STACKS[*]}"
[ "$DEINIT" = true ] && echo "Deinit: enabled"
```

---

## Phase 2: Validate Environment

Validate environment and load current configuration.

```bash
set -e  # Exit on error

CLAUDE_DIR="$CLAUDE_PROJECT_DIR/.claude"
CONFIG_FILE="$CLAUDE_DIR/stack-config.json"
GITMODULES="$CLAUDE_DIR/.gitmodules"

# Validate required tools
for tool in jq git; do
    if ! command -v $tool &> /dev/null; then
        echo "❌ Error: Required tool '$tool' not found"
        echo "   Install: brew install $tool (macOS) or apt install $tool (Linux)"
        exit 1
    fi
done

# Validate .claude directory
if [ ! -d "$CLAUDE_DIR" ]; then
    echo "❌ Error: .claude directory not found at $CLAUDE_DIR"
    exit 1
fi

# Create config if missing
if [ ! -f "$CONFIG_FILE" ]; then
    echo "⚠️  Config file not found, creating with default settings..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "version": "1.0",
  "description": "Technology stack configuration for selective loading",
  "enabledStacks": ["base"]
}
EOF
    echo "✓ Created: $CONFIG_FILE"
fi

# Validate JSON integrity
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
    echo "❌ Error: Config file is corrupted (invalid JSON)"
    echo "   File: $CONFIG_FILE"
    exit 1
fi

# Load current enabled stacks
ENABLED_STACKS=($(jq -r '.enabledStacks[]' "$CONFIG_FILE" 2>/dev/null || echo "base"))

# Discover available stacks from .gitmodules
if [ -f "$GITMODULES" ]; then
    AVAILABLE_STACKS=($(grep "^\[submodule" "$GITMODULES" | sed 's/\[submodule "\(.*\)"\]/\1/' | grep -v "^\.claude$"))
else
    # Fallback: scan for directories with .git
    AVAILABLE_STACKS=($(cd "$CLAUDE_DIR" && find . -maxdepth 1 -type d -name ".git" -prune -o -type d -print | sed 's|^\./||' | grep -v "^\." | sort))
fi

# Ensure base is always in available stacks
if [[ ! " ${AVAILABLE_STACKS[@]} " =~ " base " ]]; then
    AVAILABLE_STACKS=("base" "${AVAILABLE_STACKS[@]}")
fi

echo "✓ Environment validated"
echo "✓ Enabled stacks: ${ENABLED_STACKS[*]}"
echo "✓ Available stacks: ${AVAILABLE_STACKS[*]}"
```

---

## Phase 3: Execute Action

Execute the requested action based on parsed arguments.

### 3.1: List Action

```bash
if [ "$ACTION" = "list" ]; then
    # Stack descriptions
    declare -A STACK_DESC
    STACK_DESC[base]="Core commands, hooks, and agents (REQUIRED)"
    STACK_DESC[react]="React web development patterns and skills"
    STACK_DESC[react-native]="React Native mobile development patterns"
    STACK_DESC[nestjs]="NestJS backend development patterns"
    STACK_DESC[content]="Content creation and management skills"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Available Technology Stacks"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    printf "%-16s %-10s %s\n" "Stack" "Status" "Description"
    echo "────────────────────────────────────────────────────────────"

    for stack in "${AVAILABLE_STACKS[@]}"; do
        # Check if enabled
        if [[ " ${ENABLED_STACKS[@]} " =~ " ${stack} " ]]; then
            STATUS="✓ ENABLED"
        else
            STATUS="✗ disabled"
        fi

        # Get description or default
        DESC="${STACK_DESC[$stack]:-Technology stack}"

        printf "%-16s %-10s %s\n" "$stack" "$STATUS" "$DESC"
    done

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Currently Enabled: ${ENABLED_STACKS[*]}"
    echo ""
    echo "Commands:"
    echo "  /stack enable <name>     Enable a stack"
    echo "  /stack disable <name>    Disable a stack (--deinit to remove files)"
    echo "  /stack status            Show enabled stacks"
    echo "  /stack refresh           Re-sync enabled stacks"
    echo ""

    exit 0
fi
```

### 3.2: Enable Action

```bash
if [ "$ACTION" = "enable" ]; then
    if [ ${#STACKS[@]} -eq 0 ]; then
        echo "❌ Error: No stack names provided"
        echo "   Usage: /stack enable <stack-name> [stack-name...]"
        echo "   Available: ${AVAILABLE_STACKS[*]}"
        exit 1
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Enabling Stacks"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    CHANGES_MADE=false

    for stack in "${STACKS[@]}"; do
        echo "Processing: $stack"

        # Validate stack exists
        if [[ ! " ${AVAILABLE_STACKS[@]} " =~ " ${stack} " ]]; then
            echo "  ⚠️  Error: Unknown stack '$stack'"
            echo "  Available stacks: ${AVAILABLE_STACKS[*]}"
            continue
        fi

        # Check if already enabled
        if [[ " ${ENABLED_STACKS[@]} " =~ " ${stack} " ]]; then
            echo "  ℹ️  Stack '$stack' is already enabled"
            continue
        fi

        echo "  📦 Enabling stack: $stack..."

        # Add to config
        TMP_CONFIG="$CONFIG_FILE.tmp.$$"
        if jq --arg stack "$stack" '.enabledStacks += [$stack] | .enabledStacks |= unique' "$CONFIG_FILE" > "$TMP_CONFIG"; then
            mv "$TMP_CONFIG" "$CONFIG_FILE"
            echo "  ✓ Added to config"
        else
            echo "  ✗ Failed to update config"
            rm -f "$TMP_CONFIG"
            continue
        fi

        # Initialize submodule
        echo "  📥 Initializing submodule..."
        cd "$CLAUDE_DIR"

        if git submodule update --init "$stack" 2>&1 | grep -v "^Cloning into" || true; then
            # Check if submodule has nested submodules
            if [ -f "$stack/.gitmodules" ]; then
                echo "  📥 Initializing nested submodules..."
                (cd "$stack" && git submodule update --init --recursive) || true
            fi

            echo "  ✓ Successfully enabled: $stack"
            ENABLED_STACKS+=("$stack")
            CHANGES_MADE=true
        else
            echo "  ✗ Failed to initialize submodule: $stack"
            echo "  Rolling back config change..."
            jq --arg stack "$stack" '.enabledStacks -= [$stack]' "$CONFIG_FILE" > "$TMP_CONFIG"
            mv "$TMP_CONFIG" "$CONFIG_FILE"
        fi

        cd "$CLAUDE_PROJECT_DIR"
        echo ""
    done

    if [ "$CHANGES_MADE" = false ]; then
        echo "No changes made."
        exit 0
    fi
fi
```

### 3.3: Disable Action

```bash
if [ "$ACTION" = "disable" ]; then
    if [ ${#STACKS[@]} -eq 0 ]; then
        echo "❌ Error: No stack names provided"
        echo "   Usage: /stack disable <stack-name> [stack-name...] [--deinit]"
        exit 1
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Disabling Stacks"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    CHANGES_MADE=false

    for stack in "${STACKS[@]}"; do
        echo "Processing: $stack"

        # Prevent disabling base
        if [ "$stack" = "base" ]; then
            echo "  ⚠️  Error: Cannot disable 'base' stack (required for core functionality)"
            continue
        fi

        # Validate stack exists
        if [[ ! " ${AVAILABLE_STACKS[@]} " =~ " ${stack} " ]]; then
            echo "  ⚠️  Error: Unknown stack '$stack'"
            echo "  Available stacks: ${AVAILABLE_STACKS[*]}"
            continue
        fi

        # Check if already disabled
        if [[ ! " ${ENABLED_STACKS[@]} " =~ " ${stack} " ]]; then
            echo "  ℹ️  Stack '$stack' is already disabled"
            continue
        fi

        echo "  📦 Disabling stack: $stack..."

        # Remove from config
        TMP_CONFIG="$CONFIG_FILE.tmp.$$"
        if jq --arg stack "$stack" '.enabledStacks -= [$stack]' "$CONFIG_FILE" > "$TMP_CONFIG"; then
            mv "$TMP_CONFIG" "$CONFIG_FILE"
            echo "  ✓ Removed from config"
            CHANGES_MADE=true
        else
            echo "  ✗ Failed to update config"
            rm -f "$TMP_CONFIG"
            continue
        fi

        # Remove from enabled stacks array
        ENABLED_STACKS=($(printf '%s\n' "${ENABLED_STACKS[@]}" | grep -v "^${stack}$"))

        # Optionally deinit submodule
        if [ "$DEINIT" = true ]; then
            echo "  🗑️  Deinitializing submodule (freeing disk space)..."
            cd "$CLAUDE_DIR"
            if git submodule deinit --force "$stack" 2>/dev/null; then
                echo "  ✓ Deinitialized submodule"
            else
                echo "  ⚠️  Submodule may not have been initialized"
            fi
            cd "$CLAUDE_PROJECT_DIR"
        else
            echo "  ℹ️  Submodule files kept (use --deinit to remove)"
        fi

        echo "  ✓ Successfully disabled: $stack"
        echo ""
    done

    if [ "$CHANGES_MADE" = false ]; then
        echo "No changes made."
        exit 0
    fi
fi
```

### 3.4: Status Action

```bash
if [ "$ACTION" = "status" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Stack Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ ${#ENABLED_STACKS[@]} -eq 0 ]; then
        echo "No stacks enabled (this should not happen - base is required)"
        exit 1
    fi

    for stack in "${ENABLED_STACKS[@]}"; do
        # Check initialization status
        if [ -f "$CLAUDE_DIR/$stack/.git" ] || [ -d "$CLAUDE_DIR/$stack/.git" ]; then
            echo "✓ $stack (initialized)"
        else
            echo "⚠️  $stack (NOT initialized)"
            echo "   Run: cd $CLAUDE_DIR && git submodule update --init $stack"
        fi
    done

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Total: ${#ENABLED_STACKS[@]} stack(s) enabled"
    echo ""

    exit 0
fi
```

### 3.5: Refresh Action

```bash
if [ "$ACTION" = "refresh" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Refreshing Enabled Stacks"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    cd "$CLAUDE_DIR"

    for stack in "${ENABLED_STACKS[@]}"; do
        echo "🔄 Updating: $stack..."

        if git submodule update --init "$stack" 2>&1 | grep -v "^Cloning into" || true; then
            # Update nested submodules
            if [ -f "$stack/.gitmodules" ]; then
                echo "  📥 Updating nested submodules..."
                (cd "$stack" && git submodule update --init --recursive) || true
            fi
            echo "  ✓ Updated: $stack"
        else
            echo "  ⚠️  Failed to update: $stack"
        fi
        echo ""
    done

    cd "$CLAUDE_PROJECT_DIR"

    echo "✓ Refresh complete"
    echo ""

    # Continue to Phase 4 to update symlinks
    CHANGES_MADE=true
fi
```

### 3.6: Invalid Action

```bash
if [[ "$ACTION" != "list" && "$ACTION" != "enable" && "$ACTION" != "disable" && "$ACTION" != "status" && "$ACTION" != "refresh" ]]; then
    echo "❌ Error: Unknown action '$ACTION'"
    echo ""
    echo "Available actions:"
    echo "  list      Show all stacks with status (default)"
    echo "  enable    Enable one or more stacks"
    echo "  disable   Disable one or more stacks"
    echo "  status    Show currently enabled stacks"
    echo "  refresh   Re-sync enabled stack submodules"
    echo ""
    echo "Usage: /stack [action] [stack-name...] [--deinit]"
    exit 1
fi
```

---

## Phase 4: Update Symlinks

Rebuild command symlinks to ensure only enabled stacks are linked.

```bash
# Only update symlinks if changes were made
if [ "$CHANGES_MADE" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Updating Command Symlinks"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    cd "$CLAUDE_DIR"

    # Ensure commands directory exists
    mkdir -p commands
    cd commands

    # Remove ALL existing stack symlinks (clean slate)
    echo "🧹 Cleaning old symlinks..."
    for link in *; do
        if [ -L "$link" ]; then
            # Check if it's a stack symlink (not base category)
            if [[ "$link" != "design" && "$link" != "dev" && "$link" != "git" && "$link" != "operation" && "$link" != "utility" ]]; then
                rm "$link"
                echo "  Removed: $link"
            fi
        fi
    done

    # Recreate base category symlinks (always present)
    echo ""
    echo "🔗 Creating base category symlinks..."
    for category in design dev git operation utility; do
        if [ -d "../base/commands/$category" ]; then
            ln -sfn "../base/commands/$category" "$category"
            echo "  Linked: $category -> ../base/commands/$category"
        fi
    done

    # Create symlinks ONLY for enabled stacks with commands
    echo ""
    echo "🔗 Creating stack symlinks..."
    for stack in "${ENABLED_STACKS[@]}"; do
        if [ "$stack" = "base" ]; then
            continue  # Already handled above
        fi

        if [ -d "../$stack/commands" ]; then
            ln -sfn "../$stack/commands" "$stack"
            echo "  Linked: $stack -> ../$stack/commands"
        fi
    done

    cd "$CLAUDE_PROJECT_DIR"

    echo ""
    echo "✓ Command symlinks updated"

    # Also update agent symlinks
    echo ""
    echo "🔗 Updating Agent Symlinks..."
    if [ -f "$CLAUDE_DIR/scripts/link-agents.sh" ]; then
        bash "$CLAUDE_DIR/scripts/link-agents.sh"
    else
        echo "  ⚠️  link-agents.sh not found, skipping agent linking"
    fi
fi
```

---

## Phase 5: Results Report

Provide a summary of operations and next steps.

```bash
if [ "$CHANGES_MADE" = true ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Stack Management Complete"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Reload enabled stacks from config
    FINAL_STACKS=($(jq -r '.enabledStacks[]' "$CONFIG_FILE"))

    echo "Current Configuration:"
    echo "  Enabled Stacks: ${FINAL_STACKS[*]}"
    echo "  Total: ${#FINAL_STACKS[@]} stack(s)"
    echo ""

    # Check for broken symlinks
    echo "Verifying symlinks..."
    cd "$CLAUDE_DIR/commands"
    BROKEN_LINKS=$(find . -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)
    if [ "$BROKEN_LINKS" -gt 0 ]; then
        echo "  ⚠️  Warning: Found $BROKEN_LINKS broken symlink(s)"
        echo "  Run: find .pi/commands -type l ! -exec test -e {} \; -print"
    else
        echo "  ✓ No broken symlinks detected"
    fi
    cd "$CLAUDE_PROJECT_DIR"
    echo ""

    echo "Next Steps:"
    echo "  1. Restart Claude Code to load new skills/commands/hooks"
    echo "  2. Run /stack status to verify configuration"
    echo "  3. Check available commands in enabled stacks"
    echo ""
    echo "Note: Changes to skills and hooks require a Claude Code restart"
    echo ""
fi
```

---

## Usage Examples

```bash
# List all available stacks
/stack
/stack list

# Enable a single stack
/stack enable nestjs

# Enable multiple stacks
/stack enable nestjs react-native

# Show current status
/stack status

# Re-sync all enabled stacks
/stack refresh
```
