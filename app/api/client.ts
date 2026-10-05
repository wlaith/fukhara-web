import { apiConfig } from './config'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const { baseUrl } = apiConfig()
  const response = await fetch(`${baseUrl}${path}`)
  if (!response.ok) {
    throw new ApiError(response.status, `GET ${path} failed with ${response.status}`)
  }
  return (await response.json()) as T
}

export async function apiPostFile<T>(path: string, file: File): Promise<T> {
  const { baseUrl } = apiConfig()
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${baseUrl}${path}`, { method: 'POST', body: formData })
  if (!response.ok) {
    throw new ApiError(response.status, `POST ${path} failed with ${response.status}`)
  }
  return (await response.json()) as T
}
