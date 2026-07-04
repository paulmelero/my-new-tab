<script setup lang="ts">
import { onMounted, provide, useTemplateRef } from "vue";
import { useLocalStorage } from "@vueuse/core";
import TodoInput from "./components/TodoInput.vue";
import ViewToggle from "./components/ViewToggle.vue";
import WeekView from "./components/WeekView.vue";
import ListView from "./components/ListView.vue";
import TaskModal from "./components/TaskModal.vue";
import HistoryDialog from "./components/HistoryDialog.vue";
import { useTodos } from "./composables/useTodos";
import { clearOldTasks } from "./composables/useHistory";
import { OpenTaskKey } from "./keys";

const { hasCompleted, clearCompleted } = useTodos();
const historyDialog = useTemplateRef<InstanceType<typeof HistoryDialog>>("historyDialog");
const taskModal = useTemplateRef<InstanceType<typeof TaskModal>>("taskModal");
const viewMode = useLocalStorage<"week" | "list">("viewMode", "week");

provide(OpenTaskKey, (id: number) => taskModal.value?.open(id));

onMounted(() => {
  clearOldTasks();
});
</script>

<template>
  <div class="outter-wrapper">
    <div class="container">
      <div class="view-header flex">
        <ViewToggle v-model="viewMode" />
      </div>
      <TodoInput />
      <WeekView v-if="viewMode === 'week'" />
      <ListView v-else />
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
  <TaskModal ref="taskModal" />
</template>
