<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../composables/useI18n'

const { t, raw } = useI18n()

const openFaq = ref<number | null>(null)

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}

function getLevelColor(db: string): string {
  const val = parseInt(db, 10)
  if (val < 50) return 'var(--level-quiet)'
  if (val < 70) return 'var(--level-moderate)'
  if (val < 85) return 'var(--level-loud)'
  return 'var(--level-danger)'
}

const noiseLevels = () => raw<Array<{ db: string; desc: string }>>('seo.noiseLevels')
const faqItems = () => raw<Array<{ q: string; a: string }>>('seo.faqItems')
const howToUseSteps = () => raw<string[]>('seo.howToUseSteps')
const whyMonitorPoints = () => raw<string[]>('seo.whyMonitorPoints')
</script>

<template>
  <section class="seo-content">
    <div class="seo-section">
      <h2 class="seo-heading">{{ t('seo.whatIsTitle') }}</h2>
      <p class="seo-text">{{ t('seo.whatIsDesc') }}</p>
    </div>

    <div class="seo-section">
      <h2 class="seo-heading">{{ t('seo.howToUseTitle') }}</h2>
      <ol class="seo-steps">
        <li v-for="(step, i) in howToUseSteps()" :key="i" class="seo-step">
          <span class="step-number">{{ i + 1 }}</span>
          <span>{{ step }}</span>
        </li>
      </ol>
    </div>

    <div class="seo-section">
      <h2 class="seo-heading">{{ t('seo.noiseLevelsTitle') }}</h2>
      <div class="noise-grid">
        <div
          v-for="(item, i) in noiseLevels()"
          :key="i"
          class="noise-row"
          :style="{ '--row-color': getLevelColor(item.db) }"
        >
          <span class="noise-db">{{ item.db }}</span>
          <span class="noise-desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>

    <div class="seo-section">
      <h2 class="seo-heading">{{ t('seo.whyMonitorTitle') }}</h2>
      <ul class="seo-points">
        <li v-for="(point, i) in whyMonitorPoints()" :key="i" class="seo-point">
          {{ point }}
        </li>
      </ul>
    </div>

    <div class="seo-section">
      <h2 class="seo-heading">{{ t('seo.faqTitle') }}</h2>
      <div class="faq-list">
        <div
          v-for="(item, i) in faqItems()"
          :key="i"
          class="faq-item"
          :class="{ 'faq-item--open': openFaq === i }"
        >
          <button class="faq-question" @click="toggleFaq(i)">
            <span>{{ item.q }}</span>
            <span class="faq-chevron" :class="{ 'faq-chevron--open': openFaq === i }">›</span>
          </button>
          <div v-show="openFaq === i" class="faq-answer">
            <p>{{ item.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.seo-content {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-xl) 0 var(--space-lg);
}

.seo-section {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-card);
}

.seo-heading {
  font-size: 17px;
  font-weight: 700;
  color: var(--fg);
  margin-bottom: var(--space-md);
  letter-spacing: -0.01em;
}

.seo-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--fg-secondary);
}

/* Steps */
.seo-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.seo-step {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: 14px;
  line-height: 1.6;
  color: var(--fg-secondary);
}

.step-number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono);
  margin-top: 1px;
}

/* Noise levels grid */
.noise-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.noise-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-xs);
  background: var(--bg);
  border-left: 3px solid var(--row-color);
  transition: background 0.2s;
}

.noise-row:hover {
  background: var(--bg-elevated);
}

.noise-db {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--row-color);
  min-width: 56px;
}

.noise-desc {
  font-size: 14px;
  color: var(--fg-secondary);
}

/* Points list */
.seo-points {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.seo-point {
  font-size: 14px;
  line-height: 1.6;
  color: var(--fg-secondary);
  padding-left: var(--space-md);
  position: relative;
}

.seo-point::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.faq-item {
  background: var(--bg);
  border-radius: var(--radius-xs);
  overflow: hidden;
  transition: background 0.2s;
}

.faq-item--open {
  background: var(--bg-elevated);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
  text-align: left;
  gap: var(--space-sm);
  min-height: 44px;
}

.faq-question span:first-child {
  flex: 1;
}

.faq-chevron {
  font-size: 18px;
  color: var(--fg-tertiary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.faq-chevron--open {
  transform: rotate(90deg);
}

.faq-answer {
  padding: 0 var(--space-md) var(--space-md);
}

.faq-answer p {
  font-size: 13px;
  line-height: 1.7;
  color: var(--fg-secondary);
}
</style>