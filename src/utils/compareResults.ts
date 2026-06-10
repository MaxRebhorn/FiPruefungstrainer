import type { DiffInfo } from "@/types/task";

interface QueryResult {
  columns: string[];
  rows: any[][];
}

export function compareTablesDeep(
  nutzerResult: QueryResult,
  erwartetResult: QueryResult,
  spaltenReihenfolgeIgnorieren: boolean,
  zeilenReihenfolgeIgnorieren: boolean
): { isEqual: boolean; diff: DiffInfo } {
  const nutzerCols = nutzerResult.columns;
  const erwartetCols = erwartetResult.columns;

  // Normalisiere Spalten: sortiert ignorieren oder original
  const getNutzerRow = (row: any[]): Record<string, any> => {
    const obj: Record<string, any> = {};
    nutzerCols.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  };

  const getErwartetRow = (row: any[]): Record<string, any> => {
    const obj: Record<string, any> = {};
    erwartetCols.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  };

  // Normalisiere zu Record-Arrays
  const nutzerRecords = nutzerResult.rows.map(getNutzerRow);
  const erwartetRecords = erwartetResult.rows.map(getErwartetRow);

  const fehlende: any[] = [];
  const zusaetzliche: any[] = [];
  const unterschiedlich: Record<string, { nutzer: any; erwartet: any }> = {};

  if (zeilenReihenfolgeIgnorieren) {
    // Matching-basierter Vergleich
    const used = new Array(erwartetRecords.length).fill(false);

    for (const nRow of nutzerRecords) {
      let found = false;
      for (let ei = 0; ei < erwartetRecords.length; ei++) {
        if (used[ei]) continue;
        if (recordsEqual(nRow, erwartetRecords[ei])) {
          used[ei] = true;
          found = true;
          break;
        }
      }
      if (!found) {
        zusaetzliche.push(nRow);
      }
    }

    for (let ei = 0; ei < erwartetRecords.length; ei++) {
      if (!used[ei]) {
        fehlende.push(erwartetRecords[ei]);
      }
    }
  } else {
    // Positionsbasierter Vergleich
    const maxLen = Math.max(nutzerRecords.length, erwartetRecords.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= nutzerRecords.length) {
        fehlende.push(erwartetRecords[i]);
      } else if (i >= erwartetRecords.length) {
        zusaetzliche.push(nutzerRecords[i]);
      } else if (!recordsEqual(nutzerRecords[i], erwartetRecords[i])) {
        unterschiedlich[`Zeile ${i + 1}`] = {
          nutzer: nutzerRecords[i],
          erwartet: erwartetRecords[i],
        };
      }
    }
  }

  const isEqual =
    fehlende.length === 0 &&
    zusaetzliche.length === 0 &&
    Object.keys(unterschiedlich).length === 0;

  // Felder innerhalb erwarteter Zeilen vergleichen (spaltenFehler)
  if (!spaltenReihenfolgeIgnorieren) {
    if (JSON.stringify(nutzerCols) !== JSON.stringify(erwartetCols)) {
      unterschiedlich["_spalten"] = {
        nutzer: nutzerCols,
        erwartet: erwartetCols,
      };
    }
  } else {
    const nutzerSorted = [...nutzerCols].sort();
    const erwartetSorted = [...erwartetCols].sort();
    if (JSON.stringify(nutzerSorted) !== JSON.stringify(erwartetSorted)) {
      unterschiedlich["_spalten"] = {
        nutzer: nutzerCols,
        erwartet: erwartetCols,
      };
    }
  }

  return {
    isEqual: isEqual && Object.keys(unterschiedlich).length === 0,
    diff: {
      typ: "tabelle",
      fehlende,
      zusaetzliche,
      unterschiedlich,
    },
  };
}

function recordsEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!(key in b)) return false;
    if (!primitiveEqual(a[key], b[key])) return false;
  }
  return true;
}

function primitiveEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  return String(a) === String(b);
}
