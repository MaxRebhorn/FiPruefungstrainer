<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>💡 Hinweise</h3>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <ol v-if="hints.length > 0" class="hint-list">
          <li v-for="(hint, i) in hints" :key="i" class="hint-item">{{ hint }}</li>
        </ol>
        <p v-else class="no-hints">Keine Hinweise verfügbar.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  hints: string[];
}>();

const emit = defineEmits<{
  close: [];
}>();

function close() {
  emit("close");
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
  max-height: 80vh;
  overflow-y: auto;
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

.hint-list {
  margin: 0;
  padding-left: 20px;
}

.hint-item {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.no-hints {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0;
}
</style>
