// Simple sound effect manager using Web Audio API
export class SoundEffect {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private enabled: boolean = true;
  private victoryBuffer: AudioBuffer | null = null;

  // Base64 encoded "ahh yeeh" audio clip
  private readonly victorySound = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysrKysr6+vr6+vsbGxsbGxtDQ0NDQ0N7e3t7e3ubm5ubm5vT09PT09P////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQBAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7kGQAAAIePXJ3Q2AANqPOAe5oAAQ8fchd7YAIw486h72wABBwchEGhJkGKEJFyDFCRDxcg4UJEXIOFCRDxQkRcQ8XIOFCRDxcg4UJEXIOFCQAAAAAMcLgICAgICAgICAg8PDw8PDw8PDw8PDw8PDw+CAgICAgICAgICAgIP///wAAAAAAAAAAAAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwf/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZOuP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  private initializeAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0.3; // Set volume to 30%
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
    return this.audioContext && this.gainNode;
  }

  private async loadVictorySound() {
    if (!this.audioContext || this.victoryBuffer) return;

    try {
      // Convert base64 to array buffer
      const base64 = this.victorySound.split(',')[1];
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data
      this.victoryBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
    } catch (error) {
      console.warn('Failed to load victory sound:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
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
    if (!this.enabled || !this.initializeAudioContext()) return;

    await this.loadVictorySound();
    if (!this.victoryBuffer) return;

    const source = this.audioContext!.createBufferSource();
    source.buffer = this.victoryBuffer;
    source.connect(this.gainNode!);
    source.start();
  }
}

// Singleton instance
export const soundEffect = new SoundEffect();