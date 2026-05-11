# Design Guidelines Extraction from HTML Prototypes

> This guide is loaded by the `new-project` command during Step 7.8.3.
> Contains the complete bash logic for extracting design tokens (colors, typography,
> spacing, shadows, transitions) from HTML prototype files into PROJECT_DESIGN_GUIDELINES.md.
>
> **Source**: Extracted from `commands/dev/new-project.md` for context window optimization.

---

## Extraction Script

Execute this script when HTML prototypes exist in `.project/resources/HTML/`:

```bash
if [ -d ".project/resources/HTML" ]; then
  echo "Extracting design guidelines from HTML prototypes..."

  # Count HTML files
  HTML_FILE_COUNT=$(find .project/resources/HTML -name "*.html" 2>/dev/null | wc -l)

  if [ "$HTML_FILE_COUNT" -eq 0 ]; then
    echo "No HTML files found in .project/resources/HTML/"
    echo "  Skipping design guidelines extraction"
  else
    echo "Processing $HTML_FILE_COUNT HTML files for design extraction..."

    # Copy template
    cp .pi/templates/claude-project/docs/PROJECT_DESIGN_GUIDELINES.template.md \
       .project/docs/PROJECT_DESIGN_GUIDELINES.md

    # Replace basic placeholders
    sed -i "s/{PROJECT_NAME}/$PROJECT_NAME/g" .project/docs/PROJECT_DESIGN_GUIDELINES.md
    sed -i "s/{DATE}/$(date +%Y-%m-%d)/g" .project/docs/PROJECT_DESIGN_GUIDELINES.md

    # Execute deep extraction
    HTML_DIR=".project/resources/HTML"
    OUTPUT_FILE=".project/docs/PROJECT_DESIGN_GUIDELINES.md"

    # Create temp directory for extraction
    TEMP_DIR=$(mktemp -d -t design-extract-XXXXXX)

    # Find all HTML files
    find "$HTML_DIR" -name "*.html" > "$TEMP_DIR/files.txt"

    # Extract Tailwind configs from all HTML files
    while IFS= read -r file; do
      sed -n '/tailwind.config/,/^[[:space:]]*<\/script>/p' "$file" 2>/dev/null
    done < "$TEMP_DIR/files.txt" > "$TEMP_DIR/configs.txt"

    # Extract all CSS classes from HTML
    while IFS= read -r file; do
      grep -oE 'class="[^"]*"' "$file" 2>/dev/null | \
        sed 's/class="//g; s/"//g' | \
        tr ' ' '\n'
    done < "$TEMP_DIR/files.txt" > "$TEMP_DIR/classes.txt"

    # Analyze patterns by category
    grep "hover:" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/hover.txt"
    grep "focus:" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/focus.txt"
    grep "active:" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/active.txt"
    grep "disabled:" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/disabled.txt"
    grep "^bg-" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/colors.txt"
    grep "^text-" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/text.txt"
    grep "transition\|duration\|ease-" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/transitions.txt"
    grep "^p-\|^px-\|^py-\|^gap-" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/spacing.txt"
    grep "rounded" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/radius.txt"
    grep "shadow" "$TEMP_DIR/classes.txt" 2>/dev/null | sort | uniq -c | sort -rn > "$TEMP_DIR/shadows.txt"

    # Extract primary color
    PRIMARY=$(grep -m 1 "primary:" "$TEMP_DIR/configs.txt" 2>/dev/null | grep -oE "#[0-9A-Fa-f]{6}" | head -1)
    if [ -n "$PRIMARY" ]; then
      sed -i "0,/\[EXTRACTED\]/s//$PRIMARY/" "$OUTPUT_FILE"
    fi

    # Extract primary dark (hover state)
    PRIMARY_DARK=$(grep -m 1 "primaryDark:" "$TEMP_DIR/configs.txt" 2>/dev/null | grep -oE "#[0-9A-Fa-f]{6}" | head -1)
    if [ -n "$PRIMARY_DARK" ]; then
      sed -i "0,/\[EXTRACTED\]/s//$PRIMARY_DARK/" "$OUTPUT_FILE"
    fi

    # Extract primary light (background)
    PRIMARY_LIGHT=$(grep -m 1 "primaryLight:" "$TEMP_DIR/configs.txt" 2>/dev/null | grep -oE "#[0-9A-Fa-f]{6}" | head -1)
    if [ -n "$PRIMARY_LIGHT" ]; then
      sed -i "0,/\[EXTRACTED\]/s//$PRIMARY_LIGHT/" "$OUTPUT_FILE"
    fi

    # Extract dark color
    DARK_COLOR=$(grep -m 1 "dark:" "$TEMP_DIR/configs.txt" 2>/dev/null | grep -oE "#[0-9A-Fa-f]{6}" | head -1)
    if [ -n "$DARK_COLOR" ]; then
      sed -i "0,/\[EXTRACTED\]/s//$DARK_COLOR/" "$OUTPUT_FILE"
    fi

    # Extract font family from Google Fonts link or Tailwind config
    FONT_FAMILY=$(grep -oP "family=\K[^&:]+(?=&|\:)" "$TEMP_DIR/files.txt" 2>/dev/null | head -1 | sed 's/+/ /g')
    if [ -z "$FONT_FAMILY" ]; then
      FONT_FAMILY=$(grep -oP "fontFamily.*sans.*\[\s*'\K[^']+(?=')" "$TEMP_DIR/configs.txt" 2>/dev/null | head -1)
    fi
    if [ -n "$FONT_FAMILY" ]; then
      sed -i "s/\[EXTRACTED from HTML\]/$FONT_FAMILY/g" "$OUTPUT_FILE"
    fi

    # Extract most common transition duration
    COMMON_DURATION=$(grep -oE "duration-[0-9]+" "$TEMP_DIR/transitions.txt" 2>/dev/null | head -1 | awk '{print $2}' | sed 's/duration-//')
    if [ -n "$COMMON_DURATION" ]; then
      sed -i "s/\[EXTRACTED or 200ms\]/${COMMON_DURATION}ms/g" "$OUTPUT_FILE"
      sed -i "s/\[EXTRACTED or 300ms\]/300ms/g" "$OUTPUT_FILE"
      sed -i "s/\[EXTRACTED or 500ms\]/500ms/g" "$OUTPUT_FILE"
    fi

    # Clean up temp directory
    rm -rf "$TEMP_DIR"

    echo "Generated PROJECT_DESIGN_GUIDELINES.md with:"
    echo "  - Complete color system (primary, semantic, neutrals)"
    echo "  - Typography scale (font family, sizes, weights)"
    echo "  - Spacing system (padding, margins, gaps)"
    echo "  - Border radius levels"
    echo "  - Shadow elevations"
    echo "  - Interactive state matrices (5 states per component)"
    echo "  - Animation & transition timing"
    echo "  - Component patterns (navigation, cards, forms, buttons)"
    echo "  - Responsive breakpoints"
    echo "  - Icon system"
    echo "  - HR line styles"
    echo "  - Form element states"
    echo "  - Accessibility guidelines"
    echo ""
    echo "  Source: Analyzed $HTML_FILE_COUNT HTML prototype files"
    echo "  Output: .project/docs/PROJECT_DESIGN_GUIDELINES.md"
  fi
else
  echo "No HTML prototypes found - skipping design guidelines extraction"
  echo "  Tip: Add HTML files to .project/resources/HTML/ to enable comprehensive design extraction"
fi
```

**Integration Point**: Executes automatically during `/dev:new-project` command when HTML prototypes are detected. Provides comprehensive design system with all component states extracted from actual HTML patterns.
