// Web Audio API sound generator and cheerful background music synthesizer
// Ultra-lightweight, zero external MP3 dependencies, 100% reliable in any sandbox

export type BgmTrackId = 'semarak' | 'semangat' | 'harmoni';

export interface BgmTrackInfo {
  id: BgmTrackId;
  title: string;
  subtitle: string;
  bpm: number;
  mood: string;
}

export const BGM_TRACKS: BgmTrackInfo[] = [
  {
    id: 'semarak',
    title: 'Semarak Pesta Demokrasi',
    subtitle: 'Marimba ceria & pop upbeat khas pemilihan OSIS',
    bpm: 118,
    mood: 'Ceria & Semarak'
  },
  {
    id: 'semangat',
    title: 'Semangat OSIS Bunga Mayang',
    subtitle: 'Melodi heroik gembira penuh optimisme pelajar',
    bpm: 124,
    mood: 'Dinamis & Gembira'
  },
  {
    id: 'harmoni',
    title: 'Harmoni Ceria Sekolah',
    subtitle: 'Lonceng manis & nada kotak musik yang menyejukkan',
    bpm: 102,
    mood: 'Santai & Manis'
  }
];

export interface AudioSettingsState {
  bgmVolume: number;       // 0 to 1
  sfxVolume: number;       // 0 to 1
  bgmMuted: boolean;
  sfxMuted: boolean;
  globalMuted: boolean;
  currentTrack: BgmTrackId;
  isPlayingBgm: boolean;
}

