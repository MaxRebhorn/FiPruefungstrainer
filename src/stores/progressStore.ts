import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storage } from "@/core/storage";
import type { TaskProgress, ProgressStats } from "@/types";

export const useProgressStore = defineStore("progress", () => {
  const results = ref<Record<string, TaskProgress>>({}); // taskId → progress

  async function loadProgress() {
    const allResults = await storage.getAllResults();
    allResults.forEach(r => {
      results.value[r.id] = r;
    });
  }

  async function saveResult(
    taskId: string,
    code: string,
    status: "attempted" | "solved"
  ) {
    const existing = results.value[taskId];
    const versuche = (existing?.versuche || 0) + (status === "solved" ? 0 : 1);

    const progress: TaskProgress = {
      id: taskId,
      code,
      status,
      versuche,
      zuletzt: new Date()
    };

    results.value[taskId] = progress;
    await storage.saveResult(progress);
  }

  const stats = computed((): ProgressStats => {
    const allResults = Object.values(results.value);
    const solved = allResults.filter(r => r.status === "solved").length;
    const attempted = allResults.filter(r => r.status === "attempted").length;

    return {
      totalAufgaben: Object.keys(results.value).length,
      geloest: solved,
      versucht: attempted,
      neu: Math.max(0, (100 - solved - attempted)), // Placeholder
      durchschnittlicheVersuche: allResults.length > 0
        ? allResults.reduce((sum, r) => sum + r.versuche, 0) / allResults.length
        : 0,
      nach_typ: { sql: { gesamt: 0, geloest: 0 }, javascript: { gesamt: 0, geloest: 0 } },
      nach_schwierigkeit: { leicht: { gesamt: 0, geloest: 0 }, mittel: { gesamt: 0, geloest: 0 }, schwer: { gesamt: 0, geloest: 0 } }
    };
  });

  return {
    results,
    stats,
    loadProgress,
    saveResult
  };
});
