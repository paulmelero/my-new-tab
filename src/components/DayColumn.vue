<script setup lang="ts">
import { useTemplateRef } from "vue";
import type { SortableEvent } from "sortablejs";
import TodoItem from "./TodoItem.vue";
import { useSortableGroup } from "../composables/useSortableGroup";
import { formatDayNumber, formatWeekday, isToday } from "../composables/useDates";
import type { ToDo } from "../types/types";

const props = defineProps<{
  date: string;
  todos: ToDo[];
  onDragEnd: (event: SortableEvent) => void;
}>();

const listRef = useTemplateRef<HTMLUListElement>("list");

useSortableGroup(listRef, {
  group: "week-todos",
  handle: ".drag-handle",
  chosenClass: "dragging",
  ghostClass: "drag-over",
  onEnd: (event) => props.onDragEnd(event),
});
</script>

<template>
  <div class="day-column" :class="{ today: isToday(date) }">
    <div class="day-column-header">
      <span class="day-weekday">{{ formatWeekday(date) }}</span>
      <span class="day-number">{{ formatDayNumber(date) }}</span>
    </div>
    <ul ref="list" class="day-column-list" :data-date="date">
      <TodoItem v-for="todo in todos" :key="todo.id" :todo="todo" :data-id="todo.id" />
    </ul>
  </div>
</template>
