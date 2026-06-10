import type { Task, TaskSet } from "@/types/task";
import { storage } from "./storage";

export const taskLoader = {
  async loadAll(): Promise<Task[]> {
    const allTasks: Task[] = [];

    const builtInSets = ["krankenhaus"];

    for (const setName of builtInSets) {
      try {
        const response = await fetch(
          `/src/assets/aufgaben/${setName}.json`
        );
        const data: TaskSet = await response.json();
        allTasks.push(...data.aufgaben);
      } catch (err) {
        console.error(`Failed to load ${setName}.json:`, err);
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
