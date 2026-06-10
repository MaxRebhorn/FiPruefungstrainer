<template>
  <div class="schema-preview" v-if="tables.length > 0">
    <h3 class="schema-title">Datenbank-Schema</h3>
    <div class="table-cards">
      <div v-for="table in tables" :key="table.name" class="table-card">
        <div class="table-header">
          <span class="table-icon">📋</span>
          <span class="table-name">{{ table.name }}</span>
        </div>
        <table class="column-table">
          <thead>
            <tr>
              <th>Spalte</th>
              <th>Typ</th>
              <th>Constraints</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="col in table.columns" :key="col.name">
              <td class="col-name">{{ col.name }}</td>
              <td class="col-type">{{ col.type }}</td>
              <td class="col-constraints">
                <span
                  v-for="c in col.constraints"
                  :key="c"
                  class="constraint-badge"
                >{{ shortConstraint(c) }}</span>
              </td>
            </tr>
          </tbody>
          <tbody v-if="table.foreignKeys.length > 0" class="fk-section">
            <tr v-for="fk in table.foreignKeys" :key="fk.column + fk.references">
              <td colspan="3" class="fk-cell">
                <span class="fk-label">FK:</span>
                <span class="fk-detail">{{ fk.column }} → {{ fk.references }}({{ fk.referencesColumn }})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { parseSchema, type TableInfo } from "@/utils/schemaParser";

const props = defineProps<{ schema: string[] }>();

const tables = computed<TableInfo[]>(() => parseSchema(props.schema));

function shortConstraint(c: string): string {
  switch (c) {
    case "PRIMARY KEY": return "PK";
    case "AUTOINCREMENT": return "AI";
    case "NOT NULL": return "NN";
    case "UNIQUE": return "UQ";
    default: return c;
  }
}
</script>

<style scoped>
.schema-preview {
  margin-bottom: 24px;
}

.schema-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  font-size: 14px;
}

.table-icon {
  font-size: 14px;
}

.table-name {
  font-family: var(--font-mono);
  color: var(--color-primary);
}

.column-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.column-table th {
  padding: 6px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.column-table td {
  padding: 6px 12px;
  border-bottom: 1px solid var(--color-border);
}

.column-table tr:last-child td {
  border-bottom: none;
}

.col-name {
  font-family: var(--font-mono);
  font-weight: 500;
  white-space: nowrap;
}

.col-type {
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  font-size: 12px;
}

.col-constraints {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.constraint-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.fk-section td {
  background: rgba(62, 130, 247, 0.05);
}

.fk-cell {
  display: flex;
  gap: 6px;
  align-items: center;
}

.fk-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.fk-detail {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
