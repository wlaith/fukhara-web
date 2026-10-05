<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploader from '../components/ui/FileUploader.vue'
import { analyzeApk } from '../api/reportApi'
import { useLocalizedNavigation } from '../composables/useLocalizedNavigation'

const { t } = useI18n()
const { push } = useLocalizedNavigation()
const uploadError = ref<string | null>(null)

async function onSelect(file: File) {
  uploadError.value = null
  try {
    const result = await analyzeApk(file)
    push({ name: 'analyzing', params: { id: result.id } })
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : t('homeView.uploadFailed')
  }
}
</script>

<template>
  <main class="flex flex-col">
    <div class="page-shell grid grid-cols-1 border-subtle lg:grid-cols-3">
    <section class="flex flex-col gap-4  py-6 border-subtle p-6 lg:col-span-2">
      <h1 class="font-heading text-display-lg text-primary">{{ t('homeView.heroTitle') }}</h1>
      <p class="font-body text-body text-secondary">
        {{ t('homeView.heroBody') }}
      </p>
      <FileUploader label="" @select="onSelect" />
      <p v-if="uploadError" class="p-4 font-body text-body text-tag-red-border">{{ uploadError }}</p>
    </section></div>
    <section class="page-shell grid grid-cols-1  border-subtle lg:grid-cols-3">
          <div class="border-subtle px-6 py-6">
        <h2 class="mb-2 font-heading text-display-sm text-primary ">{{ t('homeView.transparent.title') }}</h2>
        <p class="font-body text-body text-secondary">
          {{ t('homeView.transparent.body') }}
        </p>
      </div>
      <div class="border-subtle px-6 py-6">
        <h2 class="mb-2 font-heading text-display-sm text-primary">{{ t('homeView.deepAnalysis.title') }}</h2>
        <p class="font-body text-body text-secondary">
          {{ t('homeView.deepAnalysis.body') }}
        </p>
      </div>
      <div class="border-subtle px-6 py-6">
        <h2 class="mb-2 font-heading text-display-sm text-primary">{{ t('homeView.report.title') }}</h2>
        <p class="font-body text-body text-secondary">
          {{ t('homeView.report.body') }}
        </p>
      </div>
    </section>
  </main>
</template>
