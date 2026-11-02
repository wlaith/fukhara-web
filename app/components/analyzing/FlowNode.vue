<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../ui/Icon.vue'
import checkmarkFilledIcon from '../../assets/icons/checkmark--filled.svg'

const props = defineProps<{ label: string; done: boolean; row: number; first: boolean; last: boolean }>()

const placement = computed(() => ({ gridRow: String(props.row) }))
const drawDelay = computed(() => ({ animationDelay: `${props.row * 40}ms` }))
const spine = computed(() => [props.first ? 'top-1/2' : 'top-0', props.last ? 'bottom-1/2' : 'bottom-0'])
</script>

<template>
  <div class="contents">
    <div class="relative hidden md:col-start-2 md:block" :style="placement" aria-hidden="true">
      <span class="absolute start-0 w-px bg-strong" :class="spine" />
      <span class="flow-draw absolute inset-x-0 top-1/2 h-px overflow-hidden bg-strong" :style="drawDelay">
        <span v-if="!done" class="flow-dash absolute inset-y-0 w-1/3 bg-accent motion-reduce:hidden" />
      </span>
    </div>
    <div class="py-1 md:col-start-3" :style="placement">
      <div
        class="flex items-center gap-2 border px-3 py-2 font-body text-body transition-colors duration-[110ms] ease-[cubic-bezier(0.2,0,0.38,0.9)]"
        :class="done ? 'border-subtle bg-layer-02 text-primary' : 'border-subtle bg-layer-01 text-secondary'"
      >
        <Icon v-if="done" :src="checkmarkFilledIcon" class="flow-pop" />
        <svg v-else class="size-[1em] shrink-0 animate-spin motion-reduce:animate-none" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="26 38" />
        </svg>
        <span class="min-w-0 truncate">{{ label }}</span>
      </div>
    </div>
    <div class="relative hidden md:col-start-4 md:block" :style="placement" aria-hidden="true">
      <span class="absolute end-0 w-px bg-subtle" :class="spine" />
      <span class="absolute inset-x-0 top-1/2 h-px bg-subtle">
        <span
          class="absolute inset-0 origin-left bg-secondary transition-transform duration-[240ms] ease-[cubic-bezier(0.2,0,0.38,0.9)] motion-reduce:transition-none rtl:origin-right"
          :class="done ? 'scale-x-100' : 'scale-x-0'"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.flow-draw {
  animation: flow-draw 240ms cubic-bezier(0.2, 0, 0.38, 0.9) both;
  transform-origin: left;
}

:dir(rtl) .flow-draw {
  transform-origin: right;
}

.flow-dash {
  animation: flow-dash 1200ms cubic-bezier(0.4, 0.14, 0.3, 1) infinite;
}

.flow-pop {
  animation: flow-pop 240ms cubic-bezier(0.4, 0.14, 0.3, 1) both;
}

@keyframes flow-draw {
  from {
    transform: scaleX(0);
  }
}

@keyframes flow-dash {
  from {
    inset-inline-start: -33%;
  }
  to {
    inset-inline-start: 100%;
  }
}

@keyframes flow-pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow-draw,
  .flow-pop {
    animation: none;
  }
}
</style>
