<script setup lang="ts">
defineProps<{
  dbValue: number
  level: 'quiet' | 'moderate' | 'loud' | 'danger'
  levelLabel: string
}>()
</script>

<template>
  <div class="db-card">
    <div class="db-value-row">
      <span class="db-value">{{ dbValue }}</span>
      <span class="db-unit">dB</span>
    </div>
    <div class="db-label" :class="level">
      <span class="db-label-dot"></span>
      {{ levelLabel }}
    </div>
  </div>
</template>

<style scoped>
.db-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: var(--space-xl) var(--space-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  margin-bottom: var(--space-md);
}

.db-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.db-value {
  font-family: var(--font-mono);
  font-size: 64px;
  font-weight: 600;
  line-height: 1;
  color: var(--fg);
}

.db-unit {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 400;
  color: var(--fg-tertiary);
}

.db-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-sm);
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.db-label.quiet {
  color: var(--level-quiet);
  background: rgba(92, 184, 122, 0.1);
}

.db-label.moderate {
  color: var(--level-moderate);
  background: rgba(232, 164, 74, 0.1);
}

.db-label.loud {
  color: var(--level-loud);
  background: rgba(232, 100, 74, 0.1);
}

.db-label.danger {
  color: var(--level-danger);
  background: rgba(217, 54, 54, 0.1);
}

.db-label-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
</style>