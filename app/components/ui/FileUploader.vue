<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFileUpload } from '../../composables/useFileUpload'
import { formatFileSize } from '../../domain/format'
import Icon from './Icon.vue'
import closeIcon from '../../assets/icons/close.svg'
import checkmarkFilledIcon from '../../assets/icons/checkmark--filled.svg'

defineProps<{ label?: string }>()
const emit = defineEmits<{ select: [file: File]; clear: [] }>()

const { t, locale } = useI18n()
const { selectedFile, error, selectFile, clearFile } = useFileUpload(t)
const isDragging = ref(false)
const fileSize = computed(() => (selectedFile.value ? formatFileSize(selectedFile.value.size, locale.value) : ''))

watch(selectedFile, (file) => {
  if (file) emit('select', file)
  else emit('clear')
})

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) selectFile(file)
  input.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) selectFile(file)
}
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <p v-if="label" class="font-body text-body-md font-medium text-primary">{{ label }}</p>
    <label
      class="file-uploader__dropzone relative block cursor-pointer border border-dashed border-strong px-4 py-5 font-body text-body text-accent focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-accent"
      :class="{ 'file-uploader__dropzone--dragging border-accent bg-layer-01': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input type="file" accept=".apk" class="sr-only" @change="onInputChange" >
      {{ t('fileUpload.dropPrompt') }}
    </label>
    <p v-if="error" class="font-body text-label text-tag-red-border">{{ error }}</p>
    <div v-if="selectedFile" class="flex h-12 items-center gap-4 bg-panel px-4 font-body text-body tracking-tight text-primary">
      <Icon :src="checkmarkFilledIcon" />
      <span class="min-w-0 flex-1 truncate">{{ selectedFile.name }}</span>
      <span class="shrink-0 font-body text-label tracking-label text-helper">{{ fileSize }}</span>
      <button
        type="button"
        :aria-label="t('fileUpload.remove', { name: selectedFile.name })"
        class="file-uploader__remove flex shrink-0 cursor-pointer items-center justify-center border-none bg-layer-01 p-0"
        @click="clearFile"
      >
        <img :src="closeIcon" alt="" width="20" height="20" >
      </button>
    </div>
  </div>
</template>
