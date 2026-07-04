import { computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { ToDo } from "../types/types";
import { addCompletedTask } from "./useHistory";
import { bucketDate, startOfWeek, today } from "./useDates";

type LegacyToDo = Partial<ToDo> & { id: number; text: string; completed: boolean };

function migrateTodo(raw: LegacyToDo, index: number): ToDo {
  return {
    id: raw.id,
    text: raw.text,
    completed: raw.completed,
    dueDate: raw.dueDate ?? today(),
    order: raw.order ?? index,
  };
}

const todos = useLocalStorage<ToDo[]>("todos", []);
todos.value = todos.value.map((raw, index) => migrateTodo(raw as LegacyToDo, index));

function createTodo(text: string, dueDate: string, order: number): ToDo {
  return {
    id: Date.now(),
    text,
    completed: false,
    dueDate,
    order,
  };
}

export function useTodos() {
  const hasCompleted = computed(() => todos.value.some((todo) => todo.completed));

  function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const dueDate = today();
    const minOrder = todos.value
      .filter((t) => t.dueDate === dueDate)
      .reduce((min, t) => Math.min(min, t.order), 0);
    todos.value.unshift(createTodo(trimmed, dueDate, minOrder - 1));
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }

  function deleteTodo(id: number) {
    todos.value = todos.value.filter((t) => t.id !== id);
  }

  function updateTodo(id: number, patch: Partial<Pick<ToDo, "text" | "dueDate" | "completed">>) {
    const todo = todos.value.find((t) => t.id === id);
    if (!todo) return;

    if (patch.text !== undefined) {
      const trimmed = patch.text.trim();
      if (!trimmed) {
        deleteTodo(id);
        return;
      }
      todo.text = trimmed;
    }
    if (patch.dueDate !== undefined) todo.dueDate = patch.dueDate;
    if (patch.completed !== undefined) todo.completed = patch.completed;
  }

  function moveTodo(id: number, targetDate: string, targetIndex: number) {
    const todo = todos.value.find((t) => t.id === id);
    if (!todo) return;

    const weekStart = startOfWeek(today());
    const sourceBucket = bucketDate(todo.dueDate, todo.completed, weekStart);
    if (sourceBucket !== targetDate) {
      todo.dueDate = targetDate;
    }

    const bucketTodos = todos.value
      .filter((t) => t.id !== id && bucketDate(t.dueDate, t.completed, weekStart) === targetDate)
      .sort((a, b) => a.order - b.order);
    bucketTodos.splice(targetIndex, 0, todo);
    bucketTodos.forEach((t, index) => {
      t.order = index;
    });
  }

  async function clearCompleted() {
    const completed = todos.value.filter((t) => t.completed);
    for (const todo of completed) {
      await addCompletedTask(todo);
    }
    todos.value = todos.value.filter((t) => !t.completed);
  }

  return {
    todos,
    hasCompleted,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    moveTodo,
    clearCompleted,
  };
}
