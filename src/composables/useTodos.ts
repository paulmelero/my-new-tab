import { computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { ToDo } from "../types/types";
import { addCompletedTask } from "./useHistory";

const todos = useLocalStorage<ToDo[]>("todos", []);

function createTodo(text: string): ToDo {
  return {
    id: Date.now(),
    text,
    completed: false,
    editing: false,
  };
}

export function useTodos() {
  const hasCompleted = computed(() => todos.value.some((todo) => todo.completed));

  function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.value.push(createTodo(trimmed));
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }

  function deleteTodo(id: number) {
    todos.value = todos.value.filter((t) => t.id !== id);
  }

  function startEdit(id: number) {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) todo.editing = true;
  }

  function finishEdit(id: number, text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    const todo = todos.value.find((t) => t.id === id);
    if (todo) {
      todo.text = trimmed;
      todo.editing = false;
    }
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
    startEdit,
    finishEdit,
    clearCompleted,
  };
}
