# IHK-Aufgabenplattform – Vue 3 + Vite + TypeScript (Agenten-Ready Plan)

> **Stack:** Vue 3 | Vite | TypeScript | Pinia | vue-router  
> **Hosting:** GitHub Pages (SPA mit Hash-Router)  
> **Ziel:** Zero-Backend, All-Client Aufgabenplattform

---

## A. Projekt-Initialisierung

```bash
# Setup
npm create vite@latest ihk-plattform -- --template vue-ts
cd ihk-plattform

# Dependencies
npm install
npm install -D \
  typescript \
  @types/node \
  @vitejs/plugin-vue \
  vue-tsc

npm install \
  vue@3 \
  vue-router@4 \
  pinia@2 \
  @codemirror/basic-setup@0.21 \
  @codemirror/view@6 \
  @codemirror/state@6 \
  @codemirror/lang-sql@6 \
  @codemirror/lang-javascript@6 \
  marked@9 \
  sql.js@1.12 \
  date-fns@2 \
  deep-equal@2

# Dev
npm install -D vitest @testing-library/vue
```

---

## B. Dateibaumstruktur (exakt)

```
ihk-plattform/
├── public/
│   └── sql-wasm.wasm          # SQLite WASM Binary (wichtig!)
│
├── src/
│   ├── main.ts                # App-Init, sql.js laden
│   ├── App.vue                # Root Component
│   ├── vite-env.d.ts          # Vite globals
│   │
│   ├── components/
│   │   ├── Header.vue         # Navigation + Theme Toggle
│   │   ├── Sidebar.vue        # Filter + Gruppierung
│   │   ├── EditorPanel.vue    # CodeMirror Wrapper
│   │   ├── FeedbackPanel.vue  # Ergebnis-Anzeige (✅/❌)
│   │   ├── TaskListItem.vue   # Einzelne Task im Grid
│   │   ├── DiffTable.vue      # Diff-Anzeige für SQL-Vergleiche
│   │   ├── HintModal.vue      # Hinweise + Musterlösung
│   │   └── UploadModal.vue    # JSON-Import Dialog
│   │
│   ├── views/
│   │   ├── TaskListView.vue   # Route: / (Alle Aufgaben)
│   │   ├── TaskDetailView.vue # Route: /aufgabe/:id
│   │   └── ProgressView.vue   # Route: /fortschritt (Stats)
│   │
│   ├── stores/
│   │   ├── taskStore.ts       # Pinia: Alle Aufgaben + Filter
│   │   ├── editorStore.ts     # Pinia: Editor-State (aktueller Code)
│   │   └── progressStore.ts   # Pinia: Nutzer-Fortschritt (gelöste Tasks)
│   │
│   ├── router/
│   │   └── index.ts           # vue-router Config
│   │
│   ├── core/
│   │   ├── db.ts              # SQLiteRunner Class
│   │   ├── jsRunner.ts        # JS-Sandbox + Test-Framework
│   │   ├── grantSimulator.ts  # GRANT/REVOKE Simulation
│   │   ├── storage.ts         # localStorage/IndexedDB Wrapper
│   │   ├── taskLoader.ts      # JSON-Loader (Built-in + Custom)
│   │   └── validators/        # (Optional) Validierungs-Logic
│   │       ├── sqlValidators.ts
│   │       └── jsValidators.ts
│   │
│   ├── types/
│   │   ├── task.ts            # Task, Solution Interfaces
│   │   ├── validation.ts      # ValidationResult, TestResult
│   │   ├── index.ts           # Re-exports
│   │   └── sql.ts             # SQL-Specific Types
│   │
│   ├── utils/
│   │   ├── compareResults.ts  # SQL Ergebnis-Vergleich
│   │   ├── formatters.ts      # Error-Formatting für UI
│   │   ├── deepEqual.ts       # Strikte Gleichheit für Objekte
│   │   └── debounce.ts        # Utility
│   │
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── main.css       # Global Reset + Custom Properties
│   │   │   ├── theme.css      # Dark/Light Mode Varianten
│   │   │   ├── components.css # Component-spezifische Styles
│   │   │   └── codemirror.css # CodeMirror Theming
│   │   │
│   │   ├── aufgaben/
│   │   │   ├── krankenhaus.json  # 7 Beispielaufgaben
│   │   │   ├── bank.json         # (optional, später)
│   │   │   └── logistik.json     # (optional, später)
│   │   │
│   │   └── icons/             # SVG Icons (oder Lucide)
│   │
│   └── plugins/
│       └── codemirror.ts      # CodeMirror Setup-Helper
│
├── index.html                 # SPA Entry
├── vite.config.ts             # Vite Config
├── tsconfig.json              # TS Config
├── tsconfig.node.json         # TS Config für Vite
├── vitest.config.ts           # Test Config
├── package.json               # Dependencies
└── .gitignore
```

---

## C. TypeScript Interfaces (types/task.ts)

