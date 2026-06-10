<template>
  <div v-if="task" class="task-detail">
    <div class="task-content">
      <div class="left-panel">
        <div class="context-block">
          <h1>{{ task.titel }}</h1>
          <div class="meta">
            <span class="badge" :class="'difficulty-' + task.schwierigkeit">
              {{ difficultyLabel }}
            </span>
            <span class="badge status" :class="'status-' + (task._status || 'neu')">
              {{ statusLabel }}
            </span>
          </div>
          <div class="markdown-block">
            <div class="markdown" v-html="renderedContext"></div>
          </div>
          <SchemaPreview v-if="task.typ === 'sql' && task.schema" :schema="task.schema" />
          <ClassOverview v-if="task.typ === 'javascript'" :starter-code="task.starterCode" />
          <div class="aufgabenstellung-block">
            <h3>Aufgabenstellung</h3>
            <div class="markdown" v-html="renderedAufgabe"></div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <EditorPanel :task="task" @execute="handleExecute" @show-hint="showHintModal = true" />
        <FeedbackPanel :feedback="lastFeedback" />
      </div>
    </div>

    <HintModal
      :visible="showHintModal"
      :hints="task.hinweise"
      @close="showHintModal = false"
    />
  </div>
  <div v-else class="error-state">
    <p>Aufgabe nicht gefunden.</p>
    <router-link to="/" class="back-link">Zurück zur Übersicht</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import { useEditorStore } from "@/stores/editorStore";
import { useProgressStore } from "@/stores/progressStore";
import { marked } from "marked";
import EditorPanel from "@/components/EditorPanel.vue";
import FeedbackPanel from "@/components/FeedbackPanel.vue";
import HintModal from "@/components/HintModal.vue";
import SchemaPreview from "@/components/SchemaPreview.vue";
import ClassOverview from "@/components/ClassOverview.vue";
import { SQLiteRunner } from "@/core/db";
import { JSRunner } from "@/core/jsRunner";
import type { ValidationResult } from "@/types";

const route = useRoute();
const taskStore = useTaskStore();
const editorStore = useEditorStore();
const progressStore = useProgressStore();

const taskId = route.params.id as string;
const task = computed(() => taskStore.getTaskById(taskId));
const lastFeedback = ref<ValidationResult | null>(null);
const showHintModal = ref(false);

const renderedContext = computed(() => {
  const text = task.value?.kontext || "";
  return marked(text);
});

const renderedAufgabe = computed(() => {
  const text = task.value?.aufgabenstellung || "";
  return marked(text);
});

const difficultyLabel = computed(() => {
  switch (task.value?.schwierigkeit) {
    case "leicht": return "Leicht";
    case "mittel": return "Mittel";
    case "schwer": return "Schwer";
    default: return "";
  }
});

const statusLabel = computed(() => {
  switch (task.value?._status) {
    case "solved": return "Gelöst";
    case "attempted": return "Versucht";
    default: return "Neu";
  }
});

onMounted(async () => {
  // Ensure tasks are loaded (important when navigating directly to detail)
  if (taskStore.allTasks.length === 0) {
    await taskStore.loadTasks();
  }
  await progressStore.loadProgress();
  await editorStore.loadCode(taskId);
});

async function handleExecute(code: string) {
  if (!task.value) return;

  try {
    let result: ValidationResult;

    if (task.value.typ === "sql") {
      const runner = SQLiteRunner.buildDB(window._SQL, task.value.schema || []);
      try {
        result = runner.validate(code, task.value.loesung);
      } finally {
        runner.close();
      }
    } else {
      result = await JSRunner.run(task.value as any, code);
    }

    lastFeedback.value = result;

    if (result.ok) {
      await progressStore.saveResult(taskId, code, "solved");
      taskStore.updateTaskStatus(taskId, "solved");
    } else {
      await progressStore.saveResult(taskId, code, "attempted");
      taskStore.updateTaskStatus(taskId, "attempted");
    }
  } catch (err: any) {
    lastFeedback.value = {
      ok: false,
      typ: "error",
      message: "Interner Fehler: " + err.message,
      fehler: err.message
    };
  }
}
</script>

<style scoped>
.task-detail {
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.task-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.left-panel {
  overflow-y: auto;
  padding-right: 16px;
}

.context-block {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 24px;
}

.context-block h1 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
}

.meta {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 3px;
  background: var(--color-border);
  color: var(--color-text);
}

.badge.difficulty-leicht {
  background: rgba(62, 207, 142, 0.15);
  color: var(--color-success);
}

.badge.difficulty-mittel {
  background: rgba(245, 166, 35, 0.15);
  color: var(--color-warning);
}

.badge.difficulty-schwer {
  background: rgba(247, 110, 110, 0.15);
  color: var(--color-error);
}

.badge.status-neu {
  background: rgba(136, 146, 164, 0.15);
  color: var(--color-text-muted);
}

.badge.status-attempted {
  background: rgba(245, 166, 35, 0.15);
  color: var(--color-warning);
}

.badge.status-solved {
  background: rgba(62, 207, 142, 0.15);
  color: var(--color-success);
}

.markdown-block {
  margin-bottom: 24px;
}

.markdown-block :deep(h1),
.markdown-block :deep(h2),
.markdown-block :deep(h3) {
  margin-top: 0;
}

.markdown-block :deep(p) {
  margin: 0 0 12px;
  line-height: 1.6;
}

.markdown-block :deep(code) {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--color-bg);
  padding: 2px 6px;
  border-radius: 3px;
}

.markdown-block :deep(pre) {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
}

.markdown-block :deep(pre code) {
  background: none;
  padding: 0;
}

.aufgabenstellung-block h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--color-primary);
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.right-panel > :first-child {
  flex: 1;
  min-height: 300px;
}

.error-state {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
}

.error-state p {
  font-size: 16px;
  margin-bottom: 16px;
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .task-detail {
    padding: 0;
  }

  .task-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .left-panel {
    max-height: 50vh;
    padding-right: 0;
  }

  .context-block {
    padding: 16px;
  }

  .context-block h1 {
    font-size: 20px;
  }
}
</style>
