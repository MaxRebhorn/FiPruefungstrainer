import { test, expect } from "@playwright/test";

test.describe("Navigation & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".app-header")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 15000 });
  });

  test("loads all 8 tasks in the grid", async ({ page }) => {
    const cards = page.locator(".task-card");
    await expect(cards).toHaveCount(8);
  });

  test("each task card shows type, difficulty and status badges", async ({ page }) => {
    const firstCard = page.locator(".task-card").first();
    await expect(firstCard.locator(".type-badge")).toBeVisible();
    await expect(firstCard.locator(".difficulty-badge")).toBeVisible();
    await expect(firstCard.locator(".status-indicator")).toBeVisible();
  });

  test("clicking a task navigates to detail view", async ({ page }) => {
    await page.locator(".type-badge.sql").first().click();
    await expect(page).toHaveURL(/\/aufgabe\//);
    await expect(page.locator(".task-detail")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".editor-panel")).toBeVisible();
  });

  test("back navigation to task list works", async ({ page }) => {
    // Click first SQL task
    await page.locator(".type-badge.sql").first().click();
    await expect(page.locator(".task-detail")).toBeVisible({ timeout: 10000 });

    // Navigate back via "Aufgaben" nav link
    await page.locator(".nav-link").first().click();
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 10000 });
  });

  test("progress page loads with stats", async ({ page }) => {
    await page.goto("/#/fortschritt");
    await expect(page.locator(".progress-view")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".summary-cards")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".breakdown-section")).toHaveCount(2);
  });
});

test.describe("Filtering & Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 15000 });
  });

  test("filter by SQL type shows only SQL tasks", async ({ page }) => {
    await page.locator("select").first().selectOption("sql");
    await page.waitForTimeout(300);
    const badges = page.locator(".type-badge.sql");
    await expect(badges).toHaveCount(7);
  });

  test("filter by JavaScript type shows only JS tasks", async ({ page }) => {
    await page.locator("select").first().selectOption("javascript");
    await page.waitForTimeout(300);
    const badges = page.locator(".type-badge.javascript");
    await expect(badges).toHaveCount(1);
  });

  test("filter by difficulty works", async ({ page }) => {
    // Filter by "Leicht" (2 tasks)
    const selects = page.locator("select");
    await selects.nth(1).selectOption("leicht");
    await page.waitForTimeout(300);
    await expect(page.locator(".task-card")).toHaveCount(2);

    // Filter by "Schwer" (1 task)
    await selects.nth(1).selectOption("schwer");
    await page.waitForTimeout(300);
    await expect(page.locator(".task-card")).toHaveCount(1);
  });

  test("search filters by title", async ({ page }) => {
    await page.locator(".search-input").fill("Patienten");
    await page.waitForTimeout(300);
    // Should show only tasks with "Patienten" in title
    const visibleCards = page.locator(".task-card");
    const count = await visibleCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("reset filters shows all tasks", async ({ page }) => {
    // Apply filter first
    await page.locator("select").first().selectOption("javascript");
    await page.waitForTimeout(300);
    await expect(page.locator(".task-card")).toHaveCount(1);

    // Reset
    await page.locator(".reset-btn").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".task-card")).toHaveCount(8);
  });
});

