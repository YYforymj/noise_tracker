# Noise Tracker — 噪声检测网站

## TL;DR

> **Quick Summary**: 基于 Vue 3 + Vite + TypeScript 构建移动端优先的噪声检测网站，使用 Web Audio API 实时采集麦克风分贝数据，IndexedDB 持久化存储，ECharts 趋势图表，支持深色/浅色主题和中英双语。
> 
> **Deliverables**:
> - 完整的噪声检测 Web 应用（可部署为静态站点）
> - 深色/浅色主题切换
> - 中英双语切换
> - 实时分贝显示 + 噪音等级指示
> - 趋势折线图 + 历史记录列表
> - 完整的 Vitest 单元测试覆盖
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: T1 → T4 → T5-T8 → T9 → T10 → T11

---

## Context

### Original Request
开发一个噪声检测网站，可以利用手机或电脑的麦克风，实时收集环境噪音的分贝，然后记录下来每个时间对应的噪音。网站要求移动端优先，PC端可用即可，简洁一些。

### Interview Summary
**Key Discussions**:
- **技术栈**: 用户选择 Vue 3 + Vite，不用 UI 组件库，纯 CSS
- **图表库**: ECharts（丰富交互，移动端适配好）
- **数据存储**: IndexedDB via Dexie.js（浏览器本地，无需后端）
- **设计方向**: 经过3轮 mockup 迭代，选定"Warm Slate"暖灰风格
- **语言**: 中英双语（i18n toggle）
- **交互**: 持续监测 + 手动暂停
- **测试**: TDD + Vitest

**Research Findings**:
- Web Audio API: 使用 `getFloatTimeDomainData` 计算 RMS → dBFS，必须禁用浏览器音频处理
- iOS Safari: getUserMedia 必须在用户手势中调用，AudioContext 需 resume，静音开关需特殊处理
- ECharts: 必须用 `shallowRef` + `markRaw`，`manual-update` 模式，`sampling: 'lttb'`
- Dexie.js: `bulkPut()` 批量写入，`liveQuery` 响应式读取

### Metis Review
**Identified Gaps** (addressed):
- **主题切换 UI**: mockup 中缺少深色/浅色切换按钮 → 在 header 语言切换旁添加主题图标按钮
- **dBFS 显示范围**: 负数 dBFS 对用户不友好 → 映射为 0-120 相对范围，显示为"相对噪音等级"
- **历史记录定义**: 每个 entry = 一次监测会话（开始→暂停），而非逐秒快照
- **趋势图时间窗口**: 默认 60 秒，每秒 1 个数据点
- **IndexedDB 自动清理**: 超过 30 天的 readings 自动清除，session 元数据永久保留

---

## Work Objectives

### Core Objective
构建一个移动端优先的噪声检测 Web 应用，使用麦克风实时测量环境噪音等级并以分贝值显示，同时记录历史数据和趋势。

### Concrete Deliverables
- `/home/yu/saas-web/noise_tracker/` — 完整的 Vue 3 + Vite + TypeScript 项目
- `src/composables/useTheme.ts` — 深色/浅色主题切换
- `src/composables/useI18n.ts` — 中英双语切换
- `src/composables/useNoiseDetector.ts` — 麦克风音频采集 + dBFS 计算
- `src/composables/useNoiseStorage.ts` — IndexedDB 持久化
- `src/components/DbCard.vue` — 分贝数值显示卡片
- `src/components/StatsGrid.vue` — 最低/平均/最高/时长统计
- `src/components/TrendChart.vue` — ECharts 趋势折线图
- `src/components/HistoryList.vue` — 历史记录列表
- `src/components/ActionBar.vue` — 暂停/继续按钮
- `src/App.vue` — 主页面整合
- 完整的 Vitest 测试套件

### Definition of Done
- [ ] `npm run build` 成功，产物小于 500KB gzipped
- [ ] `npm run test` 全部通过
- [ ] 浏览器打开 → 点击开始 → 麦克风实时采集 → 分贝数值实时更新
- [ ] 深色/浅色主题切换正常，刷新后保持选择
- [ ] 中英语言切换正常，刷新后保持选择
- [ ] 趋势图实时滚动更新
- [ ] 历史记录正确保存和显示
- [ ] iOS Safari 基本可用（AudioContext resume, getUserMedia 权限）

### Must Have
- 实时 dBFS 数值显示（映射到 0-120 相对范围）
- 噪音等级色标指示（安静🟢/适中🟡/嘈杂🟠/危险🔴）
- 最低/平均/最高/时长统计
- ECharts 60秒滚动趋势图
- 历史会话记录列表
- 暂停/继续控制
- 深色/浅色主题切换
- 中英双语切换
- IndexedDB 数据持久化（30天自动清理）
- iOS Safari 兼容性处理
- Warm Slate 设计风格（参考 mockup）
- 移动端优先响应式布局
- 44px 最小触摸目标
- FOUC 预防（主题闪烁）
- 指数平滑（attack 0.1 / release 0.05）

### Must NOT Have (Guardrails)
- ❌ 后端服务器 / 用户认证 / 跨设备同步
- ❌ 音频录制或存储（仅 dBFS 数值）
- ❌ 校准 SPL 值（仅相对测量）
- ❌ 推送通知 / 声音提醒
- ❌ 数据导出（CSV/JSON）
- ❌ 麦克风设备选择 UI
- ❌ PWA / Service Worker
- ❌ vue-i18n（太重，用简单 composable）
- ❌ UI 组件库（纯 CSS）
- ❌ `ref()` 或 `reactive()` 包裹 ECharts 实例
- ❌ `frequencyBinCount` 作为时域数据缓冲区大小
- ❌ `{ exact: false }` getUserMedia 约束
- ❌ ScriptProcessorNode（已废弃）
- ❌ AudioWorklet（过度设计，AnalyserNode 足够）
- ❌ 每帧写入 IndexedDB

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (new project)
- **Automated tests**: YES (TDD)
- **Framework**: Vitest (Vue 3 + Vite native)
- **If TDD**: Each task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux)
- **API/Backend**: Use Bash (curl)
- **Composable/Logic**: Use Vitest — mock Web Audio API, test pure functions

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - foundation + scaffolding):
├── T1: Project scaffolding + config [quick]
├── T2: Theme system (useTheme + CSS vars) [quick]
├── T3: i18n system (useI18n + locale files) [quick]
└── T4: Audio capture composable (useNoiseDetector) [deep]

