import type { JSTask, ValidationResult, TestCaseResult } from "@/types/task";

export class JSRunner {
  static async run(
    aufgabe: JSTask,
    nutzercode: string
  ): Promise<ValidationResult> {
    const solution = aufgabe.loesung;
    if (solution.typ !== "function_tests") {
      return {
        ok: false,
        typ: "function_tests",
        message: "Ungültiger Lösungstyp für JS-Aufgabe",
        fehler: "Invalid solution type",
      };
    }

    const testresults: TestCaseResult[] = [];

    for (const testfall of solution.testfaelle) {
      const result = await this.runTestCase(
        aufgabe,
        nutzercode,
        testfall,
        solution.funktionsname
      );
      testresults.push(result);
    }

    const allPassed = testresults.every((r) => r.ok);

    return {
      ok: allPassed,
      typ: "function_tests",
      message: allPassed
        ? `✅ Alle ${testresults.length} Testfälle bestanden!`
        : `❌ ${testresults.filter((r) => !r.ok).length}/${testresults.length} Testfälle fehlgeschlagen`,
      testfaelle: testresults,
    };
  }

  private static async runTestCase(
    aufgabe: JSTask,
    nutzercode: string,
    testfall: any,
    funktionsname: string
  ): Promise<TestCaseResult> {
    try {
      const mocks = aufgabe.mocks || {};
      const mockKlassen: Record<string, any> = {};
      for (const [name, code] of Object.entries(mocks)) {
        try {
          mockKlassen[name] = new Function("return " + code)();
        } catch (err) {
          return {
            ok: false,
            beschreibung: testfall.beschreibung,
            fehler: `Mock-Fehler (${name}): ${(err as any).message}`,
          };
        }
      }

      let userFunction;
      try {
        userFunction = new Function(
          ...Object.keys(mockKlassen),
          nutzercode + `\nreturn ${funktionsname};`
        )(...Object.values(mockKlassen));
      } catch (err: any) {
        return {
          ok: false,
          beschreibung: testfall.beschreibung,
          fehler: `Syntaxfehler: ${err.message}`,
        };
      }

      let eingabe: any[];
      try {
        const setupFn = new Function(
          ...Object.keys(mockKlassen),
          testfall.setup
        )(...Object.values(mockKlassen));
        eingabe = setupFn;
        if (!Array.isArray(eingabe)) {
          eingabe = [eingabe];
        }
      } catch (err: any) {
        return {
          ok: false,
          beschreibung: testfall.beschreibung,
          fehler: `Setup-Fehler: ${err.message}`,
        };
      }

      let ergebnis;
      try {
        ergebnis = await Promise.race([
          Promise.resolve(userFunction(...eingabe)),
          new Promise(
            (_, rej) =>
              setTimeout(() => rej(new Error("TIMEOUT")), 2000)
          ),
        ]);
      } catch (err: any) {
        return {
          ok: false,
          beschreibung: testfall.beschreibung,
          fehler:
            err.message === "TIMEOUT"
              ? "Timeout – wahrscheinlich Endlosschleife?"
              : `Runtime-Fehler: ${err.message}`,
        };
      }

      const isEqual = this.deepEqual(ergebnis, testfall.erwartet);

      return {
        ok: isEqual,
        beschreibung: testfall.beschreibung,
        erhalten: ergebnis,
        erwartet: testfall.erwartet,
      };
    } catch (err: any) {
      return {
        ok: false,
        beschreibung: testfall.beschreibung,
        fehler: err.message,
      };
    }
  }

  private static deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this.deepEqual(a[key], b[key])) return false;
    }

    return true;
  }
}
