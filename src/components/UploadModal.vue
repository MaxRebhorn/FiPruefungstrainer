<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>📤 Aufgaben importieren</h3>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p class="upload-info">Lade eine JSON-Datei mit Aufgaben hoch (TaskSet-Format).</p>

        <div
          class="drop-zone"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
          :class="{ active: dragOver }"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileSelect"
            class="file-input"
          />
          <button @click="openFileDialog" class="btn-upload">Datei auswählen</button>
          <span class="drop-text">oder JSON hier ablegen</span>
        </div>

        <div v-if="resultMessage" class="result-message" :class="resultOk ? 'success' : 'error'">
          {{ resultMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storage } from "@/core/storage";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  imported: [];
}>();

const fileInput = ref<HTMLInputElement>();
const dragOver = ref(false);
const resultMessage = ref("");
const resultOk = ref(false);

function openFileDialog() {
  fileInput.value?.click();
}

function close() {
  resultMessage.value = "";
  emit("close");
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) await processFile(file);
  target.value = "";
}

async function handleDrop(e: DragEvent) {
  dragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) await processFile(file);
}

async function processFile(file: File) {
  if (!file.name.endsWith(".json")) {
    resultMessage.value = "Bitte eine JSON-Datei auswählen.";
    resultOk.value = false;
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    const tasks = data.aufgaben || (Array.isArray(data) ? data : [data]);
    let imported = 0;

    for (const task of tasks) {
      if (task.id && task.typ && (task.loesung || task.aufgabenstellung)) {
        await storage.saveCustomTask(task);
        imported++;
      }
    }

    if (imported > 0) {
      resultMessage.value = `${imported} Aufgabe${imported !== 1 ? "n" : ""} erfolgreich importiert.`;
      resultOk.value = true;
      emit("imported");
    } else {
      resultMessage.value = "Keine gültigen Aufgaben in der Datei gefunden.";
      resultOk.value = false;
    }
  } catch (err: any) {
    resultMessage.value = "Fehler beim Lesen der Datei: " + err.message;
    resultOk.value = false;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-text);
}

.modal-body {
  padding: 20px;
}

.upload-info {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius);
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}

.drop-zone.active {
  border-color: var(--color-primary);
  background: rgba(91, 141, 239, 0.05);
}

.file-input {
  display: none;
}

.btn-upload {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-upload:hover {
  opacity: 0.9;
}

.drop-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

.result-message {
  margin-top: 12px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.result-message.success {
  background: rgba(62, 207, 142, 0.1);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.result-message.error {
  background: rgba(247, 110, 110, 0.1);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}
</style>
