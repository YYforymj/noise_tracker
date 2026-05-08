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
  seo: {
    whatIsTitle: 'What Is a Noise Monitor?',
    whatIsDesc: 'Noise Monitor Online is a free browser-based tool that helps you check real-time environmental noise levels in decibels (dB). You can use it to monitor sound levels in your room, office, classroom, or outdoor environment — no app installation required.',
    howToUseTitle: 'How to Use the Noise Monitor',
    howToUseSteps: [
      'Open the noise monitor page in your browser.',
      'Allow microphone access when prompted.',
      'Click the "Start" button to begin monitoring.',
      'View real-time dB readings on the screen.',
      'Check minimum, average, and maximum noise levels.',
      'Click "Stop" to end the session and save the record.',
    ],
    noiseLevelsTitle: 'Common Noise Level Examples',
    noiseLevels: [
      { db: '30 dB', desc: 'Quiet room, whisper' },
      { db: '50 dB', desc: 'Normal conversation' },
      { db: '70 dB', desc: 'Busy street, vacuum cleaner' },
      { db: '85 dB', desc: 'Loud machinery, heavy traffic' },
      { db: '100 dB', desc: 'Concert, factory noise' },
      { db: '120 dB', desc: 'Thunder, jet engine (pain threshold)' },
    ],
    whyMonitorTitle: 'Why Monitor Noise Levels?',
    whyMonitorPoints: [
      'Protect your hearing from prolonged exposure to loud environments',
      'Improve sleep quality by identifying noise disturbances',
      'Create a productive work environment by monitoring office noise',
      'Ensure classroom and study spaces are conducive to learning',
      'Track noise pollution in your neighborhood over time',
    ],
    faqTitle: 'Frequently Asked Questions',
    faqItems: [
      { q: 'Is this noise monitor free?', a: 'Yes, Noise Monitor Online is completely free to use. No sign-up or installation required.' },
      { q: 'Does it record audio?', a: 'No. The tool only analyzes sound levels in your browser and does not store or transmit any audio recordings.' },
      { q: 'How accurate is browser-based noise detection?', a: 'Browser-based detection provides relative dBFS measurements that are useful for comparing noise levels. For precise SPL measurements, a calibrated external microphone is recommended.' },
      { q: 'What is a safe noise level?', a: 'The WHO recommends keeping environmental noise below 50 dB for sleep and below 70 dB for daily activities. Prolonged exposure above 85 dB can cause hearing damage.' },
      { q: 'Does it work on mobile?', a: 'Yes, the tool works on any device with a microphone and a modern browser, including smartphones and tablets.' },
      { q: 'Why does it need microphone permission?', a: 'The microphone is required to capture ambient sound levels. No audio is recorded or stored — only the dB level is calculated in real time.' },
    ],
  },
} as const