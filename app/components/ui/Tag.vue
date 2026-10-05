<script setup lang="ts">
import { computed } from 'vue'
import type { TagKind } from '../../domain/severity'

const props = withDefaults(defineProps<{ kind: TagKind; size?: 'operational' | 'compact' }>(), {
  size: 'operational',
})

const sizeClasses = computed(() =>
  props.size === 'operational' ? 'rounded-tag-lg px-3 pt-[7px] pb-[5px]' : 'rounded-tag-sm px-2 pt-0.5 pb-0',
)

const kindClasses = computed(() => {
  switch (props.kind) {
    case 'red':
      return 'bg-tag-red-bg border-tag-red-border text-tag-red-text'
    case 'gold':
      return 'bg-tag-gold-bg border-tag-gold-border text-tag-gold-text'
    case 'green':
      return 'bg-tag-green-bg border-tag-green-border text-tag-green-text'
    case 'gray':
    default:
      return 'bg-tag-gray-bg border-tag-gray-border text-tag-gray-text'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center whitespace-nowrap border font-body text-label tracking-label"
    :class="[`tag--${kind}`, `tag--${size}`, sizeClasses, kindClasses]"
  >
    <slot />
  </span>
</template>
