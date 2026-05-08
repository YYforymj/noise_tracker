<script setup lang="ts">
defineProps<{
  minDb: number
  avgDb: number
  maxDb: number
  duration: string
  labels: { min: string; avg: string; max: string; duration: string }
  dbUnit: string
  minUnit: string
}>()
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">{{ labels.min }}</div>
      <div class="stat-value">{{ minDb }}<span class="stat-unit">{{ dbUnit }}</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">{{ labels.avg }}</div>
      <div class="stat-value">{{ avgDb }}<span class="stat-unit">{{ dbUnit }}</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">{{ labels.max }}</div>
      <div class="stat-value">{{ maxDb }}<span class="stat-unit">{{ dbUnit }}</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">{{ labels.duration }}</div>
      <div class="stat-value">{{ duration }}<span class="stat-unit">{{ minUnit }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: var(--space-md) var(--space-sm);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--fg-tertiary);
  margin-bottom: 4px;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}

.stat-unit {
  font-size: 11px;
  color: var(--fg-tertiary);
  font-weight: 400;
}
</style>