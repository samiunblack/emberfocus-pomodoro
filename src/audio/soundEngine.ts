/**
 * Audio Engine for EmberFocus
 * Synthesizes continuous Brown Noise, procedural campfire crackles, and meditation bell tones
 * using the native Web Audio API (zero external audio files needed).
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  // Brown noise nodes
  private brownNoiseNode: AudioNode | null = null;
  private brownNoiseGain: GainNode | null = null;
  private isBrownNoisePlaying: boolean = false;
  private brownNoiseVolume: number = 0.5;

  // Campfire crackle nodes
  private crackleIntervalId: number | null = null;
  private crackleGain: GainNode | null = null;
  private isCracklePlaying: boolean = false;
  private crackleVolume: number = 0.35;

  // Sound effects enabled
  private sfxEnabled: boolean = true;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Generates continuous Brownian / Red noise with a warm low-pass filter
   * Brownian noise has a -6dB per octave spectral density roll-off,
   * producing a deep, relaxing, rumbling ambient frequency ideal for deep concentration.
   */
  public startBrownNoise(volume?: number): void {
    const ctx = this.initContext();
    if (this.isBrownNoisePlaying) {
      if (volume !== undefined) {
        this.setBrownNoiseVolume(volume);
      }
      return;
    }

    if (volume !== undefined) {
      this.brownNoiseVolume = volume;
    }

    const bufferSize = 2 * ctx.sampleRate; // 2-second buffer
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Standard Brownian integration filter
      lastOut = (lastOut + 0.02 * white) / 1.02;
      output[i] = lastOut * 3.2; // Gain compensation
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    // Gentle low-pass filter to remove any harshness and shape the warm rumble
    const lowPass = ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(450, ctx.currentTime);

    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.setValueAtTime(30, ctx.currentTime); // Filter out subsonic DC offset

    const gainNode = ctx.createGain();
    const targetGain = Math.max(0, Math.min(1, this.brownNoiseVolume));
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain * 0.8), ctx.currentTime + 1.2);

    whiteNoiseSource.connect(highPass);
    highPass.connect(lowPass);
    lowPass.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoiseSource.start();

    this.brownNoiseNode = whiteNoiseSource;
    this.brownNoiseGain = gainNode;
    this.isBrownNoisePlaying = true;
  }

  public stopBrownNoise(): void {
    if (!this.isBrownNoisePlaying || !this.brownNoiseGain || !this.ctx) return;

    try {
      this.brownNoiseGain.gain.setValueAtTime(this.brownNoiseGain.gain.value, this.ctx.currentTime);
      this.brownNoiseGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      setTimeout(() => {
        if (this.brownNoiseNode) {
          try {
            (this.brownNoiseNode as AudioBufferSourceNode).stop();
            this.brownNoiseNode.disconnect();
          } catch {
            // Ignore if already stopped
          }
          this.brownNoiseNode = null;
        }
        this.isBrownNoisePlaying = false;
      }, 650);
    } catch {
      this.isBrownNoisePlaying = false;
    }
  }

  public setBrownNoiseVolume(volume: number): void {
    this.brownNoiseVolume = Math.max(0, Math.min(1, volume));
    if (this.brownNoiseGain && this.ctx) {
      this.brownNoiseGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.brownNoiseGain.gain.setTargetAtTime(
        Math.max(0.0001, this.brownNoiseVolume * 0.8),
        this.ctx.currentTime,
        0.1
      );
    }
  }

  /**
   * Procedural campfire crackle generator:
   * Generates organic random micro-pops and soft wood snaps that complement the fire aesthetic
   */
  public startCampfireCrackle(volume?: number): void {
    const ctx = this.initContext();
    if (this.isCracklePlaying) {
      if (volume !== undefined) this.setCampfireCrackleVolume(volume);
      return;
    }

    if (volume !== undefined) this.crackleVolume = volume;

    this.crackleGain = ctx.createGain();
    this.crackleGain.gain.setValueAtTime(this.crackleVolume, ctx.currentTime);
    this.crackleGain.connect(ctx.destination);
    this.isCracklePlaying = true;

    const playCracklePop = () => {
      if (!this.isCracklePlaying || !this.ctx || !this.crackleGain) return;

      // Random delay between pops
      const nextDelay = 80 + Math.random() * 450;

      // Create a short burst of noise for the pop
      const bufferSize = Math.floor(ctx.sampleRate * (0.015 + Math.random() * 0.035));
      const popBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = popBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const popSource = ctx.createBufferSource();
      popSource.buffer = popBuffer;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = 'bandpass';
      popFilter.frequency.setValueAtTime(800 + Math.random() * 2400, ctx.currentTime);
      popFilter.Q.setValueAtTime(2 + Math.random() * 3, ctx.currentTime);

      const popGain = ctx.createGain();
      const popIntensity = (0.05 + Math.random() * 0.35) * this.crackleVolume;
      popGain.gain.setValueAtTime(popIntensity, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      popSource.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(this.crackleGain);

      popSource.start();
      popSource.onended = () => {
        try {
          popSource.disconnect();
          popFilter.disconnect();
          popGain.disconnect();
        } catch {
          // ignore
        }
      };

      this.crackleIntervalId = window.setTimeout(playCracklePop, nextDelay);
    };

    playCracklePop();
  }

  public stopCampfireCrackle(): void {
    if (this.crackleIntervalId !== null) {
      clearTimeout(this.crackleIntervalId);
      this.crackleIntervalId = null;
    }
    this.isCracklePlaying = false;
  }

  public setCampfireCrackleVolume(volume: number): void {
    this.crackleVolume = Math.max(0, Math.min(1, volume));
    if (this.crackleGain && this.ctx) {
      this.crackleGain.gain.setTargetAtTime(this.crackleVolume, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Warm Zen Singing Bowl / Meditation chime played when a timer session finishes
   */
  public playSessionEndChime(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.initContext();

    // Fundamental + gentle warm harmonics: 528Hz (Love/Transformation frequency) + overtones
    const baseFreq = 528;
    const harmonics = [
      { ratio: 1.0, gain: 0.45, decay: 4.5 },
      { ratio: 1.503, gain: 0.25, decay: 3.8 },
      { ratio: 2.01, gain: 0.12, decay: 2.9 },
      { ratio: 2.76, gain: 0.08, decay: 2.1 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.65, ctx.currentTime);
    masterGain.connect(ctx.destination);

    harmonics.forEach(({ ratio, gain, decay }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, ctx.currentTime);

      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + decay + 0.1);
    });
  }

  /**
   * Subtle UI click sound
   */
  public playClickSound(): void {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio might be blocked before first user click
    }
  }

  public getIsBrownNoisePlaying(): boolean {
    return this.isBrownNoisePlaying;
  }

  public getBrownNoiseVolume(): number {
    return this.brownNoiseVolume;
  }

  public getIsCracklePlaying(): boolean {
    return this.isCracklePlaying;
  }

  public getCrackleVolume(): number {
    return this.crackleVolume;
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  public getSfxEnabled(): boolean {
    return this.sfxEnabled;
  }
}

export const soundEngine = new SoundEngine();
