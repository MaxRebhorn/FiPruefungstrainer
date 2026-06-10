import type {
  SelectCompareSolution,
  InsertCheckSolution,
  UpdateCheckSolution,
  AlterCheckSolution,
  CreateCheckSolution,
  GrantCheckSolution,
  ValidationResult,
  DiffInfo,
  ColumnDef,
} from "@/types/task";
import { compareTablesDeep } from "@/utils/compareResults";

declare global {
  interface Window {
    _SQL: any;
  }
}

export class SQLiteRunner {
  private db: any;

  constructor(sqlJsInstance: any) {
    this.db = new sqlJsInstance.Database();
  }

  static buildDB(
    sqlJsInstance: any,
    schemaStatements: string[]
  ): SQLiteRunner {
    const runner = new SQLiteRunner(sqlJsInstance);

    for (const stmt of schemaStatements) {
      try {
        runner.db.run(stmt);
      } catch (err: any) {
        console.error("Schema execution error:", err.message, stmt);
      }
    }

    return runner;
  }

  execute(
    sql: string
  ): { columns: string[]; rows: any[][] } | { error: string } {
    try {
      const statements = sql
        .trim()
        .split(";")
        .filter((s) => s.trim());
      if (statements.length === 0) {
        return { error: "Keine SQL-Query eingegeben" };
      }

      const result = this.db.exec(statements[0] + ";");

      if (result.length === 0) {
        return { columns: [], rows: [] };
      }

      const { columns, values } = result[0];
      return { columns, rows: values };
    } catch (err: any) {
      return { error: `SQL-Fehler: ${err.message}` };
    }
  }

  executeAll(sql: string): any[] {
    const results: any[] = [];
    const statements = sql
      .trim()
      .split(";")
      .filter((s) => s.trim());

    for (const stmt of statements) {
      try {
        const result = this.db.exec(stmt + ";");
        if (result.length > 0) {
          const { columns, values } = result[0];
          results.push({ columns, rows: values });
        } else {
          results.push(`${stmt}; executed successfully`);
        }
      } catch (err: any) {
        results.push({ error: `SQL-Fehler: ${err.message}` });
      }
    }

    return results;
  }

  validate(nutzersql: string, loesung: any): ValidationResult {
    switch (loesung.typ) {
      case "select_compare":
        return this.validate_select_compare(nutzersql, loesung);
      case "insert_check":
        return this.validate_insert_check(nutzersql, loesung);
      case "update_check":
        return this.validate_update_check(nutzersql, loesung);
      case "alter_check":
        return this.validate_alter_check(nutzersql, loesung);
      case "create_check":
        return this.validate_create_check(nutzersql, loesung);
      case "grant_check":
        return this.validateGrantCheck(nutzersql, loesung);
      default:
        return {
          ok: false,
          typ: loesung.typ || "unknown",
          message: `Unbekannter Validierungstyp: ${loesung.typ}`,
          fehler: "Unknown validation type",
        };
    }
  }

  validate_select_compare(
    nutzersql: string,
    loesung: SelectCompareSolution
  ): ValidationResult {
    const userResult = this.execute(nutzersql);
    if ("error" in userResult) {
      return {
        ok: false,
        typ: "select_compare",
        message: userResult.error,
        fehler: userResult.error,
      };
    }

    const expectedResult = this.execute(loesung.musterloesung);
    if ("error" in expectedResult) {
      return {
        ok: false,
        typ: "select_compare",
        message: "Fehler in Musterlösung (Autor-Fehler)",
        fehler: expectedResult.error,
      };
    }

    const { isEqual, diff } = compareTablesDeep(
      userResult,
      expectedResult,
      loesung.spaltenReihenfolgeIgnorieren || false,
      loesung.zeilenReihenfolgeIgnorieren || false
    );

    return {
      ok: isEqual,
      typ: "select_compare",
      message: isEqual
        ? `✅ Richtig! ${userResult.rows.length} Zeilen, alle Spalten korrekt.`
        : `❌ Falsch. Deine Ausgabe liefert ${userResult.rows.length} Zeilen, erwartet waren ${expectedResult.rows.length}.`,
      nutzerergebnis: userResult,
      erwartetergebnis: expectedResult,
      diff,
    };
  }

  validate_insert_check(
    nutzersql: string,
    loesung: InsertCheckSolution
  ): ValidationResult {
    const insertResult = this.execute(nutzersql);
    if ("error" in insertResult) {
      return {
        ok: false,
        typ: "insert_check",
        message: insertResult.error,
        fehler: insertResult.error,
      };
    }

    const checkResult = this.execute(loesung.pruefQuery);
    if ("error" in checkResult) {
      return {
        ok: false,
        typ: "insert_check",
        message: "Fehler beim Validieren",
        fehler: checkResult.error,
      };
    }

    const expected = loesung.erwartet;
    const actual = checkResult.rows.map((row: any[]) => {
      const obj: any = {};
      checkResult.columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });

    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);

