import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useI18n } from '../useI18n'
import { locale } from '../useI18n'

describe('useI18n', () => {
  beforeEach(() => {
    localStorage.clear()
    locale.value = 'en'
    window.history.replaceState({}, '', '/')
  })

  it('uses English as the only locale', () => {
    const { locale } = useI18n()
    expect(locale.value).toBe('en')
  })

  it('resolves en keys correctly', () => {
    const { t, locale } = useI18n()
    locale.value = 'en'
    expect(t('app.title')).toBe('Noise Monitor Online')
    expect(t('level.quiet')).toBe('Quiet')
    expect(t('btn.pause')).toBe('Pause')
  })

  it('persists locale to localStorage', async () => {
    const { locale } = useI18n()
    locale.value = 'en'
    await nextTick()
    expect(localStorage.getItem('noise-tracker-locale')).toBe('en')
  })

  it('returns key for unknown path', () => {
    const { t } = useI18n()
    expect(t('nonexistent.key')).toBe('nonexistent.key')
  })
})
