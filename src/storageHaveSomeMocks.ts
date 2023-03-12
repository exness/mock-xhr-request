import { MOCK_PREFIX } from './constants'

let haveSomeMocks: boolean | undefined

export const storageHaveSomeMocks = (): boolean => {
  if (haveSomeMocks !== undefined) {
    return haveSomeMocks
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(MOCK_PREFIX)) {
      haveSomeMocks = true
      return haveSomeMocks
    }
  }
  haveSomeMocks = false
  return haveSomeMocks
}
