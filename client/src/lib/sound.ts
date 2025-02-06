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

    const now = this.audioContext!.currentTime;
    this.createQuickCrash(now, this.gainNode!);
  }

  private createQuickCrash(startTime: number, destination: AudioNode) {
    // Create shorter noise buffer for quick crash
    const bufferSize = this.audioContext!.sampleRate * 0.1; // 100ms buffer
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext!.createBufferSource();
    noise.buffer = buffer;

    // Higher frequency filter for brighter crash sound
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000; // Higher frequency for clickier sound

    // Create gain node for envelope
    const gainNode = this.audioContext!.createGain();

    // Connect nodes
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    // Quick attack and decay
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

    noise.start(startTime);
    noise.stop(startTime + 0.1);
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

    // Drum roll effect
    const drumRollDuration = 1.5; // Duration of drum roll before crash
    const startingTempo = 5; // Hits per second at start
    const endingTempo = 20; // Hits per second at end

    // Calculate number of hits needed
    const totalHits = Math.floor((startingTempo + endingTempo) * drumRollDuration / 2);

    for (let i = 0; i < totalHits; i++) {
      const progress = i / totalHits;
      const currentTempo = startingTempo + (endingTempo - startingTempo) * progress;
      const hitTime = now + (progress * drumRollDuration);

      this.createDrumHit(hitTime, 0.1 + progress * 0.4, compressor);
    }

    // Final crash cymbal
    this.createCrashCymbal(now + drumRollDuration, compressor);

    console.log('Victory sound started');
  }

  private createDrumHit(startTime: number, volume: number, destination: AudioNode) {
    const osc = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    osc.connect(gainNode);
    gainNode.connect(destination);

    // Snare-like sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, startTime);
    osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.05);

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

    osc.start(startTime);
    osc.stop(startTime + 0.05);
  }

  private createCrashCymbal(startTime: number, destination: AudioNode) {
    // Create noise for cymbal
    const bufferSize = this.audioContext!.sampleRate * 2;
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext!.createBufferSource();
    noise.buffer = buffer;

    // Create filter for cymbal sound
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    // Create gain node for envelope
    const gainNode = this.audioContext!.createGain();

    // Connect nodes
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    // Set envelope
    gainNode.gain.setValueAtTime(0.8, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);

    noise.start(startTime);
    noise.stop(startTime + 1.0);
  }
}

// Singleton instance
export const soundEffect = new SoundEffect();