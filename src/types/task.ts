// ============================================
// Task-Basis
// ============================================
export interface Task {
  id: string;
  typ: "sql" | "javascript";
  schwierigkeit: "leicht" | "mittel" | "schwer";
  titel: string;
  beschreibung?: string;
  kontext: string;
  aufgabenstellung: string;
  hinweise: string[];
  starterCode?: string;

  schema?: string[];
  mocks?: Record<string, string>;

  loesung: Solution;

  gruppe?: string;

  _status?: TaskStatus;
  _versuche?: number;
  _zuletzt?: Date;
  _code?: string;
}

export type TaskStatus = "neu" | "attempted" | "solved";

export type JSTask = Task & { typ: "javascript" };

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
  musterloesung: string;
  spaltenReihenfolgeIgnorieren?: boolean;
  zeilenReihenfolgeIgnorieren?: boolean;
}

export interface InsertCheckSolution {
  typ: "insert_check";
  pruefQuery: string;
  erwartet: Record<string, any>[];
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
  setup: string;
  eingabe?: any;
  erwartet: any;
}

// ============================================
// Validation Results
// ============================================
export interface ValidationResult {
  ok: boolean;
  typ: string;
  message: string;
  nutzerergebnis?: any;
  erwartetergebnis?: any;
  fehler?: string;
  diff?: DiffInfo;
  testfaelle?: TestCaseResult[];
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
  fehlende: any[];
  zusaetzliche: any[];
  unterschiedlich: Record<string, { nutzer: any; erwartet: any }>;
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
