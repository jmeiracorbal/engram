---
name: engram-branch-pr
description: >
  PR creation workflow for Engram following the issue-first enforcement system.
  Trigger: When creating a pull request, opening a PR, or preparing changes for review.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.0"
---

## When to Use

Use this skill when:
- Creating a pull request for any change
- Preparing a branch for submission
- Helping a contributor open a PR

---

## Critical Rules

1. **Every PR MUST link an approved issue** — no exceptions
2. **Every PR MUST have exactly one `type:*` label**
3. **5 automated checks must pass** before merge is possible
4. **Blank PRs without issue linkage will be blocked** by GitHub Actions

---

## Workflow

```
1. Verify issue has `status:approved` label
2. Create branch: feat/*, fix/*, docs/*, refactor/*, chore/*
3. Implement changes
4. Run tests locally (unit + e2e)
5. Open PR using the template
6. Add exactly one type:* label
7. Wait for 5 automated checks to pass
```

---

## Branch Naming

| Type | Branch pattern | Example |
|------|---------------|---------|
| Bug fix | `fix/<short-description>` | `fix/duplicate-observation-insert` |
| Feature | `feat/<short-description>` | `feat/json-export-command` |
| Docs | `docs/<short-description>` | `docs/api-reference-update` |
| Refactor | `refactor/<short-description>` | `refactor/extract-query-sanitizer` |
| Chore | `chore/<short-description>` | `chore/bump-bubbletea-v0.26` |

---

## PR Body Format

The PR template is at `.github/PULL_REQUEST_TEMPLATE.md`. Every PR body MUST contain:

### 1. Linked Issue (REQUIRED)

```markdown
Closes #<issue-number>
```

Valid keywords: `Closes #N`, `Fixes #N`, `Resolves #N` (case insensitive).
The linked issue MUST have the `status:approved` label.

### 2. PR Type (REQUIRED)

Check exactly ONE in the template and add the matching label:

| Checkbox | Label to add |
|----------|-------------|
| Bug fix | `type:bug` |
| New feature | `type:feature` |
| Documentation only | `type:docs` |
| Code refactoring | `type:refactor` |
| Maintenance/tooling | `type:chore` |
| Breaking change | `type:breaking-change` |

### 3. Summary

1-3 bullet points of what the PR does.

### 4. Changes Table

```markdown
| File | Change |
|------|--------|
| `path/to/file` | What changed |
```

### 5. Test Plan

```markdown
- [x] Unit tests pass locally: `go test ./...`
- [x] E2E tests pass locally: `go test -tags e2e ./internal/server/...`
- [x] Manually tested the affected functionality
```

### 6. Contributor Checklist

All boxes must be checked:
- Linked an approved issue
- Added exactly one `type:*` label
- Ran unit tests locally
- Ran e2e tests locally
- Docs updated if behavior changed
- Conventional commit format
- No `Co-Authored-By` trailers

---

## Automated Checks (all 5 must pass)

| Check | Job name | What it verifies |
|-------|----------|-----------------|
| PR Validation | `Check Issue Reference` | Body contains `Closes/Fixes/Resolves #N` |
| PR Validation | `Check Issue Has status:approved` | Linked issue has `status:approved` |
| PR Validation | `Check PR Has type:* Label` | PR has exactly one `type:*` label |
| CI | `Unit Tests` | `go test ./...` passes |
| CI | `E2E Tests` | `go test -tags e2e ./internal/server/...` passes |

---

## Conventional Commits

```
<type>(<scope>): <short description>
```

Type-to-label mapping:

| Commit type | PR label |
|-------------|----------|
| `feat` | `type:feature` |
| `fix` | `type:bug` |
| `docs` | `type:docs` |
| `refactor` | `type:refactor` |
| `chore` | `type:chore` |
| `feat!` / `fix!` | `type:breaking-change` |

Examples:
```
feat(cli): add --json flag to session list command
fix(store): prevent duplicate observation insert on retry
docs(contributing): update workflow documentation
refactor(internal): extract search query sanitizer
chore(deps): bump github.com/charmbracelet/bubbletea to v0.26
fix!: change session ID format
```

---

## Commands

```bash
# Create branch
git checkout -b feat/my-feature main

# Run tests before pushing
go test ./...                                    # unit tests
go test -tags e2e ./internal/server/...          # e2e tests

# Push and create PR
git push -u origin feat/my-feature
gh pr create --title "feat(scope): description" --body "Closes #N"

# Add type label to PR
gh pr edit <pr-number> --add-label "type:feature"
```
