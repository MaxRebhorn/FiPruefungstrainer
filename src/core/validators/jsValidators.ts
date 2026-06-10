import type { JSTask, ValidationResult } from "@/types/task";
import { JSRunner } from "@/core/jsRunner";

export function validateJS(
  aufgabe: JSTask,
  nutzercode: string
): Promise<ValidationResult> {
  return JSRunner.run(aufgabe, nutzercode);
}
