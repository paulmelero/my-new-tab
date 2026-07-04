import { computed, ref } from "vue";
import localforage from "localforage";
import type { HistoryTask, ToDo } from "../types/types";

localforage.config({
  name: "my-new-tab",
  storeName: "history",
});

export async function addCompletedTask(todo: ToDo) {
  const historyTask: Omit<HistoryTask, "id"> = {
    text: todo.text,
    completedAt: Date.now(),
  };
  await localforage.setItem(String(todo.id), historyTask);
}

async function getTasks(): Promise<HistoryTask[]> {
  const tasks: HistoryTask[] = [];
  await localforage.iterate((value: Omit<HistoryTask, "id">, key: string) => {
    tasks.push({ ...value, id: Number(key) });
  });
  return tasks.reverse();
}

export async function clearOldTasks() {
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  await localforage.iterate((value: Omit<HistoryTask, "id">, key: string) => {
    if (value.completedAt < twoWeeksAgo) {
      void localforage.removeItem(key);
    }
  });
}

async function clearAllTasks() {
  await localforage.clear();
}

async function clearTasksByDate(date: number) {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);
  await localforage.iterate((value: Omit<HistoryTask, "id">, key: string) => {
    if (value.completedAt >= startOfDay && value.completedAt <= endOfDay) {
      void localforage.removeItem(key);
    }
  });
}

export function useHistory() {
  const tasks = ref<HistoryTask[]>([]);

  const groupedByDate = computed(() => {
    return tasks.value.reduce<Record<number, HistoryTask[]>>((acc, task) => {
      const date = new Date(task.completedAt).setHours(0, 0, 0, 0);
      (acc[date] ??= []).push(task);
      return acc;
    }, {});
  });

  const hasTasks = computed(() => tasks.value.length > 0);

  async function refresh() {
    tasks.value = await getTasks();
  }

  async function clearAll() {
    if (!hasTasks.value) return;
    if (!confirm("Are you sure you want to clear all history?")) return;
    await clearAllTasks();
    await refresh();
  }

  async function clearDay(date: number) {
    if (!confirm("Are you sure you want to clear this day's history?")) return;
    await clearTasksByDate(date);
    await refresh();
  }

  return { tasks, groupedByDate, hasTasks, refresh, clearAll, clearDay };
}
