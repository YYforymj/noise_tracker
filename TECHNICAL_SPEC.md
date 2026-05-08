# Noise Tracker — 技术说明文档

> 噪声检测网站 · Vue 3 + Vite + TypeScript · 移动端优先

---

## 1. 项目概览

| 项 | 值 |
|---|---|
| 项目名 | noise-tracker |
| 版本 | 1.0.0 |
| 定位 | 移动端优先的噪声检测 Web 应用 |
| 核心功能 | 麦克风实时采集环境噪音分贝值，记录历史数据和趋势 |
| 数据存储 | 纯浏览器本地（IndexedDB + localStorage），无后端 |
| 在线地址 | 需 HTTPS 或 localhost（麦克风安全上下文要求） |

---

## 2. 技术栈

### 运行时依赖

| 包 | 版本 | 用途 |
|---|---|---|
| vue | ^3.5.32 | 框架 |
| echarts | ^6.0.0 | 趋势图表 |
| vue-echarts | ^8.0.1 | Vue ECharts 组件封装 |
| dexie | ^4.4.2 | IndexedDB ORM（会话+读数持久化） |

### 开发依赖

| 包 | 用途 |
|---|---|
| vite ^8.0.10 | 构建工具 |
| typescript ~6.0.2 | 类型检查 |
| vue-tsc ^3.2.7 | Vue SFC 类型检查 |
| vitest ^4.1.5 | 单元测试 |
| @vue/test-utils ^2.4.10 | Vue 组件测试工具 |
| jsdom ^29.1.1 | 测试 DOM 环境 |
| fake-indexeddb ^6.2.5 | 测试用 IndexedDB 模拟 |

> **不使用** vue-i18n（轻量 composable 替代）、不使用 UI 组件库（纯 CSS）

---

## 3. 项目结构

```
noise_tracker/
├── index.html                     # 入口 HTML（含 FOUC 防闪脚本）
├── package.json
├── vite.config.ts                 # Vite 配置
├── vitest.config.ts               # Vitest 配置
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── mockups/                       # 原型 HTML（参考，不参与构建）
│   ├── v2-dark-en.html
│   ├── v2-dark-zh.html
│   ├── v2-light-en.html
│   ├── v2-light-zh.html
│   └── v2-warm-slate.html
│
├── src/
│   ├── main.ts                     # 应用入口
│   ├── App.vue                     # 主组件（整合所有 composables + components）
│   ├── env.d.ts                    # Vite 类型声明
│   ├── db.ts                       # Dexie 数据库定义（sessions + readings 两张表）
│   │
│   ├── styles/
│   │   ├── theme.css               # CSS 自定义属性（深色/浅色双主题）
│   │   └── base.css                # 全局重置 + 基础排版
│   │
│   ├── locales/
│   │   ├── zh.ts                   # 中文翻译（as const）
│   │   └── en.ts                   # 英文翻译（as const）
│   │
│   ├── composables/
│   │   ├── useTheme.ts             # 深色/浅色主题切换
│   │   ├── useI18n.ts              # 中英双语切换
│   │   ├── useNoiseDetector.ts     # 麦克风音频采集 + dBFS 计算
│   │   ├── useNoiseStorage.ts      # IndexedDB 持久化（会话 CRUD + 批量写入）
│   │   └── __tests__/
│   │       ├── useTheme.spec.ts
│   │       ├── useI18n.spec.ts
│   │       ├── useNoiseDetector.spec.ts
│   │       └── useNoiseStorage.spec.ts
│   │
│   └── components/
│       ├── DbCard.vue              # 分贝数值显示卡片
│       ├── StatsGrid.vue           # 最低/平均/最高/时长 四格统计
│       ├── TrendChart.vue          # ECharts 趋势折线图
│       ├── HistoryList.vue         # 历史会话列表
│       ├── ActionBar.vue           # 底部固定操作栏（开始/暂停/继续/停止）
│       └── __tests__/
│           ├── DbCard.spec.ts
│           ├── StatsGrid.spec.ts
│           ├── HistoryList.spec.ts
│           └── ActionBar.spec.ts
```

