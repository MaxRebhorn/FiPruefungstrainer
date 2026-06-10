import { defineStore } from "pinia";
import { ref } from "vue";
import { storage } from "@/core/storage";

export const useEditorStore = defineStore("editor", () => {
  const currentTaskId = ref<string | null>(null);
  const code = ref<Record<string, string>>({}); // taskId → code

  async function setCode(taskId: string, codeText: string) {
    code.value[taskId] = codeText;
    // Auch in localStorage speichern
    await storage.saveCode(taskId, codeText);
  }

  function getCode(taskId: string): string {
    return code.value[taskId] || "";
  }

  async function loadCode(taskId: string) {
    const saved = await storage.getCode(taskId);
    if (saved) {
      code.value[taskId] = saved;
    }
  }

  function setCurrentTask(taskId: string | null) {
    currentTaskId.value = taskId;
  }

  return {
    currentTaskId,
    code,
    setCode,
    getCode,
    loadCode,
    setCurrentTask
  };
});
