<template>
  <div class="task-list-view">
    <div class="page-header">
      <h1>Aufgaben</h1>
      <button @click="showUploadModal = true" class="btn-upload">📤 Hochladen</button>
    </div>

    <div v-if="taskStore.loading" class="state-message">
      <p>Lade Aufgaben...</p>
    </div>

    <div v-else-if="taskStore.error" class="state-message error">
      <p>Fehler beim Laden: {{ taskStore.error }}</p>
      <button @click="taskStore.loadTasks()" class="btn-retry">Erneut versuchen</button>
    </div>

    <div v-else-if="taskStore.filteredTasks.length === 0" class="state-message empty">
      <p>Keine Aufgaben gefunden.</p>
      <p class="hint">Filter anpassen oder neue Aufgaben hochladen.</p>
    </div>

    <div v-else class="task-grid">
      <TaskListItem v-for="task in taskStore.filteredTasks" :key="task.id" :task="task" />
    </div>

    <UploadModal
      :visible="showUploadModal"
      @close="showUploadModal = false"
      @imported="showUploadModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import TaskListItem from "@/components/TaskListItem.vue";
import UploadModal from "@/components/UploadModal.vue";

const taskStore = useTaskStore();
const showUploadModal = ref(false);

onMounted(() => {
  taskStore.loadTasks();
});
</script>

<style scoped>
.task-list-view {
  max-width: 1200px;
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

.btn-upload {
  padding: 10px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
}

.btn-upload:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.state-message {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-muted);
}

.state-message p {
  margin: 0 0 8px;
  font-size: 15px;
}

.state-message.error {
  color: var(--color-error);
}

.state-message .hint {
  font-size: 13px;
  opacity: 0.8;
}

.btn-retry {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
}

.btn-retry:hover {
  border-color: var(--color-primary);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 20px;
  }

  .task-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
