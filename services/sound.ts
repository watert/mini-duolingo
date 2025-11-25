// Simple synth based sound effects to avoid external assets
let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    // Use standard or webkit prefixed AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTimeOffset: number = 0, vol: number = 0.1) => {
  const ctx = getCtx();
  if (!ctx) return;

  // Resume context if suspended (common in browsers requiring user interaction)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);
  
  // Envelope to avoid clicking sound at start/end
  gain.gain.setValueAtTime(0, ctx.currentTime + startTimeOffset);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTimeOffset + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTimeOffset + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime + startTimeOffset);
  osc.stop(ctx.currentTime + startTimeOffset + duration + 0.05); // slight buffer
};

export const playClick = () => {
  // Short high "pop"
  playTone(600, 'sine', 0.05, 0, 0.05);
};

export const playSelect = () => {
  playTone(400, 'sine', 0.05, 0, 0.05);
}

export const playMatch = () => {
  // Pleasant ascending chime
  playTone(523.25, 'sine', 0.1, 0, 0.1); // C5
  playTone(659.25, 'sine', 0.2, 0.08, 0.1); // E5
};

export const playError = () => {
  // Dull low thud/buzz
  playTone(150, 'sawtooth', 0.15, 0, 0.08);
  playTone(100, 'sawtooth', 0.2, 0.1, 0.08);
};

export const playWin = () => {
  // Major chord arpeggio
  playTone(523.25, 'sine', 0.1, 0, 0.1);
  playTone(659.25, 'sine', 0.1, 0.1, 0.1);
  playTone(783.99, 'sine', 0.1, 0.2, 0.1);
  playTone(1046.50, 'sine', 0.4, 0.3, 0.1);
};