```typescript
// ============================================
// Task-Basis
// ============================================
export interface Task {
  id: string;
  typ: "sql" | "javascript";
  schwierigkeit: "leicht" | "mittel" | "schwer";
  titel: string;
  beschreibung?: string;
  kontext: string; // Markdown: Situationsbeschreibung
  aufgabenstellung: string; // Markdown: Die konkrete Aufgabe
  hinweise: string[]; // Array von Hilfe-Tipps
  starterCode?: string; // Vorgefertigter Code-Block
  
  // Typ-spezifische Felder
  schema?: string[]; // SQL: DDL + Seeds
  mocks?: Record<string, string>; // JS: Mock-Klassen als String
  
  loesung: Solution;
  
  // Gruppe für Filterung
  gruppe?: string; // z.B. "krankenhaus", "bank"
  
  // Runtime-Eigenschaften (aus Progress-Store)
  _status?: TaskStatus;
  _versuche?: number;
  _zuletzt?: Date;
  _code?: string;
}

export type TaskStatus = "neu" | "attempted" | "solved";

// ============================================
// Solution (Validierungstypen)
// ============================================
export type Solution =
  | SelectCompareSolution
  | InsertCheckSolution
  | UpdateCheckSolution
  | AlterCheckSolution
  | CreateCheckSolution
  | GrantCheckSolution
  | FunctionTestsSolution
  | QueryErrorSolution;

export interface SelectCompareSolution {
  typ: "select_compare";
  musterloesung: string; // SQL Query
  spaltenReihenfolgeIgnorieren?: boolean; // default: false
  zeilenReihenfolgeIgnorieren?: boolean; // default: false
}

export interface InsertCheckSolution {
  typ: "insert_check";
  pruefQuery: string; // Query um Ergebnis zu validieren
  erwartet: Record<string, any>[]; // Erwartete Zeilen nach INSERT
}

export interface UpdateCheckSolution {
  typ: "update_check";
  pruefQuery: string;
  erwartet: Record<string, any>[];
}

export interface AlterCheckSolution {
  typ: "alter_check";
  tabellenname: string;
  erwarteteSpaltendefinition: ColumnDef[];
}

export interface CreateCheckSolution {
  typ: "create_check";
  tabellenname: string;
  erwarteteSpaltendefinition: ColumnDef[];
  erwarteteIndizes?: IndexDef[];
}

export interface GrantCheckSolution {
  typ: "grant_check";
  benutzer: string;
  rechte: ("SELECT" | "INSERT" | "UPDATE" | "DELETE")[];
  tabelle: string;
  datenbank?: string;
}

export interface FunctionTestsSolution {
  typ: "function_tests";
  funktionsname: string;
  testfaelle: TestCase[];
}

export interface QueryErrorSolution {
  typ: "query_error";
  erwarterFehlertyp: "SyntaxError" | "RuntimeError" | "LogicError";
}

export interface ColumnDef {
  name: string;
  type: string;
  notNull?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
}

export interface IndexDef {
  name: string;
  spalten: string[];
  unique?: boolean;
}

export interface TestCase {
  beschreibung: string;
  setup: string; // JS-Code, der Eingabe-Array zurückgibt
  eingabe?: any; // Serialisierte Testdaten
  erwartet: any; // Erwartetes Ergebnis
}

// ============================================
// Validation Results
// ============================================
export interface ValidationResult {
  ok: boolean;
  typ: string; // Validierungstyp
  message: string; // Nutzer-lesbare Nachricht
  nutzerergebnis?: any;
  erwartetergebnis?: any;
  fehler?: string;
  diff?: DiffInfo;
  testfaelle?: TestCaseResult[]; // Für JS-Tests
}

export interface TestCaseResult {
  ok: boolean;
  beschreibung: string;
  erhalten?: any;
  erwartet?: any;
  fehler?: string;
}

export interface DiffInfo {
  typ: "tabelle" | "objekt" | "array";
  fehlende: any[]; // In erwartet, nicht in nutzer
  zusaetzliche: any[]; // In nutzer, nicht in erwartet
  unterschiedlich: Record<string, { nutzer: any; erwartet: any }>; // Per Feld
}

// ============================================
// Task-Group & Aufgaben-Sets (JSON-Format)
// ============================================
export interface TaskGroup {
  id: string;
  titel: string;
  beschreibung: string;
}

export interface TaskSet {
  gruppe: TaskGroup;
  aufgaben: Task[];
}

// ============================================
// Progress Tracking
// ============================================
export interface TaskProgress {
  id: string;
  status: TaskStatus;
  code: string;
  versuche: number;
  zuletzt: Date;
}

export interface ProgressStats {
  totalAufgaben: number;
  geloest: number;
  versucht: number;
  neu: number;
  durchschnittlicheVersuche: number;
  nach_typ: {
    sql: { gesamt: number; geloest: number };
    javascript: { gesamt: number; geloest: number };
  };
  nach_schwierigkeit: {
    leicht: { gesamt: number; geloest: number };
    mittel: { gesamt: number; geloest: number };
    schwer: { gesamt: number; geloest: number };
  };
}
```

---

## D. Pinia Stores (detailliert)

### D1. taskStore.ts

