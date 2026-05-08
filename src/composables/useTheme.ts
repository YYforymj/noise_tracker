import { ref, computed, watch } from 'vue'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'noise-tracker-theme'

let initialized = false

function resetTheme() {
  initialized = false
  theme.value = 'dark'
}
const theme = ref<Theme>('dark')
const isDark = computed(() => theme.value === 'dark')

function applyTheme(t: Theme) {
  if (t === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }
}

function initTheme() {
  if (initialized) return
  initialized = true
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') {
    theme.value = stored
  } else if (typeof window !== 'undefined' && window.matchMedia) {
    theme.value = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  applyTheme(theme.value)
}

watch(theme, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
  applyTheme(val)
})

export function useTheme() {
  initTheme()
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, isDark, toggleTheme, resetTheme }
}