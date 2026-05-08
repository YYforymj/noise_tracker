export default {
  app: {
    title: 'Noise Monitor',
  },
  level: {
    quiet: 'Quiet',
    moderate: 'Moderate',
    loud: 'Loud',
    danger: 'Danger',
  },
  stat: {
    min: 'Min',
    avg: 'Avg',
    max: 'Max',
    duration: 'Duration',
  },
  section: {
    trend: 'Trend',
    history: 'History',
  },
  btn: {
    pause: 'Pause',
    resume: 'Resume',
    start: 'Start',
    stop: 'Stop',
  },
  unit: {
    db: 'dB',
    min: ' min',
  },
  lang: {
    toggle: 'EN / 中',
  },
  error: {
    micDenied: 'Microphone permission denied. Please allow microphone access in your browser settings.',
    micNotFound: 'No microphone device found.',
    micSecure: 'Microphone requires a secure connection (HTTPS). Please use localhost or HTTPS.',
  },
} as const