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
}

// Singleton instance
export const soundEffect = new SoundEffect();
