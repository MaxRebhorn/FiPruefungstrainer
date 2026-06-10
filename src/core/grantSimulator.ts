import type { ValidationResult } from "@/types/task";

export class GrantSimulator {
  private users: Map<string, Set<string>> = new Map();
  private tablePermissions: Map<
    string,
    Map<string, Set<string>>
  > = new Map();

  /**
   * Simuliert GRANT-Abfragen (Markiert Berechtigungen)
   */
  simulateGrant(
    benutzer: string,
    rechte: string[],
    tabelle: string,
    datenbank?: string
  ): ValidationResult {
    try {
      if (!this.users.has(benutzer)) {
        this.users.set(benutzer, new Set());
      }
      if (!this.tablePermissions.has(tabelle)) {
        this.tablePermissions.set(tabelle, new Map());
      }
      if (!this.tablePermissions.get(tabelle)!.has(benutzer)) {
        this.tablePermissions.get(tabelle)!.set(benutzer, new Set());
      }

      for (const recht of rechte) {
        this.tablePermissions.get(tabelle)!.get(benutzer)!.add(recht);
      }

      return {
        ok: true,
        typ: "grant_check",
        message: `✅ Berechtigungen (${rechte.join(", ")}) für ${benutzer} auf ${tabelle} erteilt.`,
      };
    } catch (err: any) {
      return {
        ok: false,
        typ: "grant_check",
        message: `Fehler beim Erteilen der Berechtigungen: ${err.message}`,
        fehler: err.message,
      };
    }
  }

  /**
   * Prüft ob Benutzer bestimmte Rechte hat
   */
  checkPermission(
    benutzer: string,
    recht: string,
    tabelle: string
  ): boolean {
    const tablePerms = this.tablePermissions.get(tabelle);
    if (!tablePerms) return false;
    const userPerms = tablePerms.get(benutzer);
    if (!userPerms) return false;
    return userPerms.has(recht);
  }

  /**
   * Simuliert REVOKE
   */
  simulateRevoke(
    benutzer: string,
    rechte: string[],
    tabelle: string
  ): ValidationResult {
    const tablePerms = this.tablePermissions.get(tabelle);
    if (!tablePerms) {
      return {
        ok: false,
        typ: "grant_check",
        message: `Keine Berechtigungen für ${benutzer} auf ${tabelle} gefunden.`,
      };
    }
    const userPerms = tablePerms.get(benutzer);
    if (!userPerms) {
      return {
        ok: false,
        typ: "grant_check",
        message: `Keine Berechtigungen für ${benutzer} auf ${tabelle} gefunden.`,
      };
    }

    for (const recht of rechte) {
      userPerms.delete(recht);
    }

    return {
      ok: true,
      typ: "grant_check",
      message: `✅ Berechtigungen (${rechte.join(", ")}) für ${benutzer} auf ${tabelle} entzogen.`,
    };
  }

  reset() {
    this.users.clear();
    this.tablePermissions.clear();
  }
}
