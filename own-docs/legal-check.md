# Rechtliche Prüfung: FI Prüfungstrainer

## 1. Markenrecht – Verwendung von "IHK"

| Status | Erläuterung |
|--------|-------------|
| ✅ **Nicht mehr relevant** | Der Name wurde von "IHK Aufgabenplattform" auf **"FI Prüfungstrainer"** geändert. Die IHK ist keine eingetragene Wortmarke im engeren Sinne, aber als Behördenbezeichnung geschützt. Die Umbenennung eliminiert dieses Risiko. |

**Empfehlung:** Auch in Meta-Beschreibungen, Keywords und URLs sollte "IHK" nicht als Marke suggeriert werden. Sachliche Verwendungen wie "zur Vorbereitung auf IHK-Prüfungen" sind als beschreibende Angabe zulässig (§ 23 MarkenG).

---

## 2. Urheberrecht – Aufgabeninhalte

| Status | Erläuterung |
|--------|-------------|
| ✅ **Kein Risiko** | Alle drei neuen JSON-Dateien (`diakonie.json`, `industrie4.json`, `webdev.json`) enthalten **selbst erstellte Übungsaufgaben** mit fiktiven Szenarien (Diakonie, WaltherGrundig, Elektrotechniker Johannes Walter). Es wurden keine Original-IHK-Prüfungsaufgaben übernommen. Die alte `krankenhaus.json` (mit potenziell IHK-urheberrechtlich geschütztem Inhalt) wurde entfernt. |

**Urheberrechtlich geschützt sind:**
- Konkrete Prüfungsaufgaben der IHK (§ 2 UrhG – Sprachwerke)
- Datenbanken mit eigener Struktur (§ 4 UrhG – Sammlungen)

**Nicht geschützt sind:**
- Ideen, Konzepte, Prüfungsthemen an sich
- Fachliche Inhalte (SQL, JavaScript) in allgemeiner Form
- Selbst formulierte Aufgaben zu ähnlichen Themen

⚠️ **Restrisiko:** Schwellenprodukte (einfache SQL-Abfragen) genießen u.U. keinen Urheberrechtsschutz (§ 2 Abs. 2 UrhG – "persönliche geistige Schöpfung"), was die Nutzung eigener Formulierungen unbedenklich macht.

---

## 3. Prüfungsgeheimnis – § 6 IHK-Gesetz, § 353b StGB

| Status | Erläuterung |
|--------|-------------|
| ✅ **Kein Verstoß** | Es werden keine echten, nicht-veröffentlichten Prüfungsaufgaben verwendet. Alle Szenarien und Fragestellungen sind fiktiv. |

**Relevanz:** Echte IHK-Prüfungen unterliegen dem Amtsgeheimnis. Deren Veröffentlichung vor der Prüfung wäre eine Straftat (§ 353b StGB). Nach der Prüfung veröffentlichte Aufgaben können unter Umständen genutzt werden – die Rechtslage ist uneinheitlich. Der sicherste Weg (hier gewählt) ist: **komplett eigene Aufgaben.**

---

## 4. Täuschung über behördliche Anerkennung (§ 132a StGB / UWG)

| Status | Erläuterung |
|--------|-------------|
| ✅ **Kein Risiko** | Die Plattform heißt "FI Prüfungstrainer", nicht "IHK Prüfungstrainer". Es wird nicht der Eindruck erweckt, es handele sich um ein offizielles IHK-Angebot. |

**Empfehlung:** Im Impressum/Disclaimer klarstellen:
> "Der FI Prüfungstrainer ist ein unabhängiges Lernangebot und steht in keiner Verbindung zur Industrie- und Handelskammer (IHK)."

---

## 5. Haftung für Lerninhalte (§§ 823, 826 BGB, ProdHaftG)

| Status | Erläuterung |
|--------|-------------|
| ⚠️ **Geringes Restrisiko** | Fehlerhafte Aufgaben oder Musterlösungen könnten zu Rechtsstreitigkeiten führen, wenn ein Nutzer dadurch eine Prüfung nicht besteht. |

**Empfehlung:** Haftungsausschluss in den Nutzungsbedingungen:
> "Die Inhalte werden mit Sorgfalt erstellt. Eine Garantie für Richtigkeit, Vollständigkeit und Aktualität wird nicht übernommen. Die Plattform ersetzt keine offizielle Prüfungsvorbereitung der IHK."

---

## 6. Datenschutz (DSGVO)

| Status | Erläuterung |
|--------|-------------|
| ✅ **Geringes Risiko** | Die App läuft **vollständig clientseitig** (localStorage, IndexedDB). Es werden keine Daten an einen Server übermittelt. Keine Cookies, kein Tracking, keine Registrierung. |

**Empfehlung:**
- Datenschutzerklärung bereitstellen, die den clientseitigen Betrieb beschreibt
- Keine externen APIs oder Analyse-Tools einbinden (derzeit nicht vorhanden – gut!)
- Falls in Zukunft ein Backend geplant ist: Auftragsverarbeitungsvertrag (AVV) erforderlich

---

## 7. Impressumspflicht (§ 5 DDG / § 18 MStV)

| Status | Erläuterung |
|--------|-------------|
| ⚠️ **Handlungsbedarf bei öffentlichem Hosting** | Sobald die Seite öffentlich erreichbar ist, ist ein Impressum mit vollständigen Angaben zum Betreiber erforderlich. |

**Erforderliche Angaben:**
- Name und Anschrift des Betreibers
- Kontaktdaten (E-Mail, Telefon)
- Ggf. Umsatzsteuer-ID

---

## Zusammenfassung

| Bereich | Risiko | Maßnahme |
|---------|--------|----------|
| Marke "IHK" | ✅ Eliminiert | Umbenennung in "FI Prüfungstrainer" abgeschlossen |
| Urheberrecht Aufgaben | ✅ Kein Risiko | Nur selbst erstellte, fiktive Aufgaben |
| Prüfungsgeheimnis | ✅ Kein Risiko | Keine echten IHK-Prüfungsfragen |
| Behördliche Anerkennung | ✅ Kein Risiko | Klare Namenswahl, kein IHK-Bezug |
| Haftung Inhalte | ⚠️ Niedrig | Disclaimer empfehlenswert |
| DSGVO | ✅ Gering | Client-only, keine Datensammlung |
| Impressum | ⚠️ Offen | Vor öffentlichem Hosting erforderlich |

**Fazit:** Aus rechtlicher Sicht bestehen keine kritischen Risiken. Die Umbenennung und der Austausch der Aufgaben haben die wesentlichen potenziellen Probleme (Marke, Urheberrecht, Prüfungsgeheimnis) adressiert. Empfohlen werden ein Haftungsausschluss und ein Impressum vor einem öffentlichen Deployment.
