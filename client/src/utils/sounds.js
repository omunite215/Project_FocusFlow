/**
 * Web Audio API utilities for session sounds.
 * Procedurally generated — no audio file dependencies.
 * Respects prefers-reduced-motion.
 */

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Plays a 3-note ascending major chord (C5→E5→G5) for session completion.
 */
export function playCompletionChime() {
  if (prefersReducedMotion()) return;
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.7);
    });
  } catch {
    // Silently fail — audio is non-critical
  }
}

/**
 * Speaks a celebratory message with an energetic, soft voice.
 * Uses the Web Speech API (SpeechSynthesis).
 */
export function speakCelebration(message) {
  if (prefersReducedMotion()) return;
  try {
    if (!("speechSynthesis" in window)) return;

    // Cancel any in-progress speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.05;   // slightly energetic
    utterance.pitch = 1.2;   // warm, upbeat tone
    utterance.volume = 0.8;  // soft, not jarring

    // Try to pick a friendly-sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && /female|samantha|zira|google.*us/i.test(v.name)
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Silently fail — TTS is non-critical
  }
}

/**
 * Plays an attention-grabbing alert chime (two rising tones) for presence checks.
 */
export function playAlertChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone — attention grab
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(660, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second tone — higher, reinforces urgency
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, now + 0.25);
    gain2.gain.setValueAtTime(0, now + 0.25);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.8);
  } catch {
    // Silently fail
  }
}

/**
 * Speaks "Are you there?" for presence check popups.
 */
export function speakPresenceCheck() {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance("Hey! Are you still there? Time for a quick check-in.");
    utterance.rate = 1.0;
    utterance.pitch = 1.15;
    utterance.volume = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && /female|samantha|zira|google.*us/i.test(v.name)
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Silently fail
  }
}

/**
 * Plays a subtle click for check-in submission feedback.
 */
export function playCheckInClick() {
  if (prefersReducedMotion()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Silently fail
  }
}
