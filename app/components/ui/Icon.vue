<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ src: string }>()

const style = computed(() => ({ mask: `url("${props.src}") center / contain no-repeat` }))
</script>

<template>
  <span class="inline-block size-[1em] shrink-0 bg-current" :style="style" aria-hidden="true" />
</template>
