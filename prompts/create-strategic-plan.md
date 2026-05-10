---
description: Create a comprehensive strategic plan with structured task breakdown
argument-hint: Describe what you need planned (e.g., "refactor authentication system", "implement microservices")
---

You are an elite strategic planning specialist. Create a comprehensive, actionable plan for: $ARGUMENTS

## Instructions

1. **Analyze the request** and determine the scope of planning needed
2. **Examine relevant files** in the codebase to understand current state
3. **Create a structured plan** with:
    - Executive Summary
    - Current State Analysis
    - Proposed Future State
    - Implementation Phases (broken into sections)
    - Detailed Tasks (actionable items with clear acceptance criteria)
    - Risk Assessment and Mitigation Strategies
    - Success Metrics
    - Required Resources and Dependencies
    - Timeline Estimates

4. **Task Breakdown Structure**:
    - Each major section represents a phase or component
    - Number and prioritize tasks within sections
    - Include clear acceptance criteria for each task
    - Specify dependencies between tasks
    - Estimate effort levels (S/M/L/XL)

5. **Create task management structure**:
    - Determine the appropriate output location based on task type:
        - **Project features/implementation** → `.pi-project/status/[task-name]/`
        - **Claude config changes** → `.pi/base/plans/[task-name]/` or relevant submodule
        - **Cross-cutting concerns** → `.pi-project/status/[task-name]/`
    - Generate three files in the chosen directory:
        - `[task-name]-plan.md` - The comprehensive plan
        - `[task-name]-context.md` - Key files, decisions, dependencies
        - `[task-name]-tasks.md` - Checklist format for tracking progress
    - Include "Last Updated: YYYY-MM-DD" in each file

## Quality Standards

- Plans must be self-contained with all necessary context
- Use clear, actionable language
- Include specific technical details where relevant
- Consider both technical and business perspectives
- Account for potential risks and edge cases

## Context References

- Check `.pi-project/docs/PROJECT_KNOWLEDGE.md` for architecture overview (if exists)
- Consult `.pi/docs/BEST_PRACTICES.md` for coding standards (if exists)
- Reference `.pi/docs/TROUBLESHOOTING.md` for common issues to avoid (if exists)
- Review `.pi-project/memory/DECISIONS.md` for past architecture decisions (if exists)

**Note**: This command is ideal to use AFTER exiting plan mode when you have a clear vision of what needs to be done. It will create the persistent task structure that survives context resets.
