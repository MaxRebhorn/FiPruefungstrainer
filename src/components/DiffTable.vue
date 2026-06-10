<template>
  <div class="diff-table" v-if="diff">
    <h4 class="diff-title">Detail-Unterschiede</h4>

    <!-- Fehlende Einträge -->
    <div v-if="diff.fehlende.length > 0" class="diff-section">
      <h5 class="diff-section-title missing">Fehlend ({{ diff.fehlende.length }})</h5>
      <div v-for="(item, i) in diff.fehlende" :key="'miss-' + i" class="diff-item">
        <code>{{ formatValue(item) }}</code>
      </div>
    </div>

    <!-- Zusätzliche Einträge -->
    <div v-if="diff.zusaetzliche.length > 0" class="diff-section">
      <h5 class="diff-section-title extra">Zusätzlich ({{ diff.zusaetzliche.length }})</h5>
      <div v-for="(item, i) in diff.zusaetzliche" :key="'extra-' + i" class="diff-item">
        <code>{{ formatValue(item) }}</code>
      </div>
    </div>

    <!-- Unterschiedliche Einträge -->
    <div v-if="Object.keys(diff.unterschiedlich).length > 0" class="diff-section">
      <h5 class="diff-section-title different">Abweichend ({{ Object.keys(diff.unterschiedlich).length }})</h5>
      <div v-for="(entry, key, i) in diff.unterschiedlich" :key="'diff-' + i" class="diff-entry">
        <strong class="diff-key">{{ key }}</strong>
        <div class="diff-compare">
          <div class="diff-value user">
            <span class="diff-label">Dein Wert:</span>
            <code>{{ formatValue(entry.nutzer) }}</code>
          </div>
          <div class="diff-value expected">
            <span class="diff-label">Erwartet:</span>
            <code>{{ formatValue(entry.erwartet) }}</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiffInfo } from "@/types";

defineProps<{
  diff: DiffInfo | null;
}>();

function formatValue(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}
</script>

<style scoped>
.diff-table {
  margin-top: 12px;
}

.diff-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.diff-section {
  margin-bottom: 12px;
}

.diff-section-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 6px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.diff-section-title.missing {
  background: rgba(247, 110, 110, 0.15);
  color: var(--color-error);
}

.diff-section-title.extra {
  background: rgba(245, 166, 35, 0.15);
  color: var(--color-warning);
}

.diff-section-title.different {
  background: rgba(91, 141, 239, 0.15);
  color: var(--color-primary);
}

.diff-item {
  padding: 4px 8px;
  font-size: 13px;
}

.diff-item code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--color-bg);
  padding: 2px 6px;
  border-radius: 3px;
}

.diff-entry {
  padding: 8px;
  margin-bottom: 8px;
  background: var(--color-bg);
  border-radius: 4px;
}

.diff-key {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
  color: var(--color-text-muted);
}

.diff-compare {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diff-value {
  font-size: 13px;
}

.diff-value code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: 3px;
}

.diff-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-right: 4px;
}
</style>