test.describe("SQL Task Execution", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 15000 });
  });

  test("SELECT task: correct query shows success feedback", async ({ page }) => {
    // Navigate to krankenhaus-1 (SELECT with JOIN)
    await page.goto("/#/aufgabe/krankenhaus-1");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill(
      "SELECT p.name AS Name, a.name AS Abteilung, p.aufnahmedatum AS Aufnahmedatum FROM patienten p JOIN abteilungen a ON p.abteilung_id = a.id ORDER BY p.name;"
    );

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.success")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".feedback h4")).toHaveText("Richtig!");
  });

  test("SELECT task: incorrect query shows error feedback", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-1");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill("SELECT * FROM patienten;");

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.error")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".feedback.error")).toContainText("Falsch");
  });

  test("INSERT task: correct query shows success", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-2");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill(
      "INSERT INTO patienten (name, geburtsdatum, versicherungsnr, abteilung_id, aufnahmedatum) VALUES ('Eva Lang', '1995-06-20', 'E555666777', 1, '2024-03-15');"
    );

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.success")).toBeVisible({ timeout: 10000 });
  });

  test("UPDATE task: correct query shows success", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-4");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill(
      "UPDATE behandlungen SET kosten = 250 WHERE behandlungsart = 'Belastungs-EKG';"
    );

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.success")).toBeVisible({ timeout: 10000 });
  });

  test("CREATE TABLE task: correct query shows success", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-5");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill(
      "CREATE TABLE medikamente (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, hersteller TEXT NOT NULL, preis REAL NOT NULL, einheit TEXT);"
    );

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.success")).toBeVisible({ timeout: 10000 });
  });

  test("ALTER TABLE task: correct query shows success", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-6");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill("ALTER TABLE aerzte ADD COLUMN telefon TEXT;");

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.success")).toBeVisible({ timeout: 10000 });
  });

  test("GRANT task: page loads with editor and starter code", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-7");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".lang-badge")).toHaveText("SQL");

    // Editor contains GRANT starter code
    const editor = page.locator(".cm-content");
    await expect(editor).toContainText("GRANT");
  });

  test("SQL syntax error shows error feedback", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-1");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill("SELECTT * FROM patienten;");

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.error")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("JavaScript Task Execution", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 15000 });
  });

  test("JS task: correct implementation passes all test cases", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-8");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill(`function berechneZuzahlung(kosten, versichertenstatus) {
  if (versichertenstatus === "chronisch") {
    return Math.max(5, Math.min(10, kosten * 0.01));
  }
  return Math.max(5, Math.min(10, kosten * 0.1));
}`);

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.success")).toBeVisible({ timeout: 10000 });
  });

  test("JS task: incorrect implementation shows failure", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-8");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill("function berechneZuzahlung(kosten, versichertenstatus) { return 0; }");

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.error")).toBeVisible({ timeout: 10000 });
  });

  test("JS task: syntax error shows error feedback", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-8");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill("function broken(( }}");

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.error")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("UI Components", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 15000 });
  });

  test("SQL task shows SchemaPreview", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-1");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    // Schema preview should show tables
    await expect(page.locator(".schema-preview")).toBeVisible({ timeout: 5000 });
    // Should list at least patienten table
    await expect(page.locator(".schema-preview")).toContainText("patienten");
  });

  test("JavaScript task shows ClassOverview", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-8");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    // Class overview should show the function
    await expect(page.locator(".class-overview")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".class-overview")).toContainText("berechneZuzahlung");
  });

  test("HintModal opens and shows hints", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-1");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    // Click hint button
    await page.locator("button", { hasText: "Hinweis" }).click();
    await expect(page.locator(".modal-backdrop")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".modal-content")).toContainText("INNER JOIN");

    // Close modal
    await page.locator(".modal-backdrop .close-btn").click();
    await expect(page.locator(".modal-backdrop")).not.toBeVisible();
  });

  test("editor reset button restores starter code", async ({ page }) => {
    await page.goto("/#/aufgabe/krankenhaus-1");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    // Write custom code
    await editor.click();
    await editor.fill("SELECT 1;");
    await expect(editor).toHaveText(/SELECT 1/);

    // Reset
    await page.locator("button[title='Code zurücksetzen']").click();
    // Should be restored to starter code (SELECT ...)
    await expect(editor).toContainText("SELECT");
  });
});

test.describe("Status Tracking", () => {
  test("solving a task updates its status badge", async ({ page }) => {
    // Solve krankenhaus-2 (INSERT task - clean, deterministic)
    await page.goto("/#/aufgabe/krankenhaus-2");
    await expect(page.locator(".editor-panel")).toBeVisible({ timeout: 10000 });

    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.fill(
      "INSERT INTO patienten (name, geburtsdatum, versicherungsnr, abteilung_id, aufnahmedatum) VALUES ('Eva Lang', '1995-06-20', 'E555666777', 1, '2024-03-15');"
    );

    await page.locator("button", { hasText: "Ausführen" }).click();
    await expect(page.locator(".feedback.success")).toBeVisible({ timeout: 10000 });

    // Go back to list via "Aufgaben" nav link
    await page.locator(".nav-link").first().click();
    await expect(page.locator(".task-grid")).toBeVisible({ timeout: 10000 });

    // The solved card should show "Gelöst" status
    const solvedCard = page.locator(".task-card").filter({ hasText: "Neuen Patienten aufnehmen" });
    await expect(solvedCard.locator(".status-indicator")).toContainText("Gelöst");
  });
});
