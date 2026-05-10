# /dev:fix-gitignore

**Purpose:** Scan existing `.claude` framework submodules and add missing patterns to `.gitignore`.

**Use Cases:**
- After manually adding submodules
- After pulling changes that added new frameworks
- To ensure consistency across team environments
- When upgrading from older `/dev:setup-claude` versions

## Usage

```bash
/dev:fix-gitignore
```

No arguments needed - automatically detects existing submodules.

## Implementation

### Step 1: Detect Existing Submodules

```bash
cd .claude

# Parse .gitmodules to find framework submodules
EXISTING_FRAMEWORKS=()

for dir in nestjs react react-native marketing operations; do
  if [ -d "$dir" ] && grep -q "path = $dir" .gitmodules 2>/dev/null; then
    EXISTING_FRAMEWORKS+=("$dir")
  fi
done

if [ ${#EXISTING_FRAMEWORKS[@]} -eq 0 ]; then
  echo "No framework submodules detected in .gitmodules"
  exit 0
fi

echo "Detected frameworks: ${EXISTING_FRAMEWORKS[@]}"
```

### Step 2: Apply Patterns

**For each detected framework**, add missing patterns to `.gitignore`:

```bash
GITIGNORE_FILE=".gitignore"

# Ensure .gitignore exists
touch "$GITIGNORE_FILE"

# Helper function to add pattern if not exists
add_pattern() {
  local pattern="$1"
  if ! grep -qF "$pattern" "$GITIGNORE_FILE" 2>/dev/null; then
    echo "$pattern" >> "$GITIGNORE_FILE"
    echo "  + Added: $pattern"
  fi
}

# Apply patterns based on detected frameworks
for framework in "${EXISTING_FRAMEWORKS[@]}"; do
  case "$framework" in
    nestjs)
      echo "Updating .gitignore for NestJS..."
      add_pattern "nestjs/node_modules/"
      add_pattern "nestjs/dist/"
      add_pattern "nestjs/.env"
      add_pattern "nestjs/.env.local"
      add_pattern "nestjs/package-lock.json"
      ;;
    react)
      echo "Updating .gitignore for React..."
      add_pattern "react/node_modules/"
      add_pattern "react/build/"
      add_pattern "react/.next/"
      add_pattern "react/dist/"
      add_pattern "react/.env.local"
      add_pattern "react/package-lock.json"
      ;;
    react-native)
      echo "Updating .gitignore for React Native..."
      add_pattern "react-native/node_modules/"
      add_pattern "react-native/.expo/"
      add_pattern "react-native/android/app/build/"
      add_pattern "react-native/ios/Pods/"
      add_pattern "react-native/.env"
      ;;
    marketing)
      echo "Updating .gitignore for Marketing..."
      add_pattern "marketing/node_modules/"
      add_pattern "marketing/.env"
      ;;
    operations)
      echo "Updating .gitignore for Operations..."
      add_pattern "operations/node_modules/"
      add_pattern "operations/.env"
      ;;
  esac
done
```

### Step 3: Report Changes

```bash
echo ""
echo "✓ .gitignore updated with missing framework patterns"
echo ""
echo "To commit changes:"
echo "  cd .claude"
echo "  git add .gitignore"
echo "  git commit -m 'chore: Add missing .gitignore patterns for framework submodules'"
```

## Example Output

```
Detected frameworks: nestjs react

Updating .gitignore for NestJS...
  + Added: nestjs/node_modules/
  + Added: nestjs/dist/
  + Added: nestjs/.env
  + Added: nestjs/.env.local
  + Added: nestjs/package-lock.json

Updating .gitignore for React...
  + Added: react/node_modules/
  + Added: react/build/
  + Added: react/.next/
  + Added: react/dist/
  + Added: react/.env.local
  + Added: react/package-lock.json

✓ .gitignore updated with missing framework patterns

To commit changes:
  cd .claude
  git add .gitignore
  git commit -m 'chore: Add missing .gitignore patterns for framework submodules'
```

## Features

- **Automatic Detection**: Scans `.gitmodules` for existing framework submodules
- **Idempotent**: Safe to run multiple times - won't duplicate patterns
- **Comprehensive**: Covers all 6 supported frameworks
- **Non-Destructive**: Only appends new patterns, preserves existing ones
- **Framework-Specific**: Each framework gets its appropriate patterns

## Pattern Details

### NestJS
- `nestjs/node_modules/` - npm dependencies
- `nestjs/dist/` - build output
- `nestjs/.env`, `nestjs/.env.local` - environment secrets
- `nestjs/package-lock.json` - lock file

### React
- `react/node_modules/` - npm dependencies
- `react/build/`, `react/dist/` - build output
- `react/.next/` - Next.js build cache
- `react/.env.local` - environment secrets
- `react/package-lock.json` - lock file

### React Native
- `react-native/node_modules/` - npm dependencies
- `react-native/.expo/` - Expo cache
- `react-native/android/app/build/` - Android build artifacts
- `react-native/ios/Pods/` - CocoaPods dependencies
- `react-native/.env` - environment secrets

### Marketing
- `marketing/node_modules/` - npm dependencies
- `marketing/.env` - environment secrets

### Operations
- `operations/node_modules/` - npm dependencies
- `operations/.env` - environment secrets

## Troubleshooting

### No frameworks detected
**Issue:** "No framework submodules detected in .gitmodules"

**Solutions:**
- Verify you're in the `.claude` directory
- Check that `.gitmodules` file exists
- Ensure submodules were added via `/dev:setup-claude` or `/dev:migrate-submodules`

### Patterns already exist
**Issue:** No new patterns added

**Explanation:** All patterns already present in `.gitignore` - this is expected after running the command once.

### Permission denied
**Issue:** Cannot write to `.gitignore`

**Solutions:**
- Check file permissions: `ls -la .gitignore`
- Ensure you have write access to the `.claude` directory
- Try running with appropriate permissions

## Related Commands

- `/dev:setup-claude` - Interactive framework submodule setup (now includes automatic `.gitignore` updates)
- `/dev:migrate-submodules` - Flag-based framework submodule migration (now includes automatic `.gitignore` updates)
- `/dev:submodule-check` - Validate submodule health and synchronization
- `/dev:validate-claude-config` - Comprehensive Claude configuration validation
