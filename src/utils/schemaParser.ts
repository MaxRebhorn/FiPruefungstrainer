export interface ColumnInfo {
  name: string;
  type: string;
  constraints: string[];
}

export interface ForeignKeyInfo {
  column: string;
  references: string;
  referencesColumn: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
}

/**
 * Parse CREATE TABLE statements from a SQL schema array.
 * Extracts table names, columns (name + type + constraints), and foreign keys.
 */
export function parseSchema(schema: string[]): TableInfo[] {
  const tables: TableInfo[] = [];

  for (const stmt of schema) {
    const trimmed = stmt.trim();
    if (!trimmed.toUpperCase().startsWith("CREATE TABLE")) continue;

    const table = parseCreateTable(trimmed);
    if (table) tables.push(table);
  }

  return tables;
}

function parseCreateTable(ddl: string): TableInfo | null {
  // Extract table name: CREATE TABLE [IF NOT EXISTS] <name> (
  const nameMatch = ddl.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
  if (!nameMatch) return null;
  const tableName = nameMatch[1];

  // Extract content between outer parentheses
  const parenStart = ddl.indexOf("(");
  const parenEnd = ddl.lastIndexOf(")");
  if (parenStart === -1 || parenEnd === -1 || parenEnd <= parenStart) return null;

  const inner = ddl.substring(parenStart + 1, parenEnd).trim();

  const columns: ColumnInfo[] = [];
  const foreignKeys: ForeignKeyInfo[] = [];

  // Split by top-level commas (not inside nested parentheses)
  const parts = splitTopLevelCommas(inner);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check for FOREIGN KEY
    if (trimmed.toUpperCase().startsWith("FOREIGN KEY")) {
      const fk = parseForeignKey(trimmed);
      if (fk) foreignKeys.push(fk);
      continue;
    }

    // Check for CONSTRAINT (skip)
    if (trimmed.toUpperCase().startsWith("CONSTRAINT")) continue;

    // Check for PRIMARY KEY / UNIQUE at table level (skip)
    if (trimmed.toUpperCase().startsWith("PRIMARY KEY") || trimmed.toUpperCase().startsWith("UNIQUE")) continue;

    // CHECK constraint (skip)
    if (trimmed.toUpperCase().startsWith("CHECK")) continue;

    // Column definition
    const col = parseColumnDef(trimmed);
    if (col) columns.push(col);
  }

  return { name: tableName, columns, foreignKeys };
}

function splitTopLevelCommas(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const ch of text) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);

  return parts;
}

function parseColumnDef(text: string): ColumnInfo | null {
  // First token is column name, second is type
  const match = text.match(/^(\w+)\s+(\w+)(.*)$/);
  if (!match) return null;

  const name = match[1];
  const type = match[2];
  const rest = match[3].trim();

  // Collect constraints (uppercase keywords)
  const constraintKeywords = [
    "PRIMARY KEY", "AUTOINCREMENT", "NOT NULL", "NULL",
    "UNIQUE", "DEFAULT", "REFERENCES", "CHECK",
  ];

  const constraints: string[] = [];
  let remaining = rest;

  // Handle inline FOREIGN KEY: REFERENCES table(column)
  if (remaining.toUpperCase().includes("REFERENCES")) {
    constraints.push("REFERENCES");
    // We don't parse the full ref here — it's captured in foreignKeys if needed
  }

  // Extract known constraint keywords
  for (const kw of constraintKeywords) {
    const regex = new RegExp(kw.replace(/\s+/g, "\\s+"), "i");
    if (regex.test(remaining)) {
      constraints.push(kw);
    }
  }

  // Check for default value notation
  if (/default\s+/i.test(remaining)) {
    const defMatch = remaining.match(/default\s+('[^']*'|\d+\.?\d*|NULL)/i);
    if (defMatch) {
      constraints.push(`DEFAULT ${defMatch[1]}`);
    }
  }

  return { name, type, constraints };
}

function parseForeignKey(text: string): ForeignKeyInfo | null {
  const match = text.match(
    /FOREIGN\s+KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)/i
  );
  if (!match) return null;

  return {
    column: match[1],
    references: match[2],
    referencesColumn: match[3],
  };
}
