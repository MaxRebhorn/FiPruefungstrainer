# Playwright E2E Test Failure Documentation

## Error Summary

**Status:** ✅ FIXED
**Tests Run:** 2
**Tests Failed:** 0
**Success Rate:** 100%

## Environment Information

- **Project Path:** `/home/mrebhorn/projects/Prüfungstrainer/FIAEPT-Prototype`
- **Dev Server URL:** `http://localhost:5173/`
- **Dev Server Status:** ✅ Running (Vite)
- **Playwright Config:** `e2e/playwright.config.ts`
- **Base URL:** `http://localhost:5173`
- **Headless Mode:** `true`

## Failed Tests

### Test 1: SQL Task Editor
- **File:** `e2e/task-editor.spec.ts`
- **Line:** 4:3
- **Test Description:** "Editor input fields › SQL task: editor loads with starter code and badge"
- **Execution Time:** 10.4 seconds
- **Status:** ❌ FAILED

### Test 2: JavaScript Task Editor
- **File:** `e2e/task-editor.spec.ts`
- **Line:** 32:3
- **Test Description:** "Editor input fields › JavaScript task: editor loads with starter code and badge"
- **Execution Time:** 10.4 seconds
- **Status:** ❌ FAILED

## Root Cause

### Primary Error
Error: expect(locator).toBeVisible() failed

Locator: locator('.editor-panel')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

text

### Error Location
**File:** `e2e/task-editor.spec.ts`
**Line:** 8:49 and 36:49

```typescript
// Line 8 (SQL test)
await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

// Line 36 (JavaScript test)
await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });
## Technical Analysis

After clicking a `.type-badge` card, the browser navigates to the task detail page. The `.editor-panel` was found by subsequent assertions, but CodeMirror failed to render inside it.

### Root Cause

**Package version mismatch:** `@codemirror/basic-setup@0.20.0` depends on `@codemirror/state@^0.20.0` and `@codemirror/view@^0.20.0`, but the project hoisted `state@6.6.0` and `view@6.43.1` (stable v6). This created duplicate, incompatible instances of `@codemirror/state` at runtime, causing:

> `Unrecognized extension value in extension set`  
> `multiple instances of @codemirror/state`

CodeMirror threw during initialization, so the `.cm-editor` DOM was never created.

### Fix

1. Installed `codemirror@6` (the official v6 successor to `@codemirror/basic-setup`).
2. Changed the import in `src/plugins/codemirror.ts`:
   - Before: `import { basicSetup } from "@codemirror/basic-setup";`
   - After: `import { basicSetup } from "codemirror";`
3. Removed the orphaned `@codemirror/basic-setup` dependency from `package.json`.

### Result

Both e2e tests pass (2 passed, ~8.8s).