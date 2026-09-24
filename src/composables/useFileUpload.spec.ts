import { describe, it, expect } from 'vitest'
import { useFileUpload } from './useFileUpload'
import i18n from '../i18n'

function makeFile(name: string): File {
  return new File(['content'], name)
}

describe('useFileUpload', () => {
  it('accepts a .apk file', () => {
    const { selectedFile, error, selectFile } = useFileUpload()
    selectFile(makeFile('sample.apk'))
    expect(selectedFile.value?.name).toBe('sample.apk')
    expect(error.value).toBeNull()
  })

  it('rejects a non-.apk file with an error and does not select it', () => {
    const { selectedFile, error, selectFile } = useFileUpload()
    selectFile(makeFile('sample.exe'))
    expect(selectedFile.value).toBeNull()
    expect(error.value).toBe('Only .apk files are supported.')
  })

  it('is case-insensitive about the .apk extension', () => {
    const { selectedFile, error, selectFile } = useFileUpload()
    selectFile(makeFile('Sample.APK'))
    expect(selectedFile.value?.name).toBe('Sample.APK')
    expect(error.value).toBeNull()
  })

  it('clearFile resets both selectedFile and error', () => {
    const { selectedFile, error, selectFile, clearFile } = useFileUpload()
    selectFile(makeFile('bad.exe'))
    clearFile()
    expect(selectedFile.value).toBeNull()
    expect(error.value).toBeNull()
  })

  it('rejects a non-.apk file with the Arabic error when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const { error, selectFile } = useFileUpload()
    selectFile(makeFile('sample.exe'))
    expect(error.value).toBe('يُسمح فقط بملفات .apk.')
    i18n.global.locale.value = 'en'
  })
})
