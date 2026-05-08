<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useTheme } from '../composables/useTheme'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

interface DataPoint {
  time: number
  db: number
}

const props = defineProps<{
  dataPoints: DataPoint[]
  title: string
}>()

const { isDark } = useTheme()

const accentColor = isDark.value ? '#E8A44A' : '#D4942E'
const borderTickColor = isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
const fgTertiary = isDark.value ? '#6B6974' : '#9E9CA5'

const colors = ref({
  accent: accentColor,
  border: borderTickColor,
  fgTertiary: fgTertiary,
})

function updateColors() {
  const style = getComputedStyle(document.documentElement)
  colors.value = {
    accent: style.getPropertyValue('--accent').trim() || accentColor,
    border: style.getPropertyValue('--border').trim() || borderTickColor,
    fgTertiary: style.getPropertyValue('--fg-tertiary').trim() || fgTertiary,
  }
}

onMounted(updateColors)

watch(() => isDark.value, () => {
  updateColors()
})

const chartOption = computed(() => ({
  animation: false,
  grid: {
    top: 8,
    right: 8,
    bottom: 20,
    left: 32,
  },
  xAxis: {
    type: 'category' as const,
    data: props.dataPoints.map(p => {
      const d = new Date(p.time)
      return `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
    }),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      fontSize: 10,
      color: colors.value.fgTertiary,
      fontFamily: 'JetBrains Mono, monospace',
      interval: Math.floor(props.dataPoints.length / 4) || 0,
    },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value' as const,
    min: 0,
    max: 120,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: {
      lineStyle: {
        color: colors.value.border,
      },
    },
  },
  series: [
    {
      type: 'line' as const,
      data: props.dataPoints.map(p => p.db),
      smooth: true,
      showSymbol: false,
      sampling: 'lttb' as const,
      lineStyle: {
        color: colors.value.accent,
        width: 2,
      },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: colors.value.accent },
            { offset: 1, color: 'transparent' },
          ],
        } as unknown as string,
        opacity: 0.15,
      },
    },
  ],
  tooltip: { show: false },
}))
</script>

<template>
  <div class="chart-card">
    <div class="section-title">{{ title }}</div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize style="height: 100px; width: 100%;" />
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--fg-secondary);
  margin-bottom: var(--space-md);
}

.chart-container {
  width: 100%;
  height: 100px;
}
</style>