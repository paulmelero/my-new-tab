<script setup lang="ts">
defineProps<{ modelValue: "week" | "list" }>();
const emit = defineEmits<{ "update:modelValue": [value: "week" | "list"] }>();
</script>

<template>
  <div class="view-toggle" role="group" aria-label="Switch view">
    <button
      type="button"
      class="view-toggle-button"
      :class="{ active: modelValue === 'week' }"
      :aria-pressed="modelValue === 'week'"
      @click="emit('update:modelValue', 'week')"
    >
      Week
    </button>
    <button
      type="button"
      class="view-toggle-button"
      :class="{ active: modelValue === 'list' }"
      :aria-pressed="modelValue === 'list'"
      @click="emit('update:modelValue', 'list')"
    >
      List
    </button>
  </div>
</template>
