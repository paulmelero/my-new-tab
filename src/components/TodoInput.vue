<script setup lang="ts">
import { ref } from "vue";
import { useTodos } from "../composables/useTodos";

const { addTodo } = useTodos();
const text = ref("");

function submit() {
  if (!text.value.trim()) return;
  addTodo(text.value);
  text.value = "";
}
</script>

<template>
  <div class="todo-input-container flex">
    <input
      id="todoInput"
      v-model="text"
      type="text"
      class="todo-input"
      placeholder="Add a new task..."
      @keypress.enter="submit"
    />
    <button class="add-button" @click="submit">Add</button>
  </div>
</template>
