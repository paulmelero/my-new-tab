<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { useTodos } from "../composables/useTodos";
import TodoItem from "./TodoItem.vue";

const { todos } = useTodos();
const listRef = useTemplateRef<HTMLUListElement>("list");

useSortable(listRef, todos, {
  animation: 150,
  chosenClass: "dragging",
  ghostClass: "drag-over",
});
</script>

<template>
  <ul ref="list" class="todo-list">
    <TodoItem v-for="todo in todos" :key="todo.id" :todo="todo" />
  </ul>
  <div v-if="!todos.length" class="empty-state">No tasks yet. Add one to get started!</div>
</template>
