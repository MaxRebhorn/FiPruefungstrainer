import { test, expect } from "@playwright/test";

test.describe("Editor input fields", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".app-header")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 15000 });
  });

  test("SQL task: editor loads with starter code and badge", async ({ page }) => {
    await page.locator(".type-badge.sql").first().click();

    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".lang-badge")).toHaveText("SQL");
    await expect(page.locator(".cm-editor")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await expect(editor).toContainText("SELECT");
    await editor.click();
    await editor.fill("SELECT p.name FROM patienten p;");
    await expect(editor).toHaveText(/SELECT p\.name FROM patienten/);

    await expect(page.locator("button", { hasText: "Ausführen" })).toBeVisible();
  });

  test("JavaScript task: editor loads with starter code and badge", async ({ page }) => {
    await page.locator(".type-badge.javascript").first().click();

    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".lang-badge")).toHaveText("JavaScript");
    await expect(page.locator(".cm-editor")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await expect(editor).toContainText("function");
    await editor.click();
    await editor.fill("function berechneZuzahlung(kosten, status) { return 10; }");
    await expect(editor).toContainText("berechneZuzahlung");

    await expect(page.locator("button", { hasText: "Ausführen" })).toBeVisible();
  });
});
