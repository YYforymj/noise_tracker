export default {
  app: {
    title: '噪声监测',
  },
  level: {
    quiet: '安静',
    moderate: '适中',
    loud: '嘈杂',
    danger: '危险',
  },
  stat: {
    min: '最低',
    avg: '平均',
    max: '最高',
    duration: '时长',
  },
  section: {
    trend: '趋势',
    history: '历史记录',
  },
  btn: {
    pause: '暂停监测',
    resume: '继续监测',
    start: '开始监测',
    stop: '结束',
  },
  unit: {
    db: 'dB',
    min: ' min',
  },
  lang: {
    toggle: '中 / EN',
  },
  error: {
    micDenied: '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问',
    micNotFound: '未找到麦克风设备',
    micSecure: '麦克风需要安全连接(HTTPS)才能使用，请使用 localhost 或 HTTPS 访问',
  },
} as const