import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Mock crypto.randomUUID for test environments where it is not fully available.
// Use `as any` to satisfy the branded template-literal return type
// (`${string}-${string}-${string}-${string}-${string}`) without TS errors.
if (typeof window !== 'undefined' && !window.crypto) {
  ;(window as any).crypto = {}
}
if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
  ;(window as any).crypto.randomUUID = (): `${string}-${string}-${string}-${string}-${string}` =>
    `${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 14)}` as `${string}-${string}-${string}-${string}-${string}`
}
if (typeof globalThis !== 'undefined' && !(globalThis as any).crypto) {
  ;(globalThis as any).crypto = {
    randomUUID: (): `${string}-${string}-${string}-${string}-${string}` =>
      `${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 14)}` as `${string}-${string}-${string}-${string}-${string}`,
  }
}

afterEach(() => {
  cleanup()
})
