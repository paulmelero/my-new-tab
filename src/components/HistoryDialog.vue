<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useHistory } from "../composables/useHistory";

const { groupedByDate, hasTasks, refresh, clearAll, clearDay } = useHistory();
const dialogRef = useTemplateRef<HTMLDialogElement>("dialog");

async function open() {
  dialogRef.value?.showModal();
  await refresh();
}

function close() {
  dialogRef.value?.close();
}

function formatDate(date: number) {
  return new Date(date).toLocaleDateString();
}

defineExpose({ open });
</script>

<template>
  <dialog ref="dialog">
    <div class="dialog-header flex">
      <h2>History</h2>
      <div class="dialog-controls flex">
        <button class="clear-all-button" @click="clearAll">Clear All</button>
        <button id="js-close" @click="close">&times; Close</button>
      </div>
    </div>
    <div class="dialog-content">
      <ul class="history-list">
        <li v-if="!hasTasks" class="empty-history">No history available</li>
        <li v-for="(tasks, date) in groupedByDate" :key="date" class="history-date-group">
          <div class="history-date-header">
            <h2>{{ formatDate(Number(date)) }}</h2>
            <button class="clear-day" @click="clearDay(Number(date))">Clear Day</button>
          </div>
          <ul class="history-items">
            <li v-for="task in tasks" :key="task.id" class="history-item">
              <span class="history-text">{{ task.text }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </dialog>
</template>
