// Web Audio API Synthesizer para Micro-interações sem dependências externas

let sharedCtx = null;
export const __resetSharedCtx = () => { sharedCtx = null; };

function getAudioContext() {
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore audio errors
  }
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';

    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

export function playFanfareSound() {
  try {
    const ctx = getAudioContext();
    const notes = [
      { f: 523.25, time: 0, dur: 0.1 },     // C5
      { f: 659.25, time: 0.15, dur: 0.1 },  // E5
      { f: 783.99, time: 0.3, dur: 0.4 }    // G5
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = note.f;

      const startTime = ctx.currentTime + note.time;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + note.dur);

      osc.start(startTime);
      osc.stop(startTime + note.dur + 0.1);
    });
  } catch (e) {}
}
