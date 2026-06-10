import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Task } from "@/types/task";
import { taskLoader } from "@/core/taskLoader";

export const useTaskStore = defineStore("tasks", () => {
  // State
  const allTasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filter-State
  const filterType = ref<"alle" | "sql" | "javascript">("alle");
  const filterDifficulty = ref<"alle" | "leicht" | "mittel" | "schwer">("alle");
  const filterGroup = ref<string>("alle");
  const filterStatus = ref<"alle" | "neu" | "attempted" | "solved">("alle");
  const searchQuery = ref("");

  // Computed: Gefilterte und gesuchte Tasks
  const filteredTasks = computed(() => {
    return allTasks.value.filter(task => {
      if (filterType.value !== "alle" && task.typ !== filterType.value) return false;
      if (filterDifficulty.value !== "alle" && task.schwierigkeit !== filterDifficulty.value) return false;
      if (filterGroup.value !== "alle" && task.gruppe !== filterGroup.value) return false;
      if (filterStatus.value !== "alle" && task._status !== filterStatus.value) return false;
      if (searchQuery.value && !task.titel.toLowerCase().includes(searchQuery.value.toLowerCase())) return false;
      return true;
    });
  });

  // Computed: Alle verfügbaren Gruppen
  const groups = computed(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    allTasks.value.forEach(task => {
      if (task.gruppe && !seen.has(task.gruppe)) {
        seen.add(task.gruppe);
        result.push({ id: task.gruppe, name: task.gruppe });
      }
    });
    return result;
  });

  // Computed: Statistiken
  const stats = computed(() => {
    const total = allTasks.value.length;
    const solved = allTasks.value.filter(t => t._status === "solved").length;
    const attempted = allTasks.value.filter(t => t._status === "attempted").length;
    const sql = allTasks.value.filter(t => t.typ === "sql").length;
    const js = allTasks.value.filter(t => t.typ === "javascript").length;
    return { total, solved, attempted, sql, js };
  });

  // Actions
  async function loadTasks() {
    loading.value = true;
    error.value = null;
    try {
      allTasks.value = await taskLoader.loadAll();
    } catch (err: any) {
      error.value = err.message;
      console.error("Failed to load tasks:", err);
    } finally {
      loading.value = false;
    }
  }

  function getTaskById(id: string): Task | undefined {
    return allTasks.value.find(t => t.id === id);
  }

  function setFilterType(type: string) {
    filterType.value = type as any;
  }

  function setFilterDifficulty(difficulty: string) {
    filterDifficulty.value = difficulty as any;
  }

  function setFilterGroup(group: string) {
    filterGroup.value = group;
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status as any;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function resetFilters() {
    filterType.value = "alle";
    filterDifficulty.value = "alle";
    filterGroup.value = "alle";
    filterStatus.value = "alle";
    searchQuery.value = "";
  }

  function updateTaskStatus(taskId: string, status: "neu" | "attempted" | "solved") {
    const task = getTaskById(taskId);
    if (task) {
      task._status = status;
      if (status !== "neu") {
        task._versuche = (task._versuche || 0) + 1;
        task._zuletzt = new Date();
      }
    }
  }

  return {
    // State
    allTasks,
    loading,
    error,
    filterType,
    filterDifficulty,
    filterGroup,
    filterStatus,
    searchQuery,

    // Computed
    filteredTasks,
    groups,
    stats,

    // Actions
    loadTasks,
    getTaskById,
    setFilterType,
    setFilterDifficulty,
    setFilterGroup,
    setFilterStatus,
    setSearchQuery,
    resetFilters,
    updateTaskStatus
  };
});
