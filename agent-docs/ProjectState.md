# Project State – IHK-Aufgabenplattform

## Phase 1: Projekt-Setup

- [x] `npm create vite` + Dependencies
- [x] `vite.config.ts`, `tsconfig.json`
- [x] CSS Custom Properties (`main.css`, `theme.css`)
- [x] `index.html` + `src/main.ts`
- [x] `src/App.vue` (Root Component mit Header/Sidebar/Router-View)

## Phase 2: Types & Core

- [x] `src/types/task.ts` – Alle Interfaces
- [x] `src/types/index.ts` – Re-exports
- [x] `src/core/db.ts` – SQLiteRunner
- [x] `src/core/jsRunner.ts` – JS-Sandbox
- [x] `src/core/storage.ts` – localStorage/IndexedDB
- [x] `src/core/taskLoader.ts` – JSON-Loader
- [x] `src/core/grantSimulator.ts` – GRANT/REVOKE Simulation
- [x] `src/core/validators/sqlValidators.ts` – SQL Validation Helper
- [x] `src/core/validators/jsValidators.ts` – JS Validation Helper
- [x] `src/utils/compareResults.ts` – SQL Ergebnis-Vergleich
- [x] `src/utils/formatters.ts` – Error-Formatting
- [x] `src/utils/deepEqual.ts` – Deep Equality
- [x] `src/utils/debounce.ts` – Debounce Utility
- [x] `src/plugins/codemirror.ts` – CodeMirror Setup-Helper

## Phase 3: Pinia Stores

- [x] `src/stores/taskStore.ts`
- [x] `src/stores/editorStore.ts`
- [x] `src/stores/progressStore.ts`

## Phase 4: Router & App-Shell

- [x] `src/router/index.ts` (Hash-Router mit 3 Routen)
- [x] `src/App.vue` + `src/main.ts`

## Phase 5: Komponenten

- [x] `src/components/EditorPanel.vue` – CodeMirror-Editor mit createCodeMirror-Plugin
- [x] `src/components/FeedbackPanel.vue` – Ergebnis-Anzeige (SQL-Diff, JS-Testfälle)
- [x] `src/components/DiffTable.vue` – Spalten-/Zeilen-Diff
- [x] `src/components/Header.vue`, `Sidebar.vue` – Sidebar mit Live-Filtern + Suche
- [x] `src/components/TaskListItem.vue` – Aufgabenkarte mit Badges
- [x] `src/components/HintModal.vue` – Hinweismodal
- [x] `src/components/UploadModal.vue` – JSON-Upload mit Drag & Drop
- [x] `src/views/TaskListView.vue` – Grid mit Lade-/Fehler-/Leerzustand
- [x] `src/views/TaskDetailView.vue` – Zwei-Spalten-Layout mit Editor + Feedback
- [x] `src/views/ProgressView.vue` – Statistik-Dashboard

## Phase 6: Aufgaben + Testing

- [x] `src/assets/aufgaben/krankenhaus.json` – 7 SQL + 1 JS
- [x] `public/sql-wasm.wasm` kopieren
- [ ] `npm run dev` – Tests im Browser
- [ ] Edge Cases testen (Fehlerbehandlung, Timeouts)

## Phase 7: Polish

- [ ] Dark/Light Mode Toggle
- [ ] Mobile Responsive Layout
- [ ] Upload-Modal für Custom Tasks
- [ ] Export/Import Funktionalität


## Phase 8: UI improvement

- [x] SQL Table preview (Shows a overview of the SQL Tables with their fields for SQL tasks)
- [x] Javascript Class and Function Overview (If a Task has pre defined Classes they should be shown as an overview and also recognised within the Tasks code editor but not shown within it)