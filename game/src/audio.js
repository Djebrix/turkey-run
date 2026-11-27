// Gobble Dash — sound, synthesized with WebAudio only. No audio files are
// shipped: every gobble, boing, ding and thud is an oscillator shaped here.

/** All the game's sounds, built from oscillators and noise, nothing loaded. */
export class GobbleAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
  }

  /** Create the audio context on the first user gesture. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.35;
  }

  /** A short tone: frequency slide, waveform, length and loudness. */
  tone(from, to, duration, type, volume, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + duration);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  /** A burst of filtered noise for thuds, flaps and the oven's roar. */
  noise(duration, volume, cutoff, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(t0);
  }

  /** The turkey's gobble: three quick descending blips. */
  gobble() {
    this.tone(420, 300, 0.09, 'square', 0.25);
    this.tone(380, 260, 0.09, 'square', 0.25, 0.1);
    this.tone(340, 210, 0.14, 'square', 0.25, 0.2);
  }

  /** Jump: a quick rising boing. */
  jump() {
    this.tone(220, 520, 0.16, 'sine', 0.3);
  }

  /** Pickup: a bright two-note ding. */
  pickup() {
    this.tone(880, 880, 0.08, 'triangle', 0.3);
    this.tone(1318, 1318, 0.12, 'triangle', 0.3, 0.08);
  }

  /** Hit: a low thud plus a descending squawk. */
  hit() {
    this.noise(0.18, 0.5, 500);
    this.tone(300, 90, 0.3, 'sawtooth', 0.3);
  }

  /** Caught: a sad little descending phrase. */
  caught() {
    this.tone(392, 392, 0.18, 'triangle', 0.3);
    this.tone(330, 330, 0.18, 'triangle', 0.3, 0.18);
    this.tone(262, 196, 0.4, 'triangle', 0.3, 0.36);
  }

  /** Escaped: a cheerful rising fanfare. */
  fanfare() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => this.tone(n, n, 0.18, 'triangle', 0.3, i * 0.13));
    this.tone(1318, 1318, 0.4, 'triangle', 0.25, 0.55);
  }

  /** The farmer spots the turkey: a short alarmed blare. */
  alarm() {
    this.tone(180, 320, 0.2, 'sawtooth', 0.22);
    this.tone(320, 180, 0.2, 'sawtooth', 0.22, 0.2);
  }
}