```typescript
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Task } from "@/types/task";
import { taskLoader } from "@/core/taskLoader";

export const useTaskStore = defineStore("tasks", () => {
  // State
  const allTasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filter-State
  const filterType = ref<"alle" | "sql" | "javascript">("alle");
  const filterDifficulty = ref<"alle" | "leicht" | "mittel" | "schwer">("alle");
  const filterGroup = ref<string>("alle");
  const filterStatus = ref<"alle" | "neu" | "attempted" | "solved">("alle");
  const searchQuery = ref("");

  // Computed: Gefilterte und gesuchte Tasks
  const filteredTasks = computed(() => {
    return allTasks.value.filter(task => {
      if (filterType.value !== "alle" && task.typ !== filterType.value) return false;
      if (filterDifficulty.value !== "alle" && task.schwierigkeit !== filterDifficulty.value) return false;
      if (filterGroup.value !== "alle" && task.gruppe !== filterGroup.value) return false;
      if (filterStatus.value !== "alle" && task._status !== filterStatus.value) return false;
      if (searchQuery.value && !task.titel.toLowerCase().includes(searchQuery.value.toLowerCase())) return false;
      return true;
    });
  });

  // Computed: Alle verfügbaren Gruppen
  const groups = computed(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    allTasks.value.forEach(task => {
      if (task.gruppe && !seen.has(task.gruppe)) {
        seen.add(task.gruppe);
        result.push({ id: task.gruppe, name: task.gruppe });
      }
    });
    return result;
  });

  // Computed: Statistiken
  const stats = computed(() => {
    const total = allTasks.value.length;
    const solved = allTasks.value.filter(t => t._status === "solved").length;
    const attempted = allTasks.value.filter(t => t._status === "attempted").length;
    const sql = allTasks.value.filter(t => t.typ === "sql").length;
    const js = allTasks.value.filter(t => t.typ === "javascript").length;
    return { total, solved, attempted, sql, js };
  });

  // Actions
  async function loadTasks() {
    loading.value = true;
    error.value = null;
    try {
      allTasks.value = await taskLoader.loadAll();
    } catch (err: any) {
      error.value = err.message;
      console.error("Failed to load tasks:", err);
    } finally {
      loading.value = false;
    }
  }

  function getTaskById(id: string): Task | undefined {
    return allTasks.value.find(t => t.id === id);
  }

  function setFilterType(type: string) {
    filterType.value = type as any;
  }

  function setFilterDifficulty(difficulty: string) {
    filterDifficulty.value = difficulty as any;
  }

  function setFilterGroup(group: string) {
    filterGroup.value = group;
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status as any;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function resetFilters() {
    filterType.value = "alle";
    filterDifficulty.value = "alle";
    filterGroup.value = "alle";
    filterStatus.value = "alle";
    searchQuery.value = "";
  }

  function updateTaskStatus(taskId: string, status: "neu" | "attempted" | "solved") {
    const task = getTaskById(taskId);
    if (task) {
      task._status = status;
      if (status !== "neu") {
        task._versuche = (task._versuche || 0) + 1;
        task._zuletzt = new Date();
      }
    }
  }

  return {
    // State
    allTasks,
    loading,
    error,
    filterType,
    filterDifficulty,
    filterGroup,
    filterStatus,
    searchQuery,

    // Computed
    filteredTasks,
    groups,
    stats,

    // Actions
    loadTasks,
    getTaskById,
    setFilterType,
    setFilterDifficulty,
    setFilterGroup,
    setFilterStatus,
    setSearchQuery,
    resetFilters,
    updateTaskStatus
  };
});
```

### D2. editorStore.ts

```typescript
import { defineStore } from "pinia";
import { ref } from "vue";
import { storage } from "@/core/storage";

export const useEditorStore = defineStore("editor", () => {
  const currentTaskId = ref<string | null>(null);
  const code = ref<Record<string, string>>({}); // taskId → code

  async function setCode(taskId: string, codeText: string) {
    code.value[taskId] = codeText;
    // Auch in localStorage speichern
    await storage.saveCode(taskId, codeText);
  }

  function getCode(taskId: string): string {
    return code.value[taskId] || "";
  }

  async function loadCode(taskId: string) {
    const saved = await storage.getCode(taskId);
    if (saved) {
      code.value[taskId] = saved;
    }
  }

  function setCurrentTask(taskId: string | null) {
    currentTaskId.value = taskId;
  }

  return {
    currentTaskId,
    code,
    setCode,
    getCode,
    loadCode,
    setCurrentTask
  };
});
```

### D3. progressStore.ts

