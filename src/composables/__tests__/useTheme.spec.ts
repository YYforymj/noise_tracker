import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark', 'light')
  })

  it('exposes theme, isDark, and toggleTheme', () => {
    const { theme, isDark, toggleTheme } = useTheme()
    expect(theme.value).toBeTruthy()
    expect(typeof isDark.value).toBe('boolean')
    expect(typeof toggleTheme).toBe('function')
  })

  it('toggleTheme switches between dark and light', async () => {
    const { theme, toggleTheme } = useTheme()
    const before = theme.value
    toggleTheme()
    await nextTick()
    expect(theme.value).toBe(before === 'dark' ? 'light' : 'dark')
  })

  it('toggles .dark and .light classes on document', async () => {
    const { theme, toggleTheme } = useTheme()
    toggleTheme()
    await nextTick()
    if (theme.value === 'dark') {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    } else {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    }
  })

  it('persists theme to localStorage on change', async () => {
    const { theme, toggleTheme } = useTheme()
    const before = theme.value
    toggleTheme()
    await nextTick()
    expect(localStorage.getItem('noise-tracker-theme')).toBe(before === 'dark' ? 'light' : 'dark')
  })
})