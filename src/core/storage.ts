import type { TaskProgress } from "@/types";

const STORAGE_PREFIX = "fi_";
const DB_NAME = "FIPlattform";
const STORE_NAME = "tasks";

export const storage = {
  // ========== localStorage für Codes & Results ==========

  async saveResult(progress: TaskProgress) {
    const key = `${STORAGE_PREFIX}result_${progress.id}`;
    localStorage.setItem(key, JSON.stringify(progress));
  },

  async getResult(taskId: string): Promise<TaskProgress | null> {
    const key = `${STORAGE_PREFIX}result_${taskId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  async getAllResults(): Promise<TaskProgress[]> {
    const results: TaskProgress[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_PREFIX}result_`)) {
        const data = localStorage.getItem(key);
        if (data) results.push(JSON.parse(data));
      }
    }
    return results;
  },

  async saveCode(taskId: string, code: string) {
    const key = `${STORAGE_PREFIX}code_${taskId}`;
    localStorage.setItem(key, code);
  },

  async getCode(taskId: string): Promise<string | null> {
    const key = `${STORAGE_PREFIX}code_${taskId}`;
    return localStorage.getItem(key);
  },

  // ========== IndexedDB für Custom Tasks ==========

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  },

  async saveCustomTask(task: any) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(task);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  },

  async getCustomTasks(): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  },

  // ========== Import/Export ==========

  async exportAll(): Promise<string> {
    const results = await this.getAllResults();
    const custom = await this.getCustomTasks();
    return JSON.stringify(
      {
        version: "1.0",
        exported: new Date().toISOString(),
        results,
        customTasks: custom,
      },
      null,
      2
    );
  },

  async importAll(jsonString: string) {
    const data = JSON.parse(jsonString);
    for (const result of data.results || []) {
      await this.saveResult(result);
    }
    for (const task of data.customTasks || []) {
      await this.saveCustomTask(task);
    }
  },
};
