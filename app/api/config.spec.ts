import { describe, it, expect } from 'vitest'
import { apiConfig } from './config'

describe('apiConfig', () => {
  it('defaults to mock data and an empty base URL', () => {
    expect(apiConfig()).toEqual({ baseUrl: '', useMock: true })
  })
})
