<script setup lang="ts">
import { inject } from "vue";
import type { ToDo } from "../types/types";
import { useTodos } from "../composables/useTodos";
import { isOverdue } from "../composables/useDates";
import { OpenTaskKey } from "../keys";

const props = defineProps<{ todo: ToDo }>();

const { toggleTodo, deleteTodo } = useTodos();
const openTask = inject(OpenTaskKey);
</script>

<template>
  <li
    class="todo-item flex"
    :class="{ completed: todo.completed, overdue: isOverdue(todo.dueDate, todo.completed) }"
    @click="openTask?.(todo.id)"
  >
    <span class="drag-handle">⋮⋮</span>
    <input
      type="checkbox"
      class="todo-checkbox"
      :checked="todo.completed"
      @click.stop
      @change="toggleTodo(todo.id)"
    />
    <span class="todo-text" :class="{ completed: todo.completed }">{{ todo.text }}</span>
    <button class="delete-button" @click.stop="deleteTodo(todo.id)">×</button>
  </li>
</template>
