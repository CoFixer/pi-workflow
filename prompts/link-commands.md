---
description: Create symlinks between base and tech stack command folders
argument-hint: no arguments
---

# Link Commands

Creates symlinks to make all submodule commands accessible from the central `.pi/commands/` hub.

---

## Purpose

This command sets up the symlink structure that allows all commands from:
- **Base commands** (`design`, `dev`, `git`, `operation`, `utility`)
- **Tech stack commands** (`react-native`, `nestjs`, `react`)

...to be accessible from a single location: `.pi/commands/`

---

## Step 1: Validate Directory Structure

Verify the `.claude` directory exists and contains the expected structure:

```bash
ls -d .pi/base/commands 2>/dev/null || echo "NOT_FOUND"
```

**If NOT_FOUND:**
```
Error: .pi/base/commands directory not found.
Please ensure submodules are initialized:
  git submodule update --init --recursive
```

---

## Step 2: Create Commands Hub Directory

Create the central commands directory if it doesn't exist:

```bash
mkdir -p .pi/commands
```

---

## Step 3: Link Base Command Categories

Link each base command category to the commands hub:

```bash
cd .claude
for category in design dev git operation utility; do
    if [ -d "base/commands/$category" ]; then
        ln -sfn "../base/commands/$category" "commands/$category"
        echo "Linked: $category -> ../base/commands/$category"
    fi
done
cd ..
```

---

## Step 4: Link Tech Stack Commands

Link tech-stack-specific commands if they exist:

```bash
cd .claude

# Link react-native commands
if [ -d "react-native/commands" ]; then
    ln -sfn "../react-native/commands" "commands/react-native"
    echo "Linked: react-native -> ../react-native/commands"
fi

# Link other framework commands
for framework in nestjs react; do
    if [ -d "$framework/commands" ]; then
        ln -sfn "../$framework/commands" "commands/$framework"
        echo "Linked: $framework -> ../$framework/commands"
    fi
done
cd ..
```

---

## Step 5: Verify and Report Results

Show the final state of the commands hub:

```bash
ls -la .pi/commands/
```

**Report format:**
```
## Commands Linked Successfully

| Category | Target |
|----------|--------|
| design | ../base/commands/design |
| dev | ../base/commands/dev |
| git | ../base/commands/git |
| operation | ../base/commands/operation |
| utility | ../base/commands/utility |
| react-native | ../react-native/commands |

All commands are now accessible from `.pi/commands/`
```

---

## Error Handling

**Submodules not initialized:**
```
Error: .pi/base/commands not found.

The base submodule may not be initialized. Run:
  git submodule update --init --recursive

Then try /link-commands again.
```

**Permission denied:**
```
Error: Cannot create symlinks in .pi/commands/

Check directory permissions:
  ls -la .pi/
```

**Broken symlinks:**
If existing symlinks are broken, the `-sfn` flag will replace them.

---

## Example

Running `/link-commands`:

```
Linked: design -> ../base/commands/design
Linked: dev -> ../base/commands/dev
Linked: git -> ../base/commands/git
Linked: operation -> ../base/commands/operation
Linked: utility -> ../base/commands/utility
Linked: react-native -> ../react-native/commands

## Commands Linked Successfully

| Category | Target |
|----------|--------|
| design | ../base/commands/design |
| dev | ../base/commands/dev |
| git | ../base/commands/git |
| operation | ../base/commands/operation |
| utility | ../base/commands/utility |
| react-native | ../react-native/commands |

All commands are now accessible from `.pi/commands/`
```

---

## Notes

- Uses `ln -sfn` which:
  - `-s`: Creates symbolic link
  - `-f`: Forces overwrite if link exists
  - `-n`: Treats destination as normal file if it's a symlink to a directory
- Only links directories that exist (silently skips missing ones)
- Safe to run multiple times (idempotent)
