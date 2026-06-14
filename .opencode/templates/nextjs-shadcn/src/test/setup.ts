import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Mock crypto.randomUUID for test environments where it is not fully available
if (typeof window !== 'undefined' && !window.crypto) {
  (window as any).crypto = {};
}
if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
  window.crypto.randomUUID = () => Math.random().toString(36).substring(2, 15);
}
if (typeof global !== 'undefined' && !global.crypto) {
  (global as any).crypto = {
    randomUUID: () => Math.random().toString(36).substring(2, 15),
  };
}

afterEach(() => {
  cleanup()
})
