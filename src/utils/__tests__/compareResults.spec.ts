import { describe, it, expect } from "vitest";
import { compareTablesDeep } from "../compareResults";

function makeResult(columns: string[], rows: any[][]) {
  return { columns, rows };
}

describe("compareTablesDeep", () => {
  it("returns isEqual true for identical tables", () => {
    const nutzer = makeResult(["id", "name"], [[1, "Alice"], [2, "Bob"]]);
    const erwartet = makeResult(["id", "name"], [[1, "Alice"], [2, "Bob"]]);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.isEqual).toBe(true);
  });

  it("detects missing rows", () => {
    const nutzer = makeResult(["id"], [[1]]);
    const erwartet = makeResult(["id"], [[1], [2]]);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.isEqual).toBe(false);
    expect(result.diff.fehlende).toHaveLength(1);
    expect(result.diff.fehlende[0]).toEqual({ id: 2 });
  });

  it("detects extra rows", () => {
    const nutzer = makeResult(["id"], [[1], [2]]);
    const erwartet = makeResult(["id"], [[1]]);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.isEqual).toBe(false);
    expect(result.diff.zusaetzliche).toHaveLength(1);
  });

  it("detects different values", () => {
    const nutzer = makeResult(["id", "name"], [[1, "Alice"]]);
    const erwartet = makeResult(["id", "name"], [[1, "Bob"]]);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.isEqual).toBe(false);
    expect(Object.keys(result.diff.unterschiedlich).length).toBeGreaterThanOrEqual(1);
  });

  it("ignores column order when spaltenReihenfolgeIgnorieren is true", () => {
    const nutzer = makeResult(["name", "id"], [["Alice", 1]]);
    const erwartet = makeResult(["id", "name"], [[1, "Alice"]]);
    const result = compareTablesDeep(nutzer, erwartet, true, false);
    expect(result.isEqual).toBe(true);
  });

  it("ignores row order when zeilenReihenfolgeIgnorieren is true", () => {
    const nutzer = makeResult(["id"], [[2], [1]]);
    const erwartet = makeResult(["id"], [[1], [2]]);
    const result = compareTablesDeep(nutzer, erwartet, false, true);
    expect(result.isEqual).toBe(true);
  });

  it("detects column mismatch (ordering matters)", () => {
    const nutzer = makeResult(["name", "id"], [["Alice", 1]]);
    const erwartet = makeResult(["id", "name"], [[1, "Alice"]]);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.isEqual).toBe(false);
    expect(result.diff.unterschiedlich["_spalten"]).toBeDefined();
  });

  it("handles empty results", () => {
    const nutzer = makeResult(["id"], []);
    const erwartet = makeResult(["id"], []);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.isEqual).toBe(true);
  });

  it("handles null values", () => {
    const nutzer = makeResult(["id", "name"], [[1, null]]);
    const erwartet = makeResult(["id", "name"], [[1, null]]);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.isEqual).toBe(true);
  });

  it("diff returns typ 'tabelle'", () => {
    const nutzer = makeResult(["id"], [[1]]);
    const erwartet = makeResult(["id"], [[1]]);
    const result = compareTablesDeep(nutzer, erwartet, false, false);
    expect(result.diff.typ).toBe("tabelle");
  });
});
