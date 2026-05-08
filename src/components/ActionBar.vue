<script setup lang="ts">
defineProps<{
  isPaused: boolean
  isMonitoring: boolean
  pauseLabel: string
  resumeLabel: string
  startLabel: string
  stopLabel: string
}>()

const emit = defineEmits<{
  toggle: []
  stop: []
}>()
</script>

<template>
  <div class="action-bar">
    <button
      v-if="isMonitoring && isPaused"
      class="btn-pause paused"
      @click="emit('toggle')"
    >
      {{ resumeLabel }}
    </button>
    <button
      v-else-if="isMonitoring"
      class="btn-pause active"
      @click="emit('toggle')"
    >
      {{ pauseLabel }}
    </button>
    <button
      v-else
      class="btn-pause idle"
      @click="emit('toggle')"
    >
      {{ startLabel }}
    </button>
    <button
      v-if="isMonitoring"
      class="btn-stop"
      @click="emit('stop')"
    >
      {{ stopLabel }}
    </button>
  </div>
</template>

<style scoped>
.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: var(--space-md) var(--space-md) var(--space-xl);
  padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, var(--bg) 70%, transparent);
  z-index: 100;
  display: flex;
  gap: var(--space-sm);
}

.btn-pause {
  flex: 1;
  padding: 16px;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 700;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  min-height: 48px;
}

.btn-pause:hover { opacity: 0.9; }
.btn-pause:active { transform: scale(0.98); }

.btn-pause.paused {
  background: var(--accent);
  color: var(--bg);
  border: none;
}

.btn-stop {
  padding: 16px 24px;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 700;
  background: var(--bg-card);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  min-height: 48px;
  min-width: 44px;
}

.btn-stop:hover { opacity: 0.9; }
.btn-stop:active { transform: scale(0.98); }
</style>