import type { Task, TaskSet } from "@/types/task";
import { storage } from "./storage";

// Dynamisch alle JSON-Aufgabendateien im assets/aufgaben/ Verzeichnis erkennen
const aufgabenModules = import.meta.glob<{ default: TaskSet }>(
  "/src/assets/aufgaben/*.json",
  { eager: true }
);

export const taskLoader = {
  async loadAll(): Promise<Task[]> {
    const allTasks: Task[] = [];

    for (const [path, module] of Object.entries(aufgabenModules)) {
      try {
        const data = module.default;
        allTasks.push(...data.aufgaben);
      } catch (err) {
        console.error(`Failed to load ${path}:`, err);
      }
    }

    try {
      const customTasks = await storage.getCustomTasks();
      allTasks.push(...customTasks);
    } catch (err) {
      console.error("Failed to load custom tasks:", err);
    }

    const allResults = await storage.getAllResults();
    const resultMap = new Map(allResults.map((r) => [r.id, r]));

    allTasks.forEach((task) => {
      const result = resultMap.get(task.id);
      if (result) {
        task._status = result.status;
        task._versuche = result.versuche;
        task._zuletzt = new Date(result.zuletzt);
        task._code = result.code;
      } else {
        task._status = "neu";
        task._versuche = 0;
      }
    });

    return allTasks;
  },
};
