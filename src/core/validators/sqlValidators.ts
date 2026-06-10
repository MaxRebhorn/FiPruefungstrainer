import type { ValidationResult } from "@/types/task";
import { SQLiteRunner } from "@/core/db";

export function validateSQL(
  sql: string,
  schema: string[],
  loesung: any
): ValidationResult {
  const runner = SQLiteRunner.buildDB(window._SQL, schema);
  try {
    return runner.validate(sql, loesung);
  } finally {
    runner.close();
  }
}
