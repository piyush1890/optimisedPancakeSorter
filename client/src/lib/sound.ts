// Simple sound effect manager using Web Audio API
export class SoundEffect {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private enabled: boolean = true;

  private initializeAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0.5;
        console.log('Audio context initialized successfully');
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
    return this.audioContext && this.gainNode;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    console.log('Sound enabled:', enabled);
  }

  playClick() {
    if (!this.enabled || !this.initializeAudioContext()) return;

    const oscillator = this.audioContext!.createOscillator();
    oscillator.connect(this.gainNode!);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, this.audioContext!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      this.audioContext!.currentTime + 0.1
    );
    oscillator.start();
    oscillator.stop(this.audioContext!.currentTime + 0.1);
  }

  async playVictory() {
    if (!this.enabled) {
      console.log('Sound is disabled, skipping victory sound');
      return;
    }

    if (!this.initializeAudioContext()) {
      console.warn('Failed to initialize audio context');
      return;
    }

    console.log('Playing victory sound');

    const now = this.audioContext!.currentTime;
    const duration = 2.0; // Total duration in seconds

    // Create a compressor for better sound
    const compressor = this.audioContext!.createDynamicsCompressor();
    compressor.connect(this.gainNode!);

    // Bass drum
    this.createKick(now, compressor);
    this.createKick(now + 0.5, compressor);
    this.createKick(now + 1.0, compressor);
    this.createKick(now + 1.5, compressor);

    // Bass line
    this.createBassLine(now, duration, compressor);

    // Lead synth
    this.createLeadSynth(now, duration, compressor);

    console.log('Victory sound started');
  }

  private createKick(startTime: number, destination: AudioNode) {
    const osc = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    osc.connect(gainNode);
    gainNode.connect(destination);

    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    gainNode.gain.setValueAtTime(1, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }

  private createBassLine(startTime: number, duration: number, destination: AudioNode) {
    const osc = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    const filter = this.audioContext!.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    // Bass line settings
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 10;

    // Bass pattern
    const bassNotes = [60, 62, 64, 65]; // Bass note frequencies
    const noteTime = duration / bassNotes.length;

    bassNotes.forEach((note, i) => {
      const noteStart = startTime + (i * noteTime);
      osc.frequency.setValueAtTime(220 * Math.pow(2, (note - 69) / 12), noteStart);
      gainNode.gain.setValueAtTime(0.5, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + noteTime * 0.9);
    });

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private createLeadSynth(startTime: number, duration: number, destination: AudioNode) {
    const osc = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    osc.connect(gainNode);
    gainNode.connect(destination);

    // Lead synth settings
    osc.type = 'square';

    // Lead pattern
    const leadNotes = [72, 74, 76, 77]; // Lead note frequencies
    const noteTime = duration / leadNotes.length;

    leadNotes.forEach((note, i) => {
      const noteStart = startTime + (i * noteTime);
      osc.frequency.setValueAtTime(440 * Math.pow(2, (note - 69) / 12), noteStart);
      gainNode.gain.setValueAtTime(0.2, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + noteTime * 0.8);
    });

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

// Singleton instance
export const soundEffect = new SoundEffect();