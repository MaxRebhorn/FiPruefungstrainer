<template>
  <div v-if="!feedback" class="feedback-empty">
    Gib Code ein und klicke "Ausführen".
  </div>
  <div v-else-if="feedback.ok" class="feedback success">
    <div class="feedback-icon">✅</div>
    <div>
      <h4>Richtig!</h4>
      <p>{{ feedback.message }}</p>
    </div>
  </div>
  <div v-else class="feedback error">
    <div class="feedback-icon">❌</div>
    <div>
      <h4>Falsch</h4>
      <p>{{ feedback.message }}</p>
      <DiffTable
        v-if="feedback.diff && feedback.typ === 'select_compare'"
        :diff="feedback.diff"
      />
      <div v-if="feedback.fehler" class="error-detail">
        <code>{{ feedback.fehler }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationResult } from "@/types/task";
import DiffTable from "./DiffTable.vue";

defineProps<{
  feedback: ValidationResult | null;
}>();
</script>

<style scoped>
.feedback-empty {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.feedback {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius);
  margin-top: 12px;
}

.feedback.success {
  background: rgba(62, 207, 142, 0.1);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.feedback.error {
  background: rgba(247, 110, 110, 0.1);
  border: 1px solid var(--color-error);
  color: var(--color-error);
}

.feedback-icon {
  font-size: 24px;
  line-height: 1;
}

h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

p {
  margin: 0;
  font-size: 14px;
}

.error-detail {
  margin-top: 8px;
}

.error-detail code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--color-bg);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  word-break: break-all;
}
</style>
