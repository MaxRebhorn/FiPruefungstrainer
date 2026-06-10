<template>
  <div class="class-overview" v-if="hasContent">
    <h3 class="overview-title">
      {{ preview.classes.length > 0 ? "Klassen & Funktionen" : "Funktionen" }}
    </h3>

    <!-- Classes -->
    <div v-for="cls in preview.classes" :key="cls.name" class="class-card">
      <div class="class-header">
        <span class="keyword">class</span>
        <span class="class-name">{{ cls.name }}</span>
      </div>
      <div v-if="cls.methods.length > 0" class="methods-list">
        <div v-for="meth in cls.methods" :key="meth.name" class="method-item">
          <span class="method-name">{{ meth.name }}</span>
          <span class="method-params">({{ meth.params.join(", ") }})</span>
        </div>
      </div>
    </div>

    <!-- Functions -->
    <div v-for="fn in preview.functions" :key="fn.name" class="function-item">
      <span class="keyword">function</span>
      <span class="function-name">{{ fn.name }}</span>
      <span class="function-params">({{ fn.params.join(", ") }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { parseJSPreview, type JSPreview } from "@/utils/jsPreviewParser";

const props = defineProps<{ starterCode?: string }>();

const preview = computed<JSPreview>(() => parseJSPreview(props.starterCode || ""));
const hasContent = computed(() =>
  preview.value.functions.length > 0 || preview.value.classes.length > 0
);
</script>

<style scoped>
.class-overview {
  margin-bottom: 24px;
}

.overview-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.class-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 8px;
}

.class-header {
  padding: 8px 12px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.keyword {
  color: var(--color-primary);
  font-weight: 600;
  font-family: var(--font-mono);
  font-size: 12px;
}

.class-name {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 14px;
}

.methods-list {
  padding: 4px 0;
}

.method-item {
  padding: 4px 12px 4px 24px;
  font-family: var(--font-mono);
  font-size: 13px;
  display: flex;
  gap: 4px;
}

.method-item:hover {
  background: rgba(62, 130, 247, 0.05);
}

.method-name {
  color: var(--color-text);
  font-weight: 500;
}

.method-params {
  color: var(--color-text-muted);
}

.function-item {
  padding: 6px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  margin-bottom: 6px;
  font-family: var(--font-mono);
  font-size: 13px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.function-item:hover {
  border-color: var(--color-primary);
}

.function-name {
  font-weight: 600;
}

.function-params {
  color: var(--color-text-muted);
}
</style>
