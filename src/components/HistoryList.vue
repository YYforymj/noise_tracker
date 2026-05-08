<script setup lang="ts">
interface HistorySession {
  id: string
  startTime: number
  avgDb: number
  maxDb: number
  level: 'quiet' | 'moderate' | 'loud' | 'danger'
  levelLabel: string
}

defineProps<{
  sessions: HistorySession[]
  title: string
}>()

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="history-card">
    <div class="section-title">{{ title }}</div>
    <div v-for="session in sessions" :key="session.id" class="history-item">
      <div class="history-left">
        <span class="history-dot" :class="session.level"></span>
        <span class="history-time">{{ formatTime(session.startTime) }}</span>
      </div>
      <span class="history-db">{{ session.avgDb }} dB</span>
      <span class="history-level" :class="session.level">{{ session.levelLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.history-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--fg-secondary);
  margin-bottom: var(--space-md);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
}

.history-item + .history-item {
  border-top: 1px solid var(--border);
}

.history-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.history-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.history-dot.quiet { background: var(--level-quiet); }
.history-dot.moderate { background: var(--level-moderate); }
.history-dot.loud { background: var(--level-loud); }
.history-dot.danger { background: var(--level-danger); }

.history-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-tertiary);
}

.history-db {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
}

.history-level {
  font-size: 12px;
  font-weight: 600;
}

.history-level.quiet { color: var(--level-quiet); }
.history-level.moderate { color: var(--level-moderate); }
.history-level.loud { color: var(--level-loud); }
.history-level.danger { color: var(--level-danger); }
</style>