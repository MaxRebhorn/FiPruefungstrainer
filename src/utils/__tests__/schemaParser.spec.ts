import { describe, it, expect } from "vitest";
import { parseSchema } from "../schemaParser";

describe("parseSchema", () => {
  it("parses a simple CREATE TABLE", () => {
    const schema = ["CREATE TABLE patienten (id INTEGER PRIMARY KEY, name TEXT NOT NULL);"];
    const tables = parseSchema(schema);
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe("patienten");
    expect(tables[0].columns).toHaveLength(2);
    expect(tables[0].columns[0].name).toBe("id");
    expect(tables[0].columns[0].type).toBe("INTEGER");
    expect(tables[0].columns[1].name).toBe("name");
    expect(tables[0].columns[1].type).toBe("TEXT");
  });

  it("extracts constraints from columns", () => {
    const schema = ["CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE);"];
    const tables = parseSchema(schema);
    const cols = tables[0].columns;
    expect(cols[0].constraints).toContain("PRIMARY KEY");
    expect(cols[0].constraints).toContain("AUTOINCREMENT");
    expect(cols[1].constraints).toContain("NOT NULL");
    expect(cols[1].constraints).toContain("UNIQUE");
  });

  it("parses FOREIGN KEY", () => {
    const schema = [
      "CREATE TABLE besuche (id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patienten(id));",
    ];
    const tables = parseSchema(schema);
    expect(tables[0].foreignKeys).toHaveLength(0); // inline REFERENCES, not FOREIGN KEY clause
  });

  it("parses FOREIGN KEY clause", () => {
    const schema = [
      "CREATE TABLE besuche (id INTEGER PRIMARY KEY, patient_id INTEGER, FOREIGN KEY (patient_id) REFERENCES patienten(id));",
    ];
    const tables = parseSchema(schema);
    expect(tables[0].foreignKeys).toHaveLength(1);
    expect(tables[0].foreignKeys[0].column).toBe("patient_id");
    expect(tables[0].foreignKeys[0].references).toBe("patienten");
    expect(tables[0].foreignKeys[0].referencesColumn).toBe("id");
  });

  it("handles IF NOT EXISTS", () => {
    const schema = ["CREATE TABLE IF NOT EXISTS logs (id INTEGER);"];
    const tables = parseSchema(schema);
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe("logs");
  });

  it("skips non-CREATE TABLE statements", () => {
    const schema = [
      "CREATE INDEX idx_name ON patienten(name);",
      "INSERT INTO patienten VALUES (1, 'Test');",
    ];
    const tables = parseSchema(schema);
    expect(tables).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(parseSchema([])).toEqual([]);
  });

  it("handles table-level constraints (PRIMARY KEY, UNIQUE)", () => {
    const schema = [
      "CREATE TABLE t (a INTEGER, b INTEGER, PRIMARY KEY (a, b), UNIQUE (b));",
    ];
    const tables = parseSchema(schema);
    expect(tables).toHaveLength(1);
    expect(tables[0].columns).toHaveLength(2);
  });

  it("parses DEFAULT values", () => {
    const schema = ["CREATE TABLE t (id INTEGER, status TEXT DEFAULT 'aktiv', anzahl INTEGER DEFAULT 0);"];
    const tables = parseSchema(schema);
    const cols = tables[0].columns;
    expect(cols[1].constraints.some((c) => c.includes("DEFAULT"))).toBe(true);
    expect(cols[2].constraints.some((c) => c.includes("DEFAULT"))).toBe(true);
  });

  it("handles multiple tables", () => {
    const schema = [
      "CREATE TABLE a (id INTEGER);",
      "CREATE TABLE b (id INTEGER);",
      "CREATE TABLE c (id INTEGER);",
    ];
    expect(parseSchema(schema)).toHaveLength(3);
  });
});
