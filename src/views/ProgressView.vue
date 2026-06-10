<template>
  <div class="progress-view">
    <div class="page-header">
      <h1>Fortschritt</h1>
      <div class="header-actions">
        <button @click="handleExport" class="btn-export">📥 Exportieren</button>
      </div>
    </div>

    <div v-if="!loaded" class="state-message">
      Lade Statistiken...
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <span class="card-value">{{ taskStore.allTasks.length }}</span>
          <span class="card-label">Gesamt</span>
        </div>
        <div class="summary-card solved">
          <span class="card-value">{{ progressStore.stats.geloest }}</span>
          <span class="card-label">Gelöst</span>
        </div>
        <div class="summary-card attempted">
          <span class="card-value">{{ progressStore.stats.versucht }}</span>
          <span class="card-label">Versucht</span>
        </div>
        <div class="summary-card new">
          <span class="card-value">{{ neuCount }}</span>
          <span class="card-label">Neu</span>
        </div>
      </div>

      <!-- Average attempts -->
      <div class="avg-attempts">
        <strong>Durchschnittliche Versuche:</strong>
        {{ progressStore.stats.durchschnittlicheVersuche.toFixed(1) }}
      </div>

      <!-- By Type -->
      <section class="breakdown-section">
        <h2>Nach Typ</h2>
        <div class="breakdown-grid">
          <div class="breakdown-card">
            <h3>SQL</h3>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: typePercent('sql') + '%' }"
              ></div>
            </div>
            <div class="breakdown-stats">
              <span class="solved">{{ breakdown.byType.sql.geloest }}</span>
              <span class="sep">/</span>
              <span class="total">{{ breakdown.byType.sql.gesamt }}</span>
              <span class="pct">({{ typePercent('sql') }}%)</span>
            </div>
          </div>
          <div class="breakdown-card">
            <h3>JavaScript</h3>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: typePercent('javascript') + '%' }"
              ></div>
            </div>
            <div class="breakdown-stats">
              <span class="solved">{{ breakdown.byType.javascript.geloest }}</span>
              <span class="sep">/</span>
              <span class="total">{{ breakdown.byType.javascript.gesamt }}</span>
              <span class="pct">({{ typePercent('javascript') }}%)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- By Difficulty -->
      <section class="breakdown-section">
        <h2>Nach Schwierigkeit</h2>
        <div class="breakdown-grid">
          <div class="breakdown-card" v-for="diff in difficulties" :key="diff.key">
            <h3>{{ diff.label }}</h3>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: diffPercent(diff.key) + '%' }"
              ></div>
            </div>
            <div class="breakdown-stats">
              <span class="solved">{{ breakdown.byDifficulty[diff.key].geloest }}</span>
              <span class="sep">/</span>
              <span class="total">{{ breakdown.byDifficulty[diff.key].gesamt }}</span>
              <span class="pct">({{ diffPercent(diff.key) }}%)</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import { useProgressStore } from "@/stores/progressStore";
import { storage } from "@/core/storage";

const taskStore = useTaskStore();
const progressStore = useProgressStore();
const loaded = ref(false);

const difficulties = [
  { key: "leicht" as const, label: "Leicht" },
  { key: "mittel" as const, label: "Mittel" },
  { key: "schwer" as const, label: "Schwer" }
];

onMounted(async () => {
  await Promise.all([
    taskStore.loadTasks(),
    progressStore.loadProgress()
  ]);
  loaded.value = true;
});

const neuCount = computed(() => {
  const total = taskStore.allTasks.length;
  const geloest = progressStore.stats.geloest;
  const versucht = progressStore.stats.versucht;
  return Math.max(0, total - geloest - versucht);
});

const breakdown = computed(() => {
  const tasks = taskStore.allTasks;
  const results = progressStore.results;

  const byType = {
    sql: { gesamt: 0, geloest: 0 },
    javascript: { gesamt: 0, geloest: 0 }
  };

  const byDifficulty = {
    leicht: { gesamt: 0, geloest: 0 },
    mittel: { gesamt: 0, geloest: 0 },
    schwer: { gesamt: 0, geloest: 0 }
  };

  for (const task of tasks) {
    byType[task.typ].gesamt++;
    byDifficulty[task.schwierigkeit].gesamt++;

    const result = results[task.id];
    if (result?.status === "solved") {
      byType[task.typ].geloest++;
      byDifficulty[task.schwierigkeit].geloest++;
    }
  }

  return { byType, byDifficulty };
});

function typePercent(typ: "sql" | "javascript"): number {
  const b = breakdown.value.byType[typ];
  return b.gesamt > 0 ? Math.round((b.geloest / b.gesamt) * 100) : 0;
}

function diffPercent(diff: "leicht" | "mittel" | "schwer"): number {
  const b = breakdown.value.byDifficulty[diff];
  return b.gesamt > 0 ? Math.round((b.geloest / b.gesamt) * 100) : 0;
}

async function handleExport() {
  try {
    const data = await storage.exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ihk-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error("Export failed:", err);
  }
}
</script>

<style scoped>
.progress-view {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-export {
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
}

.btn-export:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.state-message {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
  font-size: 15px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
}

.card-value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-label {
  font-size: 13px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-card.solved .card-value {
  color: var(--color-success);
}

.summary-card.attempted .card-value {
  color: var(--color-warning);
}

.summary-card.new .card-value {
  color: var(--color-text-muted);
}

.avg-attempts {
  text-align: center;
  margin-bottom: 32px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.avg-attempts strong {
  color: var(--color-text);
}

.breakdown-section {
  margin-bottom: 32px;
}

.breakdown-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.breakdown-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px;
}

.breakdown-card h3 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: var(--color-bg);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--color-success);
  border-radius: 4px;
  transition: width 0.3s ease;
  min-width: 0;
}

.breakdown-stats {
  font-size: 13px;
}

.breakdown-stats .solved {
  color: var(--color-success);
  font-weight: 600;
}

.breakdown-stats .sep {
  color: var(--color-text-muted);
}

.breakdown-stats .total {
  color: var(--color-text-muted);
}

.breakdown-stats .pct {
  color: var(--color-text-muted);
  font-size: 12px;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 20px;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .summary-card {
    padding: 16px;
  }

  .card-value {
    font-size: 24px;
  }
}
</style>
