<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ title: string; rows: { id: string; title: string; meta: string }[] }>()
defineEmits<{ 'select-row': [id: string] }>()

const { t } = useI18n()
</script>

<template>
  <div class="w-full bg-canvas border-subtle ">
    <div class="contained-list__header px-4 py-[15px] font-body text-body font-semibold tracking-tight text-primary bg-layer-01 border-y border-subtle">
      {{ title }}
    </div>
    <p v-if="rows.length === 0" class="p-4 font-body text-body text-secondary ">{{ t('containedList.noFindings') }}</p>
    <button
      v-for="row in rows"
      :key="row.id"
      type="button"
      class="contained-list__row border-subtle grid w-full grid-cols-1 items-start gap-2 bg-transparent px-4 py-4 text-start font-body text-body tracking-tight text-primary cursor-pointer sm:grid-cols-2 sm:items-center sm:justify-between sm:gap-4"
      @click="$emit('select-row', row.id)"
    >
      <span class="break-words">{{ row.title }}</span>
      <span class="break-all text-secondary">{{ row.meta }}</span>
    </button>
  </div>
</template>
