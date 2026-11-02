<script setup lang="ts">
import { computed } from 'vue'
import Tag from '../ui/Tag.vue'
import type { SubVerdict } from '../../domain/subVerdicts'

const props = defineProps<{ label: string; subVerdict: SubVerdict }>()
defineEmits<{ select: [] }>()

const HEADLINE_TEXT = {
  red: 'text-tag-red-text',
  gold: 'text-tag-gold-text',
  green: 'text-tag-green-text',
  gray: 'text-primary',
} as const

const headlineClass = computed(() => HEADLINE_TEXT[props.subVerdict.headlineKind ?? 'gray'])
</script>

<template>
  <button
    type="button"
    class="sub-verdict-card flex cursor-pointer flex-col gap-3 border-subtle bg-layer-01 p-5 text-start transition-colors duration-[110ms] hover:bg-subtle-hover/40 focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
    @click="$emit('select')"
  >
    <span class="font-body text-eyebrow font-semibold text-primary">{{ label }}</span>
    <span class="font-heading text-display-md font-[350] tracking-label" :class="headlineClass">
      {{ subVerdict.headline }}
    </span>
    <span v-if="subVerdict.tags.length > 0" class="flex flex-wrap gap-2">
      <Tag v-for="tag in subVerdict.tags" :key="tag.label" :kind="tag.kind" size="compact">
        {{ tag.label }}
      </Tag>
    </span>
  </button>
</template>
