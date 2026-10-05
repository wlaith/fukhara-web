<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import { flaggedIdentifierPairs, categoryLabel, type ApkidFileMatches } from '../../../domain/subVerdicts'
import ContainedList from '../../ui/ContainedList.vue'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!

onMounted(() => {
  report.fingerprints.load()
})

const checksums = computed(() => report.fingerprints.data.value?.checksums)

// identifiers.apkid.files nests the match array one level deeper, at .files.files.
const apkidFiles = computed(() => {
  const files = report.fingerprints.data.value?.identifiers?.apkid?.files as
    | { files?: (ApkidFileMatches & { filename?: string })[] }
    | undefined
  return files?.files ?? []
})

const identifierTags = computed(() => {
  // Unlike the summary card, this detail view renders every flagged pair, uncapped.
  return flaggedIdentifierPairs(apkidFiles.value).map((pair) => {
    const [category, value] = pair.split(':')
    return { label: `${categoryLabel(category ?? '', t)}: ${value}` }
  })
})

const fuzzyHashes = computed(() => {
  const raw = report.fingerprints.data.value?.fuzzy_hashes as
    | { ssdeep?: { filename?: string | null; fuzzy_hash?: string | null }[] | null }
    | undefined
  return raw?.ssdeep ?? []
})
</script>

<template>
  <div>
    <p v-if="report.fingerprints.error.value" class="section-error p-4 font-body text-body text-tag-red-border">
      {{ report.fingerprints.error.value }}
    </p>
    <ContainedList :title="t('fingerprints.fingerprintsTitle')" :rows="fuzzyHashes.map((hash, index) => ({ id: hash.filename ?? index.toString(), title: hash.filename ?? t('fingerprints.unknownFilename'), meta: hash.fuzzy_hash ?? t('fingerprints.noFuzzyHash') }))" />
    <ContainedList :title="t('fingerprints.identifiersTitle')" :rows="identifierTags.map((tag, index) => ({ id: index.toString(), title: tag.label, meta: '' }))" />
    <ContainedList :title="t('fingerprints.checksumsTitle')" :rows="checksums ? [{ id: 'checksums', title: t('fingerprints.checksumsSummary', { md5: checksums.md5, sha1: checksums.sha1, sha256: checksums.sha256, size: checksums.size }), meta: '' }] : []" />
  </div>
</template>
