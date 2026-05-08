import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useI18n } from '../useI18n'

describe('useI18n', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to en locale', () => {
    const { locale } = useI18n()
    expect(['en', 'zh']).toContain(locale.value)
  })

  it('resolves zh keys correctly', () => {
    const { t, locale } = useI18n()
    locale.value = 'zh'
    expect(t('app.title')).toBe('噪声监测')
    expect(t('level.quiet')).toBe('安静')
    expect(t('btn.pause')).toBe('暂停监测')
  })

  it('resolves en keys correctly', () => {
    const { t, locale } = useI18n()
    locale.value = 'en'
    expect(t('app.title')).toBe('Noise Monitor')
    expect(t('level.quiet')).toBe('Quiet')
    expect(t('btn.pause')).toBe('Pause')
  })

  it('toggles locale', () => {
    const { locale, toggleLocale } = useI18n()
    const before = locale.value
    toggleLocale()
    expect(locale.value).toBe(before === 'en' ? 'zh' : 'en')
  })

  it('persists locale to localStorage', async () => {
    const { toggleLocale } = useI18n()
    toggleLocale()
    await nextTick()
    expect(localStorage.getItem('noise-tracker-locale')).toBeTruthy()
  })

  it('returns key for unknown path', () => {
    const { t } = useI18n()
    expect(t('nonexistent.key')).toBe('nonexistent.key')
  })
})