export const ANALYSIS_TOOLS = [
  'mobsf',
  'apk_info',
  'apkid',
  'androcfg',
  'quark_engine',
  'ssdeep',
  'yara',
  'virustotal',
  'malwarebazaar',
] as const

export function withKnownTools(toolsDone: string[]): string[] {
  return [...new Set([...ANALYSIS_TOOLS, ...toolsDone])]
}