type AudioListener = (state: AudioSettingsState) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private isBgmPlaying: boolean = false;
  private schedulerTimer: number | null = null;
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private listeners: Set<AudioListener> = new Set();

  private settings: AudioSettingsState = {
    bgmVolume: 0.45,
    sfxVolume: 0.75,
    bgmMuted: false,
    sfxMuted: false,
    globalMuted: false,
    currentTrack: 'semarak',
    isPlayingBgm: false
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('pilketos_audio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = {
          ...this.settings,
          ...parsed,
          isPlayingBgm: false // Don't auto-start unprompted until user interaction
        };
      }
    } catch {
      // Ignore local storage read errors
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('pilketos_audio_settings', JSON.stringify({
        bgmVolume: this.settings.bgmVolume,
        sfxVolume: this.settings.sfxVolume,
        bgmMuted: this.settings.bgmMuted,
        sfxMuted: this.settings.sfxMuted,
        globalMuted: this.settings.globalMuted,
        currentTrack: this.settings.currentTrack
      }));
    } catch {
      // Ignore
    }
  }

  private notify() {
    this.settings.isPlayingBgm = this.isBgmPlaying;
    this.listeners.forEach((fn) => fn({ ...this.settings }));
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.settings, isPlayingBgm: this.isBgmPlaying });
    return () => this.listeners.delete(listener);
  }

  public getState(): AudioSettingsState {
    return { ...this.settings, isPlayingBgm: this.isBgmPlaying };
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.settings.globalMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // SFX Sub-bus Gain
        this.sfxGain = this.ctx.createGain();
        const sfxEffVolume = this.settings.sfxMuted ? 0 : this.settings.sfxVolume;
        this.sfxGain.gain.setValueAtTime(sfxEffVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        // BGM Sub-bus Gain
        this.bgmGain = this.ctx.createGain();
        const bgmEffVolume = this.settings.bgmMuted ? 0 : this.settings.bgmVolume;
        this.bgmGain.gain.setValueAtTime(bgmEffVolume, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- VOLUME CONTROLS ---

  public setGlobalMuted(muted: boolean) {
    this.settings.globalMuted = muted;
    this.initCtx();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public toggleGlobalMute() {
    this.setGlobalMuted(!this.settings.globalMuted);
  }

  public setBgmVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.settings.bgmVolume = clamped;
    if (clamped > 0 && this.settings.bgmMuted) {
      this.settings.bgmMuted = false;
    }
    this.initCtx();
    if (this.bgmGain && this.ctx) {
      const eff = this.settings.bgmMuted ? 0 : clamped;
      this.bgmGain.gain.setValueAtTime(eff, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public setBgmMuted(muted: boolean) {
    this.settings.bgmMuted = muted;
    this.initCtx();
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : this.settings.bgmVolume, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public toggleBgmMute() {
    this.setBgmMuted(!this.settings.bgmMuted);
  }

  public setSfxVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.settings.sfxVolume = clamped;
    if (clamped > 0 && this.settings.sfxMuted) {
      this.settings.sfxMuted = false;
    }
    this.initCtx();
    if (this.sfxGain && this.ctx) {
      const eff = this.settings.sfxMuted ? 0 : clamped;
      this.sfxGain.gain.setValueAtTime(eff, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public setSfxMuted(muted: boolean) {
    this.settings.sfxMuted = muted;
    this.initCtx();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : this.settings.sfxVolume, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public toggleSfxMute() {
    this.setSfxMuted(!this.settings.sfxMuted);
  }

  public setBgmTrack(trackId: BgmTrackId) {
    if (this.settings.currentTrack === trackId) return;
    this.settings.currentTrack = trackId;
    this.currentStep = 0;
    this.saveSettings();
    this.notify();
  }

  // --- BACKGROUND MUSIC SYNTHESIZER ---

  public startBgm() {
    this.initCtx();
    if (this.isBgmPlaying) return;
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    
    // Smooth fade in
    if (this.bgmGain) {
      const target = this.settings.bgmMuted ? 0 : this.settings.bgmVolume;
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.3);
    }

    this.schedulerTimer = window.setInterval(() => {
      this.scheduleLoop();
    }, 45);

    this.notify();
  }

  public stopBgm() {
    if (!this.isBgmPlaying) return;
    
    if (this.bgmGain && this.ctx) {
      const current = this.bgmGain.gain.value;
      this.bgmGain.gain.setValueAtTime(current, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    }

    setTimeout(() => {
      if (this.schedulerTimer !== null) {
        clearInterval(this.schedulerTimer);
        this.schedulerTimer = null;
      }
      this.isBgmPlaying = false;
      this.notify();
    }, 220);
  }

  public toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
  }

  private scheduleLoop() {
    if (!this.ctx || !this.isBgmPlaying) return;

    const track = BGM_TRACKS.find(t => t.id === this.settings.currentTrack) || BGM_TRACKS[0];
    const secondsPerBeat = 60.0 / track.bpm;
    const stepDuration = secondsPerBeat / 4; // 16th notes
    const lookahead = 0.15; // 150ms lookahead

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this.playTrackStep(this.settings.currentTrack, this.currentStep, this.nextNoteTime, stepDuration);
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 64; // 4-bar loop (16 steps x 4)
    }
  }

  private playTrackStep(trackId: BgmTrackId, step: number, time: number, stepDur: number) {
    if (!this.ctx || !this.bgmGain) return;

    if (trackId === 'semarak') {
      this.playSemarakStep(step, time, stepDur);
    } else if (trackId === 'semangat') {
      this.playSemangatStep(step, time, stepDur);
    } else {
      this.playHarmoniStep(step, time, stepDur);
    }
  }

  // Track 1: "Semarak Pesta Demokrasi" (BPM 118, C Major Happy Pop/Marimba)
  private playSemarakStep(step: number, time: number, stepDur: number) {
    const bar = Math.floor(step / 16);
    const pos = step % 16;

    // Cheerful Marimba Melody (C major pentatonic / diatonic upbeat)
    const melodyMap: Record<number, number> = {
      0: 523.25, 2: 659.25, 4: 783.99, 6: 880.00,
      8: 783.99, 10: 659.25, 12: 587.33, 14: 659.25,
      16: 587.33, 18: 698.46, 20: 783.99, 22: 987.77,
      24: 880.00, 26: 783.99, 28: 698.46, 30: 587.33,
      32: 659.25, 34: 880.00, 36: 1046.50, 38: 987.77,
      40: 880.00, 42: 783.99, 44: 659.25, 46: 523.25,
      48: 698.46, 50: 783.99, 52: 880.00, 54: 1046.50,
      56: 987.77, 58: 783.99, 60: 523.25, 62: 659.25
    };

    if (melodyMap[step]) {
      this.playSynthNote(melodyMap[step], time, stepDur * 1.5, 'triangle', 0.22, 0.005, 0.2);
      // High chime overtone for marimba bell brightness
      this.playSynthNote(melodyMap[step] * 2, time, stepDur * 0.8, 'sine', 0.08, 0.003, 0.08);
    }

    // Bouncy Walking Bass (Bar 0: C, Bar 1: G, Bar 2: Am, Bar 3: F)
    const bassRoots = [130.81, 98.00, 110.00, 87.31];
    const currentRoot = bassRoots[bar];
    if (pos === 0 || pos === 6 || pos === 8 || pos === 12) {
      const pitch = pos === 6 || pos === 12 ? currentRoot * 1.5 : currentRoot;
      this.playSynthNote(pitch, time, stepDur * 1.8, 'sine', 0.32, 0.01, 0.25);
    }

    // Warm Chord Pad Stabs on Beats 2 & 4 (steps 4 & 12)
    if (pos === 4 || pos === 12) {
      const chordFreaks = [
        [261.63, 329.63, 392.00], // C
        [196.00, 246.94, 293.66], // G
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63]  // F
      ][bar];

      chordFreaks.forEach(freq => {
        this.playSynthNote(freq, time, stepDur * 2.2, 'triangle', 0.1, 0.02, 0.3);
      });
    }

    // Gentle percussion: soft kick on beat 1 & 3, shaker on every 2nd step
    if (pos === 0 || pos === 8) {
      this.playSoftKick(time);
    }
    if (pos % 2 === 0) {
      this.playShaker(time, pos % 4 === 2 ? 0.04 : 0.02);
    }
  }

  // Track 2: "Semangat OSIS Bunga Mayang" (BPM 124, G Major Fanfare)
  private playSemangatStep(step: number, time: number, stepDur: number) {
    const bar = Math.floor(step / 16);
    const pos = step % 16;

    // Joyful trumpet/synth lead
    const fanfareNotes = [
      // Bar 0: G major
      392.00, 0, 493.88, 0, 587.33, 0, 783.99, 0, 659.25, 0, 587.33, 0, 493.88, 0, 587.33, 0,
      // Bar 1: D major
      587.33, 0, 739.99, 0, 880.00, 0, 1174.66, 0, 987.77, 0, 880.00, 0, 739.99, 0, 587.33, 0,
      // Bar 2: E minor
      659.25, 0, 783.99, 0, 987.77, 0, 1174.66, 0, 987.77, 0, 783.99, 0, 659.25, 0, 783.99, 0,
      // Bar 3: C major to D
      523.25, 0, 659.25, 0, 783.99, 0, 880.00, 0, 783.99, 0, 659.25, 0, 587.33, 0, 783.99, 0
    ];

    const freq = fanfareNotes[step];
    if (freq && freq > 0) {
      this.playSynthNote(freq, time, stepDur * 1.8, 'triangle', 0.25, 0.01, 0.22);
      this.playSynthNote(freq * 0.5, time, stepDur * 1.6, 'sine', 0.15, 0.01, 0.2);
    }

    // Driving Bassline
    const bassRoots = [98.00, 146.83, 82.41, 130.81];
    if (pos === 0 || pos === 4 || pos === 8 || pos === 12) {
      this.playSynthNote(bassRoots[bar], time, stepDur * 2.5, 'sine', 0.35, 0.01, 0.3);
    }

    if (pos === 0 || pos === 8) {
      this.playSoftKick(time);
    }
    if (pos % 2 === 0) {
      this.playShaker(time, 0.035);
    }
  }

  // Track 3: "Harmoni Ceria Sekolah" (BPM 102, F Major Bell Box)
  private playHarmoniStep(step: number, time: number, stepDur: number) {
    const bar = Math.floor(step / 16);
    const pos = step % 16;

    // Sweet Music Box arpeggios
    const arpeggioChords = [
      [349.23, 440.00, 523.25, 698.46], // F
      [466.16, 587.33, 698.46, 932.33], // Bb
      [261.63, 329.63, 392.00, 523.25], // C
      [349.23, 440.00, 523.25, 698.46]  // F
    ];

    if (pos % 2 === 0) {
      const chord = arpeggioChords[bar];
      const noteIdx = (pos / 2) % chord.length;
      const note = chord[noteIdx];
      this.playSynthNote(note, time, stepDur * 3, 'sine', 0.2, 0.004, 0.4);
      this.playSynthNote(note * 2, time, stepDur * 1.5, 'triangle', 0.08, 0.002, 0.15);
    }

    if (pos === 0 || pos === 8) {
      const root = [87.31, 116.54, 130.81, 87.31][bar];
      this.playSynthNote(root, time, stepDur * 4, 'sine', 0.28, 0.02, 0.5);
    }
  }

  private playSynthNote(
    freq: number, 
    time: number, 
    duration: number, 
    type: OscillatorType, 
    peakGain: number, 
    attack: number, 
    decay: number
  ) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(peakGain, time + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(time);
      osc.stop(time + attack + decay + 0.05);
    } catch {
      // Ignore
    }
  }

  private playSoftKick(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(time);
      osc.stop(time + 0.1);
    } catch {
      // Ignore
    }
  }

  private playShaker(time: number, volume: number) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      // Small filtered noise click for hihat/shaker
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(4500, time);
      osc.frequency.exponentialRampToValueAtTime(9000, time + 0.02);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(time);
      osc.stop(time + 0.035);
    } catch {
      // Ignore
    }
  }

  // --- SOUND EFFECTS (SFX) ---

  public playSuccess() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.4); // C6
      
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      
      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      
      osc1.start(now);
      osc1.stop(now + 0.55);
    } catch {
      // Ignore
    }
  }

  public playClick() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  public playCoblos() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;

      // Sharp metallic click
      const oscStrike = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();
      oscStrike.type = 'triangle';
      oscStrike.frequency.setValueAtTime(1400, now);
      oscStrike.frequency.exponentialRampToValueAtTime(320, now + 0.08);

      strikeGain.gain.setValueAtTime(0.4, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      oscStrike.connect(strikeGain);
      strikeGain.connect(this.sfxGain);
      oscStrike.start(now);
      oscStrike.stop(now + 0.08);

      // Heavy wooden ballot punch resonance
      const oscThud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      oscThud.type = 'sine';
      oscThud.frequency.setValueAtTime(190, now + 0.02);
      oscThud.frequency.exponentialRampToValueAtTime(55, now + 0.22);

      thudGain.gain.setValueAtTime(0.45, now + 0.02);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      oscThud.connect(thudGain);
      thudGain.connect(this.sfxGain);
      oscThud.start(now + 0.02);
      oscThud.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  public playCelebrationFanfare() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        const duration = idx === notes.length - 1 ? 0.6 : 0.22;
        gain.gain.setValueAtTime(0.2, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(noteTime);
        osc.stop(noteTime + duration);
      });
    } catch {
      // Ignore
    }
  }

  public playPop() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore
    }
  }

  public playInkDip() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignore
    }
  }

  public playBallotDrop() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
      
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  public playSparkle() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const sparklePitches = [1046.50, 1318.51, 1567.98, 2093.00];

      sparklePitches.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = now + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.18);
      });
    } catch {
      // Ignore
    }
  }

  public playWhoosh() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }

  public playStamp() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  public playError() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.settings.sfxMuted || this.settings.globalMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }
}

// Single singleton instance exported as `sound`
export const sound = new SoundManager();
