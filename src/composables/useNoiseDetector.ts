import { ref, readonly, onUnmounted } from 'vue'

type NoiseLevel = 'quiet' | 'moderate' | 'loud' | 'danger'

const LEVEL_THRESHOLDS: Record<NoiseLevel, [number, number]> = {
  quiet: [0, 50],
  moderate: [50, 70],
  loud: [70, 85],
  danger: [85, 120],
}

const ATTACK_COEFFICIENT = 0.06
const RELEASE_COEFFICIENT = 0.02
const DBFS_OFFSET = 120
const SILENCE_FLOOR = 1e-10
const DISPLAY_UPDATE_INTERVAL = 1000

function classifyLevel(db: number): NoiseLevel {
  if (db < 50) return 'quiet'
  if (db < 70) return 'moderate'
  if (db < 85) return 'loud'
  return 'danger'
}

function computeRMS(buffer: Float32Array<ArrayBufferLike>): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}

function computeDBFS(rms: number): number {
  return 20 * Math.log10(Math.max(rms, SILENCE_FLOOR))
}

function mapToRelative(dBFS: number): number {
  return Math.max(0, Math.min(120, dBFS + DBFS_OFFSET))
}

export function useNoiseDetector() {
  const currentDb = ref(0)
  const currentLevel = ref<NoiseLevel>('quiet')
  const isMonitoring = ref(false)
  const isPaused = ref(false)
  const minDb = ref(Infinity)
  const maxDb = ref(-Infinity)
  const avgDb = ref(0)
  const sessionDuration = ref(0)
  const errorMessage = ref<string | null>(null)

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let mediaStream: MediaStream | null = null
  let animationFrameId: number | null = null
  let smoothedDb = 0
  let sampleCount = 0
  let dbSum = 0
  let sessionStartTime = 0
  let durationInterval: ReturnType<typeof setInterval> | null = null
  let buffer: Float32Array | null = null
  let lastDisplayUpdate = 0

  function applySmoothing(newDb: number): number {
    const alpha = newDb > smoothedDb ? ATTACK_COEFFICIENT : RELEASE_COEFFICIENT
    smoothedDb = smoothedDb + alpha * (newDb - smoothedDb)
    return smoothedDb
  }

  function processAudioFrame() {
    if (!analyser || !buffer || isPaused.value) {
      if (!isPaused.value) {
        animationFrameId = requestAnimationFrame(processAudioFrame)
      }
      return
    }

    analyser.getFloatTimeDomainData(buffer as Float32Array<ArrayBuffer>)
    const rms = computeRMS(buffer)
    const dBFS = computeDBFS(rms)
    const relative = mapToRelative(dBFS)
    const smoothed = applySmoothing(relative)

    const now = performance.now()
    if (now - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL) {
      lastDisplayUpdate = now
      currentDb.value = Math.round(smoothed)
      currentLevel.value = classifyLevel(smoothed)

      if (smoothed < minDb.value) minDb.value = Math.round(smoothed)
      if (smoothed > maxDb.value) maxDb.value = Math.round(smoothed)
    }
    sampleCount++
    dbSum += smoothed
    avgDb.value = Math.round(dbSum / sampleCount)

    animationFrameId = requestAnimationFrame(processAudioFrame)
  }

  function startDurationTimer() {
    sessionStartTime = Date.now()
    durationInterval = setInterval(() => {
      if (!isPaused.value) {
        sessionDuration.value = Math.floor((Date.now() - sessionStartTime) / 1000)
      }
    }, 1000)
  }

  async function startMonitoring() {
    if (isMonitoring.value) return

    errorMessage.value = null

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      errorMessage.value = 'micSecure'
      return
    }

    const audioConstraints: MediaStreamConstraints[] = [
      { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } },
      { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false } },
      { audio: true },
    ]

    for (const constraints of audioConstraints) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

        audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        await audioContext.resume()

        if ('audioSession' in navigator) {
          (navigator as unknown as { audioSession: { type: string } }).audioSession.type = 'play-and-record'
        }

        const source = audioContext.createMediaStreamSource(mediaStream)
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.3
        analyser.minDecibels = -100
        analyser.maxDecibels = -10

        source.connect(analyser)
        buffer = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>

        isMonitoring.value = true
        isPaused.value = false
        minDb.value = Infinity
        maxDb.value = -Infinity
        sampleCount = 0
        dbSum = 0
        smoothedDb = 0
        currentDb.value = 0

        startDurationTimer()
        processAudioFrame()

        audioContext.addEventListener('statechange', handleAudioContextStateChange)
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return
      } catch (err) {
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop())
          mediaStream = null
        }
        if (audioContext) {
          audioContext.close()
          audioContext = null
        }
        analyser = null
        buffer = null

        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            errorMessage.value = 'micDenied'
            return
          }
          if (err.name === 'NotFoundError') {
            errorMessage.value = 'micNotFound'
            return
          }
          if (err.name === 'NotReadableError' || err.name === 'AbortError') {
            continue
          }
        }
        if (constraints === audioConstraints[audioConstraints.length - 1]) {
          errorMessage.value = 'micDenied'
          return
        }
        continue
      }
    }
  }

  function handleAudioContextStateChange() {
    if (audioContext && (audioContext.state === 'suspended' || audioContext.state === 'interrupted')) {
      audioContext.resume()
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    } else {
      if (isMonitoring.value && !isPaused.value) {
        setTimeout(() => {
          if (audioContext) audioContext.resume()
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(processAudioFrame)
          }
        }, 100)
      }
    }
  }

  function stopMonitoring() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    if (durationInterval !== null) {
      clearInterval(durationInterval)
      durationInterval = null
    }
    if (audioContext) {
      audioContext.removeEventListener('statechange', handleAudioContextStateChange)
      audioContext.close()
      audioContext = null
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    isMonitoring.value = false
    isPaused.value = false
    analyser = null
    buffer = null
  }

  function pauseMonitoring() {
    isPaused.value = true
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  function resumeMonitoring() {
    isPaused.value = false
    if (audioContext) audioContext.resume()
    animationFrameId = requestAnimationFrame(processAudioFrame)
  }

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    currentDb: readonly(currentDb),
    currentLevel: readonly(currentLevel),
    isMonitoring: readonly(isMonitoring),
    isPaused: readonly(isPaused),
    minDb: readonly(minDb),
    maxDb: readonly(maxDb),
    avgDb: readonly(avgDb),
    sessionDuration: readonly(sessionDuration),
    errorMessage: readonly(errorMessage),
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
  }
}

export { computeRMS, computeDBFS, mapToRelative, classifyLevel, LEVEL_THRESHOLDS }