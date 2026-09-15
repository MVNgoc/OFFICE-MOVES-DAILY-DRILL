/**
 * Retro sound effects synthesised with the Web Audio API — no audio files.
 *
 * Everything is built from square/triangle oscillators through a short gain
 * envelope, which is what gives the chiptune "blip" character. The context is
 * created lazily on the first user gesture so browsers don't block it.
 */

type Wave = OscillatorType

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.22
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface ToneOptions {
  freq: number
  /** Slide to this frequency across the tone. */
  endFreq?: number
  duration?: number
  wave?: Wave
  gain?: number
  /** Seconds to wait before the tone starts. */
  delay?: number
}

function tone({ freq, endFreq, duration = 0.08, wave = 'square', gain = 1, delay = 0 }: ToneOptions) {
  const audio = ensureContext()
  if (!audio || !master || muted) return

  const start = audio.currentTime + delay
  const osc = audio.createOscillator()
  const env = audio.createGain()

  osc.type = wave
  osc.frequency.setValueAtTime(freq, start)
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), start + duration)
  }

  // Fast attack, exponential decay — the classic 8-bit envelope.
  env.gain.setValueAtTime(0.0001, start)
  env.gain.exponentialRampToValueAtTime(gain, start + 0.005)
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(env)
  env.connect(master)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** Short burst of filtered noise — used for the "done" confetti pop. */
function noise(duration = 0.18, gain = 0.5) {
  const audio = ensureContext()
  if (!audio || !master || muted) return

  const frames = Math.floor(audio.sampleRate * duration)
  const buffer = audio.createBuffer(1, frames, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }

  const src = audio.createBufferSource()
  src.buffer = buffer

  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1800
  filter.Q.value = 0.8

  const env = audio.createGain()
  env.gain.value = gain

  src.connect(filter)
  filter.connect(env)
  env.connect(master)
  src.start()
}

export const sfx = {
  /** Generic UI click. */
  click() {
    tone({ freq: 640, endFreq: 880, duration: 0.05, wave: 'square', gain: 0.5 })
  },

  /** Toggling a filter on/off — two flavours so selection state is audible. */
  toggle(on: boolean) {
    tone({ freq: on ? 520 : 400, endFreq: on ? 780 : 300, duration: 0.07, gain: 0.5 })
  },

  /** One tick of the spin reel. Pitch rises as the reel slows down. */
  tick(progress: number) {
    tone({ freq: 380 + progress * 420, duration: 0.03, wave: 'square', gain: 0.32 })
  },

  /** The reel has landed on an exercise. */
  spinComplete() {
    tone({ freq: 523.25, duration: 0.1, wave: 'square', gain: 0.6 })
    tone({ freq: 659.25, duration: 0.1, wave: 'square', gain: 0.6, delay: 0.09 })
    tone({ freq: 783.99, duration: 0.18, wave: 'square', gain: 0.6, delay: 0.18 })
  },

  /** Countdown timer started. */
  start() {
    tone({ freq: 440, endFreq: 660, duration: 0.12, wave: 'triangle', gain: 0.55 })
  },

  /** Countdown timer paused. */
  pause() {
    tone({ freq: 440, endFreq: 260, duration: 0.12, wave: 'triangle', gain: 0.5 })
  },

  /** One of the final three beeps before the timer hits zero. */
  countdownBeep() {
    tone({ freq: 880, duration: 0.09, wave: 'square', gain: 0.5 })
  },

  /** Timer reached zero. */
  finish() {
    tone({ freq: 659.25, duration: 0.12, wave: 'square', gain: 0.6 })
    tone({ freq: 783.99, duration: 0.12, wave: 'square', gain: 0.6, delay: 0.11 })
    tone({ freq: 1046.5, duration: 0.3, wave: 'square', gain: 0.6, delay: 0.22 })
    noise(0.2, 0.25)
  },

  /** One side of a two-sided exercise is done — change sides. */
  switchSide() {
    tone({ freq: 784, duration: 0.1, wave: 'square', gain: 0.55 })
    tone({ freq: 587.33, duration: 0.1, wave: 'square', gain: 0.55, delay: 0.11 })
    tone({ freq: 784, duration: 0.16, wave: 'square', gain: 0.55, delay: 0.22 })
  },

  /** Daily streak incremented. */
  streakUp() {
    tone({ freq: 523.25, duration: 0.08, gain: 0.55 })
    tone({ freq: 659.25, duration: 0.08, gain: 0.55, delay: 0.07 })
    tone({ freq: 783.99, duration: 0.08, gain: 0.55, delay: 0.14 })
    tone({ freq: 1046.5, duration: 0.26, gain: 0.6, delay: 0.21 })
    noise(0.25, 0.22)
  },

  /** Filters matched nothing. */
  error() {
    tone({ freq: 220, endFreq: 110, duration: 0.22, wave: 'sawtooth', gain: 0.45 })
  },

  setMuted(next: boolean) {
    muted = next
    if (!next) ensureContext()
  },

  isMuted() {
    return muted
  },
}
