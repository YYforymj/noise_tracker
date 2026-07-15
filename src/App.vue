<script setup lang="ts">
import { computed, defineAsyncComponent, ref, onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import { useI18n } from './composables/useI18n'
import { useNoiseDetector } from './composables/useNoiseDetector'
import { useNoiseStorage } from './composables/useNoiseStorage'
import DbCard from './components/DbCard.vue'
import StatsGrid from './components/StatsGrid.vue'
import HistoryList from './components/HistoryList.vue'
import ActionBar from './components/ActionBar.vue'
import SeoContent from './components/SeoContent.vue'

const { isDark, toggleTheme } = useTheme()
const { t, alternateHref } = useI18n()
const {
  currentDb, currentLevel, isMonitoring, isPaused,
  minDb, maxDb, avgDb, sessionDuration, errorMessage,
  startMonitoring, stopMonitoring, pauseMonitoring, resumeMonitoring,
} = useNoiseDetector()
const {
  startSession, endSession, saveReading, getRecentSessions,
} = useNoiseStorage()

const TrendChart = defineAsyncComponent(() => import('./components/TrendChart.vue'))

const statsLabels = computed(() => ({
  min: t('stat.min'),
  avg: t('stat.avg'),
  max: t('stat.max'),
  duration: t('stat.duration'),
}))

const durationStr = computed(() => {
  const d = sessionDuration.value
  const mins = Math.floor(d / 60)
  const secs = d % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const displayMinDb = computed(() => minDb.value === Infinity ? 0 : Math.round(minDb.value))
const displayMaxDb = computed(() => maxDb.value === -Infinity ? 0 : Math.round(maxDb.value))
const displayAvgDb = computed(() => avgDb.value === 0 ? 0 : Math.round(avgDb.value))

const dataPoints = ref<{ time: number; db: number }[]>([])
const historySessions = ref<Array<{
  id: string
  startTime: number
  avgDb: number
  maxDb: number
  level: 'quiet' | 'moderate' | 'loud' | 'danger'
  levelLabel: string
}>>([])

let currentSessionId: string | null = null
let readingInterval: ReturnType<typeof setInterval> | null = null

const levelLabel = computed(() => t(`level.${currentLevel.value}`))

function classifyLevel(db: number): 'quiet' | 'moderate' | 'loud' | 'danger' {
  if (db < 50) return 'quiet'
  if (db < 70) return 'moderate'
  if (db < 85) return 'loud'
  return 'danger'
}

async function handleToggle() {
  if (!isMonitoring.value) {
    try {
      await startMonitoring()
      currentSessionId = startSession()
      dataPoints.value = []

      readingInterval = setInterval(() => {
        if (!isPaused.value && isMonitoring.value) {
          const dp = { time: Date.now(), db: currentDb.value }
          dataPoints.value = [...dataPoints.value.slice(-119), dp]
          if (currentSessionId) {
            saveReading(currentSessionId, dp.time, dp.db)
          }
        }
      }, 1000)
    } catch (err) {
      console.error('Failed to start monitoring:', err)
    }
  } else if (isPaused.value) {
    resumeMonitoring()
  } else {
    pauseMonitoring()
  }
}

function handleStop() {
  if (currentSessionId) {
    endSession(currentSessionId, {
      avgDb: displayAvgDb.value,
      maxDb: displayMaxDb.value,
      minDb: displayMinDb.value,
      duration: sessionDuration.value,
    })
    currentSessionId = null
  }
  if (readingInterval) {
    clearInterval(readingInterval)
    readingInterval = null
  }
  stopMonitoring()
  refreshHistory()
}

async function refreshHistory() {
  try {
    const sessions = await getRecentSessions(20)
    historySessions.value = sessions.map(s => ({
      ...s,
      level: classifyLevel(s.avgDb),
      levelLabel: '',
    }))
    historySessions.value.forEach((s, i) => {
      historySessions.value[i].levelLabel = t(`level.${s.level}`)
    })
  } catch {
    // ignore
  }
}

onMounted(() => {
  refreshHistory()
})
</script>

<template>
  <header class="header">
    <h1>{{ t('app.title') }}</h1>
    <div class="header-actions">
      <a class="lang-toggle" :href="alternateHref">
        {{ t('lang.toggle') }}
      </a>
      <button class="theme-toggle" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
  </header>

  <div v-if="errorMessage" class="error-message">
    {{ errorMessage === 'micDenied' ? t('error.micDenied') : errorMessage === 'micNotFound' ? t('error.micNotFound') : errorMessage === 'micSecure' ? t('error.micSecure') : errorMessage }}
  </div>

  <DbCard
    v-if="isMonitoring"
    :dbValue="currentDb"
    :level="currentLevel"
    :levelLabel="levelLabel"
  />
  <DbCard
    v-else
    :dbValue="0"
    level="quiet"
    :levelLabel="t('btn.start')"
  />

  <StatsGrid
    v-if="isMonitoring"
    :minDb="displayMinDb"
    :avgDb="displayAvgDb"
    :maxDb="displayMaxDb"
    :duration="durationStr"
    :labels="statsLabels"
    dbUnit=" dB"
    minUnit=" min"
  />
  <StatsGrid
    v-else
    :minDb="0"
    :avgDb="0"
    :maxDb="0"
    duration="0:00"
    :labels="statsLabels"
    dbUnit=" dB"
    minUnit=" min"
  />

  <TrendChart
    v-if="isMonitoring && dataPoints.length > 0"
    :dataPoints="dataPoints"
    :title="t('section.trend')"
  />

  <HistoryList
    v-if="historySessions.length > 0"
    :sessions="historySessions"
    :title="t('section.history')"
  />

  <ActionBar
    :isPaused="isPaused"
    :isMonitoring="isMonitoring"
    :pauseLabel="t('btn.pause')"
    :resumeLabel="t('btn.resume')"
    :startLabel="t('btn.start')"
    stopLabel="■"
    @toggle="handleToggle"
    @stop="handleStop"
  />

  <SeoContent />
</template>

<style>
.error-message {
  background: var(--level-danger);
  color: #fff;
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-md);
  font-size: 13px;
  font-weight: 600;
}
</style>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.header h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--fg);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.lang-toggle {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--fg-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  min-height: 36px;
  min-width: auto;
}

.lang-toggle:hover {
  background: var(--bg-elevated);
  border-color: var(--fg-tertiary);
}

.theme-toggle {
  font-size: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  min-height: 36px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--bg-elevated);
  border-color: var(--fg-tertiary);
}
</style>