```typescript
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storage } from "@/core/storage";
import type { TaskProgress, ProgressStats } from "@/types";

export const useProgressStore = defineStore("progress", () => {
  const results = ref<Record<string, TaskProgress>>({}); // taskId → progress

  async function loadProgress() {
    const allResults = await storage.getAllResults();
    allResults.forEach(r => {
      results.value[r.id] = r;
    });
  }

  async function saveResult(
    taskId: string,
    code: string,
    status: "attempted" | "solved"
  ) {
    const existing = results.value[taskId];
    const versuche = (existing?.versuche || 0) + (status === "solved" ? 0 : 1);
    
    const progress: TaskProgress = {
      id: taskId,
      code,
      status,
      versuche,
      zuletzt: new Date()
    };

    results.value[taskId] = progress;
    await storage.saveResult(progress);
  }

  const stats = computed((): ProgressStats => {
    const allResults = Object.values(results.value);
    const solved = allResults.filter(r => r.status === "solved").length;
    const attempted = allResults.filter(r => r.status === "attempted").length;
    
    return {
      totalAufgaben: Object.keys(results.value).length,
      geloest: solved,
      versucht: attempted,
      neu: Math.max(0, (100 - solved - attempted)), // Placeholder
      durchschnittlicheVersuche: allResults.length > 0
        ? allResults.reduce((sum, r) => sum + r.versuche, 0) / allResults.length
        : 0,
      nach_typ: { sql: { gesamt: 0, geloest: 0 }, javascript: { gesamt: 0, geloest: 0 } },
      nach_schwierigkeit: { leicht: { gesamt: 0, geloest: 0 }, mittel: { gesamt: 0, geloest: 0 }, schwer: { gesamt: 0, geloest: 0 } }
    };
  });

  return {
    results,
    stats,
    loadProgress,
    saveResult
  };
});
```

---

## E. Core Module (TypeScript)

### E1. core/db.ts (SQLiteRunner)

```typescript
import type {
  SelectCompareSolution,
  InsertCheckSolution,
  ValidationResult,
  DiffInfo
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

  /**
   * Baut frische DB aus Schema-Statements auf (DDL + Seeds)
   */
  static buildDB(sqlJsInstance: any, schemaStatements: string[]): SQLiteRunner {
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

  /**
   * Führt SQL-Query aus, gibt Ergebnis als Tabelle zurück
   */
  execute(sql: string): { columns: string[]; rows: any[][] } | { error: string } {
    try {
      // Nur das erste Statement ausführen
      const statements = sql.trim().split(";").filter(s => s.trim());
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

  /**
   * Validiert SELECT-Query gegen Musterlösung
   */
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
        fehler: userResult.error
      };
    }

    const expectedResult = this.execute(loesung.musterloesung);
    if ("error" in expectedResult) {
      return {
        ok: false,
        typ: "select_compare",
        message: "Fehler in Musterlösung (Autor-Fehler)",
        fehler: expectedResult.error
      };
    }

    const { isEqual, diff } = compareTablesDeep(
      userResult,
      expectedResult as any,
      loesung.spaltenReihenfolgeIgnorieren || false,
      loesung.zeilenReihenfolgeIgnorieren || false
    );

    return {
      ok: isEqual,
      typ: "select_compare",
      message: isEqual
        ? `✅ Richtig! ${userResult.rows.length} Zeilen, alle Spalten korrekt.`
        : `❌ Falsch. Deine Ausgabe liefert ${userResult.rows.length} Zeilen, erwartet waren ${(expectedResult as any).rows.length}.`,
      nutzerergebnis: userResult,
      erwartetergebnis: expectedResult,
      diff
    };
  }

  /**
   * Validiert INSERT-Query
   */
  validate_insert_check(
    nutzersql: string,
    loesung: InsertCheckSolution
  ): ValidationResult {
    // 1. INSERT ausführen
    const insertResult = this.execute(nutzersql);
    if ("error" in insertResult) {
      return {
        ok: false,
        typ: "insert_check",
        message: insertResult.error,
        fehler: insertResult.error
      };
    }

    // 2. Prüf-Query ausführen
    const checkResult = this.execute(loesung.pruefQuery);
    if ("error" in checkResult) {
      return {
        ok: false,
        typ: "insert_check",
        message: "Fehler beim Validieren",
        fehler: checkResult.error
      };
    }

    // 3. Vergleich
    const expected = loesung.erwartet;
    const actual = (checkResult as any).rows.map((row: any[]) => {
      const obj: any = {};
      (checkResult as any).columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });

    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);

    return {
      ok: isEqual,
      typ: "insert_check",
      message: isEqual ? "✅ Korrekt eingefügt!" : "❌ Falsch eingefügt",
      nutzerergebnis: actual,
      erwartetergebnis: expected
    };
  }

  // Weitere Validierungs-Methoden analog für UPDATE, ALTER, CREATE, GRANT
  // (hier abgekürzt)
}
```

### E2. core/jsRunner.ts (JavaScript-Sandbox)

