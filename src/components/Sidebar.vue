<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3>Filter</h3>
      <div class="filter-group">
        <label>Typ</label>
        <select>
          <option>Alle</option>
          <option>SQL</option>
          <option>JavaScript</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Schwierigkeit</label>
        <select>
          <option>Alle</option>
          <option>Leicht</option>
          <option>Mittel</option>
          <option>Schwer</option>
        </select>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 16px;
  overflow-y: auto;
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

.filter-group select {
  width: 100%;
  padding: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 13px;
}
</style>
