<script setup lang="ts">
defineProps<{ items: { id: string; label: string }[]; activeId: string }>()
defineEmits<{ select: [id: string] }>()
</script>

<template>
  <div class="flex gap-px overflow-x-auto">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="tabs__item shrink-0 whitespace-nowrap border-none border-b-2 border-subtle-hover bg-transparent px-4 py-3 cursor-pointer font-body text-body tracking-tight text-secondary"
      :class="{ 'tabs__item--active border-b-accent text-primary font-semibold': item.id === activeId }"
      @click="$emit('select', item.id)"
    >
      {{ item.label }}
    </button>
  </div>
</template>
