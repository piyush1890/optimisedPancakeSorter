// Simple sound effect manager using Web Audio API
export class SoundEffect {
  private audioContext: AudioContext;
  private gainNode: GainNode;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.3; // Set volume to 30%
  }

  playClick() {
    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(this.gainNode);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      this.audioContext.currentTime + 0.1
    );
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playVictory() {
    const now = this.audioContext.currentTime;

    // Create oscillator for trumpet-like sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);

    // Set up trumpet-like sound
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);

    // Fanfare melody
    oscillator.frequency.setValueAtTime(293.66, now); // D4
    oscillator.frequency.setValueAtTime(440, now + 0.2); // A4
    oscillator.frequency.setValueAtTime(587.33, now + 0.4); // D5

    oscillator.start(now);
    oscillator.stop(now + 1);
  }
}

// Singleton instance
export const soundEffect = new SoundEffect();