---

## 4. 数据流

```
┌─────────────┐     getUserMedia      ┌──────────────────┐
│   麦克风     │ ──────────────────→   │ useNoiseDetector │
└─────────────┘   Web Audio API        │  (每帧采集)       │
                                         │                 │
                     requestAnimationFrame │  RMS → dBFS    │
                     + 指数平滑            │  → 0-120 相对值  │
                     + 1s 限频刷新 UI       │                 │
                                         └────────┬────────┘
                                                  │
                           ┌───────────────────────┤
                           │                       │
                    currentDb 等            1s 间隔 saveReading
                    reactive 状态                 │
                           │               ┌───────▼────────┐
                           │               │ useNoiseStorage │
                           │               │  (IndexedDB)     │
                           │               │  ↓ bulkPut 1s    │
                           │               │  ↓ autoPurge 30d  │
                           │               └─────────────────┘
                           ▼
                  ┌────────────────┐
                  │    App.vue      │
                  │  ┌─ DbCard      │  ← 实时 dB 值 + 噪音等级
                  │  ├─ StatsGrid    │  ← 最低/平均/最高/时长
                  │  ├─ TrendChart   │  ← ECharts 折线图
                  │  ├─ HistoryList  │  ← 停止后刷新
                  │  └─ ActionBar    │  ← 开始/暂停/停止
                  └────────────────┘
```

---

## 5. 核心算法

### 5.1 dBFS 计算（useNoiseDetector.ts）

```
麦克风 → AnalyserNode(fftSize=2048)
       → getFloatTimeDomainData(buffer)  // 时域数据
       → RMS = sqrt( Σ sample² / bufferLength )
       → dBFS = 20 × log10( max(RMS, 1e-10) )
       → relative = clamp( dBFS + 120,  0, 120 )
       → 指数平滑: attack=0.06 / release=0.02
```

### 5.2 噪音等级分类

| 等级 | 相对分贝 | 中文 | English | 颜色（深色） | 颜色（浅色） |
|------|----------|------|---------|-------------|-------------|
| quiet | 0-50 | 安静 | Quiet | #5CB87A | #4EA068 |
| moderate | 50-70 | 适中 | Moderate | #E8A44A | #D4942E |
| loud | 70-85 | 嘈杂 | Loud | #E8644A | #D45A3A |
| danger | 85+ | 危险 | Danger | #D93636 | #C42E2E |

### 5.3 指数平滑

```typescript
const alpha = newDb > smoothedDb ? ATTACK_COEFFICIENT : RELEASE_COEFFICIENT
smoothedDb = smoothedDb + alpha * (newDb - smoothedDb)
```

- 上升时（声音变大）：attack = 0.06，响应较慢
- 下降时（声音变小）：release = 0.02，衰减更慢
- UI 刷新限频：每 1000ms 更新一次 currentDb / currentLevel

---

## 6. 数据持久化

### 6.1 localStorage — 用户偏好

| Key | 值 | 文件 |
|-----|----|------|
| `noise-tracker-theme` | `'dark'` / `'light'` | useTheme.ts |
| `noise-tracker-locale` | `'zh'` / `'en'` | useI18n.ts |

### 6.2 IndexedDB (`NoiseTrackerDB`) — 监测数据

**sessions 表**（一次 停止→开始 = 一条记录）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | 主键 | 时间戳+随机数 |
| startTime | number | 索引 | 开始时间戳 |
| endTime | number | — | 结束时间戳 |
| avgDb | number | — | 平均分贝 |
| maxDb | number | — | 最高分贝 |
| minDb | number | — | 最低分贝 |
| duration | number | — | 时长（秒） |

**readings 表**（每秒一条实时数据点）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | 主键 | 时间戳+随机数 |
| sessionId | string | 索引 | 关联会话 ID |
| timestamp | number | 索引 | 时间戳 |
| db | number | — | 相对分贝值 |

### 6.3 写入策略

