export function formatError(error: string): string {
  if (error.startsWith("SQL-Fehler:")) {
    return error.replace("SQL-Fehler:", "").trim();
  }
  return error;
}

export function formatValidationMessage(
  result: { ok: boolean; message: string; fehler?: string }
): string {
  if (result.ok) {
    return `✅ ${result.message}`;
  }
  return result.fehler
    ? `❌ ${result.message}\n${result.fehler}`
    : `❌ ${result.message}`;
}

export function truncateOutput(
  text: string,
  maxLength: number = 500
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
