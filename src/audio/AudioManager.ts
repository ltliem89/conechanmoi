class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.75;
  private isUnlocked: boolean = false;

  // Cooldown timestamps (ms) to prevent audio overlapping chaos
  private lastCroakTime = 0;
  private lastJumpTime = 0;
  private lastCatchTime = 0;
  private lastTickSecond = -1;

  private ensureContext(): AudioContext | null {
    if (!this.isUnlocked) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.isUnlocked = true;
    this.ensureContext();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime,
        0.02
      );
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.ctx.currentTime,
        0.02
      );
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public resetRoundTracking(): void {
    this.lastTickSecond = -1;
  }

  /**
   * Starts a very gentle pond water/breeze ambient texture
   */
  public startAmbient(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    this.stopAmbient();

    try {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink/brown noise approximation for gentle water breeze
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.15;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 420;
      filter.Q.value = 1.4;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();

      this.ambientSource = source;
      this.ambientGain = gain;
    } catch {
      // ignore audio errors
    }
  }

  public stopAmbient(): void {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // ignore
      }
      this.ambientGain = null;
    }
  }

  /**
   * Cartoon frog "ộp ộp" double-syllable croak
   */
  public playFrogCroak(variant = 0): void {
    if (this.isMuted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastCroakTime < 650) return;
    this.lastCroakTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const baseFreq = 115 + (variant % 5) * 14;
    const now = ctx.currentTime;

    // Two syllables: "Ộp ... ộp!"
    [0, 0.16].forEach((offset, idx) => {
      const start = now + offset;
      const dur = idx === 0 ? 0.11 : 0.14;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * 0.85, start);
      osc.frequency.exponentialRampToValueAtTime(
        baseFreq * (idx === 0 ? 1.35 : 1.55),
        start + dur * 0.65
      );
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, start + dur);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2.8, start);
      filter.Q.value = 4.5;

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(start);
      osc.stop(start + dur + 0.01);
    });
  }

  /**
   * Frog jump sound with subtle spring boing
   */
  public playFrogJump(): void {
    if (this.isMuted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastJumpTime < 220) return;
    this.lastJumpTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /**
   * Gentle water ripple plop when frog lands on lily pad
   */
  public playLilyPadLand(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.09);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Snappy "chụp / pop" sound synchronized with tongue catching insect
   */
  public playCatchPop(): void {
    if (this.isMuted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastCatchTime < 75) return;
    this.lastCatchTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // 1. Snappy tongue "chụp"
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(780, now + 0.065);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.012);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // 2. Cheerful bubble pop chime right after
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const notes = [523.25, 587.33, 659.25, 783.99, 880];
    const pick = notes[Math.floor(Math.random() * notes.length)];
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(pick, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(pick * 1.25, now + 0.13);

    gain2.gain.setValueAtTime(0.001, now + 0.04);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.055);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.16);
  }

  /**
   * Suspense tick during final 5 seconds
   */
  public playCountdownTick(secondsLeft: number): void {
    if (this.isMuted) return;
    if (secondsLeft > 5 || secondsLeft <= 0) return;
    if (this.lastTickSecond === secondsLeft) return;
    this.lastTickSecond = secondsLeft;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = secondsLeft <= 2 ? 740 : 587.33;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Grand celebratory fanfare when the winner is revealed (plays once per round)
   */
  public playVictoryFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    // Bright C-major -> G -> C6 fanfare
    const chordSeq = [
      { freq: 523.25, time: 0.0, dur: 0.14 }, // C5
      { freq: 659.25, time: 0.11, dur: 0.14 }, // E5
      { freq: 783.99, time: 0.22, dur: 0.16 }, // G5
      { freq: 1046.5, time: 0.36, dur: 0.55 }, // C6
      { freq: 783.99, time: 0.36, dur: 0.55 }, // G5 harmony
      { freq: 659.25, time: 0.36, dur: 0.55 }, // E5 harmony
    ];

    chordSeq.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(0.22, now + n.time + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur + 0.02);
    });

    // Happy celebration frog croak right after the chord
    setTimeout(() => {
      this.lastCroakTime = 0;
      this.playFrogCroak(2);
    }, 450);
  }

  /**
   * Cheerful chime + ribbit when clicking a frog to change its color
   */
  public playFrogColorChange(paletteIdx = 0): void {
    if (this.isMuted) return;
    this.unlock();
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const scaleNotes = [
      523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5,
    ];
    const baseNote = scaleNotes[paletteIdx % scaleNotes.length];

    // Sparkling two-note arpeggio + soft croak
    [baseNote, baseNote * 1.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.055;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, start + 0.12);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.15);
    });

    this.lastCroakTime = 0;
    this.playFrogCroak(paletteIdx);
  }

  /**
   * Festive firework explosion pop & shimmer
   */
  public playFireworkBurst(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // 1. Deep warm thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180 + Math.random() * 60, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.22);

    oscGain.gain.setValueAtTime(0.16, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // 2. Filtered sparkle crackle burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.28);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.pow(1 - i / bufferSize, 1.8);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 + Math.random() * 900, now);
    filter.Q.value = 1.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.11, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }

  /**
   * Water splash sound when a pond fish leaps up to snap prey or dives back in
   */
  public playFishSplash(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // 1. Water bubble plop
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);

    // 2. Filtered water spray noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.value = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.09, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }
}

export const audioManager = new SoundSystem();