    return {
      ok: isEqual,
      typ: "insert_check",
      message: isEqual
        ? "✅ Korrekt eingefügt!"
        : "❌ Falsch eingefügt",
      nutzerergebnis: actual,
      erwartetergebnis: expected,
    };
  }

  validate_update_check(
    nutzersql: string,
    loesung: UpdateCheckSolution
  ): ValidationResult {
    const updateResult = this.execute(nutzersql);
    if ("error" in updateResult) {
      return {
        ok: false,
        typ: "update_check",
        message: updateResult.error,
        fehler: updateResult.error,
      };
    }

    const checkResult = this.execute(loesung.pruefQuery);
    if ("error" in checkResult) {
      return {
        ok: false,
        typ: "update_check",
        message: "Fehler beim Validieren",
        fehler: checkResult.error,
      };
    }

    const expected = loesung.erwartet;
    const actual = checkResult.rows.map((row: any[]) => {
      const obj: any = {};
      checkResult.columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });

    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);

    return {
      ok: isEqual,
      typ: "update_check",
      message: isEqual
        ? "✅ Korrekt aktualisiert!"
        : "❌ Falsch aktualisiert",
      nutzerergebnis: actual,
      erwartetergebnis: expected,
    };
  }

  validate_alter_check(
    nutzersql: string,
    loesung: AlterCheckSolution
  ): ValidationResult {
    const alterResult = this.execute(nutzersql);
    if ("error" in alterResult) {
      return {
        ok: false,
        typ: "alter_check",
        message: alterResult.error,
        fehler: alterResult.error,
      };
    }

    const tableInfo = this.execute(
      `PRAGMA table_info(${loesung.tabellenname});`
    );
    if ("error" in tableInfo) {
      return {
        ok: false,
        typ: "alter_check",
        message: "Tabelle nicht gefunden",
        fehler: tableInfo.error,
      };
    }

    const actualColumns = tableInfo.rows.map((row: any[]) => ({
      name: row[1],
      type: row[2],
      notNull: row[3] === 1,
      primaryKey: row[5] === 1,
    }));

    const expected = loesung.erwarteteSpaltendefinition;
    const colDiff = DiffColumnDefs(expected, actualColumns);

    return {
      ok: colDiff.length === 0,
      typ: "alter_check",
      message:
        colDiff.length === 0
          ? "✅ Tabellenstruktur korrekt!"
          : `❌ Abweichungen: ${colDiff.join(", ")}`,
      nutzerergebnis: actualColumns,
      erwartetergebnis: expected,
    };
  }

  validate_create_check(
    nutzersql: string,
    loesung: CreateCheckSolution
  ): ValidationResult {
    const createResult = this.execute(nutzersql);
    if ("error" in createResult) {
      return {
        ok: false,
        typ: "create_check",
        message: createResult.error,
        fehler: createResult.error,
      };
    }

    const tableInfo = this.execute(
      `PRAGMA table_info(${loesung.tabellenname});`
    );
    if ("error" in tableInfo) {
      return {
        ok: false,
        typ: "create_check",
        message: "Tabelle wurde nicht erstellt",
        fehler: tableInfo.error,
      };
    }

    const actualColumns = tableInfo.rows.map((row: any[]) => ({
      name: row[1],
      type: row[2],
      notNull: row[3] === 1,
      primaryKey: row[5] === 1,
    }));

    const expected = loesung.erwarteteSpaltendefinition;
    const colDiff = DiffColumnDefs(expected, actualColumns);

    let indexMessages: string[] = [];
    if (loesung.erwarteteIndizes) {
      for (const idx of loesung.erwarteteIndizes) {
        const indexInfo = this.execute(
          `PRAGMA index_list(${loesung.tabellenname});`
        );
        if (!("error" in indexInfo)) {
          const found = indexInfo.rows.some(
            (row: any[]) => row[1] === idx.name
          );
          if (!found) {
            indexMessages.push(`Index "${idx.name}" fehlt`);
          }
        }
      }
    }

    const allOk = colDiff.length === 0 && indexMessages.length === 0;

    return {
      ok: allOk,
      typ: "create_check",
      message: allOk
        ? "✅ Tabelle korrekt erstellt!"
        : `❌ ${[...colDiff, ...indexMessages].join(", ")}`,
      nutzerergebnis: actualColumns,
      erwartetergebnis: expected,
    };
  }

  validateGrantCheck(
    nutzersql: string,
    loesung: GrantCheckSolution
  ): ValidationResult {
    const grantResult = this.execute(nutzersql);
    if ("error" in grantResult) {
      return {
        ok: false,
        typ: "grant_check",
        message: grantResult.error,
        fehler: grantResult.error,
      };
    }

    return {
      ok: true,
      typ: "grant_check",
      message: "✅ Berechtigung erteilt (Syntaxprüfung bestanden)",
    };
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

function DiffColumnDefs(
  expected: ColumnDef[],
  actual: { name: string; type: string; notNull: boolean; primaryKey: boolean }[]
): string[] {
  const diffs: string[] = [];
  for (const exp of expected) {
    const act = actual.find((a) => a.name === exp.name);
    if (!act) {
      diffs.push(`Spalte "${exp.name}" fehlt`);
      continue;
    }
    if (act.type.toUpperCase() !== exp.type.toUpperCase()) {
      diffs.push(
        `Spalte "${exp.name}": Typ ${act.type} statt ${exp.type}`
      );
    }
    if (exp.notNull && !act.notNull) {
      diffs.push(`Spalte "${exp.name}": NOT NULL fehlt`);
    }
    if (exp.primaryKey && !act.primaryKey) {
      diffs.push(`Spalte "${exp.name}": PRIMARY KEY fehlt`);
    }
  }
  return diffs;
}
