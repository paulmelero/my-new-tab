<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import TodoInput from "./components/TodoInput.vue";
import TodoList from "./components/TodoList.vue";
import HistoryDialog from "./components/HistoryDialog.vue";
import { useTodos } from "./composables/useTodos";
import { clearOldTasks } from "./composables/useHistory";

const { hasCompleted, clearCompleted } = useTodos();
const historyDialog = useTemplateRef<InstanceType<typeof HistoryDialog>>("historyDialog");

onMounted(() => {
  clearOldTasks();
});
</script>

<template>
  <div class="outter-wrapper">
    <div class="container">
      <TodoInput />
      <TodoList />
      <button v-if="hasCompleted" class="clear-completed-button" @click="clearCompleted">
        Clear Completed
      </button>
    </div>

    <footer class="footer flex">
      <div class="history-link">
        <button @click="historyDialog?.open()">History</button>
      </div>
    </footer>
  </div>
  <HistoryDialog ref="historyDialog" />
</template>
