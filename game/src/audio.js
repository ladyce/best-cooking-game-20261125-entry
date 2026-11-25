// All sound is synthesized with WebAudio — no audio files, no network. The context is created
// lazily on the first user gesture (browsers block audio before one), and every cue is a short
// oscillator or noise envelope so a cue never overlaps into a drone.
export class SoundBoard {
  constructor() {
    this.context = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  ensure() {
    if (this.context) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
    } catch (error) {
      this.context = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopSizzle();
    return this.muted;
  }

  tone(freq, seconds, type, volume, when = 0) {
    if (!this.context || this.muted) return;
    const start = this.context.currentTime + when;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(this.context.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  }

  /** Short click when an ingredient lands in the tray. */
  grab() {
    this.tone(520, 0.08, 'triangle', 0.18);
    this.tone(780, 0.07, 'triangle', 0.12, 0.03);
  }

  /** Two wooden thocks for a chop. */
  chop() {
    this.tone(180, 0.07, 'square', 0.16);
    this.tone(140, 0.07, 'square', 0.14, 0.09);
  }

  /** A bright ding when a station finishes. */
  ding() {
    this.tone(880, 0.18, 'sine', 0.2);
    this.tone(1318, 0.22, 'sine', 0.14, 0.06);
  }

  /** Coin arpeggio on a served dish. */
  coins() {
    this.tone(988, 0.09, 'triangle', 0.2);
    this.tone(1319, 0.09, 'triangle', 0.2, 0.07);
    this.tone(1568, 0.16, 'triangle', 0.2, 0.14);
  }

  /** Low buzz when an order expires or a heart is lost. */
  buzz() {
    this.tone(160, 0.3, 'sawtooth', 0.14);
    this.tone(120, 0.35, 'sawtooth', 0.12, 0.12);
  }

  /** Service bell at the pass. */
  bell() {
    this.tone(1568, 0.25, 'sine', 0.22);
    this.tone(2093, 0.3, 'sine', 0.12, 0.05);
  }

  /** Looping filtered noise while something grills or boils; call stopSizzle to end it. */
  startSizzle() {
    if (!this.context || this.muted || this.sizzleNodes) return;
    const length = this.context.sampleRate * 1;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4200;
    filter.Q.value = 0.8;
    const gain = this.context.createGain();
    gain.gain.value = 0.035;
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.start();
    this.sizzleNodes = { source, gain };
  }

  stopSizzle() {
    if (!this.sizzleNodes) return;
    try {
      this.sizzleNodes.gain.gain.setTargetAtTime(0, this.context.currentTime, 0.05);
      this.sizzleNodes.source.stop(this.context.currentTime + 0.2);
    } catch (error) {
      /* already stopped */
    }
    this.sizzleNodes = null;
  }
}