```typescript
import type { JSTask, ValidationResult, TestCaseResult } from "@/types/task";

export class JSRunner {
  /**
   * Führt JS-Aufgabe aus und testet sie
   */
  static async run(aufgabe: JSTask, nutzercode: string): Promise<ValidationResult> {
    const solution = aufgabe.loesung;
    if (solution.typ !== "function_tests") {
      return {
        ok: false,
        typ: "function_tests",
        message: "Ungültiger Lösungstyp für JS-Aufgabe",
        fehler: "Invalid solution type"
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

    const allPassed = testresults.every(r => r.ok);

    return {
      ok: allPassed,
      typ: "function_tests",
      message: allPassed
        ? `✅ Alle ${testresults.length} Testfälle bestanden!`
        : `❌ ${testresults.filter(r => !r.ok).length}/${testresults.length} Testfälle fehlgeschlagen`,
      testfaelle: testresults
    };
  }

  /**
   * Führt einzelnen Testfall aus mit Sandbox + Timeout
   */
  private static async runTestCase(
    aufgabe: JSTask,
    nutzercode: string,
    testfall: any,
    funktionsname: string
  ): Promise<TestCaseResult> {
    try {
      // 1. Mock-Klassen kompilieren
      const mocks = aufgabe.mocks || {};
      const mockKlassen: Record<string, any> = {};
      for (const [name, code] of Object.entries(mocks)) {
        try {
          mockKlassen[name] = new Function("return " + code)();
        } catch (err) {
          return {
            ok: false,
            beschreibung: testfall.beschreibung,
            fehler: `Mock-Fehler (${name}): ${(err as any).message}`
          };
        }
      }

      // 2. Nutzer-Funktion sandboxen
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
          fehler: `Syntaxfehler: ${err.message}`
        };
      }

      // 3. Setup-Code ausführen
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
          fehler: `Setup-Fehler: ${err.message}`
        };
      }

      // 4. Mit Timeout ausführen
      let ergebnis;
      try {
        ergebnis = await Promise.race([
          Promise.resolve(userFunction(...eingabe)),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error("TIMEOUT")), 2000)
          )
        ]);
      } catch (err: any) {
        return {
          ok: false,
          beschreibung: testfall.beschreibung,
          fehler:
            err.message === "TIMEOUT"
              ? "Timeout – wahrscheinlich Endlosschleife?"
              : `Runtime-Fehler: ${err.message}`
        };
      }

      // 5. Vergleich mit erwartetem Ergebnis
      const isEqual = this.deepEqual(ergebnis, testfall.erwartet);

      return {
        ok: isEqual,
        beschreibung: testfall.beschreibung,
        erhalten: ergebnis,
        erwartet: testfall.erwartet
      };
    } catch (err: any) {
      return {
        ok: false,
        beschreibung: testfall.beschreibung,
        fehler: err.message
      };
    }
  }

  /**
   * Tiefe Gleichheitsprüfung (Objekte, Arrays, Primitive)
   */
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
```

### E3. core/storage.ts (localStorage/IndexedDB Wrapper)

