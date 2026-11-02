<script setup lang="ts">
import { nextTick, onBeforeUnmount, shallowRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import Tag from '../ui/Tag.vue'
import Icon from '../ui/Icon.vue'
import LinkButton from '../ui/LinkButton.vue'
import { useRecentReports, type RecentReport } from '../../composables/useRecentReports'
import { verdictSeverityKind } from '../../domain/severity'
import { formatTimestamp } from '../../domain/format'
import checkmarkFilledIcon from '../../assets/icons/checkmark--filled.svg'

const UNDO_TIMEOUT_MS = 8000

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { reports, clear, restore } = useRecentReports()
const cleared = shallowRef<RecentReport[] | null>(null)
const clearButton = useTemplateRef<{ $el: HTMLElement }>('clearButton')
const undoButton = useTemplateRef<{ $el: HTMLElement }>('undoButton')
let undoTimer: ReturnType<typeof setTimeout> | undefined

async function onClear() {
  cleared.value = reports.value
  clear()
  clearTimeout(undoTimer)
  undoTimer = setTimeout(() => (cleared.value = null), UNDO_TIMEOUT_MS)
  await nextTick()
  undoButton.value?.$el.focus()
}

async function onUndo() {
  if (!cleared.value) return
  restore(cleared.value)
  cleared.value = null
  clearTimeout(undoTimer)
  await nextTick()
  clearButton.value?.$el.focus()
}

onBeforeUnmount(() => clearTimeout(undoTimer))
</script>

<template>
  <div class="page-shell flex flex-col">
    <section v-if="reports.length" class="flex flex-col border-subtle">
      <div class="flex items-center justify-between gap-4 border-subtle bg-layer-01 px-6 py-4">
        <h2 class="font-heading text-display-sm text-primary">{{ t('recentReports.title') }}</h2>
        <LinkButton ref="clearButton" class="recent-reports__clear" @click="onClear">{{ t('recentReports.clear') }}</LinkButton>
      </div>
      <ul class="m-0 list-none p-0">
        <li v-for="report in reports" :key="report.id" class="border-subtle">
          <NuxtLink
            :to="localePath({ name: 'report', params: { id: report.id } })"
            class="flex flex-wrap items-center gap-4 px-6 py-4 font-body text-body text-primary no-underline hover:bg-subtle-hover/40 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            <bdi dir="auto" class="min-w-0 flex-1 truncate font-semibold">{{ report.appName }}</bdi>
            <Tag v-if="report.verdict" :kind="verdictSeverityKind(report.severity)" size="compact">{{ report.verdict }}</Tag>
            <span class="font-body text-caption text-helper">{{ formatTimestamp(new Date(report.viewedAt).toISOString(), locale) }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
    <div role="status">
      <div v-if="cleared" class="flex flex-wrap items-center justify-between gap-4 border-subtle bg-layer-01 px-6 py-4 font-body text-body text-primary">
        <span class="flex items-center gap-2">
          <Icon :src="checkmarkFilledIcon" />
          {{ t('recentReports.cleared') }}
        </span>
        <LinkButton ref="undoButton" class="recent-reports__undo" @click="onUndo">{{ t('recentReports.undo') }}</LinkButton>
      </div>
    </div>
  </div>
</template>
