<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";
import type { ToDo } from "../types/types";
import { useTodos } from "../composables/useTodos";

const props = defineProps<{ todo: ToDo }>();

const { toggleTodo, deleteTodo, startEdit, finishEdit } = useTodos();

const editText = ref(props.todo.text);
const editInput = useTemplateRef<HTMLInputElement>("editInput");

function beginEdit() {
  editText.value = props.todo.text;
  startEdit(props.todo.id);
  nextTick(() => {
    editInput.value?.focus();
    editInput.value?.select();
  });
}

let savedByEnter = false;

function saveOnEnter() {
  savedByEnter = true;
  finishEdit(props.todo.id, editText.value);
}

function saveOnBlur() {
  if (savedByEnter) {
    savedByEnter = false;
    return;
  }
  finishEdit(props.todo.id, editText.value);
}
</script>

<template>
  <li class="todo-item flex" :class="{ completed: todo.completed }" @dblclick="beginEdit">
    <span class="drag-handle">⋮⋮</span>
    <input
      type="checkbox"
      class="todo-checkbox"
      :checked="todo.completed"
      @change="toggleTodo(todo.id)"
    />
    <input
      v-if="todo.editing"
      ref="editInput"
      v-model="editText"
      class="edit-input"
      type="text"
      @keypress.enter="saveOnEnter"
      @blur="saveOnBlur"
    />
    <span v-else class="todo-text" :class="{ completed: todo.completed }">{{ todo.text }}</span>
    <button class="delete-button" @click="deleteTodo(todo.id)">×</button>
  </li>
</template>
