<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3>Filter</h3>

      <div class="filter-group">
        <label>Suche</label>
        <input
          v-model="taskStore.searchQuery"
          type="text"
          placeholder="Aufgabe suchen..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <label>Typ</label>
        <select v-model="taskStore.filterType">
          <option value="alle">Alle</option>
          <option value="sql">SQL</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Schwierigkeit</label>
        <select v-model="taskStore.filterDifficulty">
          <option value="alle">Alle</option>
          <option value="leicht">Leicht</option>
          <option value="mittel">Mittel</option>
          <option value="schwer">Schwer</option>
        </select>
      </div>

      <div class="filter-group" v-if="taskStore.groups.length > 0">
        <label>Gruppe</label>
        <select v-model="taskStore.filterGroup">
          <option value="alle">Alle</option>
          <option v-for="g in taskStore.groups" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Status</label>
        <select v-model="taskStore.filterStatus">
          <option value="alle">Alle</option>
          <option value="neu">Neu</option>
          <option value="attempted">Versucht</option>
          <option value="solved">Gelöst</option>
        </select>
      </div>

      <button @click="taskStore.resetFilters()" class="reset-btn">Filter zurücksetzen</button>
    </div>

    <div class="sidebar-section">
      <h3>Statistik</h3>
      <div class="stat-row">
        <span class="stat-label">Gesamt</span>
        <span class="stat-value">{{ taskStore.stats.total }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Gelöst</span>
        <span class="stat-value solved">{{ taskStore.stats.solved }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Versucht</span>
        <span class="stat-value attempted">{{ taskStore.stats.attempted }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useTaskStore } from "@/stores/taskStore";

const taskStore = useTaskStore();
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 16px;
  overflow-y: auto;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 56px;
    bottom: 0;
    z-index: 100;
    transition: left 0.25s ease;
    box-shadow: var(--shadow);
  }

  .sidebar.sidebar-open {
    left: 0;
  }
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section h3 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 12px 0;
  letter-spacing: 0.05em;
}

.filter-group {
  margin-bottom: 12px;
}

.filter-group label {
  display: block;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.filter-group select,
.search-input {
  width: 100%;
  padding: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 13px;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.reset-btn {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  margin-top: 4px;
}

.reset-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
}

.stat-label {
  color: var(--color-text-muted);
}

.stat-value {
  font-weight: 600;
}

.stat-value.solved {
  color: var(--color-success);
}

.stat-value.attempted {
  color: var(--color-warning);
}
</style>
