<script setup lang="ts">
import { computed } from "vue";
import type { SortableEvent } from "sortablejs";
import DayColumn from "./DayColumn.vue";
import { useTodos } from "../composables/useTodos";
import { bucketDate, startOfWeek, today, weekDays } from "../composables/useDates";
import type { ToDo } from "../types/types";

const { todos, moveTodo } = useTodos();

const days = computed(() => weekDays(today()));

const todosByDay = computed(() => {
  const weekStart = startOfWeek(today());
  const map = new Map<string, ToDo[]>();
  for (const day of days.value) map.set(day, []);

  for (const todo of todos.value) {
    map.get(bucketDate(todo.dueDate, todo.completed, weekStart))?.push(todo);
  }
  for (const dayTodos of map.values()) {
    dayTodos.sort((a, b) => a.order - b.order);
  }
  return map;
});

function handleDragEnd(event: SortableEvent) {
  const id = Number(event.item.dataset.id);
  const date = event.to.dataset.date;
  if (!date || Number.isNaN(id)) return;

  // Sortable already performed a raw DOM move, which can move a node out of
  // one DayColumn's tracked children and into another's. Revert it so Vue's
  // own re-render (driven by the reactive array below) is the only thing
  // that touches the DOM — otherwise the source column unmounting its item
  // can rip the node back out of the target column it was just dropped into.
  const referenceNode = event.from.children[event.oldIndex ?? 0] ?? null;
  event.from.insertBefore(event.item, referenceNode);

  moveTodo(id, date, event.newIndex ?? 0);
}
</script>

<template>
  <div class="week-grid">
    <DayColumn
      v-for="day in days"
      :key="day"
      :date="day"
      :todos="todosByDay.get(day) ?? []"
      :on-drag-end="handleDragEnd"
    />
  </div>
</template>