Wave 2 (After Wave 1 - UI components, MAX PARALLEL):
├── T5: dB display card (DbCard) [quick]
├── T6: Stats grid (StatsGrid) [quick]
├── T7: Trend chart (TrendChart) [unspecified-high]
├── T8: History list (HistoryList) [quick]
└── T9: IndexedDB storage (useNoiseStorage) [deep]

Wave 3 (After Wave 2 - integration + polish):
├── T10: Action bar + full App integration [deep]
└── T11: iOS compatibility layer + edge cases [deep]

Wave FINAL (After ALL tasks):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)

Critical Path: T1 → T4 → T9 → T10 → T11 → F1-F4
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 5 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T2, T3, T4 |
| T2 | T1 | T10 |
| T3 | T1 | T10 |
| T4 | T1 | T5, T6, T7, T8, T9, T10 |
| T5 | T4 | T10 |
| T6 | T4 | T10 |
| T7 | T4 | T10 |
| T8 | T9 | T10 |
| T9 | T4 | T8, T10 |
| T10 | T2, T3, T4, T5, T6, T7, T8, T9 | T11 |
| T11 | T10 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1→`quick`, T2→`quick`, T3→`quick`, T4→`deep`
- **Wave 2**: 5 tasks — T5→`quick`, T6→`quick`, T7→`unspecified-high`, T8→`quick`, T9→`deep`
- **Wave 3**: 2 tasks — T10→`deep`, T11→`deep`
- **FINAL**: 4 tasks — F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [ ] 1. Project scaffolding + config

  **What to do**:
  - Run `npm create vite@latest . -- --template vue-ts` in `/home/yu/saas-web/noise_tracker/` to scaffold Vue 3 + TypeScript project
  - Install dependencies: `npm install dexie echarts vue-echarts`
  - Install dev dependencies: `npm install -D vitest @vue/test-utils jsdom @vitest/coverage-v8 fake-indexeddb`
  - Configure `vitest.config.ts` with `environment: 'jsdom'`
  - Create `src/styles/theme.css` with all CSS custom properties from mockups (both dark and light themes)
  - Create `src/styles/base.css` with CSS reset and base typography (Nunito + JetBrains Mono fonts via Google Fonts with `font-display: swap`)
  - Add FOUC prevention `<script>` in `index.html` `<head>`: read `localStorage` theme/locale, set `<html>` class before first paint
  - Add `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">` for notched phones
  - Create empty composable/component directories: `src/composables/`, `src/components/`, `src/locales/`
  - Add `env.d.ts` with Web Audio API type declarations if needed
  - Delete default Vite template content (HelloWorld.vue, etc.)

  **Must NOT do**:
  - Do NOT install vue-i18n
  - Do NOT install any UI component library (Vuetify, Element Plus, etc.)
  - Do NOT add ScriptProcessorNode types
  - Do NOT add AudioWorklet types

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation task, blocks all others)
  - **Parallel Group**: Wave 1
  - **Blocks**: T2, T3, T4
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html` — Dark theme CSS variables (lines 11-41): `--bg`, `--bg-card`, `--fg`, `--accent`, `--level-*`, `--radius-*`, `--space-*`, `--shadow-*`
  - `/home/yu/saas-web/noise_tracker/mockups/v2-light-zh.html` — Light theme CSS variables (lines 11-41): Same variable names, different values (cream bg, white cards, darker accent)

  **API/Type References**:
  - Vite vue-ts template: `https://vite.dev/guide/#scaffolding-your-first-vite-project`
  - Dexie.js API: `https://dexie.org/docs/API`

  **WHY Each Reference Matters**:
  - Dark mockup CSS variables → exact color tokens for the dark theme CSS custom properties
  - Light mockup CSS variables → exact color tokens for the light theme CSS custom properties
  - The FOUC script must read from localStorage keys that useTheme/useI18n will later write to

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/__tests__/setup.test.ts
  - [ ] `npm run test` → PASS (1 test, confirms vitest setup works)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Project builds successfully
    Tool: Bash
    Preconditions: All dependencies installed
    Steps:
      1. Run `npm run build` in /home/yu/saas-web/noise_tracker/
      2. Check exit code is 0
      3. Verify dist/ directory exists and contains index.html
    Expected Result: Build succeeds without errors
    Failure Indicators: Exit code non-zero, missing dist/index.html
    Evidence: .sisyphus/evidence/task-1-build-success.txt

  Scenario: CSS variables are defined for both themes
    Tool: Bash
    Preconditions: theme.css exists
    Steps:
      1. Grep src/styles/theme.css for `--bg:` — must find both dark (#1E1F26) and light (#F4F1EB) values
      2. Grep for `--accent:` — must find both dark (#E8A44A) and light (#D4942E) values
      3. Grep for `--level-quiet:` — must exist in both themes
    Expected Result: All CSS custom properties from mockups are present
    Failure Indicators: Missing variables, wrong color values
    Evidence: .sisyphus/evidence/task-1-css-variables.txt

  Scenario: FOUC prevention script exists
    Tool: Bash
    Preconditions: index.html exists
    Steps:
      1. Read index.html
      2. Verify a `<script>` block exists in `<head>` before any CSS `<link>`
      3. Verify it reads from localStorage for theme
    Expected Result: FOUC prevention script present in head before stylesheets
    Failure Indicators: No script in head, or script after CSS links
    Evidence: .sisyphus/evidence/task-1-fouc-prevention.txt
  ```

  **Commit**: YES
  - Message: `chore: scaffold Vue 3 + Vite + TypeScript project`
  - Files: `package.json, vite.config.ts, tsconfig.json, index.html, src/styles/theme.css, src/styles/base.css, vitest.config.ts, env.d.ts`
  - Pre-commit: `npm run build && npm run test`

- [ ] 2. Theme system (useTheme + CSS vars)

  **What to do**:
  - Create `src/composables/useTheme.ts`
  - Implement theme logic: read from `localStorage` key `noise-tracker-theme`, fallback to `prefers-color-scheme` media query, default to `dark`
  - Toggle between `'dark'` and `'light'` by adding/removing `.dark` class on `<html>` element
  - Expose: `theme` (ref), `isDark` (computed), `toggleTheme()` (function)
  - Persist theme choice to `localStorage` on change
  - Write tests BEFORE implementation (TDD):
    - Test: default theme follows `prefers-color-scheme`
    - Test: `toggleTheme()` switches dark → light and light → dark
    - Test: theme persists after `localStorage` write
    - Test: `.dark` class is correctly toggled on `document.documentElement`

  **Must NOT do**:
  - Do NOT use a third-party theme library
  - Do NOT use `ref()` or `reactive()` for ECharts instances
  - Do NOT add theme toggle inside a settings modal

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T3, T4)
  - **Parallel Group**: Wave 1
  - **Blocks**: T10
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:64-69` — Header with language toggle button, theme toggle goes next to it
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:11-41` — CSS variables for both themes

  **WHY Each Reference Matters**:
  - Header mockup shows where the toggle UI goes — a small button next to the language toggle
  - CSS variables from mockups define the exact color token values for each theme

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/composables/__tests__/useTheme.spec.ts
  - [ ] `npm run test -- src/composables/__tests__/useTheme.spec.ts` → PASS (4 tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Theme toggle switches CSS variables
    Tool: Bash
    Preconditions: T1 and T2 completed, dev server running
    Steps:
      1. Import useTheme in a test component
      2. Call toggleTheme() to switch from dark to light
      3. Assert document.documentElement.classList.contains('dark') === false
      4. Call toggleTheme() again to switch back to dark
      5. Assert document.documentElement.classList.contains('dark') === true
    Expected Result: .dark class toggles correctly
    Failure Indicators: Class not toggled, wrong class name
    Evidence: .sisyphus/evidence/task-2-theme-toggle.txt

  Scenario: Theme persists across reload
    Tool: Bash
    Preconditions: Theme set to 'light'
    Steps:
      1. Set localStorage.setItem('noise-tracker-theme', 'light')
      2. Initialize useTheme composable
      3. Assert theme.value === 'light'
      4. Assert isDark.value === false
    Expected Result: Theme correctly restored from localStorage
    Failure Indicators: Theme defaults to dark despite localStorage value
    Evidence: .sisyphus/evidence/task-2-theme-persist.txt
  ```

  **Commit**: YES
  - Message: `feat: add theme composable and CSS variable system`
  - Files: `src/composables/useTheme.ts, src/composables/__tests__/useTheme.spec.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 3. i18n system (useI18n + locale files)

  **What to do**:
  - Create `src/locales/zh.ts` with Chinese translations as `as const` object
  - Create `src/locales/en.ts` with English translations as `as const` object
  - Create `src/composables/useI18n.ts`
  - Read locale from `localStorage` key `noise-tracker-locale`, fallback to `navigator.language` starting with `'zh'`, default to `'en'`
  - Expose: `locale` (ref), `t` (function that resolves nested keys like `t('level.quiet')`), `toggleLocale()` (function)
  - Persist locale choice to `localStorage` on change
  - Write tests BEFORE implementation (TDD):
    - Test: default locale follows `navigator.language`
    - Test: `t('app.title')` returns correct string for each locale
    - Test: `toggleLocale()` switches zh → en and en → zh
    - Test: locale persists after `localStorage` write

  **Must NOT do**:
  - Do NOT use vue-i18n (overkill for 2 languages)
  - Do NOT add any UI for locale switching (that's T10's job)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T4)
  - **Parallel Group**: Wave 1
  - **Blocks**: T10
  - **Blocked By**: T1

  **References**:

  **API/Type References**:
  - i18n string catalog from Metis review: `app.title`, `level.quiet/moderate/loud/danger`, `stat.min/avg/max/duration`, `section.trend/history`, `btn.pause/resume`, `unit.db/min`, `lang.toggle`

  **WHY Each Reference Matters**:
  - The i18n catalog has exact zh-CN and en strings that must be present in the locale files

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/composables/__tests__/useI18n.spec.ts
  - [ ] `npm run test -- src/composables/__tests__/useI18n.spec.ts` → PASS (4 tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All i18n keys resolve correctly
    Tool: Bash
    Preconditions: T3 completed
    Steps:
      1. Set locale to 'zh'
      2. Assert t('app.title') === '噪声监测'
      3. Assert t('level.quiet') === '安静'
      4. Assert t('btn.pause') === '暂停监测'
      5. Set locale to 'en'
      6. Assert t('app.title') === 'Noise Monitor'
      7. Assert t('level.quiet') === 'Quiet'
      8. Assert t('btn.pause') === 'Pause'
    Expected Result: All keys resolve to correct translations
    Failure Indicators: Missing keys, wrong translations
    Evidence: .sisyphus/evidence/task-3-i18n-keys.txt

  Scenario: Locale persistence
    Tool: Bash
    Preconditions: T3 completed
    Steps:
      1. Set localStorage.setItem('noise-tracker-locale', 'en')
      2. Initialize useI18n
      3. Assert locale.value === 'en'
      4. Call toggleLocale()
      5. Assert locale.value === 'zh'
      6. Assert localStorage.getItem('noise-tracker-locale') === 'zh'
    Expected Result: Locale persists and toggles correctly
    Failure Indicators: Locale not persisted, toggle doesn't work
    Evidence: .sisyphus/evidence/task-3-locale-persist.txt
  ```

  **Commit**: YES
  - Message: `feat: add i18n composable and locale files`
  - Files: `src/composables/useI18n.ts, src/locales/zh.ts, src/locales/en.ts, src/composables/__tests__/useI18n.spec.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 4. Audio capture composable (useNoiseDetector)

  **What to do**:
  - Create `src/composables/useNoiseDetector.ts`
  - Implement the core audio pipeline:
    1. `startMonitoring()`: Request microphone via `navigator.mediaDevices.getUserMedia()` with 3-tier fallback (raw constraints → partial constraints → basic `{ audio: true }`)
    2. Create `AudioContext`, call `.resume()` synchronously within user gesture handler
    3. Set `navigator.audioSession.type = 'play-and-record'` if available (iOS 16.4+)
    4. Create `MediaStreamSource` → `AnalyserNode` (fftSize: 2048, smoothingTimeConstant: 0.3, minDecibels: -100, maxDecibels: -10)
    5. requestAnimationFrame loop: call `getFloatTimeDomainData(buffer)` where `buffer = new Float32Array(analyser.fftSize)` (NOT frequencyBinCount)
    6. Calculate RMS: `Math.sqrt(sum / buffer.length)` where `sum = Σ sample²`
    7. Calculate dBFS: `20 * Math.log10(Math.max(rms, 1e-10))` — guard against -Infinity
    8. Apply exponential smoothing: attack coefficient 0.1 (rising), release coefficient 0.05 (falling)
    9. Map dBFS to 0-120 relative scale: `relative = Math.max(0, Math.min(120, dBFS + 120))`
    10. Determine noise level: 0-50 quiet, 50-70 moderate, 70-85 loud, 85+ danger
  - `stopMonitoring()`: Cancel rAF, close AudioContext, stop all MediaStream tracks
  - `pauseMonitoring()` / `resumeMonitoring()`: Toggle rAF loop without re-requesting mic
  - Handle `document.visibilitychange`: pause monitoring when hidden, resume when visible
  - Handle `AudioContext.statechange` event: auto-resume from `"suspended"` and `"interrupted"` states
  - Expose reactive state: `currentDb`, `currentLevel`, `isMonitoring`, `isPaused`, `minDb`, `maxDb`, `avgDb`, `sessionDuration`
  - Write tests BEFORE implementation (TDD):
    - Test: `computeDBFS()` with known inputs (silence → -Infinity guard, full scale → 0, half amplitude → ~-6)
    - Test: exponential smoothing logic (attack vs release)
    - Test: level classification (0-50 → quiet, 50-70 → moderate, etc.)
    - Test: dBFS-to-relative mapping (dBFS=-120 → relative=0, dBFS=0 → relative=120)
    - Test: getUserMedia 3-tier fallback with OverconstrainedError mock
    - Test: visibilitychange pause/resume

  **Must NOT do**:
  - Do NOT use `frequencyBinCount` as buffer length for time-domain data
  - Do NOT use `{ exact: false }` in constraints (use simple boolean `false`)
  - Do NOT use ScriptProcessorNode (deprecated)
  - Do NOT use AudioWorklet (overkill)
  - Do NOT use `ref()` or `reactive()` for ECharts
  - Do NOT write to IndexedDB in this composable

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T3)
  - **Parallel Group**: Wave 1
  - **Blocks**: T5, T6, T7, T8, T9, T10
  - **Blocked By**: T1

  **References**:

  **API/Type References**:
  - Web Audio API AnalyserNode: `https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode`
  - MDN getUserMedia: `https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia`
  - Dexie.js API: `https://dexie.org/docs/API`

  **Test References**:
  - Mock AudioContext and AnalyserNode with `vi.stubGlobal` and factory functions
  - Use `fake-indexeddb/auto` for Dexie testing

  **WHY Each Reference Matters**:
  - AnalyserNode docs → correct API usage for getFloatTimeDomainData
  - getUserMedia docs → constraint format and error handling
  - The test references explain how to mock Web Audio API without real microphone hardware

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/composables/__tests__/useNoiseDetector.spec.ts
  - [ ] `npm run test -- src/composables/__tests__/useNoiseDetector.spec.ts` → PASS (6+ tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: dBFS calculation is correct for known inputs
    Tool: Bash (vitest)
    Preconditions: T4 completed
    Steps:
      1. Run tests for computeDBFS function
      2. Test with silence (all zeros) → returns floor value -100
      3. Test with full scale (all 1.0) → returns 0
      4. Test with half amplitude (all 0.5) → returns approximately -6
    Expected Result: All dBFS calculations match expected values within tolerance
    Failure Indicators: Wrong values, -Infinity returned, NaN
    Evidence: .sisyphus/evidence/task-4-dbfs-calc.txt

  Scenario: OverconstrainedError fallback works
    Tool: Bash (vitest)
    Preconditions: T4 completed
    Steps:
      1. Mock getUserMedia to throw OverconstrainedError for raw constraints
      2. Mock getUserMedia to succeed for partial constraints
      3. Call startMonitoring()
      4. Assert AudioContext and AnalyserNode are created with partial constraints
    Expected Result: Falls back gracefully from raw → partial → basic constraints
    Failure Indicators: Unhandled promise rejection, no AudioContext created
    Evidence: .sisyphus/evidence/task-4-fallback.txt

  Scenario: Exponential smoothing works correctly
    Tool: Bash (vitest)
    Preconditions: T4 completed
    Steps:
      1. Test attack: when new value > previous, apply alpha=0.1
      2. Test release: when new value < previous, apply alpha=0.05
      3. Verify smoothed value approaches new value faster in attack than release
    Expected Result: Smoothing coefficients applied correctly
    Failure Indicators: Wrong alpha values, no smoothing effect
    Evidence: .sisyphus/evidence/task-4-smoothing.txt
  ```

  **Commit**: YES
  - Message: `feat: add audio capture composable (useNoiseDetector)`
  - Files: `src/composables/useNoiseDetector.ts, src/composables/__tests__/useNoiseDetector.spec.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 5. dB display card component (DbCard)

  **What to do**:
  - Create `src/components/DbCard.vue`
  - Display current dB value as large number (64px font, JetBrains Mono) + "dB" unit label
  - Display noise level badge with colored dot + label (安静/适中/嘈杂/危险)
  - Badge colors: quiet=#5CB87A(green), moderate=#E8A44A(amber), loud=#E8644A(orange), danger=#D93636(red)
  - Badge background: same color at 10% opacity (`rgba(X,Y,Z,0.1)`)
  - Accept props: `dbValue` (number), `level` ('quiet'|'moderate'|'loud'|'danger'), `levelLabel` (string from i18n)
  - Style the card as a rounded card with `--bg-card` background, `--radius` border-radius, `--shadow-card` box-shadow
  - Use `--font-mono` for the dB number, `--font-sans` for the level label
  - Write tests:
    - Test: renders correct dB value
    - Test: applies correct level class based on level prop
    - Test: displays correct level label text

  **Must NOT do**:
  - Do NOT hardcode color values — use CSS variables from theme
  - Do NOT add any animation or transition to the dB number (real-time updates are enough)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T6, T7, T8)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: T4

  **References**:

  **Pattern References**:
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:95-140` — DbCard structure: `.db-card > .db-value-row(.db-value + .db-unit) + .db-label(.db-label-dot + text)`
  - `/home/yu/saas-web/noise_tracker/mockups/v2-light-zh.html` — Same structure with light theme colors

  **WHY Each Reference Matters**:
  - The mockup shows exact HTML structure, font sizes, spacing, and color treatment for the dB display card

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/components/__tests__/DbCard.spec.ts
  - [ ] `npm run test -- src/components/__tests__/DbCard.spec.ts` → PASS (3 tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: DbCard renders with correct dB value and level
    Tool: Bash (vitest)
    Preconditions: T5 completed
    Steps:
      1. Mount DbCard with props: { dbValue: 42, level: 'quiet', levelLabel: '安静' }
      2. Assert text content includes '42'
      3. Assert element has class '.db-label' with '.quiet' modifier
      4. Assert text content includes '安静'
    Expected Result: Correct value and level displayed
    Failure Indicators: Wrong value, missing class, wrong label
    Evidence: .sisyphus/evidence/task-5-dbcard-render.txt

  Scenario: DbCard applies theme-specific styles
    Tool: Bash (vitest)
    Preconditions: T5 completed, dark theme active
    Steps:
      1. Mount DbCard with dark theme (.dark class on html)
      2. Check that the card background uses --bg-card CSS variable
      3. Switch to light theme
      4. Verify CSS variable values change
    Expected Result: Card respects theme CSS variables
    Failure Indicators: Hardcoded colors instead of CSS variables
    Evidence: .sisyphus/evidence/task-5-dbcard-theme.txt
  ```

  **Commit**: YES
  - Message: `feat: add dB display card component (DbCard)`
  - Files: `src/components/DbCard.vue, src/components/__tests__/DbCard.spec.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 6. Stats grid component (StatsGrid)

  **What to do**:
  - Create `src/components/StatsGrid.vue`
  - Display 4 stat cards in a grid: Min/Avg/Max/Duration (最低/平均/最高/时长)
  - Each card: `--bg-card` background, `--radius-sm` border-radius, `--shadow-card` box-shadow
  - Label text (11px, `--fg-tertiary`, font-weight 600) + value (18px, `--font-mono`, `--fg`) + unit (11px, `--fg-tertiary`)
  - Grid: `repeat(4, 1fr)` with `--space-sm` gap
  - Accept props: `minDb` (number), `avgDb` (number), `maxDb` (number), `duration` (string like "5:23"), and i18n strings
  - Write tests:
    - Test: renders all 4 stat cards with correct values
    - Test: updates when props change

  **Must NOT do**:
  - Do NOT hardcode layout values — use CSS variables from theme
  - Do NOT add any animation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T7, T8)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: T4

  **References**:

  **Pattern References**:
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:148-181` — StatsGrid structure: `.stats-grid > .stat-card > .stat-label + .stat-value(.stat-unit)`

  **WHY Each Reference Matters**:
  - The mockup shows exact grid layout, card sizing, and typography for the stats row

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/components/__tests__/StatsGrid.spec.ts
  - [ ] `npm run test -- src/components/__tests__/StatsGrid.spec.ts` → PASS (2 tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: StatsGrid renders all 4 stat cards correctly
    Tool: Bash (vitest)
    Preconditions: T6 completed
    Steps:
      1. Mount StatsGrid with props: { minDb: 28, avgDb: 39, maxDb: 58, duration: '12', durationUnit: ' min', labels: {min:'最低',avg:'平均',max:'最高',duration:'时长'} }
      2. Find all .stat-card elements — assert 4 exist
      3. Assert first card shows '28 dB', second shows '39 dB', etc.
    Expected Result: 4 cards with correct values and labels
    Failure Indicators: Missing cards, wrong values
    Evidence: .sisyphus/evidence/task-6-statsgrid-render.txt
  ```

  **Commit**: YES
  - Message: `feat: add stats grid component (StatsGrid)`
  - Files: `src/components/StatsGrid.vue, src/components/__tests__/StatsGrid.spec.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 7. Trend chart component (TrendChart)

  **What to do**:
  - Create `src/components/TrendChart.vue`
  - Integrate ECharts using `vue-echarts` with `manual-update` prop for performance
  - Use `shallowRef` + `markRaw` for ECharts instance — NEVER `ref()` or `reactive()`
  - Tree-shake ECharts imports: import only `LineChart`, `GridComponent`, `DataZoomComponent`, etc. from `echarts/core`
  - Configure chart options:
    - Series type: `line`, `sampling: 'lttb'`, `animation: false`, `showSymbol: false`
    - Line color: `var(--accent)` (use computed from current theme)
    - Area fill: gradient from `--accent` at 15% opacity to transparent
    - Y-axis: 0-120 dB range, hidden axis line, light grid lines
    - X-axis: time labels, hidden axis line
    - Rolling 60-second window
    - Endpoint indicator: a circle at the latest data point with a pulsing ring (CSS animation)
  - Accept props: `dataPoints` (array of `{time: number, db: number}`)
  - Style the card with `--bg-card` background and `--radius` border-radius
  - Use section title from i18n (`section.trend`)
  - Write tests:
    - Test: chart renders without errors when shallowRef is used
    - Test: chart updates when dataPoints prop changes
    - Test: `manual-update` prop is set to true

  **Must NOT do**:
  - Do NOT use `ref()` or `reactive()` for ECharts instance
  - Do NOT use `appendData` API (only works with scatter/lines/GL series)
  - Do NOT set `animation: true` on real-time data series
  - Do NOT import full ECharts bundle — use tree-shaken imports from `echarts/core`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T8)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: T4

  **References**:

  **Pattern References**:
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:182-206` — Chart card structure and SVG line style
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:346-367` — SVG chart line and area fill gradient

  **API/Type References**:
  - vue-echarts: `https://github.com/nicefangy/vue-echarts` — `manual-update` prop for streaming data
  - ECharts LTTB sampling: `https://echarts.apache.org/en/option.html#series-line.sampling`

  **WHY Each Reference Matters**:
  - The mockup SVG shows the exact visual style: accent-colored line, gradient area fill, endpoint indicator with pulsing ring
  - vue-echarts manual-update → prevents Vue from deep-watching the entire option object on every frame
  - LTTB sampling → preserves peaks/valleys when down-sampling for performance

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/components/__tests__/TrendChart.spec.ts
  - [ ] `npm run test -- src/components/__tests__/TrendChart.spec.ts` → PASS (3 tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Chart renders with mock data
    Tool: Bash (vitest)
    Preconditions: T7 completed
    Steps:
      1. Mount TrendChart with props: { dataPoints: [{time: Date.now()-5000, db: 42}, {time: Date.now(), db: 45}] }
      2. Assert no console errors
      3. Assert chart container element exists
      4. Verify ECharts instance is created (not null)
    Expected Result: Chart renders without errors
    Failure Indicators: Console errors, null ECharts instance
    Evidence: .sisyphus/evidence/task-7-chart-render.txt

  Scenario: Chart uses shallowRef for ECharts instance
    Tool: Bash (grep)
    Preconditions: T7 completed
    Steps:
      1. Search TrendChart.vue source for `shallowRef`
      2. Search for `markRaw`
      3. Confirm NO `ref(` or `reactive(` wrapping ECharts instances
    Expected Result: shallowRef and markRaw are used, no ref()/reactive() for ECharts
    Failure Indicators: Found `ref(` or `reactive(` wrapping ECharts
    Evidence: .sisyphus/evidence/task-7-echarts-ref.txt
  ```

  **Commit**: YES
  - Message: `feat: add trend chart component (TrendChart)`
  - Files: `src/components/TrendChart.vue, src/components/__tests__/TrendChart.spec.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 8. History list component (HistoryList)

  **What to do**:
  - Create `src/components/HistoryList.vue`
  - Display a list of past monitoring sessions with: colored dot, time, dB value, and level label
  - Each history item: `.history-item > .history-left(.history-dot + .history-time) + .history-db + .history-level`
  - Level dots: quiet=#5CB87A, moderate=#E8A44A, loud=#E8644A, danger=#D93636 (dark), adjusted for light theme
  - Section title from i18n (`section.history`)
  - Accept props: `sessions` (array of `{id, startTime, avgDb, maxDb, level, levelLabel}`)
  - Sort by most recent first
  - Write tests:
    - Test: renders correct number of items
    - Test: applies correct level dot colors
    - Test: renders in reverse chronological order

  **Must NOT do**:
  - Do NOT fetch from IndexedDB in this component (that's T9's job via composable)
  - Do NOT add pagination or virtual scrolling

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T7)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: T9

  **References**:

  **Pattern References**:
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:207-264` — HistoryList structure: `.history-card > .section-title + .history-item > .history-left(.history-dot + .history-time) + .history-db + .history-level`

  **WHY Each Reference Matters**:
  - The mockup shows exact HTML structure, dot styling, typography for each history item

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/components/__tests__/HistoryList.spec.ts
  - [ ] `npm run test -- src/components/__tests__/HistoryList.spec.ts` → PASS (3 tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: HistoryList renders sessions correctly
    Tool: Bash (vitest)
    Preconditions: T8 completed
    Steps:
      1. Mount HistoryList with mock sessions array (3 items with different levels)
      2. Assert 3 .history-item elements exist
      3. Assert items are in reverse chronological order (most recent first)
      4. Assert each item has correct level dot class (.quiet, .moderate, etc.)
    Expected Result: 3 items rendered in correct order with correct level classes
    Failure Indicators: Wrong order, wrong classes, items not rendered
    Evidence: .sisyphus/evidence/task-8-historylist-render.txt
  ```

  **Commit**: YES
  - Message: `feat: add history list component (HistoryList)`
  - Files: `src/components/HistoryList.vue, src/components/__tests__/HistoryList.spec.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 9. IndexedDB persistence layer (useNoiseStorage)

  **What to do**:
  - Create `src/composables/useNoiseStorage.ts`
  - Define Dexie.js database schema:
    ```
    sessions table: id (string, primary), startTime (number), endTime (number), avgDb (number), maxDb (number), minDb (number), duration (number)
    readings table: id (string, primary), sessionId (string, indexed), timestamp (number, indexed), db (number)
    ```
  - Index: `sessions.startTime`, `readings.sessionId`, `readings.timestamp`, `readings[sessionId+timestamp]`
  - Create a `useNoiseStorage` composable that exposes:
    - `saveReading(sessionId, timestamp, db)` — buffers in memory, flushes via `bulkPut` every 1 second
    - `startSession()` — creates a new session record
    - `endSession(sessionId)` — updates session endTime and stats
    - `getRecentSessions(limit)` — returns last N sessions sorted by startTime desc
    - `getRecentReadings(sessionId, limit)` — returns last N readings for a session
    - `autoPurge()` — removes readings older than 30 days, keeps session metadata
  - Use `fake-indexeddb/auto` for testing (Dexie automatically uses it in Node environment)
  - Write tests BEFORE implementation (TDD):
    - Test: create and retrieve a session
    - Test: bulk-put readings and verify they persist
    - Test: getRecentSessions returns sessions in reverse chronological order
    - Test: auto-purge removes readings older than 30 days
    - Test: auto-purge keeps session metadata even when readings are deleted

  **Must NOT do**:
  - Do NOT use `db.add()` for individual readings in hot path — use buffered `bulkPut()`
  - Do NOT use `liveQuery` yet (that's for reactivity, will be wired in T10)
  - Do NOT use `ref()` or `reactive()` to store Dexie db instance

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T7)
  - **Parallel Group**: Wave 2
  - **Blocks**: T8, T10
  - **Blocked By**: T4

  **References**:

  **API/Type References**:
  - Dexie.js: `https://dexie.org/docs/API` — `bulkPut()`, `where().above()` for time range queries
  - fake-indexeddb: `https://github.com/nolanlawson/fake-indexeddb` — `import 'fake-indexeddb/auto'` for testing

  **WHY Each Reference Matters**:
  - Dexie's `bulkPut()` is critical for performance — individual `add()` calls on every frame would kill IndexedDB
  - fake-indexeddb allows testing Dexie in Node without a real browser

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/composables/__tests__/useNoiseStorage.spec.ts
  - [ ] `npm run test -- src/composables/__tests__/useNoiseStorage.spec.ts` → PASS (5 tests, 0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Session CRUD operations work correctly
    Tool: Bash (vitest)
    Preconditions: T9 completed
    Steps:
      1. Call startSession() and verify it returns a session ID
      2. Call endSession(id) with stats and verify session is updated
      3. Call getRecentSessions(10) and verify the session appears
    Expected Result: Session created, updated, and retrieved correctly
    Failure Indicators: Session not found, wrong stats
    Evidence: .sisyphus/evidence/task-9-session-crud.txt

  Scenario: Auto-purge removes old readings but keeps session metadata
    Tool: Bash (vitest)
    Preconditions: T9 completed
    Steps:
      1. Create a session and add readings with timestamps 31 days ago
      2. Call autoPurge()
      3. Verify readings older than 30 days are deleted
      4. Verify session metadata still exists
    Expected Result: Old readings deleted, session metadata preserved
    Failure Indicators: Readings not deleted, or session also deleted
    Evidence: .sisyphus/evidence/task-9-auto-purge.txt

  Scenario: Bulk write performance is acceptable
    Tool: Bash (vitest)
    Preconditions: T9 completed
    Steps:
      1. Buffer 60 readings (1 second of data at 1fps)
      2. Call bulkPut and verify all 60 readings are stored
      3. Verify this completes in < 100ms
    Expected Result: 60 readings stored in < 100ms
    Failure Indicators: Timeout, incomplete data
    Evidence: .sisyphus/evidence/task-9-bulk-write.txt
  ```

  **Commit**: YES
  - Message: `feat: add IndexedDB persistence layer (useNoiseStorage)`
  - Files: `src/composables/useNoiseStorage.ts, src/composables/__tests__/useNoiseStorage.spec.ts, src/db.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 10. Action bar + full App integration

  **What to do**:
  - Create `src/components/ActionBar.vue`
  - Fixed bottom bar with gradient fade from `--bg` (transparent-to-bg gradient)
  - Single pause/resume button: `--accent` background when active (暂停监测 / Pause), `--bg-card` background with `--border` when paused (继续监测 / Resume)
  - Button: `border-radius: var(--radius)`, `padding: 16px`, `font-weight: 700`
  - Accept props: `isPaused` (boolean), `onToggle` (function)
  - Handle iOS user gesture requirement: the button's click handler must synchronously call `audioContext.resume()` before any async operations
  - Create `src/App.vue` — wire up all composables and components:
    - Header: app title (i18n) + language toggle + theme toggle (🌙/☀️ icon button)
    - DbCard: receives `currentDb`, `currentLevel`, `levelLabel` from useNoiseDetector
    - StatsGrid: receives `minDb`, `avgDb`, `maxDb`, `duration` from useNoiseDetector
    - TrendChart: receives `dataPoints` from useNoiseStorage recent readings
    - HistoryList: receives `sessions` from useNoiseStorage
    - ActionBar: receives `isPaused` and toggle function
  - Mobile-first responsive layout: `max-width: 480px`, `margin: 0 auto`, `padding: var(--space-lg) var(--space-md) 120px`
  - Safe area insets: `padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom))` for fixed action bar
  - Write integration tests:
    - Test: clicking pause button toggles monitoring state
    - Test: switching theme applies `.dark` class
    - Test: switching locale changes displayed text

  **Must NOT do**:
  - Do NOT add a settings modal or panel — theme and language toggles live in the header
  - Do NOT add data export functionality
  - Do NOT add microphone device selection UI

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T2, T3, T4, T5, T6, T7, T8, T9)
  - **Parallel Group**: Wave 3
  - **Blocks**: T11
  - **Blocked By**: T2, T3, T4, T5, T6, T7, T8, T9

  **References**:

  **Pattern References**:
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:64-69` — Header structure
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:266-303` — ActionBar structure and styles
  - `/home/yu/saas-web/noise_tracker/mockups/v2-dark-zh.html:307-418` — Full app layout structure

  **WHY Each Reference Matters**:
  - The mockup shows the exact layout structure, spacing, and component order that App.vue must follow
  - The ActionBar mockup shows the exact button styling and fixed positioning

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/components/__tests__/ActionBar.spec.ts
  - [ ] Test file created: src/__tests__/App.spec.ts
  - [ ] `npm run test` → ALL tests pass

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full app renders all components
    Tool: Playwright
    Preconditions: T10 completed, dev server running
    Steps:
      1. Navigate to http://localhost:5173
      2. Click the start/monitoring button (requires user gesture for mic)
      3. If prompted, allow microphone permission
      4. Assert the page contains: dB value display, stats grid (4 items), trend chart, history section, action bar
    Expected Result: All components render on the page
    Failure Indicators: Missing component, blank section
    Evidence: .sisyphus/evidence/task-10-full-app.png

  Scenario: Theme toggle switches between dark and light
    Tool: Playwright
    Preconditions: T10 completed
    Steps:
      1. Navigate to http://localhost:5173
      2. Find theme toggle button (🌙/☀️)
      3. Click it
      4. Assert document.documentElement.classList changes (add/remove .dark)
      5. Assert CSS variable --bg changes color
      6. Take screenshot of both themes
    Expected Result: Theme toggles and CSS variables change
    Failure Indicators: Class doesn't toggle, colors don't change
    Evidence: .sisyphus/evidence/task-10-theme-toggle-dark.png, .sisyphus/evidence/task-10-theme-toggle-light.png

  Scenario: Language toggle switches between Chinese and English
    Tool: Playwright
    Preconditions: T10 completed
    Steps:
      1. Navigate to http://localhost:5173
      2. Assert page displays Chinese text (噪声监测)
      3. Click language toggle (中 / EN)
      4. Assert page displays English text (Noise Monitor)
    Expected Result: All text labels switch between Chinese and English
    Failure Indicators: Some labels don't switch, mixed languages
    Evidence: .sisyphus/evidence/task-10-locale-zh.png, .sisyphus/evidence/task-10-locale-en.png
  ```

  **Commit**: YES
  - Message: `feat: integrate all components in App.vue`
  - Files: `src/App.vue, src/components/ActionBar.vue, src/components/__tests__/ActionBar.spec.ts, src/__tests__/App.spec.ts, src/main.ts`
  - Pre-commit: `npm run test -- --run`

- [ ] 11. iOS Safari compatibility + edge cases + polish

  **What to do**:
  - Add iOS Safari audio compatibility in `useNoiseDetector.ts`:
    1. Set `navigator.audioSession.type = 'play-and-record'` if available (iOS 16.4+)
    2. For iOS < 16.4, add silent WAV bypass: create a short silent AudioBuffer and play it to unlock the audio context
    3. Listen for `AudioContext.statechange` event: handle non-standard `"interrupted"` state (iOS 18+)
    4. Auto-resume AudioContext when state transitions from `"suspended"` or `"interrupted"` to `"running"`
  - Add microphone permission denied UX:
    - If `getUserMedia` throws `NotAllowedError`: show a clear message explaining how to re-enable microphone
    - If `getUserMedia` throws `NotFoundError`: show "no microphone found" message
  - Handle `document.visibilitychange`:
    - When document becomes hidden: pause monitoring (cancel rAF), but keep AudioContext alive
    - When document becomes visible: resume monitoring (restart rAF), auto-resume AudioContext if suspended
    - Add a small delay (100ms) before resuming to avoid race conditions
  - Polish styling to match mockups pixel-perfectly:
    - Verify both dark and light themes match mockup CSS variables exactly
    - Add `font-display: swap` to Google Fonts link
    - Add touch-action styles for mobile (prevent double-tap zoom)
    - Ensure 44px minimum touch targets
    - Add `env(safe-area-inset-bottom)` to action bar padding
    - Verify `position: fixed` action bar with gradient fade works on mobile browsers
  - Clean up: remove any console.log, unused imports, debug code
  - Write E2E tests:
    - Test: microphone permission denied → error message shown
    - Test: visibilitychange → monitoring pauses and resumes
    - Test: theme persists after page reload
    - Test: locale persists after page reload

  **Must NOT do**:
  - Do NOT add PWA or service worker functionality
  - Do NOT add data export
  - Do NOT add push notifications

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs all components integrated)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: T10

  **References**:

  **API/Type References**:
  - MDN AudioContext.statechange: `https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/statechange_event`
  - Media Capture and Streams API (getUserMedia errors): `https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions`

  **WHY Each Reference Matters**:
  - The statechange event is critical for handling iOS "interrupted" state
  - getUserMedia error types (NotAllowedError, NotFoundError) drive the permission denied UX

  **Acceptance Criteria**:

  **If TDD (tests enabled):**
  - [ ] Test file created: src/composables/__tests__/useNoiseDetector-ios.spec.ts
  - [ ] Test file created: src/__tests__/integration.spec.ts
  - [ ] `npm run test` → ALL tests pass

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Microphone permission denied shows error message
    Tool: Playwright
    Preconditions: T11 completed, dev server running
    Steps:
      1. Navigate to http://localhost:5173
      2. Use Playwright to deny microphone permission (browserContext.grantPermissions([], {origin}))
      3. Click the start/monitoring button
      4. Assert an error message is displayed on the page
      5. The error message should mention microphone or permission
    Expected Result: User-friendly error message shown when mic permission denied
    Failure Indicators: Blank screen, unhandled promise rejection, no error message
    Evidence: .sisyphus/evidence/task-11-permission-denied.png

  Scenario: Theme preference persists after page reload
    Tool: Playwright
    Preconditions: T11 completed
    Steps:
      1. Navigate to http://localhost:5173
      2. Click theme toggle to switch to light mode
      3. Assert `.dark` class is removed from <html>
      4. Reload the page
      5. Assert `.dark` class is STILL removed (theme persisted)
    Expected Result: Theme persists across reloads
    Failure Indicators: Theme resets to default after reload
    Evidence: .sisyphus/evidence/task-11-theme-persist.png

  Scenario: Page visibility change pauses and resumes monitoring
    Tool: Bash (vitest)
    Preconditions: T11 completed
    Steps:
      1. Mock document.visibilitychange event
      2. Start monitoring
      3. Dispatch 'visibilitychange' with document.hidden = true
      4. Assert isPaused.value === true
      5. Dispatch 'visibilitychange' with document.hidden = false
      6. Assert isPaused.value === false
    Expected Result: Monitoring pauses when hidden, resumes when visible
    Failure Indicators: Monitoring doesn't pause/resume, AudioContext not handled
    Evidence: .sisyphus/evidence/task-11-visibilitychange.txt

  Scenario: Build succeeds with acceptable bundle size
    Tool: Bash
    Preconditions: T11 completed
    Steps:
      1. Run `npm run build` in /home/yu/saas-web/noise_tracker/
      2. Check dist/ directory size
      3. Verify total gzipped size < 500KB
    Expected Result: Build succeeds, bundle size under 500KB gzipped
    Failure Indicators: Build errors, bundle exceeds 500KB
    Evidence: .sisyphus/evidence/task-11-bundle-size.txt
  ```

  **Commit**: YES
  - Message: `fix: iOS Safari compatibility and edge cases`
  - Files: `src/composables/useNoiseDetector.ts, src/App.vue, src/components/ActionBar.vue, src/composables/__tests__/useNoiseDetector-ios.spec.ts, src/__tests__/integration.spec.ts`
  - Pre-commit: `npm run test -- --run && npm run build`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `npm run test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports, `reactive(echartsInstance)`, `frequencyBinCount` for time-domain buffer, `{ exact: false }` getUserMedia, ScriptProcessorNode usage. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration: theme toggle + i18n toggle + monitoring start + pause + resume. Test edge cases: deny microphone permission, switch tabs (visibilitychange), rapid pause/resume. Capture screenshots for both themes. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT Have" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1**: `chore: scaffold Vue 3 + Vite + TypeScript project` — package.json, vite.config.ts, tsconfig.json, index.html
- **T2**: `feat: add theme composable and CSS variable system` — src/composables/useTheme.ts, src/styles/theme.css
- **T3**: `feat: add i18n composable and locale files` — src/composables/useI18n.ts, src/locales/*.ts
- **T4**: `feat: add audio capture composable (useNoiseDetector)` — src/composables/useNoiseDetector.ts, tests
- **T5**: `feat: add dB display card component (DbCard)` — src/components/DbCard.vue, tests
- **T6**: `feat: add stats grid component (StatsGrid)` — src/components/StatsGrid.vue, tests
- **T7**: `feat: add trend chart component (TrendChart)` — src/components/TrendChart.vue, tests
- **T8**: `feat: add history list component (HistoryList)` — src/components/HistoryList.vue, tests
- **T9**: `feat: add IndexedDB persistence layer (useNoiseStorage)` — src/composables/useNoiseStorage.ts, tests
- **T10**: `feat: integrate all components in App.vue` — src/App.vue, integration tests
- **T11**: `fix: iOS Safari compatibility and edge cases` — various files, E2E tests

---

## Success Criteria

### Verification Commands
```bash
npm run build        # Expected: successful build, < 500KB gzipped
npm run test         # Expected: all tests pass
npx tsc --noEmit     # Expected: no type errors
```

### Final Checklist
- [ ] All "Must Have" features present and working
- [ ] All "Must NOT Have" patterns absent from codebase
- [ ] Dark and light themes render correctly
- [ ] Chinese and English locales work correctly
- [ ] Real-time dBFS display updates smoothly
- [ ] Trend chart scrolls with live data
- [ ] History list populates from IndexedDB
- [ ] Theme and locale preferences persist across reloads
- [ ] No FOUC on initial load
- [ ] iOS Safari: microphone permission flow works
- [ ] iOS Safari: AudioContext resumes from suspended state