```
数据采集 (1s间隔)
    ↓
内存缓冲区 (readingBuffer[])
    ↓ 满足任一条件：
    ├── 缓冲达到 60 条 → flushBuffer()
    └── 定时器 1s 到期 → flushBuffer()
    ↓
Dexie.bulkPut() 写入 IndexedDB
```

### 6.4 自动清理

- `autoPurge()` 删除 30 天前的 readings
- sessions 元数据永久保留

---

## 7. 主题系统

CSS 自定义属性实现深色/浅色双主题，DOM 切换方式：

```html
<html class="dark">   <!-- 深色主题 -->
<html class="light">  <!-- 浅色主题 -->
```

### 关键变量对照

| CSS 变量 | 深色值 | 浅色值 | 用途 |
|----------|--------|--------|------|
| `--bg` | #1E1F26 | #F4F1EB | 页面背景 |
| `--bg-card` | #282A33 | #FFFFFF | 卡片背景 |
| `--fg` | #E8E6E1 | #2A2930 | 主文字 |
| `--fg-secondary` | #9B99A1 | #6E6C75 | 次要文字 |
| `--fg-tertiary` | #6B6974 | #9E9CA5 | 标签/单位 |
| `--accent` | #E8A44A | #D4942E | 强调色 |
| `--border` | rgba(255,255,255,0.06) | rgba(0,0,0,0.07) | 边框 |
| `--shadow-card` | 重阴影 | 轻阴影 | 卡片阴影 |

### FOUC 防闪

`index.html <head>` 中的内联脚本在首帧渲染前：
1. 读取 `localStorage` 的主题和语言设置
2. 设置 `<html>` 的 `class`（dark/light）和 `lang`（zh-CN/en）
3. 确保首屏无闪烁

---

## 8. i18n 国际化

轻量级实现（不依赖 vue-i18n）：

```typescript
// 使用方式
const { t, locale, toggleLocale } = useI18n()
t('level.quiet')      // → '安静' 或 'Quiet'
t('btn.pause')         // → '暂停监测' 或 'Pause'
```

### 翻译 Key 清单

| Key | 中文 | English |
|-----|------|---------|
| app.title | 噪声监测 | Noise Monitor |
| level.quiet | 安静 | Quiet |
| level.moderate | 适中 | Moderate |
| level.loud | 嘈杂 | Loud |
| level.danger | 危险 | Danger |
| stat.min | 最低 | Min |
| stat.avg | 平均 | Avg |
| stat.max | 最高 | Max |
| stat.duration | 时长 | Duration |
| section.trend | 趋势 | Trend |
| section.history | 历史记录 | History |
| btn.start | 开始监测 | Start |
| btn.pause | 暂停监测 | Pause |
| btn.resume | 继续监测 | Resume |
| btn.stop | 结束 | Stop |
| unit.db | dB | dB |
| unit.min | min | min |
| lang.toggle | 中 / EN | EN / 中 |
| error.micDenied | 麦克风权限被拒绝… | Microphone permission denied… |
| error.micNotFound | 未找到麦克风设备 | No microphone device found |
| error.micSecure | 麦克风需要安全连接… | Microphone requires HTTPS… |

---

## 9. 组件说明

### 9.1 DbCard.vue
- Props: `dbValue`, `level`, `levelLabel`
- 显示大字号分贝值 + 噪音等级标签
- 等级标签为 pill 形状，背景色为等级色 10% 透明度

### 9.2 StatsGrid.vue
- Props: `minDb`, `avgDb`, `maxDb`, `duration`, `labels`, `dbUnit`, `minUnit`
- 四格等宽 grid，每格显示标签 + 数值 + 单位

### 9.3 TrendChart.vue
- Props: `dataPoints` (`{time, db}[]`), `title`
- ECharts 折线图，从 CSS 变量运行时读取颜色（不使用 `var(--xxx)` 传给 Canvas）
- LTTB 采样，关闭动画，响应主题变化
- **注意**: ECharts Canvas API 不支持 CSS 变量，颜色通过 `getComputedStyle` 运行时读取

