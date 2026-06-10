<template>
  <div class="editor-panel">
    <div class="editor-header">
      <span class="lang-badge">{{ task.typ === 'sql' ? 'SQL' : 'JavaScript' }}</span>
      <div class="actions">
        <button @click="resetCode" title="Code zurücksetzen" class="icon-btn">↺</button>
      </div>
    </div>
    <div ref="editorContainer" class="editor-container"></div>
    <div class="editor-footer">
      <button @click="handleExecute" class="btn-primary">▶ Ausführen</button>
      <button @click="emit('show-hint')" class="btn-secondary">💡 Hinweis</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { Task, JSTask } from "@/types/task";
import { useEditorStore } from "@/stores/editorStore";
import { createCodeMirror } from "@/plugins/codemirror";

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{
  execute: [code: string];
  "show-hint": [];
}>();

const editorStore = useEditorStore();
const editorContainer = ref<HTMLDivElement>();
let editor: ReturnType<typeof createCodeMirror>;

onMounted(() => {
  const startCode = editorStore.getCode(props.task.id) || props.task.starterCode || "";

  // Collect mock names for autocompletion in JS tasks
  const extraCompletions: string[] = [];
  if (props.task.typ === "javascript" && props.task.mocks) {
    for (const name of Object.keys(props.task.mocks)) {
      extraCompletions.push(name);
    }
  }

  editor = createCodeMirror(editorContainer.value!, {
    doc: startCode,
    lang: props.task.typ,
    extraCompletions: extraCompletions.length > 0 ? extraCompletions : undefined,
    onChange: (value) => {
      editorStore.setCode(props.task.id, value);
    }
  });
});

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
  }
});

function handleExecute() {
  const code = editor.state.doc.toString();
  editorStore.setCode(props.task.id, code);
  emit("execute", code);
}

function resetCode() {
  const startCode = props.task.starterCode || "";
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: startCode
    }
  });
  editorStore.setCode(props.task.id, startCode);
}
</script>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.lang-badge {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-primary);
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  padding: 6px 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.icon-btn:hover {
  background: var(--color-border);
}

.editor-container {
  flex: 1;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 14px;
}

.editor-container :deep(.cm-editor) {
  height: 100%;
}

.editor-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

.btn-primary {
  flex: 1;
  padding: 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--color-border);
}
</style>
