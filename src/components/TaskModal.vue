<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useTodos } from "../composables/useTodos";

const { todos, updateTodo, deleteTodo } = useTodos();

const dialogRef = useTemplateRef<HTMLDialogElement>("dialog");
const activeId = ref<number | null>(null);
const text = ref("");
const dueDate = ref("");
const completed = ref(false);

function open(id: number) {
  const todo = todos.value.find((t) => t.id === id);
  if (!todo) return;
  activeId.value = id;
  text.value = todo.text;
  dueDate.value = todo.dueDate;
  completed.value = todo.completed;
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
  activeId.value = null;
}

function save() {
  if (activeId.value === null) return;
  updateTodo(activeId.value, {
    text: text.value,
    dueDate: dueDate.value,
    completed: completed.value,
  });
  close();
}

function remove() {
  if (activeId.value === null) return;
  deleteTodo(activeId.value);
  close();
}

defineExpose({ open });
</script>

<template>
  <dialog ref="dialog" class="task-modal">
    <form class="task-modal-form" @submit.prevent="save">
      <label class="task-modal-field">
        <span>Title</span>
        <input v-model="text" type="text" name="title" required />
      </label>
      <label class="task-modal-field">
        <span>Due date</span>
        <input v-model="dueDate" type="date" name="dueDate" required />
      </label>
      <label class="task-modal-checkbox flex">
        <input v-model="completed" type="checkbox" name="completed" class="todo-checkbox" />
        <span>Completed</span>
      </label>
      <div class="task-modal-actions flex">
        <button type="button" class="delete-button task-modal-delete" @click="remove">
          Delete
        </button>
        <div class="task-modal-actions-right flex">
          <button type="button" @click="close">Cancel</button>
          <button type="submit" class="task-modal-save">Save</button>
        </div>
      </div>
    </form>
  </dialog>
</template>
