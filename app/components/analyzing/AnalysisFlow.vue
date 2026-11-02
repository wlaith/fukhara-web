<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../ui/Icon.vue'
import FlowNode from './FlowNode.vue'
import applicationMobileIcon from '../../assets/icons/application--mobile.svg'
import reportDataIcon from '../../assets/icons/report--data.svg'
import checkmarkFilledIcon from '../../assets/icons/checkmark--filled.svg'

const props = defineProps<{
  tools: { id: string; label: string; done: boolean }[]
  percent: number
  complete: boolean
  sourceLabel: string
  reportLabel: string
  progressLabel: string
}>()

const span = computed(() => ({ gridRow: `1 / span ${props.tools.length}` }))
</script>

<template>
  <div class="flex flex-col gap-2 md:grid md:grid-cols-[auto_3rem_minmax(0,1fr)_3rem_auto] md:gap-0" aria-hidden="true">
    <div class="flex items-center md:col-start-1" :style="span">
      <div class="flex items-center gap-2 border border-strong bg-layer-01 px-4 py-3 font-body text-body font-semibold text-primary">
        <Icon :src="applicationMobileIcon" />
        {{ sourceLabel }}
      </div>
    </div>
    <FlowNode
      v-for="(tool, index) in tools"
      :key="tool.id"
      :label="tool.label"
      :done="tool.done"
      :row="index + 1"
      :first="index === 0"
      :last="index === tools.length - 1"
    />
    <div class="flex items-center md:col-start-5" :style="span">
      <div
        class="flex items-center gap-3 border px-4 py-3 font-body text-body transition-colors duration-[400ms] ease-[cubic-bezier(0.4,0.14,0.3,1)]"
        :class="complete ? 'border-accent bg-accent text-accent-text-on' : 'border-strong bg-layer-01 text-primary'"
      >
        <span class="relative flex size-10 shrink-0 items-center justify-center text-body-lg">
          <svg class="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" :class="complete ? 'stroke-current' : 'stroke-subtle'" stroke-width="2" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              class="stroke-accent transition-[stroke-dasharray] duration-[240ms] ease-[cubic-bezier(0.2,0,0.38,0.9)] motion-reduce:transition-none"
              :class="{ 'opacity-0': complete }"
              stroke-width="2"
              pathLength="100"
              :stroke-dasharray="`${percent} 100`"
            />
          </svg>
          <Icon :src="complete ? checkmarkFilledIcon : reportDataIcon" />
        </span>
        <span class="flex flex-col">
          <span class="font-semibold">{{ reportLabel }}</span>
          <span class="font-body text-caption" :class="complete ? '' : 'text-secondary'">{{ progressLabel }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
