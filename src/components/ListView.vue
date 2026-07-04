<script setup lang="ts">
import { computed } from "vue";
import TodoItem from "./TodoItem.vue";
import { useTodos } from "../composables/useTodos";
import { bucketDate, compareDates, startOfWeek, today } from "../composables/useDates";

const { todos } = useTodos();

const sortedTodos = computed(() => {
  const weekStart = startOfWeek(today());
  return [...todos.value].sort((a, b) => {
    const bucketA = bucketDate(a.dueDate, a.completed, weekStart);
    const bucketB = bucketDate(b.dueDate, b.completed, weekStart);
    return compareDates(bucketA, bucketB) || a.order - b.order;
  });
});
</script>

<template>
  <ul class="todo-list">
    <TodoItem v-for="todo in sortedTodos" :key="todo.id" :todo="todo" />
  </ul>
  <div v-if="!sortedTodos.length" class="empty-state">No tasks yet. Add one to get started!</div>
</template>
