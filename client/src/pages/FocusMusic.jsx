import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO ENGINE — Procedural music generation using Web Audio API
// ═══════════════════════════════════════════════════════════════════════════════

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicNodes = [];
    this.ambientNodes = {};
    this.isPlaying = false;
    this.currentChannel = null;
    this._schedulerInterval = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx?.state === "suspended") this.ctx.resume();
  }

  setVolume(v) {
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  stopMusic() {
    this.isPlaying = false;
    clearInterval(this._schedulerInterval);
    this.musicNodes.forEach((n) => {
      try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch {}
    });
    this.musicNodes = [];
  }

  playChannel(channel) {
    this.init();
    this.resume();
    this.stopMusic();
    this.isPlaying = true;
    this.currentChannel = channel;
    switch (channel) {
      case "lofi": this._playLofi(); break;
      case "ambient": this._playAmbientMusic(); break;
      case "classical": this._playClassical(); break;
      case "nature": this._playNatureMusic(); break;
      case "electronic": this._playElectronic(); break;
      case "piano": this._playPiano(); break;
      case "cafe": this._playCafe(); break;
      case "binaural": this._playBinaural(); break;
      default: this._playLofi();
    }
  }

  _playLofi() {
    const ctx = this.ctx, dest = this.masterGain;
    const chords = [
      [261.63, 329.63, 392.00, 493.88],
      [220.00, 261.63, 329.63, 392.00],
      [174.61, 220.00, 261.63, 329.63],
      [196.00, 246.94, 293.66, 349.23],
    ];
    let beat = 0;
    const bpm = 75, bt = 60 / bpm;
    const schedule = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime, ci = Math.floor(beat / 8) % chords.length;
      if (beat % 4 === 0) this._kick(now, dest, 0.3);
      if (beat % 4 === 2) this._snare(now, dest, 0.15);
      this._hihat(now, dest, beat % 2 === 0 ? 0.08 : 0.04);
      if (beat % 8 === 0) {
        this._bass(now, chords[ci][0] / 2, bt * 7.5, dest, 0.2);
        chords[ci].forEach((f) => this._padNote(now, f, bt * 7.5, dest, 0.04));
      }
      if (beat % 4 === 0 && Math.random() > 0.4) {
        const pent = [523.25, 587.33, 659.25, 783.99, 880.00];
        this._bellNote(now + bt * 0.5, pent[Math.floor(Math.random() * pent.length)], bt * 1.5, dest, 0.06);
      }
      beat++;
    };
    this._schedulerInterval = setInterval(schedule, bt * 1000);
    schedule();
  }

  _playAmbientMusic() {
    const ctx = this.ctx, dest = this.masterGain;
    [130.81, 164.81, 196.00, 246.94, 329.63].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      lfo.type = "sine"; lfo.frequency.value = 0.05 + i * 0.02;
      lfoG.gain.value = freq * 0.01;
      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      osc.connect(gain); gain.connect(dest);
      gain.gain.value = 0; gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3 + i);
      osc.start(); lfo.start();
      this.musicNodes.push(osc, lfo, gain, lfoG);
    });
    this._addDelay(dest, 0.8, 0.3);
  }

  _playClassical() {
    const ctx = this.ctx, dest = this.masterGain;
    const patterns = [
      [261.63, 329.63, 392.00, 523.25, 392.00, 329.63],
      [220.00, 261.63, 329.63, 440.00, 329.63, 261.63],
      [174.61, 220.00, 261.63, 349.23, 261.63, 220.00],
      [196.00, 246.94, 293.66, 392.00, 293.66, 246.94],
    ];
    let pi = 0, ni = 0;
    const nt = 0.4;
    const schedule = () => {
      if (!this.isPlaying) return;
      this._pianoNote(ctx.currentTime, patterns[pi][ni], nt * 2.5, dest, 0.12);
      ni++;
      if (ni >= patterns[pi].length) { ni = 0; pi = (pi + 1) % patterns.length; }
    };
    this._schedulerInterval = setInterval(schedule, nt * 1000);
    schedule();
  }

  _playNatureMusic() {
    const ctx = this.ctx, dest = this.masterGain;
    this._createFilteredNoise("lowpass", 600, 0.08, dest);
    let beat = 0;
    const schedule = () => {
      if (!this.isPlaying) return;
      if (Math.random() > 0.6) this._chirp(ctx.currentTime, 1800 + Math.random() * 2000, 0.1 + Math.random() * 0.2, dest, 0.04);
      if (beat % 8 === 0 && Math.random() > 0.3) {
        const s = [523.25, 587.33, 659.25, 698.46, 783.99];
        this._fluteNote(ctx.currentTime, s[Math.floor(Math.random() * s.length)], 1.5, dest, 0.06);
      }
      beat++;
    };
    this._schedulerInterval = setInterval(schedule, 500);
    schedule();
  }

  _playElectronic() {
    const ctx = this.ctx, dest = this.masterGain;
    const bpm = 110, bt = 60 / bpm, bl = [65.41, 65.41, 87.31, 73.42];
    let beat = 0;
    const schedule = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      if (beat % 4 === 0) this._kick(now, dest, 0.35);
      if (beat % 2 === 1) this._hihat(now, dest, 0.06);
      if (beat % 4 === 2) this._snare(now, dest, 0.12);
      if (beat % 4 === 0) this._synthBass(now, bl[Math.floor(beat / 4) % bl.length], bt * 3.5, dest, 0.15);
      if (beat % 16 === 0) [130.81, 196.00, 261.63].forEach((f) => this._padNote(now, f, bt * 15, dest, 0.03));
      if (beat % 2 === 0 && Math.random() > 0.3) {
        const arp = [523.25, 659.25, 783.99, 1046.50];
        this._synthLead(now, arp[beat % arp.length], bt * 0.4, dest, 0.04);
      }
      beat++;
    };
    this._schedulerInterval = setInterval(schedule, bt * 1000);
    schedule();
  }

  _playPiano() {
    const ctx = this.ctx, dest = this.masterGain;
    const mel = [
      { f: 523.25, d: 0.8 }, { f: 493.88, d: 0.4 }, { f: 440.00, d: 0.6 }, { f: 392.00, d: 0.8 },
      { f: 349.23, d: 0.4 }, { f: 329.63, d: 0.6 }, { f: 293.66, d: 0.8 }, { f: 261.63, d: 1.2 },
      { f: 293.66, d: 0.6 }, { f: 329.63, d: 0.4 }, { f: 392.00, d: 0.8 }, { f: 440.00, d: 0.6 },
      { f: 493.88, d: 0.4 }, { f: 523.25, d: 1.2 }, { f: 0, d: 0.8 }, { f: 440.00, d: 0.6 },
    ];
    let idx = 0;
    const schedule = () => {
      if (!this.isPlaying) return;
      const { f, d } = mel[idx % mel.length];
      if (f > 0) {
        this._pianoNote(ctx.currentTime, f, d * 2, dest, 0.15);
        if (idx % 4 === 0) this._pianoNote(ctx.currentTime, f / 2, d * 3, dest, 0.06);
      }
      idx++;
      clearInterval(this._schedulerInterval);
      const next = mel[idx % mel.length]?.d || 0.6;
      this._schedulerInterval = setInterval(schedule, next * 1000);
    };
    this._schedulerInterval = setInterval(schedule, mel[0].d * 1000);
    schedule();
  }

  _playCafe() {
    const ctx = this.ctx, dest = this.masterGain;
    const bpm = 95, bt = 60 / bpm;
    const chords = [
      [146.83, 174.61, 220.00, 261.63], [196.00, 246.94, 293.66, 349.23],
      [261.63, 329.63, 392.00, 493.88], [220.00, 261.63, 329.63, 392.00],
    ];
    this._createFilteredNoise("bandpass", 1500, 0.03, dest);
    let beat = 0;
    const schedule = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime, ci = Math.floor(beat / 8) % chords.length;
      if (beat % 2 === 0) this._brush(now, dest, 0.06);
      if (beat % 4 === 3) this._brush(now, dest, 0.04);
      if (beat % 2 === 0) this._bass(now, chords[ci][Math.floor(Math.random() * 2)] / 2, bt * 1.8, dest, 0.12);
      if (beat % 8 === 0) chords[ci].forEach((f) => this._pianoNote(now, f, bt * 7, dest, 0.035));
      beat++;
    };
    this._schedulerInterval = setInterval(schedule, bt * 1000);
    schedule();
  }

  _playBinaural() {
    const ctx = this.ctx, dest = this.masterGain;
    const base = 200, diff = 10;
    const oL = ctx.createOscillator(), gL = ctx.createGain(), pL = ctx.createStereoPanner();
    oL.type = "sine"; oL.frequency.value = base; gL.gain.value = 0.15; pL.pan.value = -1;
    oL.connect(gL).connect(pL).connect(dest);
    const oR = ctx.createOscillator(), gR = ctx.createGain(), pR = ctx.createStereoPanner();
    oR.type = "sine"; oR.frequency.value = base + diff; gR.gain.value = 0.15; pR.pan.value = 1;
    oR.connect(gR).connect(pR).connect(dest);
    const pad = ctx.createOscillator(), padG = ctx.createGain();
    pad.type = "sine"; pad.frequency.value = 100; padG.gain.value = 0.04;
    pad.connect(padG).connect(dest);
    oL.start(); oR.start(); pad.start();
    this.musicNodes.push(oL, oR, pad, gL, gR, padG, pL, pR);
  }

  // Synthesis primitives
  _kick(t, d, v = 0.3) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(d); o.start(t); o.stop(t + 0.3); this.musicNodes.push(o);
  }
  _snare(t, d, v = 0.15) {
    const c = this.ctx, bs = c.sampleRate * 0.15, b = c.createBuffer(1, bs, c.sampleRate), dt = b.getChannelData(0);
    for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bs * 0.2));
    const s = c.createBufferSource(); s.buffer = b; const g = c.createGain(), f = c.createBiquadFilter();
    f.type = "highpass"; f.frequency.value = 2000; g.gain.value = v;
    s.connect(f).connect(g).connect(d); s.start(t); this.musicNodes.push(s);
  }
  _hihat(t, d, v = 0.06) {
    const c = this.ctx, bs = c.sampleRate * 0.05, b = c.createBuffer(1, bs, c.sampleRate), dt = b.getChannelData(0);
    for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bs * 0.15));
    const s = c.createBufferSource(); s.buffer = b; const g = c.createGain(), f = c.createBiquadFilter();
    f.type = "highpass"; f.frequency.value = 7000; g.gain.value = v;
    s.connect(f).connect(g).connect(d); s.start(t); this.musicNodes.push(s);
  }
  _brush(t, d, v = 0.05) {
    const c = this.ctx, bs = c.sampleRate * 0.1, b = c.createBuffer(1, bs, c.sampleRate), dt = b.getChannelData(0);
    for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bs * 0.4)) * 0.5;
    const s = c.createBufferSource(); s.buffer = b; const g = c.createGain(), f = c.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 4000; f.Q.value = 0.5; g.gain.value = v;
    s.connect(f).connect(g).connect(d); s.start(t); this.musicNodes.push(s);
  }
  _bass(t, fr, dur, d, v = 0.2) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "triangle"; o.frequency.value = fr;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(d); o.start(t); o.stop(t + dur); this.musicNodes.push(o);
  }
  _synthBass(t, fr, dur, d, v = 0.15) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.value = fr; f.type = "lowpass";
    f.frequency.setValueAtTime(fr * 8, t); f.frequency.exponentialRampToValueAtTime(fr * 2, t + dur * 0.5);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f).connect(g).connect(d); o.start(t); o.stop(t + dur); this.musicNodes.push(o);
  }
  _synthLead(t, fr, dur, d, v = 0.04) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "square"; o.frequency.value = fr;
    g.gain.setValueAtTime(v, t); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(d); o.start(t); o.stop(t + dur + 0.01); this.musicNodes.push(o);
  }
  _padNote(t, fr, dur, d, v = 0.04) {
    const c = this.ctx, o1 = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o1.type = "sine"; o2.type = "triangle"; o1.frequency.value = fr; o2.frequency.value = fr * 1.003;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.3); g.gain.linearRampToValueAtTime(0, t + dur);
    o1.connect(g); o2.connect(g); g.connect(d);
    o1.start(t); o2.start(t); o1.stop(t + dur); o2.stop(t + dur); this.musicNodes.push(o1, o2);
  }
  _pianoNote(t, fr, dur, d, v = 0.12) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "triangle"; o.frequency.value = fr;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(v * 0.3, t + 0.1); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(d); o.start(t); o.stop(t + dur); this.musicNodes.push(o);
  }
  _bellNote(t, fr, dur, d, v = 0.06) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.value = fr;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(d); o.start(t); o.stop(t + dur); this.musicNodes.push(o);
  }
  _fluteNote(t, fr, dur, d, v = 0.06) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    const vib = c.createOscillator(), vG = c.createGain();
    o.type = "sine"; o.frequency.value = fr; vib.type = "sine"; vib.frequency.value = 5; vG.gain.value = fr * 0.01;
    vib.connect(vG); vG.connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.15); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(d); o.start(t); vib.start(t); o.stop(t + dur); vib.stop(t + dur);
    this.musicNodes.push(o, vib);
  }
  _chirp(t, fr, dur, d, v = 0.04) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(fr, t);
    o.frequency.exponentialRampToValueAtTime(fr * 1.5, t + dur * 0.3);
    o.frequency.exponentialRampToValueAtTime(fr * 0.8, t + dur);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(d); o.start(t); o.stop(t + dur); this.musicNodes.push(o);
  }
  _createFilteredNoise(ft, fr, v, d) {
    const c = this.ctx, bs = 2 * c.sampleRate, b = c.createBuffer(1, bs, c.sampleRate), dt = b.getChannelData(0);
    for (let i = 0; i < bs; i++) dt[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b; s.loop = true;
    const g = c.createGain(); g.gain.value = v;
    const f = c.createBiquadFilter(); f.type = ft; f.frequency.value = fr;
    s.connect(f).connect(g).connect(d); s.start(); this.musicNodes.push(s);
  }
  _addDelay(d, dt, fb) {
    const c = this.ctx, dl = c.createDelay(2); dl.delayTime.value = dt;
    const g = c.createGain(); g.gain.value = fb;
    d.connect(dl); dl.connect(g); g.connect(dl); dl.connect(d);
    this.musicNodes.push(dl, g);
  }

  // Ambient layers
  toggleAmbient(id, filterFreq) {
    this.init(); this.resume();
    if (this.ambientNodes[id]) {
      try { this.ambientNodes[id].src.stop(); } catch {}
      delete this.ambientNodes[id]; return false;
    }
    const c = this.ctx, bs = 2 * c.sampleRate, b = c.createBuffer(1, bs, c.sampleRate), dt = b.getChannelData(0);
    this._fillNoise(dt, bs, c.sampleRate, id);
    const s = c.createBufferSource(); s.buffer = b; s.loop = true;
    const g = c.createGain(); g.gain.value = 0.25;
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filterFreq;
    s.connect(f).connect(g).connect(c.destination);
    s.start(); this.ambientNodes[id] = { src: s, gain: g, filter: f }; return true;
  }
  setAmbientVolume(id, v) { if (this.ambientNodes[id]) this.ambientNodes[id].gain.gain.value = v; }
  _fillNoise(dt, bs, sr, type) {
    switch (type) {
      case "rain": for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * (0.3 + 0.2 * Math.sin(i / (sr * 2))); break;
      case "thunder": for (let i = 0; i < bs; i++) { const t = i / sr; dt[i] = (Math.random() * 2 - 1) * Math.max(0, Math.sin(t * 0.5) * Math.exp(-(t % 4) * 0.8)) * 0.6; } break;
      case "fire": for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * (0.15 + 0.1 * Math.sin(i / 500) * Math.random()); break;
      case "wind": { let v = 0; for (let i = 0; i < bs; i++) { v = (v + 0.03 * (Math.random() * 2 - 1)) / 1.03; dt[i] = v * 2.5 + Math.sin(i / (sr * 3)) * 0.08; } break; }
      case "birds": for (let i = 0; i < bs; i++) { const t = i / sr; dt[i] = Math.sin(t * (2000 + Math.sin(t * 10) * 800)) * 0.08 * (Math.random() > 0.997 ? 1 : 0.01); } break;
      case "waves": for (let i = 0; i < bs; i++) { const t = i / sr; dt[i] = (Math.random() * 2 - 1) * 0.25 * (0.5 + 0.5 * Math.sin(t * 0.25)); } break;
      case "white": for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * 0.5; break;
      case "brown": { let v = 0; for (let i = 0; i < bs; i++) { v = (v + 0.02 * (Math.random() * 2 - 1)) / 1.02; dt[i] = v * 3; } break; }
      case "cafe_amb": for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * 0.15 * (0.7 + 0.3 * Math.sin(i / (sr * 5))); break;
      case "keyboard": for (let i = 0; i < bs; i++) dt[i] = (Math.random() > 0.996 ? (Math.random() * 2 - 1) * 0.5 : 0) + (Math.random() * 2 - 1) * 0.008; break;
      default: for (let i = 0; i < bs; i++) dt[i] = Math.random() * 2 - 1;
    }
  }

  destroy() {
    this.stopMusic();
    Object.values(this.ambientNodes).forEach((n) => { try { n.src.stop(); } catch {} });
    this.ambientNodes = {};
    if (this.ctx) this.ctx.close();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const CHANNELS = [
  { id: "lofi", name: "Lo-fi beats", icon: "🎧", desc: "Warm hip-hop beats — kick, snare, detuned chord pads, pentatonic melodies at 75 BPM", pill: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800", active: "bg-indigo-600 text-white border-indigo-600", art: "bg-indigo-100 dark:bg-indigo-900" },
  { id: "ambient", name: "Ambient", icon: "🌊", desc: "Five layered oscillators with LFO modulation and delay feedback", pill: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800", active: "bg-teal-600 text-white border-teal-600", art: "bg-teal-100 dark:bg-teal-900" },
  { id: "classical", name: "Classical", icon: "🎻", desc: "Arpeggiated patterns inspired by Debussy and Satie", pill: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800", active: "bg-orange-600 text-white border-orange-600", art: "bg-orange-100 dark:bg-orange-900" },
  { id: "nature", name: "Nature", icon: "🌿", desc: "Wind noise, bird chirps, and pentatonic flute with vibrato", pill: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800", active: "bg-green-600 text-white border-green-600", art: "bg-green-100 dark:bg-green-900" },
  { id: "electronic", name: "Deep focus", icon: "⚡", desc: "Sawtooth bass, synth arpeggios, four-on-the-floor at 110 BPM", pill: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800", active: "bg-violet-600 text-white border-violet-600", art: "bg-violet-100 dark:bg-violet-900" },
  { id: "piano", name: "Piano", icon: "🎹", desc: "Gentle C-major melody with bass accompaniment", pill: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800", active: "bg-pink-600 text-white border-pink-600", art: "bg-pink-100 dark:bg-pink-900" },
  { id: "cafe", name: "Cafe jazz", icon: "☕", desc: "Jazz voicings, brushed drums, walking bass at 95 BPM + cafe noise", pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800", active: "bg-amber-600 text-white border-amber-600", art: "bg-amber-100 dark:bg-amber-900" },
  { id: "binaural", name: "Binaural", icon: "🧠", desc: "10 Hz alpha-wave binaural beats — use headphones", pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800", active: "bg-blue-600 text-white border-blue-600", art: "bg-blue-100 dark:bg-blue-900" },
];

const AMBIENTS = [
  { id: "rain", name: "Rain", icon: "🌧️", freq: 2000 },
  { id: "thunder", name: "Thunder", icon: "⛈️", freq: 600 },
  { id: "fire", name: "Fireplace", icon: "🔥", freq: 3000 },
  { id: "wind", name: "Wind", icon: "💨", freq: 800 },
  { id: "birds", name: "Birds", icon: "🐦", freq: 6000 },
  { id: "waves", name: "Waves", icon: "🌊", freq: 1500 },
  { id: "white", name: "White noise", icon: "📡", freq: 8000 },
  { id: "brown", name: "Brown noise", icon: "🟤", freq: 400 },
  { id: "cafe_amb", name: "Cafe hum", icon: "☕", freq: 2500 },
  { id: "keyboard", name: "Typing", icon: "⌨️", freq: 5000 },
];

const TIMER_PRESETS = [15, 25, 30, 45, 60, 90, 120];
const RATING_MSGS = ["", "Rough session — you still showed up.", "Getting there — small wins.", "Solid focus!", "Great session — in the zone!", "Peak performance!"];
const FOCUS_BG = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-indigo-500"];
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function Viz({ on }) {
  const ref = useRef([]);
  useEffect(() => {
    let id;
    const tick = () => {
      ref.current.forEach((b) => { if (b) b.style.height = on ? `${4 + Math.random() * 26}px` : "4px"; });
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on]);
  return (
    <div className="flex items-end justify-center gap-[2px] h-8 my-3" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} ref={(el) => (ref.current[i] = el)} className="w-[3px] rounded-sm bg-indigo-400/50 dark:bg-indigo-500/40 transition-[height] duration-100" style={{ height: "4px" }} />
      ))}
    </div>
  );
}

function AmbGrid({ engine, amb, setAmb }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {AMBIENTS.map((a) => {
        const on = !!amb[a.id];
        return (
          <div key={a.id} className={`rounded-xl border p-3 text-center transition-all ${on ? "bg-teal-50 border-teal-300 dark:bg-teal-950/40 dark:border-teal-700" : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-teal-300"}`}>
            <button onClick={() => {
              const isOn = engine.current.toggleAmbient(a.id, a.freq);
              setAmb((p) => { const n = { ...p }; if (isOn) n[a.id] = { vol: 0.25 }; else delete n[a.id]; return n; });
            }} className="w-full cursor-pointer" aria-label={`Toggle ${a.name}`}>
              <span className="text-2xl block mb-1">{a.icon}</span>
              <span className={`text-xs block ${on ? "text-teal-600 dark:text-teal-400 font-medium" : "text-stone-500"}`}>{a.name}</span>
            </button>
            {on && <input type="range" min="0" max="100" value={Math.round((amb[a.id]?.vol ?? 0.25) * 100)} onChange={(e) => { const v = parseInt(e.target.value) / 100; engine.current.setAmbientVolume(a.id, v); setAmb((p) => ({ ...p, [a.id]: { vol: v } })); }} className="w-full h-1 mt-2 appearance-none rounded-full bg-teal-200 dark:bg-teal-800 accent-teal-500 cursor-pointer" aria-label={`${a.name} volume`} onClick={(e) => e.stopPropagation()} />}
          </div>
        );
      })}
    </div>
  );
}

function Timer({ onDone }) {
  const [pre, setPre] = useState(25);
  const [sec, setSec] = useState(25 * 60);
  const [run, setRun] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (run && sec > 0) {
      ref.current = setInterval(() => setSec((p) => { if (p <= 1) { clearInterval(ref.current); setRun(false); onDone?.(); return 0; } return p - 1; }), 1000);
    }
    return () => clearInterval(ref.current);
  }, [run, onDone]);
  const pick = (m) => { setPre(m); setSec(m * 60); setRun(false); clearInterval(ref.current); };
  const prog = 1 - sec / (pre * 60);
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 mb-6">
      <p className="text-sm font-medium mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" />Focus timer</p>
      <div className="flex justify-center mb-5">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-stone-100 dark:text-stone-800" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-indigo-500" strokeDasharray={`${prog * 276.46} 276.46`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-medium tracking-wider tabular-nums">{fmt(sec)}</span>
            <span className="text-xs text-stone-400 mt-1">{run ? "Focusing..." : sec === 0 ? "Done!" : "Ready"}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {TIMER_PRESETS.map((m) => <button key={m} onClick={() => pick(m)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${pre === m ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-700 hover:border-indigo-400"}`}>{m} min</button>)}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { if (sec <= 0) setSec(pre * 60); setRun((p) => !p); }} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 cursor-pointer">{run ? "Pause" : sec === 0 ? "Restart" : "Start focus"}</button>
        <button onClick={() => { setRun(false); clearInterval(ref.current); setSec(pre * 60); }} className="px-6 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-medium hover:border-indigo-400 cursor-pointer">Reset</button>
      </div>
    </div>
  );
}

function Rating({ show, onSubmit }) {
  const [r, setR] = useState(0);
  const [done, setDone] = useState(false);
  if (!show) return null;
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 mb-6">
      <p className="text-center font-medium mb-4">How productive was this session?</p>
      <div className="flex justify-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((v) => <button key={v} onClick={() => !done && setR(v)} className={`w-11 h-11 rounded-xl border text-lg transition-all cursor-pointer ${r >= v ? `${FOCUS_BG[v]} text-white border-transparent` : "border-stone-200 dark:border-stone-700 hover:border-stone-400"}`}>★</button>)}
      </div>
      <p className="text-center text-sm text-stone-500 min-h-[1.25rem] mb-3">{done ? "Saved! Great work." : RATING_MSGS[r]}</p>
      {!done && <button onClick={() => { if (r > 0) { setDone(true); onSubmit?.(r); } }} disabled={r === 0} className="block mx-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 cursor-pointer">Save rating</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

export default function FocusMusic() {
  const engine = useRef(new AudioEngine());
  const [channel, setChannel] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [amb, setAmb] = useState({});
  const [showRating, setShowRating] = useState(false);

  const ch = useMemo(() => CHANNELS.find((c) => c.id === channel), [channel]);

  const select = useCallback((id) => { setChannel(id); setPlaying(true); engine.current.playChannel(id); }, []);
  const toggle = useCallback(() => {
    if (!channel) { select("lofi"); return; }
    if (playing) { engine.current.stopMusic(); setPlaying(false); }
    else { engine.current.playChannel(channel); setPlaying(true); }
  }, [channel, playing, select]);

  useEffect(() => { engine.current.setVolume(volume / 100); }, [volume]);
  useEffect(() => () => engine.current.destroy(), []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight mb-1">Focus sounds</h1>
          <p className="text-stone-500 text-sm">Real-time generated focus audio — pick a channel, layer ambient sounds, set your timer</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CHANNELS.map((c) => <button key={c.id} onClick={() => select(c.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer hover:scale-[1.03] ${channel === c.id ? c.active : c.pill}`} aria-label={c.name}><span className="text-base">{c.icon}</span>{c.name}</button>)}
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 ${ch?.art || "bg-stone-100 dark:bg-stone-800"}`}>{ch?.icon || "🎵"}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base">{ch?.name || "Select a channel"}</p>
              <p className="text-sm text-stone-500">{ch?.desc || "Choose from 8 focus audio channels"}</p>
              {ch && <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${ch.pill}`}>{playing ? "Now playing" : "Paused"}</span>}
            </div>
          </div>

          <Viz on={playing} />

          <div className="flex items-center justify-center gap-5 mb-5">
            <button onClick={toggle} className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl hover:bg-indigo-700 transition-colors cursor-pointer" aria-label={playing ? "Pause" : "Play"}>{playing ? "⏸" : "▶"}</button>
          </div>

          <div className="flex items-center gap-3 px-4">
            <span className="text-sm text-stone-400">🔈</span>
            <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="flex-1 h-1 appearance-none rounded-full bg-stone-200 dark:bg-stone-700 accent-indigo-500 cursor-pointer" aria-label="Volume" />
            <span className="text-sm text-stone-400">🔊</span>
          </div>

          {channel === "binaural" && <p className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-sm text-blue-700 dark:text-blue-300">🎧 Use headphones for binaural beats to work properly. Each ear receives a slightly different frequency, creating brainwave entrainment.</p>}
        </div>

        <p className="text-sm font-medium mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" />Ambient layers — mix with music</p>
        <div className="mb-8"><AmbGrid engine={engine} amb={amb} setAmb={setAmb} /></div>

        <Timer onDone={() => setShowRating(true)} />
        <Rating show={showRating} onSubmit={(r) => console.log("Rating:", r)} />

        <p className="text-center text-xs text-stone-400 mt-8">All audio is synthesized in real-time using the Web Audio API. Zero external files or services.</p>
      </div>
    </div>
  );
}
