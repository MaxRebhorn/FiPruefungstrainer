<template>
  <router-link :to="`/aufgabe/${task.id}`" class="task-card">
    <div class="task-card-header">
      <span class="type-badge" :class="task.typ">
        {{ task.typ === "sql" ? "SQL" : "JS" }}
      </span>
      <span class="difficulty-badge" :class="task.schwierigkeit">
        {{ difficultyLabel }}
      </span>
      <span class="status-indicator" :class="task._status || 'neu'">
        {{ statusLabel }}
      </span>
    </div>
    <h3 class="task-title">{{ task.titel }}</h3>
    <p v-if="task.gruppe" class="task-group">{{ task.gruppe }}</p>
    <p v-if="task.beschreibung" class="task-desc">{{ task.beschreibung }}</p>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/types";

const props = defineProps<{
  task: Task;
}>();

const difficultyLabel = computed(() => {
  switch (props.task.schwierigkeit) {
    case "leicht": return "Leicht";
    case "mittel": return "Mittel";
    case "schwer": return "Schwer";
  }
});

const statusLabel = computed(() => {
  switch (props.task._status) {
    case "solved": return "Gelöst";
    case "attempted": return "Versucht";
    default: return "Neu";
  }
});
</script>

<style scoped>
.task-card {
  display: block;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.task-card-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.type-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-badge.sql {
  background: rgba(91, 141, 239, 0.2);
  color: #5b8def;
}

.type-badge.javascript {
  background: rgba(245, 166, 35, 0.2);
  color: #f5a623;
}

.difficulty-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.difficulty-badge.leicht {
  background: rgba(62, 207, 142, 0.15);
  color: var(--color-success);
}

.difficulty-badge.mittel {
  background: rgba(245, 166, 35, 0.15);
  color: var(--color-warning);
}

.difficulty-badge.schwer {
  background: rgba(247, 110, 110, 0.15);
  color: var(--color-error);
}

.status-indicator {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}

.status-indicator.neu {
  background: rgba(136, 146, 164, 0.15);
  color: var(--color-text-muted);
}

.status-indicator.attempted {
  background: rgba(245, 166, 35, 0.15);
  color: var(--color-warning);
}

.status-indicator.solved {
  background: rgba(62, 207, 142, 0.15);
  color: var(--color-success);
}

.task-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.task-group {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.task-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
