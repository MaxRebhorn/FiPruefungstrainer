Hier ist die Datei `beispielaufgaben.md` mit einer originalgetreuen, aber leicht umformulierten Zusammenstellung der SQL- und Pseudocode‑Aufgaben aus deinen Prüfungsunterlagen. Die Aufgaben sind in einen gemeinsamen Kontext (Krankenhaus‑Software) eingebettet, wie es die IHK typischerweise macht.

```markdown
# Beispielaufgaben – SQL & Pseudocode (JavaScript)

Die folgenden Aufgaben sind an die Struktur und das Niveau der IHK‑Abschlussprüfung angelehnt. Sie stammen aus den Originalprüfungen Sommer 2025 (Teil „Entwicklung und Umsetzung von Algorithmen“) und wurden für Übungszwecke leicht abgewandelt.

## Kontext

Sie arbeiten als Entwickler für die **AMAG Soft GmbH**. Ihr Team entwickelt eine Krankenhaus‑Software, die unter anderem eine **digitale Patientenakte**, eine **Bettenbelegungsstatistik** und eine **Verwaltung von Verschreibungen** umfasst.

---

## 1. SQL‑Aufgaben (Datenbank NotaufnahmeManagement)

Gegeben sind folgende Tabellen (Auszüge):

**Tabelle `Aerzte`**  
`AID` (PK), `Vorname`, `Nachname`, `Fachgebiet`, `Email`

**Tabelle `Patienten`**  
`PID` (PK), `Vorname`, `Nachname`

**Tabelle `Medikamente`**  
`MID` (PK), `Name`

**Tabelle `Verschreibungen`**  
`VID` (PK), `PID` (FK), `AID` (FK), `MID` (FK), `Dosis`, `Hinweis`, `Datum`

Die Tabellen sind bereits mit Beispieldaten gefüllt.

### a) Neuen Arzt einfügen
Fügen Sie einen neuen Arzt mit den Angaben **„Horner, Hugo, Allgemeinmedizin“** in die Tabelle `Aerzte` ein. Die E‑Mail‑Adresse ist zunächst unbekannt (darf `NULL` sein).

### b) Schreibrechte gewähren
Dem bereits existierenden Benutzer `hhorner` sollen **Schreibrechte (INSERT, UPDATE)** auf die Tabelle `Verschreibungen` der Datenbank `NotaufnahmeManagement` gewährt werden.

### c) Schreibrechte entziehen
Dem Benutzer `sklinkel` sollen die **Schreibrechte (INSERT, UPDATE)** für die Tabelle `Verschreibungen` wieder entzogen werden.

### d) Pflichtfeld nachträglich setzen
In der Tabelle `Aerzte` soll die Spalte `Email` jetzt zum **Pflichtfeld** (`NOT NULL`) werden. Die Tabelle ist bereits gefüllt, und bei manchen Ärzten fehlt der E‑Mail‑Eintrag (`NULL`). Für diese Fälle soll vorher die Adresse `'info@fit.de'` eingetragen werden.

Schreiben Sie die notwendigen Anweisungen, um die fehlenden E‑Mails zu ergänzen und anschließend die Spalte auf `NOT NULL` zu ändern.

### e) Patienten mit mindestens drei Verschreibungen
Erstellen Sie eine Abfrage, die `PID`, `Nachname`, `Vorname` sowie die **Anzahl der Verschreibungen** aller Patienten liefert, die **mindestens drei Verschreibungen** erhalten haben. Sortieren Sie absteigend nach der Anzahl.

**Beispielausgabe:**

| PID | Nachname | Vorname | Anzahl_Verschreibungen |
|-----|----------|---------|------------------------|
| 1   | Keller   | Paul    | 4                      |
| 2   | Fischer  | Julia   | 4                      |
| 6   | Richter  | Nina    | 3                      |

### f) Durchschnittliche Anzahl Verschreibungen pro Patient
Berechnen Sie den **Durchschnitt der Anzahl der Verschreibungen** über alle Patienten.

**Beispielausgabe:**

| Durchschnitt_Verschreibungen_pro_Patient |
|------------------------------------------|
| 2.0                                      |

---

## 2. Pseudocode‑Aufgabe (als JavaScript umgesetzt)

Für eine Statistik soll eine Funktion die **Auslastung der Betten einer Station** ermitteln.

Gegeben sind zwei Klassen (als Mocks – Sie als Nutzer sehen nur die öffentlichen Methoden):

```javascript
class Belegung {
  getPatientId()   // Integer
  getDatumVon()    // Date (Aufnahmetag)
  getDatumBis()    // Date (Entlassungstag, zählt nicht mehr als belegter Tag)
  getStationId()   // Integer
}