### 9.4 HistoryList.vue
- Props: `sessions`, `title`
- 按 startTime 降序排列，每条显示彩色圆点 + 时间 + dB + 等级

### 9.5 ActionBar.vue
- Props: `isPaused`, `isMonitoring`, `pauseLabel`, `resumeLabel`, `startLabel`, `stopLabel`
- Events: `@toggle`, `@stop`
- 固定底部，渐变遮罩背景
- 监测中显示暂停+停止按钮；未监测显示开始按钮

---

## 10. iOS Safari 兼容性

| 问题 | 处理方式 |
|------|---------|
| AudioContext 需用户手势内 resume | `startMonitoring()` 在 click handler 中同步调用 `audioContext.resume()` |
| getUserMedia 三级降级 | `echoCancellation: false` → `echoCancellation: true` → `{ audio: true }` |
| NotReadableError 降级 | 捕获后清理 stream+AudioContext，尝试下一级约束 |
| iOS 16.4+ audioSession | 设置 `navigator.audioSession.type = 'play-and-record'`（如可用） |
| 页面隐藏时暂停 | `visibilitychange` 事件：取消 rAF，保持 AudioContext 存活 |
| 页面可见时恢复 | 100ms 延迟后恢复 rAF + resume AudioContext |
| 安全上下文 | 非 HTTPS 时显示 `micSecure` 错误提示 |

---

## 11. 部署说明

### 11.1 开发

```bash
cd noise_tracker
npm install --registry=https://registry.npmmirror.com
npm run dev          # http://localhost:5173
npm run test         # vitest run
npm run build        # vue-tsc + vite build
```

### 11.2 生产构建

```bash
npm run build
# 产物在 dist/ 目录
# JS: ~228KB gzipped
# CSS: ~2KB gzipped
```

### 11.3 部署要求

| 要求 | 说明 |
|------|------|
| HTTPS | 麦克风 API 要求安全上下文（localhost 例外） |
| 静态托管 | 任何静态托管即可（Vercel/Netlify/GitHub Pages/Nginx） |
| 无后端 | 纯前端应用，数据全部存浏览器 |
| 字体 | 页面依赖 Google Fonts（Nunito + JetBrains Mono），需外网访问 |

### 11.4 Nginx 配置示例

```nginx
server {
    listen 443 ssl;
    server_name noise.example.com;

    root /var/www/noise-tracker/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 12. 测试

```bash
npm run test          # 运行全部测试
npm run test:watch    # watch 模式
```

### 测试覆盖

| 文件 | 测试数 | 覆盖内容 |
|------|--------|---------|
| useTheme.spec.ts | 4 | 主题切换、localStorage 持久化、DOM class |
| useI18n.spec.ts | 6 | 翻译 key 解析、语言切换、localStorage 持久化 |
| useNoiseDetector.spec.ts | 6 | RMS/dBFS 计算、相对映射、等级分类 |
| useNoiseStorage.spec.ts | 5 | Session CRUD、批量写入、30天自动清理 |
| DbCard.spec.ts | 3 | 渲染 dB 值、等级 class、等级文本 |
| StatsGrid.spec.ts | 2 | 渲染 4 格、props 更新 |
| HistoryList.spec.ts | 3 | 渲染条目数、等级 dot class、时间排序 |
| ActionBar.spec.ts | 7 | 按钮状态、emit toggle/stop |

运行环境：jsdom + fake-indexeddb，无需真实浏览器/麦克风。

---

## 13. 已知限制与未来方向

| 项目 | 当前状态 | 备注 |
|------|---------|------|
| 分贝精度 | 相对值，非 SPL 校准 | dBFS + 120 偏移，仅供参考 |
| 历史记录 | 仅停止时刷新 | 可改为 Dexie liveQuery 实时更新 |
| 数据导出 | 不支持 | 计划要求中明确排除 |
| PWA | 不支持 | 计划要求中明确排除 |
| ECharts 包体积 | ~228KB gzipped | 可考虑按需引入或换轻量图表库 |
| 趋势图刷新 | 1秒一个数据点 | 滚动窗口 120 秒 |