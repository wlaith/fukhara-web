export function apiConfig(): { baseUrl: string; useMock: boolean } {
  const { public: config } = useRuntimeConfig()
  return { baseUrl: config.apiBaseUrl, useMock: config.useMock }
}