class Station {
  getStationId()   // Integer
  getAnzahlBetten() // Integer
}
```

In einem Array `belegungen` vom Typ `Belegung[]` ist für jeden Krankenhausaufenthalt gespeichert, auf welcher Station ein Patient von `datumVon` bis `datumBis` ein Bett belegt hat.

**Aufgabe:**  
Implementieren Sie die Funktion

```javascript
function ermittleAuslastungsTage(belegungen, startDatum, endDatum, station)
```

die ermittelt, an **wie vielen Tagen** im vorgegebenen Zeitraum (`startDatum` bis `endDatum` inklusive) die übergebene `station` **zu mehr als 80 % ausgelastet** war.

**Hinweise:**
- `Date`‑Objekte können mit `<`, `<=`, `>`, `>=` verglichen werden.
- `date + 1` liefert den nächsten Kalendertag (als `Date`‑Objekt).
- Ein Tag gilt als voll belegt, wenn die Anzahl der belegten Betten > 80 % der Gesamtbetten der Station ist.
- Die Entlassung `datumBis` zählt nicht mehr als Belegungstag (d. h. der Patient belegt das Bett an allen Tagen von `datumVon` bis `datumBis - 1`).
- Gehen Sie davon aus, dass die `belegungen`‑Liste alle Aufenthalte im System enthält (auch außerhalb des betrachteten Zeitraums).

**Beispiel (vereinfacht):**  
Station hat 10 Betten. An einem Tag sind 9 Betten belegt → 9/10 = 90 % → zählt als über 80 %.  
An einem Tag sind 8 Betten belegt → 8/10 = 80 % → zählt **nicht** (da „zu mehr als 80 %“).

**Schreiben Sie den Code in JavaScript.** (Die IHK‑Originalaufgabe verwendete Pseudocode – hier wird aus didaktischen Gründen JavaScript verlangt.)

---

## Lösungshinweise (für Selbstkontrolle)

Die vollständigen Musterlösungen zu diesen Aufgaben finden Sie in der zugehörigen Lösungserläuterung. Versuchen Sie zuerst, eigenständig zu arbeiten.

- SQL a) – `INSERT INTO Aerzte (Vorname, Nachname, Fachgebiet) VALUES (...)`
- SQL b) – `GRANT INSERT, UPDATE ON NotaufnahmeManagement.Verschreibungen TO 'hhorner'`
- SQL c) – `REVOKE INSERT, UPDATE ON ... FROM 'sklinkel'`
- SQL d) – `UPDATE ... SET Email = 'info@fit.de' WHERE Email IS NULL;` dann `ALTER TABLE ... MODIFY COLUMN Email VARCHAR(100) NOT NULL;`
- SQL e) – `SELECT p.PID, p.Nachname, p.Vorname, COUNT(v.VID) AS Anzahl ... JOIN ... GROUP BY ... HAVING COUNT(...) >= 3 ORDER BY Anzahl DESC`
- SQL f) – `SELECT AVG(Anzahl) FROM (SELECT COUNT(*) AS Anzahl FROM Verschreibungen GROUP BY PID) AS sub`
- JavaScript – Iteriere über jeden Tag im Zeitraum; zähle für jeden Tag die Belegungen, deren `datumVon` <= Tag < `datumBis` und `stationId` passt; vergleiche mit 0.8 * `station.getAnzahlBetten()`.
```

Du kannst diese Datei direkt als Vorlage für deine Plattform verwenden. Sie enthält keine direkten urheberrechtlich geschützten Originalformulierungen der IHK, sondern eine sinngemäße Übertragung, die für Übungszwecke unbedenklich ist.