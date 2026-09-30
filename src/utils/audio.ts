// Web Audio API Sound Generator & Speech Synthesis for Classroom English Game

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private noteIndex: number = 0;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Crisp, cheerful pop bubble sound
  public playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency slide for cute bubble pop
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Clear musical chime when answering correctly
  public playSuccessChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.36);
    });
  }

  // Playful celebration sound for combos or achieving target
  public playCelebration() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const melody = [523.25, 659.25, 783.99, 880, 1046.5]; // C5, E5, G5, A5, C6
    const now = this.ctx.currentTime;

    melody.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.4, now + i * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.42);
    });
  }

  // Friendly soft tap for wrong fruit clicked
  public playGentleBoing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Playful, cheerful, relaxing nursery BGM generated purely via Web Audio API
  public startBGM() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;

    // Upbeat gentle nursery arpeggio (C major / pentatonic happy chords)
    // C - E - G - A - G - E - F - A - C - B - G - E
    const melody = [
      { note: 261.63, len: 0.35, chord: [130.81, 196.0] }, // C4 (C3 bass)
      { note: 329.63, len: 0.35 },                          // E4
      { note: 392.00, len: 0.35 },                          // G4
      { note: 440.00, len: 0.50 },                          // A4
      { note: 392.00, len: 0.35 },                          // G4
      { note: 329.63, len: 0.35 },                          // E4
      { note: 349.23, len: 0.35, chord: [174.61, 220.0] }, // F4 (F3 bass)
      { note: 440.00, len: 0.35 },                          // A4
      { note: 523.25, len: 0.45 },                          // C5
      { note: 493.88, len: 0.35 },                          // B4
      { note: 392.00, len: 0.35, chord: [146.83, 196.0] }, // G4 (G3 bass)
      { note: 329.63, len: 0.50 },                          // E4
    ];

    const stepTime = 420; // ms per beat

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      if (this.ctx.state === 'suspended') return;

      const item = melody[this.noteIndex % melody.length];
      const now = this.ctx.currentTime;

      // Play soft marimba melody note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.note, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.len);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + item.len + 0.05);

      // Play soft bass tone if present
      if (item.chord) {
        item.chord.forEach((bassFreq) => {
          const bassOsc = this.ctx!.createOscillator();
          const bassGain = this.ctx!.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          bassGain.gain.setValueAtTime(0.001, now);
          bassGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          bassOsc.connect(bassGain);
          bassGain.connect(this.bgmGain!);

          bassOsc.start(now);
          bassOsc.stop(now + 0.75);
        });
      }

      this.noteIndex = (this.noteIndex + 1) % melody.length;
    };

    playStep();
    this.bgmIntervalId = window.setInterval(playStep, stepTime);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying;
  }

  // Clear, crisp real human English speech synthesis with caching and high-quality voice selection
  public speakEnglishWord(word: string, options?: { spell?: boolean; slow?: boolean }) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop prior utterance

    const textToSpeak = options?.spell
      ? `${word}! ${word.split('').join(' . ')} . ${word}!`
      : word;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    utterance.rate = options?.slow ? 0.75 : 0.9;
    utterance.pitch = 1.15; // Slightly cheerful pitch for children

    // Find a pleasant English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Jenny'))) ||
        v.lang === 'en-US'
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

export const soundManager = new SoundManager();
