# {WORKFLOW_NAME} Status - {PROJECT_NAME}

> Auto-generated status file for Ralph workflow tracking.
> Template: `.pi/base/templates/ralph/status-file.template.md`

---

## Quick Summary

| Category | Completed | In Progress | Pending | Total |
|----------|-----------|-------------|---------|-------|
| All Items | 0 | 0 | 0 | 0 |

---

## Configuration

```yaml
workflow: {WORKFLOW_NAME}
project: {PROJECT_NAME}
skill: .pi/{STACK}/skills/{SKILL_FILE}
created: {DATE}
last_run: null
```

---

## Item Tracking

| Item Name | Source Ref | Status | Last Run | Result | Notes |
|-----------|------------|--------|----------|--------|-------|
| *No items discovered yet* | - | - | - | - | Run discovery to populate |

---

## Execution Log

| Date | Items Processed | Pass | Fail | Skipped | Duration | Notes |
|------|-----------------|------|------|---------|----------|-------|

---

## Needs Manual Review

Items that couldn't be processed automatically and require human attention.

*None yet*

---

## Changelog

- {DATE}: Initial status file created

---

## Status Legend

| Icon | Status | Meaning |
|------|--------|---------|
| :white_check_mark: | Pass | Successfully processed |
| :construction: | In Progress | Currently being processed |
| :clipboard: | Pending | Not yet processed |
| :x: | Failed | Processing failed |
| :warning: | Needs Review | Requires manual attention |

---

## Usage

### Run Full Workflow
```bash
/ralph {WORKFLOW_KEY} {PROJECT_NAME}
```

### Run Incremental (Pending Only)
```bash
/ralph {WORKFLOW_KEY} {PROJECT_NAME} --incremental
```

### Run Specific Category
```bash
/ralph {WORKFLOW_KEY} {PROJECT_NAME} --category "Category Name"
```