```typescript
import type { TaskProgress } from "@/types";

const STORAGE_PREFIX = "ihk_";
const DB_NAME = "IHKPlattform";
const STORE_NAME = "tasks";

export const storage = {
  // ========== localStorage für Codes & Results ==========

  async saveResult(progress: TaskProgress) {
    const key = `${STORAGE_PREFIX}result_${progress.id}`;
    localStorage.setItem(key, JSON.stringify(progress));
  },

  async getResult(taskId: string): Promise<TaskProgress | null> {
    const key = `${STORAGE_PREFIX}result_${taskId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  async getAllResults(): Promise<TaskProgress[]> {
    const results: TaskProgress[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_PREFIX}result_`)) {
        const data = localStorage.getItem(key);
        if (data) results.push(JSON.parse(data));
      }
    }
    return results;
  },

  async saveCode(taskId: string, code: string) {
    const key = `${STORAGE_PREFIX}code_${taskId}`;
    localStorage.setItem(key, code);
  },

  async getCode(taskId: string): Promise<string | null> {
    const key = `${STORAGE_PREFIX}code_${taskId}`;
    return localStorage.getItem(key);
  },

  // ========== IndexedDB für Custom Tasks ==========

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  },

  async saveCustomTask(task: any) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(task);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  },

  async getCustomTasks(): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  },

  // ========== Import/Export ==========

  async exportAll(): Promise<string> {
    const results = await this.getAllResults();
    const custom = await this.getCustomTasks();
    return JSON.stringify(
      {
        version: "1.0",
        exported: new Date().toISOString(),
        results,
        customTasks: custom
      },
      null,
      2
    );
  },

  async importAll(jsonString: string) {
    const data = JSON.parse(jsonString);
    for (const result of data.results || []) {
      await this.saveResult(result);
    }
    for (const task of data.customTasks || []) {
      await this.saveCustomTask(task);
    }
  }
};
```

### E4. core/taskLoader.ts

```typescript
import type { Task, TaskSet } from "@/types/task";
import { storage } from "./storage";
import { useProgressStore } from "@/stores/progressStore";

export const taskLoader = {
  async loadAll(): Promise<Task[]> {
    const allTasks: Task[] = [];

    // 1. Built-in Aufgaben laden
    const builtInSets = [
      "krankenhaus",
      // "bank",
      // "logistik"
    ];

    for (const setName of builtInSets) {
      try {
        const response = await fetch(`/src/assets/aufgaben/${setName}.json`);
        const data: TaskSet = await response.json();
        allTasks.push(...data.aufgaben);
      } catch (err) {
        console.error(`Failed to load ${setName}.json:`, err);
      }
    }

    // 2. Custom Tasks aus IndexedDB laden
    try {
      const customTasks = await storage.getCustomTasks();
      allTasks.push(...customTasks);
    } catch (err) {
      console.error("Failed to load custom tasks:", err);
    }

    // 3. Mit Progress-Status anreichern
    const progressStore = useProgressStore();
    const allResults = await storage.getAllResults();
    const resultMap = new Map(allResults.map(r => [r.id, r]));

    allTasks.forEach(task => {
      const result = resultMap.get(task.id);
      if (result) {
        task._status = result.status;
        task._versuche = result.versuche;
        task._zuletzt = new Date(result.zuletzt);
        task._code = result.code;
      } else {
        task._status = "neu";
        task._versuche = 0;
      }
    });

    return allTasks;
  }
};
```

---

## F. Vue Components (Beispiele)

### F1. EditorPanel.vue

```vue
<template>
  <div class="editor-panel">
    <div class="editor-header">
      <span class="lang-badge">{{ task.typ === 'sql' ? 'SQL' : 'JavaScript' }}</span>
      <div class="actions">
        <button @click="resetCode" title="Code zurücksetzen" class="icon-btn">↺</button>
      </div>
    </div>
    <div ref="editorContainer" class="editor-container"></div>
    <div class="editor-footer">
      <button @click="handleExecute" class="btn-primary">▶ Ausführen</button>
      <button @click="showHint" class="btn-secondary">💡 Hinweis</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { sql } from "@codemirror/lang-sql";
import { javascript } from "@codemirror/lang-javascript";
import type { Task } from "@/types/task";
import { useEditorStore } from "@/stores/editorStore";

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{ execute: [code: string] }>();

const route = useRoute();
const editorStore = useEditorStore();
const editorContainer = ref<HTMLDivElement>();
let editor: EditorView;

onMounted(() => {
  const lang = props.task.typ === "sql" ? sql() : javascript();
  const startCode = editorStore.getCode(props.task.id) || props.task.starterCode || "";

  const state = EditorState.create({
    doc: startCode,
    extensions: [basicSetup, lang]
  });

  editor = new EditorView({
    state,
    parent: editorContainer.value!
  });
});

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
  }
});

function handleExecute() {
  const code = editor.state.doc.toString();
  editorStore.setCode(props.task.id, code);
  emit("execute", code);
}

function resetCode() {
  const startCode = props.task.starterCode || "";
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: startCode
    }
  });
  editorStore.setCode(props.task.id, startCode);
}

function showHint() {
  // Modal öffnen mit Hinweise
}
</script>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.lang-badge {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-primary);
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  padding: 6px 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.icon-btn:hover {
  background: var(--color-border);
}

.editor-container {
  flex: 1;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 14px;
}

.editor-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

.btn-primary {
  flex: 1;
  padding: 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--color-primary);
  opacity: 0.9;
}

.btn-secondary {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

### F2. FeedbackPanel.vue (SQL)

```vue
<template>
  <div v-if="!feedback" class="feedback-empty">
    Gib Code ein und klicke "Ausführen".
  </div>
  <div v-else-if="feedback.ok" class="feedback success">
    <div class="feedback-icon">✅</div>
    <div>
      <h4>Richtig!</h4>
      <p>{{ feedback.message }}</p>
    </div>
  </div>
  <div v-else class="feedback error">
    <div class="feedback-icon">❌</div>
    <div>
      <h4>Falsch</h4>
      <p>{{ feedback.message }}</p>
      <DiffTable
        v-if="feedback.diff && feedback.typ === 'select_compare'"
        :diff="feedback.diff"
        :user-result="feedback.nutzerergebnis"
        :expected-result="feedback.erwartetergebnis"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationResult } from "@/types/task";
import DiffTable from "./DiffTable.vue";

defineProps<{
  feedback: ValidationResult | null;
}>();
</script>

<style scoped>
.feedback-empty {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.feedback {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius);
  margin-top: 12px;
}

.feedback.success {
  background: rgba(62, 207, 142, 0.1);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.feedback.error {
  background: rgba(247, 110, 110, 0.1);
  border: 1px solid var(--color-error);
  color: var(--color-error);
}

.feedback-icon {
  font-size: 24px;
  line-height: 1;
}

h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

p {
  margin: 0;
  font-size: 14px;
}
</style>
```

### F3. TaskDetailView.vue

```vue
<template>
  <div v-if="task" class="task-detail">
    <div class="task-content">
      <div class="left-panel">
        <div class="context-block">
          <h1>{{ task.titel }}</h1>
          <div class="meta">
            <span class="badge" :class="`difficulty-${task.schwierigkeit}`">
              {{ task.schwierigkeit }}
            </span>
            <span class="badge status" :class="`status-${task._status}`">
              {{ statusLabel(task._status) }}
            </span>
          </div>
          <div class="markdown-block">
            <div class="markdown" v-html="renderedContext"></div>
          </div>
          <div class="aufgabenstellung-block">
            <h3>Aufgabenstellung</h3>
            <div class="markdown" v-html="renderedAufgabe"></div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <EditorPanel :task="task" @execute="handleExecute" />
        <FeedbackPanel :feedback="lastFeedback" />
      </div>
    </div>
  </div>
  <div v-else class="error">Task nicht gefunden</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import { useProgressStore } from "@/stores/progressStore";
import { marked } from "marked";
import EditorPanel from "@/components/EditorPanel.vue";
import FeedbackPanel from "@/components/FeedbackPanel.vue";
import { SQLiteRunner } from "@/core/db";
import { JSRunner } from "@/core/jsRunner";

const route = useRoute();
const taskStore = useTaskStore();
const progressStore = useProgressStore();

const taskId = route.params.id as string;
const task = computed(() => taskStore.getTaskById(taskId));
const lastFeedback = ref<any>(null);

const renderedContext = computed(() => marked(task.value?.kontext || ""));
const renderedAufgabe = computed(() => marked(task.value?.aufgabenstellung || ""));

onMounted(() => {
  progressStore.loadProgress();
});

function statusLabel(status?: string) {
  return { neu: "Neu", attempted: "Versucht", solved: "Gelöst" }[status || "neu"];
}

async function handleExecute(code: string) {
  if (!task.value) return;

  try {
    let result;
    if (task.value.typ === "sql") {
      const runner = SQLiteRunner.buildDB(window._SQL, task.value.schema || []);
      result = runner.validate_select_compare(code, task.value.loesung as any);
    } else {
      result = await JSRunner.run(task.value as any, code);
    }

    lastFeedback.value = result;

    if (result.ok) {
      await progressStore.saveResult(taskId, code, "solved");
      taskStore.updateTaskStatus(taskId, "solved");
    } else {
      await progressStore.saveResult(taskId, code, "attempted");
      taskStore.updateTaskStatus(taskId, "attempted");
    }
  } catch (err: any) {
    lastFeedback.value = {
      ok: false,
      typ: "error",
      message: "Interner Fehler: " + err.message,
      fehler: err.message
    };
  }
}
</script>

<style scoped>
.task-detail {
  height: 100%;
  padding: 24px;
  overflow: hidden;
}

.task-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.left-panel {
  overflow-y: auto;
  padding-right: 16px;
}

.context-block {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 24px;
}

.context-block h1 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
}

.meta {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 3px;
  background: var(--color-border);
  color: var(--color-text);
}

.badge.difficulty-leicht {
  background: rgba(62, 207, 142, 0.2);
  color: var(--color-success);
}

.badge.difficulty-mittel {
  background: rgba(245, 166, 35, 0.2);
  color: var(--color-warning);
}

.badge.difficulty-schwer {
  background: rgba(247, 110, 110, 0.2);
  color: var(--color-error);
}

.markdown-block {
  margin-bottom: 24px;
  line-height: 1.6;
}

.markdown {
  color: var(--color-text);
  font-size: 14px;
}

.aufgabenstellung-block h3 {
  margin: 24px 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

@media (max-width: 1200px) {
  .task-content {
    grid-template-columns: 1fr;
  }

  .left-panel {
    max-height: 40vh;
  }
}
</style>
```

---

## G. Router-Konfiguration

**src/router/index.ts:**
```typescript
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import TaskListView from "@/views/TaskListView.vue";
import TaskDetailView from "@/views/TaskDetailView.vue";
import ProgressView from "@/views/ProgressView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "TaskList",
    component: TaskListView
  },
  {
    path: "/aufgabe/:id",
    name: "TaskDetail",
    component: TaskDetailView
  },
  {
    path: "/fortschritt",
    name: "Progress",
    component: ProgressView
  }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
```

---

## H. CSS & Theme

**src/assets/styles/main.css:**
```css
* {
  box-sizing: border-box;
}

:root {
  /* Colors */
  --color-bg: #0f1117;
  --color-surface: #1a1d27;
  --color-border: #2d3147;
  --color-primary: #5b8def;
  --color-success: #3ecf8e;
  --color-error: #f76e6e;
  --color-warning: #f5a623;
  --color-text: #e2e8f0;
  --color-text-muted: #8892a4;

  /* Fonts */
  --font-mono: "JetBrains Mono", "Fira Code", "Courier New", monospace;
  --font-ui: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Spacing */
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

[data-theme="light"] {
  --color-bg: #f8f9fc;
  --color-surface: #ffffff;
  --color-border: #d9dce4;
  --color-text: #1a202c;
  --color-text-muted: #64748b;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-ui);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
}

html {
  scroll-behavior: smooth;
}

/* Utility Classes */
.flex {
  display: flex;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.mt-4 {
  margin-top: 16px;
}

.text-center {
  text-align: center;
}

/* Button Reset */
button {
  font-family: inherit;
  font-size: inherit;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## I. Build & Deployment

**vite.config.ts:**
```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: "esnext",
    outDir: "dist",
    minify: "terser",
    cssCodeSplit: true,
    sourcemap: false
  },
  optimizeDeps: {
    include: ["sql.js", "marked"]
  }
});
```

**Deploy zu GitHub Pages:**
```bash
npm run build
# → Inhalt von dist/ in GitHub repo pushen
# → GitHub Pages auf Branch "gh-pages" einstellen
# → https://username.github.io/ihk-plattform
```

---

## J. Aufgaben-JSON (aufgaben/krankenhaus.json)

```json
{
  "gruppe": {
    "id": "krankenhaus",
    "titel": "Krankenhaus – NotaufnahmeManagement",
    "beschreibung": "Sie arbeiten als Entwickler bei der AMAG Soft GmbH..."
  },
  "aufgaben": [
    {
      "id": "kh-sql-01",
      "typ": "sql",
      "schwierigkeit": "leicht",
      "titel": "Neuen Arzt einfügen",
      "kontext": "**Tabelle `Aerzte`**: ...",
      "aufgabenstellung": "Fügen Sie einen Arzt mit...",
      "hinweise": ["Nutze INSERT INTO...", "Email darf NULL sein"],
      "starterCode": "INSERT INTO Aerzte ",
      "schema": [
        "CREATE TABLE Aerzte (AID INTEGER PRIMARY KEY AUTOINCREMENT, Vorname TEXT NOT NULL, Nachname TEXT NOT NULL, Fachgebiet TEXT, Email TEXT);",
        "INSERT INTO Aerzte VALUES (1,'Max','Müller','Chirurgie','m.mueller@kh.de');"
      ],
      "loesung": {
        "typ": "insert_check",
        "pruefQuery": "SELECT Vorname, Nachname, Fachgebiet, Email FROM Aerzte WHERE Nachname = 'Horner';",
        "erwartet": [
          { "Vorname": "Hugo", "Nachname": "Horner", "Fachgebiet": "Allgemeinmedizin", "Email": null }
        ]
      }
    }
  ]
}
```

---

## K. Umsetzungsreihenfolge (für Agenten)

### Phase 1: Projekt-Setup (30 min)
1. ✅ `npm create vite` + Dependencies
2. ✅ `vite.config.ts`, `tsconfig.json`
3. ✅ CSS Custom Properties (`main.css`)
4. ✅ `index.html` + `src/main.ts`

### Phase 2: Types & Core (2–3h)
5. ✅ `src/types/task.ts` – Alle Interfaces
6. ✅ `src/core/db.ts` – SQLiteRunner
7. ✅ `src/core/jsRunner.ts` – JS-Sandbox
8. ✅ `src/core/storage.ts` – localStorage/IndexedDB
9. ✅ `src/core/taskLoader.ts` – JSON-Loader

### Phase 3: Pinia Stores (1h)
10. ✅ `src/stores/taskStore.ts`
11. ✅ `src/stores/editorStore.ts`
12. ✅ `src/stores/progressStore.ts`

### Phase 4: Router & App-Shell (1h)
13. ✅ `src/router/index.ts`
14. ✅ `src/App.vue` + `src/main.ts`

### Phase 5: Komponenten (3–4h)
15. ✅ `src/components/EditorPanel.vue`
16. ✅ `src/components/FeedbackPanel.vue`
17. ✅ `src/components/DiffTable.vue`
18. ✅ `src/components/Header.vue`, `Sidebar.vue`
19. ✅ `src/views/TaskListView.vue` – Mit Filter
20. ✅ `src/views/TaskDetailView.vue` – Haupt-Editor
21. ✅ `src/views/ProgressView.vue` – Statistik

### Phase 6: Aufgaben + Testing (2–3h)
22. ✅ `src/assets/aufgaben/krankenhaus.json` – 7 SQL + 1 JS
23. ✅ `public/sql-wasm.wasm` kopieren
24. ✅ `npm run dev` – Tests im Browser
25. ✅ Edge Cases testen (Fehlerbehandlung, Timeouts)

### Phase 7: Polish (1–2h)
26. ✅ Dark/Light Mode Toggle
27. ✅ Mobile Responsive Layout (Sidebar-Toggle, @media queries, responsive grid)
28. ✅ Upload-Modal für Custom Tasks
29. ✅ Export-Funktionalität (JSON-Download in ProgressView)

---

## L. Kritische Details für Agenten

| Problem | Lösung |
|---|---|
| **sql.js WASM lädt nicht** | `public/sql-wasm.wasm` muss existieren; `locateFile: f => '/sql-wasm.wasm'` in `initSqlJs()` |
| **CodeMirror zeigt nichts** | `EditorView` muss in existierenden DOM-Node (`ref`) eingebunden werden; `@codemirror/basic-setup` import |
| **Endlosschleife crasht Browser** | `Promise.race` mit 2s Timeout in `jsRunner.ts` – kritisch! |
| **Pinia Store nicht im onMounted erkannt** | Stores müssen mit `useStore()` IN Komponente aufgerufen werden, nicht global |
| **localStorage > 5MB** | Nur Codes + Results speichern; custom Tasks in IndexedDB |
| **Hash-Router: Seite lädt sich immer neu** | `createWebHashHistory()` verwenden; Refresh nur bei Hash-Change |

---

## M. Package.json (Komplette Dependencies)

```json
{
  "name": "ihk-plattform",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@codemirror/basic-setup": "^0.21.0",
    "@codemirror/view": "^6.20.0",
    "@codemirror/state": "^6.2.0",
    "@codemirror/lang-sql": "^6.5.0",
    "@codemirror/lang-javascript": "^6.1.0",
    "marked": "^9.1.0",
    "sql.js": "^1.12.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "vue-tsc": "^1.8.0",
    "vite": "^4.3.0",
    "vitest": "^0.34.0",
    "@testing-library/vue": "^8.0.0"
  }
}
```

