import { ref } from 'vue'
import i18n from '../i18n'

export function useFileUpload() {
  const selectedFile = ref<File | null>(null)
  const error = ref<string | null>(null)

  function selectFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.apk')) {
      selectedFile.value = null
       error.value = i18n.global.t('fileUpload.invalidType')
      return
    }
    selectedFile.value = file
    error.value = null
  }

  function clearFile() {
    selectedFile.value = null
    error.value = null
  }

  return { selectedFile, error, selectFile, clearFile }
}
