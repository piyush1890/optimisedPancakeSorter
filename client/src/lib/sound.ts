// Simple sound effect manager using Web Audio API
export class SoundEffect {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private enabled: boolean = true;
  private victoryBuffer: AudioBuffer | null = null;

  private initializeAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0.5; // Increased volume to 50%
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

    // Simple oscillator-based "ahh yeeh" sound
    const now = this.audioContext!.currentTime;

    // Create oscillators for the vocal-like sound
    const osc1 = this.audioContext!.createOscillator();
    const osc2 = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.gainNode!);

    // Configure oscillators for a vocal-like sound
    osc1.type = 'sine';
    osc2.type = 'triangle';

    // "Ahh" part
    osc1.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.setValueAtTime(444, now); // Slightly detuned for chorus effect

    // "Yeeh" part
    osc1.frequency.setValueAtTime(523.25, now + 0.3); // C5
    osc2.frequency.setValueAtTime(527.25, now + 0.3);

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gainNode.gain.setValueAtTime(0.5, now + 0.3);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.6);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);

    console.log('Victory sound started');
  }
}

// Singleton instance
export const soundEffect = new SoundEffect();