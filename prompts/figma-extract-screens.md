---
description: Extract Figma screen names and node IDs to update implementation status
argument-hint: Figma URL with node-id (e.g., https://figma.com/design/...?node-id=XXX-XXX)
---

You are a Figma design analyzer. Your task is to extract screen names and node IDs from a Figma design section and update the implementation status documentation.

## Input

Figma URL: $ARGUMENTS

## Step 1: Parse the Figma URL

Extract the file key and node ID from the URL:
- URL format: `https://www.figma.com/design/:fileKey/:fileName?node-id=:nodeId`
- Example: `fileKey=66szKiU5yFXWIGNdbHkUGY`, `nodeId=16297-54644`
- Node ID formats: `16297-105461` (hyphen) → convert to `16297:105461` (colon) for API calls

## Step 2: Fetch Figma Data via REST API

Use the Figma REST API with the token stored in `.project/secrets/figma-token.env`.

### Fetch the node data:

```bash
# Load token from secrets
source .project/secrets/figma-token.env

# Variables from URL
FILE_KEY="<file-key-from-url>"
NODE_ID="<node-id-with-colon>"  # e.g., 16297:54644

# Fetch node with depth=1 (direct children only - fastest)
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$NODE_ID&depth=1" \
  -o /tmp/figma_response.json

# Check response size
echo "Response size: $(wc -c < /tmp/figma_response.json) bytes"
```

### Parse the response:

```python
import json

with open('/tmp/figma_response.json', 'r') as f:
    data = json.load(f)

nodes = data.get('nodes', {})
for node_id, node_data in nodes.items():
    document = node_data.get('document', {})
    name = document.get('name', 'Unknown')
    node_type = document.get('type', 'Unknown')
    children = document.get('children', [])

    print(f"Node: {name}")
    print(f"Type: {node_type}")
    print(f"ID: {node_id}")
    print(f"\nChildren ({len(children)} total):")
    print("-" * 50)

    # Filter for SECTION and FRAME types (main screens)
    for child in children:
        child_id = child.get('id')
        child_name = child.get('name')
        child_type = child.get('type')
        if child_type in ['SECTION', 'FRAME']:
            print(f"  {child_id}: [{child_type}] {child_name}")
```

## Step 3: Generate Markdown Table

Create a table for the implementation status file:

```python
# Generate markdown table
print("\n| Section Name | Node ID | Figma Link | Status |")
print("|--------------|---------|------------|--------|")

for child in sorted(children, key=lambda x: x.get('name', '')):
    if child.get('type') in ['SECTION', 'FRAME']:
        child_id = child.get('id')
        child_name = child.get('name')
        # Convert ID to hyphen format for URL
        url_id = child_id.replace(':', '-')
        print(f"| {child_name} | `{child_id}` | [View](https://www.figma.com/design/66szKiU5yFXWIGNdbHkUGY?node-id={url_id}) | :clipboard: To Map |")
```

## Step 4: Update the Status File

Edit `.project/status/FRONTEND_SCREEN_IMPLEMENTATION_STATUS.md`:

1. Find the "### All Figma Sections" table
2. Add new sections or update existing ones
3. Update the Change Log with today's date

## Step 5: Report Results

After updating, report:
- Node name and type
- Number of children found
- File update confirmation

## Error Handling

- **Invalid URL**: Ask user to provide a valid Figma URL with `node-id` parameter
- **401 Unauthorized**: Token may be expired. Ask user to generate a new token at Figma → Settings → Account → Personal access tokens
- **404 Not Found**: Node ID may be incorrect or file access is restricted
- **Rate Limited (429)**: Wait and retry, or reduce request frequency

## Figma Token Setup

Token is stored at: `.project/secrets/figma-token.env`

To create a new token:
1. Go to Figma → Settings → Account → Personal access tokens
2. Create token with `file_content:read` scope
3. Save to `.project/secrets/figma-token.env` as:
   ```
   FIGMA_TOKEN=figd_xxxxx...
   ```

## Example Usage

**Input:**
```
https://www.figma.com/design/66szKiU5yFXWIGNdbHkUGY/The-Coaching-Record-Web-Portal?node-id=16297-54644
```

**Output:**
- Fetches page "Coach Web Portal - All Approved"
- Lists all sections with node IDs
- Updates implementation status document
