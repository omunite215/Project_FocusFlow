import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// AUDIO ENGINE — Neuroscience-grounded, warm synthesis
// ═══════════════════════════════════════════════════════════════

class SoothingEngine {
  constructor() {
    this.cx = null; this.mg = null; this.rv = null; this.rg = null;
    this.dg = null; this.wf = null; this.ns = []; this.an = {};
    this.on = false; this.si = null; this.bn = null;
  }
  init() {
    if (this.cx) return;
    this.cx = new (window.AudioContext || window.webkitAudioContext)();
    this.mg = this.cx.createGain(); this.mg.gain.value = 0.55;
    this.wf = this.cx.createBiquadFilter(); this.wf.type = "lowpass"; this.wf.frequency.value = 3200; this.wf.Q.value = 0.35;
    this.rv = this._mkRv(3.2, 2); this.rg = this.cx.createGain(); this.rg.gain.value = 0.25;
    this.dg = this.cx.createGain(); this.dg.gain.value = 0.75;
    this.wf.connect(this.dg); this.wf.connect(this.rv); this.rv.connect(this.rg);
    this.dg.connect(this.mg); this.rg.connect(this.mg); this.mg.connect(this.cx.destination);
  }
  _mkRv(d, dc) {
    const c = this.cx, l = c.sampleRate * d, b = c.createBuffer(2, l, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const dt = b.getChannelData(ch); for (let i = 0; i < l; i++) dt[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / l, dc); }
    const cv = c.createConvolver(); cv.buffer = b; return cv;
  }
  resume() { if (this.cx?.state === "suspended") this.cx.resume(); }
  vol(v) { if (this.mg) this.mg.gain.value = v; }
  get D() { return this.wf; }
  stop() { this.on = false; clearInterval(this.si); this.ns.forEach(n => { try { n.stop?.(0); } catch {} }); this.ns = []; }
  play(ch) {
    this.init(); this.resume(); this.stop(); this.on = true;
    const rv = { lofi: .3, ambient: .35, classical: .45, nature: .3, electronic: .12, piano: .5, cafe: .15, binaural: .05 };
    const wm = { lofi: 2800, ambient: 3800, classical: 5500, nature: 4500, electronic: 4000, piano: 6000, cafe: 4500, binaural: 8000 };
    this.rg.gain.value = rv[ch] || .25; this.wf.frequency.value = wm[ch] || 3500;
    this["_" + ch]?.();
  }
  startBreathe() { this.init(); if (this.bn) return; const c = this.cx, l = c.createOscillator(), g = c.createGain(); l.type = "sine"; l.frequency.value = .1; g.gain.value = .08; l.connect(g); g.connect(this.mg.gain); l.start(); this.bn = { l, g }; }
  stopBreathe() { if (this.bn) { try { this.bn.l.stop(); } catch {} this.bn = null; } }

  // ── Channels ──
  _lofi() { const D = this.D, c = this.cx, ch = [[146.83,220,261.63,329.63,440],[98,146.83,196,246.94,349.23],[130.81,164.81,246.94,329.63,493.88],[110,164.81,220,261.63,392]], bt = 60/72; let b = 0; this._cr(D,.01); const s = () => { if (!this.on) return; const n = c.currentTime, ci = Math.floor(b/16) % ch.length; if (b%4===0) this._k(n,D); if (b%4===2) this._sn(n,D); this._h(n,D,b%2===0?.02:.008); if (b%16===0) ch[ci].forEach(f => this._wp(n,f,bt*15.5,D,.02)); if (b%8===0) this._db(n,ch[ci][0]/2,bt*7.5,D,.12); if (b%8===0 && Math.random()>.5) { const p = [523.25,587.33,659.25,783.99,880]; this._bl(n+bt*.5,p[Math.floor(Math.random()*p.length)],bt*3,D,.025); } b++; }; this.si = setInterval(s, bt*1000); s(); }
  _ambient() { const D = this.D, c = this.cx; [108,136.07,162,216,272.14].forEach((f,i) => { const o1 = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain(); o1.type = "sine"; o1.frequency.value = f; o2.type = "sine"; o2.frequency.value = f*1.003; l.type = "sine"; l.frequency.value = .04+i*.015; lg.gain.value = f*.008; l.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency); g.gain.value = 0; g.gain.linearRampToValueAtTime(.09, c.currentTime+2+i); o1.connect(g); o2.connect(g); g.connect(D); o1.start(); o2.start(); l.start(); this.ns.push(o1,o2,l); }); const sub = c.createOscillator(), sg = c.createGain(); sub.type = "sine"; sub.frequency.value = 54; sg.gain.value = 0; sg.gain.linearRampToValueAtTime(.06, c.currentTime+3); sub.connect(sg); sg.connect(D); sub.start(); this.ns.push(sub); const sh = c.createOscillator(), shg = c.createGain(); sh.type = "sine"; sh.frequency.value = 544.28; shg.gain.value = 0; shg.gain.linearRampToValueAtTime(.015, c.currentTime+5); sh.connect(shg); shg.connect(D); sh.start(); this.ns.push(sh); }
  _classical() { const D = this.D, c = this.cx, ph = [[392,329.63,261.63,329.63,392,523.25],[349.23,293.66,220,293.66,349.23,440],[329.63,261.63,196,261.63,329.63,392],[293.66,246.94,196,220,261.63,329.63]]; let pi = 0, ni = 0; const s = () => { if (!this.on) return; this._gp(c.currentTime,ph[pi][ni],.55*3,D,.07); if (ni===0) this._db(c.currentTime,ph[pi][0]/4,.55*5.5,D,.05); ni++; if (ni >= ph[pi].length) { ni = 0; pi = (pi+1) % ph.length; } }; this.si = setInterval(s, 550); s(); }
  _nature() { const D = this.D, c = this.cx; this._pn(D,.05); this._wl(D,.025); let b = 0; const s = () => { if (!this.on) return; if (Math.random()>.5) this._bd(c.currentTime+Math.random()*.3,2200+Math.random()*1800,.12+Math.random()*.15,D,.035); if (b%10===0 && Math.random()>.3) { const sc = [392,440,523.25,587.33,659.25]; this._fl(c.currentTime,sc[Math.floor(Math.random()*sc.length)],2,D,.03); } b++; }; this.si = setInterval(s, 500); s(); }
  _electronic() { const D = this.D, c = this.cx, bt = 60/100, bl = [65.41,65.41,87.31,73.42]; let b = 0; const s = () => { if (!this.on) return; const n = c.currentTime; if (b%4===0) this._k(n,D); if (b%2===1) this._h(n,D,.015); if (b%4===0) this._fb(n,bl[Math.floor(b/4)%bl.length],bt*3.5,D,.08); if (b%16===0) [130.81,196,261.63].forEach(f => this._wp(n,f,bt*15,D,.018)); if (b%2===0 && Math.random()>.35) { const a = [523.25,659.25,783.99,1046.5]; this._ts(n,a[b%a.length],bt*.35,D,.012); } b++; }; this.si = setInterval(s, bt*1000); s(); }
  _piano() { const D = this.D, c = this.cx, m = [{f:523.25,d:1},{f:493.88,d:.6},{f:440,d:.8},{f:392,d:1.2},{f:349.23,d:.6},{f:329.63,d:.8},{f:293.66,d:1},{f:261.63,d:1.8},{f:0,d:1.2},{f:293.66,d:.8},{f:329.63,d:.6},{f:392,d:1},{f:440,d:.8},{f:493.88,d:.6},{f:523.25,d:1.8},{f:0,d:1.5},{f:440,d:.8},{f:392,d:1.2},{f:329.63,d:1.8},{f:0,d:1.2}]; let i = 0; const s = () => { if (!this.on) return; const {f,d} = m[i%m.length]; if (f > 0) { this._gp(c.currentTime,f,d*2.5,D,.09); if (i%6===0) this._gp(c.currentTime,f/2,d*3.5,D,.035); } i++; clearInterval(this.si); this.si = setInterval(s, (m[i%m.length]?.d||.8)*1000); }; this.si = setInterval(s, m[0].d*1000); s(); }
  _cafe() { const D = this.D, c = this.cx, bt = 60/88; this._bn(D,.07); const ch = [[146.83,174.61,220,261.63,349.23],[196,246.94,293.66,349.23,440],[130.81,196,246.94,329.63,493.88],[110,164.81,220,261.63,329.63]]; let b = 0; const s = () => { if (!this.on) return; const n = c.currentTime, ci = Math.floor(b/8)%ch.length; if (b%3===0) this._br(n,D,.06); if (b%4===3) this._br(n,D,.03); if (b%2===0) this._db(n,ch[ci][Math.floor(Math.random()*2)]/2,bt*1.8,D,.14); if (b%8===0) ch[ci].forEach(f => this._gp(n,f,bt*7,D,.04)); if (b%8===4 && Math.random()>.5) { const mel = [523.25,587.33,659.25,698.46]; this._gp(n,mel[Math.floor(Math.random()*mel.length)],bt*2,D,.035); } b++; }; this.si = setInterval(s, bt*1000); s(); }
  _binaural() { const D = this.D, c = this.cx; const oL = c.createOscillator(), gL = c.createGain(), pL = c.createStereoPanner(); oL.type = "sine"; oL.frequency.value = 200; gL.gain.value = .1; pL.pan.value = -1; oL.connect(gL).connect(pL).connect(this.mg); const oR = c.createOscillator(), gR = c.createGain(), pR = c.createStereoPanner(); oR.type = "sine"; oR.frequency.value = 216; gR.gain.value = .1; pR.pan.value = 1; oR.connect(gR).connect(pR).connect(this.mg); const dr = c.createOscillator(), drg = c.createGain(); dr.type = "sine"; dr.frequency.value = 100; drg.gain.value = 0; drg.gain.linearRampToValueAtTime(.025, c.currentTime+3); dr.connect(drg).connect(D); this._pn(D,.012); oL.start(); oR.start(); dr.start(); this.ns.push(oL,oR,dr,gL,gR,drg,pL,pR); }

  // ── Primitives ──
  _k(t,D){const c=this.cx,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(75,t);o.frequency.exponentialRampToValueAtTime(28,t+.15);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g).connect(D);o.start(t);o.stop(t+.4);this.ns.push(o)}
  _sn(t,D){const c=this.cx,bs=c.sampleRate*.12,b=c.createBuffer(1,bs,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(bs*.25))*.25;const s=c.createBufferSource();s.buffer=b;const g=c.createGain(),f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=3000;f.Q.value=.3;g.gain.value=.05;s.connect(f).connect(g).connect(D);s.start(t);this.ns.push(s)}
  _h(t,D,v=.015){const c=this.cx,bs=c.sampleRate*.035,b=c.createBuffer(1,bs,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(bs*.08));const s=c.createBufferSource();s.buffer=b;const g=c.createGain(),f=c.createBiquadFilter();f.type="highpass";f.frequency.value=9000;g.gain.value=v;s.connect(f).connect(g).connect(D);s.start(t);this.ns.push(s)}
  _br(t,D,v=.05){const c=this.cx,bs=c.sampleRate*.15,b=c.createBuffer(1,bs,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(bs*.4))*.6;const s=c.createBufferSource();s.buffer=b;const g=c.createGain(),f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=3000;f.Q.value=.25;g.gain.value=v;s.connect(f).connect(g).connect(D);s.start(t);this.ns.push(s)}
  _wp(t,fr,dur,D,v=.02){const c=this.cx,o1=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=1100;f.Q.value=.3;o1.type="sine";o2.type="sine";o1.frequency.value=fr;o2.frequency.value=fr*1.004;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+dur*.35);g.gain.linearRampToValueAtTime(v*.5,t+dur*.7);g.gain.linearRampToValueAtTime(0,t+dur);o1.connect(f);o2.connect(f);f.connect(g);g.connect(D);o1.start(t);o2.start(t);o1.stop(t+dur+.1);o2.stop(t+dur+.1);this.ns.push(o1,o2)}
  _db(t,fr,dur,D,v=.1){const c=this.cx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=280;o.type="triangle";o.frequency.value=fr;g.gain.setValueAtTime(v,t);g.gain.linearRampToValueAtTime(v*.4,t+dur*.3);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(f).connect(g).connect(D);o.start(t);o.stop(t+dur);this.ns.push(o)}
  _fb(t,fr,dur,D,v=.08){const c=this.cx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type="sawtooth";o.frequency.value=fr;f.type="lowpass";f.frequency.setValueAtTime(fr*4,t);f.frequency.exponentialRampToValueAtTime(fr*1.5,t+dur*.6);f.Q.value=1.5;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(f).connect(g).connect(D);o.start(t);o.stop(t+dur);this.ns.push(o)}
  _gp(t,fr,dur,D,v=.07){const c=this.cx,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=2400;o.type="triangle";o.frequency.value=fr;o2.type="sine";o2.frequency.value=fr*2.01;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(v*.35,t+.08);g.gain.exponentialRampToValueAtTime(v*.12,t+dur*.4);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(f);o2.connect(f);f.connect(g);g.connect(D);o.start(t);o2.start(t);o.stop(t+dur);o2.stop(t+dur);this.ns.push(o,o2)}
  _bl(t,fr,dur,D,v=.025){const c=this.cx,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=fr;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(D);o.start(t);o.stop(t+dur);this.ns.push(o)}
  _ts(t,fr,dur,D,v=.012){const c=this.cx,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=fr;g.gain.setValueAtTime(v,t);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g).connect(D);o.start(t);o.stop(t+dur+.01);this.ns.push(o)}
  _fl(t,fr,dur,D,v=.03){const c=this.cx,o=c.createOscillator(),g=c.createGain(),vb=c.createOscillator(),vg=c.createGain(),f=c.createBiquadFilter();o.type="sine";o.frequency.value=fr;f.type="lowpass";f.frequency.value=1800;vb.type="sine";vb.frequency.value=4.5;vg.gain.value=fr*.007;vb.connect(vg);vg.connect(o.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.25);g.gain.linearRampToValueAtTime(v*.6,t+dur*.6);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(f).connect(g).connect(D);o.start(t);vb.start(t);o.stop(t+dur);vb.stop(t+dur);this.ns.push(o,vb)}
  _bd(t,fr,dur,D,v=.04){const c=this.cx,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain();o.type="sine";o2.type="sine";o.frequency.setValueAtTime(fr,t);o.frequency.exponentialRampToValueAtTime(fr*1.4,t+dur*.2);o.frequency.exponentialRampToValueAtTime(fr*.8,t+dur);o2.frequency.setValueAtTime(fr*2,t);o2.frequency.exponentialRampToValueAtTime(fr*2.8,t+dur*.2);o2.frequency.exponentialRampToValueAtTime(fr*1.6,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.setValueAtTime(v*.8,t+dur*.3);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);o2.connect(g);g.connect(D);o.start(t);o2.start(t);o.stop(t+dur);o2.stop(t+dur);this.ns.push(o,o2)}
  _cr(D,v=.01){const c=this.cx,bs=2*c.sampleRate,b=c.createBuffer(1,bs,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++)d[i]=(Math.random()>.993?(Math.random()*2-1):0)+(Math.random()*2-1)*.002;const s=c.createBufferSource();s.buffer=b;s.loop=true;const g=c.createGain(),f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=2800;f.Q.value=.4;g.gain.value=v;s.connect(f).connect(g).connect(D);s.start();this.ns.push(s)}
  _pn(D,v=.04){const c=this.cx,bs=2*c.sampleRate,b=c.createBuffer(1,bs,c.sampleRate),d=b.getChannelData(0);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(let i=0;i<bs;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}const s=c.createBufferSource();s.buffer=b;s.loop=true;const g=c.createGain();g.gain.value=v;s.connect(g).connect(D);s.start();this.ns.push(s)}
  _bn(D,v=.06){const c=this.cx,bs=2*c.sampleRate,b=c.createBuffer(1,bs,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<bs;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}const s=c.createBufferSource();s.buffer=b;s.loop=true;const g=c.createGain(),f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=800;g.gain.value=v;s.connect(f).connect(g).connect(D);s.start();this.ns.push(s)}
  _wl(D,v=.025){const c=this.cx,bs=2*c.sampleRate,b=c.createBuffer(1,bs,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<bs;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*2+Math.sin(i/(c.sampleRate*4))*.05}const s=c.createBufferSource();s.buffer=b;s.loop=true;const g=c.createGain(),f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=650;g.gain.value=v;s.connect(f).connect(g).connect(D);s.start();this.ns.push(s)}

  // ── Ambient layers ──
  toggleAmb(id, freq) {
    this.init(); this.resume();
    if (this.an[id]) { try { this.an[id].s.stop(); } catch {} delete this.an[id]; return false; }
    const c = this.cx, bs = 2*c.sampleRate, b = c.createBuffer(1,bs,c.sampleRate), d = b.getChannelData(0);
    this._fa(d,bs,c.sampleRate,id);
    const s = c.createBufferSource(); s.buffer = b; s.loop = true;
    const g = c.createGain(); g.gain.value = .18;
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = freq; f.Q.value = .3;
    s.connect(f).connect(g).connect(c.destination); s.start();
    this.an[id] = { s, g }; return true;
  }
  setAV(id, v) { if (this.an[id]) this.an[id].g.gain.value = v; }
  _fa(d,bs,sr,t) {
    switch(t) {
      case "rain": for(let i=0;i<bs;i++){const x=i/sr;d[i]=(Math.random()*2-1)*(.2+.12*Math.sin(x*.3))*(.8+.2*Math.sin(x*.07))} break;
      case "stream": {let v=0;for(let i=0;i<bs;i++){v=(v+.04*(Math.random()*2-1))/1.04;d[i]=v*1.5+(Math.random()*2-1)*.08*Math.sin(i/(sr*2))}} break;
      case "ocean": for(let i=0;i<bs;i++){const x=i/sr;d[i]=(Math.random()*2-1)*.35*(.5+.5*Math.sin(x*.15))*(.7+.3*Math.sin(x*.04))} break;
      case "fire": for(let i=0;i<bs;i++){const cr=Math.random()>.97?(Math.random()*2-1)*.4:0;d[i]=(Math.random()*2-1)*(.12+.1*Math.sin(i/200)*Math.random())+cr} break;
      case "wind": {let v=0;for(let i=0;i<bs;i++){v=(v+.02*(Math.random()*2-1))/1.02;d[i]=v*2+Math.sin(i/(sr*5))*.04}} break;
      case "birds": {for(let i=0;i<bs;i++)d[i]=0;const nc=8+Math.floor(Math.random()*8);for(let c=0;c<nc;c++){const st=Math.floor(Math.random()*(bs-sr*.15)),cl=Math.floor(sr*(.05+Math.random()*.1)),bf=2000+Math.random()*2500,sw=(Math.random()-.5)*2000,vl=.08+Math.random()*.12;for(let j=0;j<cl&&st+j<bs;j++){const tt=j/sr,env=Math.sin(Math.PI*j/cl),fr=bf+sw*(j/cl);d[st+j]+=Math.sin(2*Math.PI*fr*tt)*env*vl}}} break;
      case "crickets": for(let i=0;i<bs;i++){const x=i/sr;const c1=Math.sin(2*Math.PI*3200*x)*.08,c2=Math.sin(2*Math.PI*3800*x)*.05;const p1=(x*10%1)<.3?1:0,p2=((x*8+.5)%1)<.25?1:0;const md=.6+.4*Math.sin(x*.8);d[i]=(c1*p1+c2*p2)*md} break;
      case "cafe": for(let i=0;i<bs;i++){const mm=(Math.random()*2-1)*.15*(.5+.5*Math.sin(i/(sr*5)));const cl=Math.random()>.999?Math.sin(i/sr*6000)*.1*Math.exp(-(i%200)/30):0;d[i]=mm+cl} break;
      default: for(let i=0;i<bs;i++)d[i]=Math.random()*2-1;
    }
  }
  destroy() { this.stop(); this.stopBreathe(); Object.values(this.an).forEach(n => { try { n.s.stop(); } catch {} }); this.an = {}; if (this.cx) this.cx.close(); }
}

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const CHANNELS = [
  { id:"lofi", name:"Lo-fi beats", icon:"🎧", desc:"72 BPM · jazz chords · vinyl crackle", info:"Research: 70-85 BPM matches resting heart rate. Vinyl crackle = stochastic resonance (OHSU 2024, g=0.249)." },
  { id:"ambient", name:"432Hz Ambient", icon:"🌊", desc:"Evolving drones · slow LFO modulation", info:"Research: Slowly evolving drones prevent habituation. LFO modulation keeps auditory cortex mildly engaged." },
  { id:"classical", name:"Classical", icon:"🎻", desc:"Satie-inspired · simple arpeggios", info:"Research: Predictable structure, low cognitive load. Medium-tempo instrumental supports focus." },
  { id:"nature", name:"Nature + Pink noise", icon:"🌿", desc:"Pink noise · birdsong · wind · flute", info:"Research: Pink noise — OHSU 2024 meta-analysis: significant ADHD benefit (k=13, N=335, g=0.249)." },
  { id:"electronic", name:"Deep focus", icon:"⚡", desc:"100 BPM · filtered synths · sub-bass", info:"Research: Steady rhythmic pulse provides temporal structure ADHD brains often lack internally." },
  { id:"piano", name:"Solo piano", icon:"🎹", desc:"Contemplative · slow · deliberate silences", info:"Research: Northwestern lab: music engagement strengthens prefrontal-auditory connections ADHD compromises." },
  { id:"cafe", name:"Cafe jazz", icon:"☕", desc:"Jazz chords · brown noise · brushed drums", info:"Research: Moderate Brain Arousal model: ADHD brains need more stimulation for optimal arousal." },
  { id:"binaural", name:"Beta binaural", icon:"🧠", desc:"16Hz beta entrainment · headphones required", info:"Research: 2020 Frontiers: beta binaural beats improved sustained attention in ADHD adults. Headphones required." },
];

const AMBIENTS = [
  { id:"rain", name:"Gentle rain", icon:"🌧️", freq:2200, desc:"Natural pink noise" },
  { id:"stream", name:"Forest stream", icon:"💧", freq:3000, desc:"Flowing water" },
  { id:"ocean", name:"Ocean waves", icon:"🌊", freq:1200, desc:"Natural brown noise" },
  { id:"fire", name:"Fireplace", icon:"🔥", freq:2800, desc:"Warm crackling" },
  { id:"wind", name:"Soft wind", icon:"🍃", freq:700, desc:"Gentle breeze" },
  { id:"birds", name:"Birdsong", icon:"🐦", freq:6000, desc:"Sporadic chirps" },
  { id:"crickets", name:"Night crickets", icon:"🦗", freq:7000, desc:"Natural rhythm" },
  { id:"cafe", name:"Cafe murmur", icon:"☕", freq:2200, desc:"Optimal arousal" },
];

const PRESETS = [
  { name:"Deep work", icon:"🎯", ch:"lofi", amb:["ocean"], desc:"Lo-fi + ocean waves" },
  { name:"Reading", icon:"📖", ch:"nature", amb:["rain"], desc:"Pink noise + rain" },
  { name:"Creative", icon:"🎨", ch:"ambient", amb:["cafe"], desc:"432Hz + cafe murmur" },
  { name:"Intense", icon:"⚡", ch:"binaural", amb:[], desc:"Beta binaural (headphones!)" },
];

const TIMER_PRESETS = [15, 25, 30, 45, 60, 90, 120];
const RATING_MSGS = ["","Rough — you showed up.","Getting there — small wins.","Solid focus!","Great session!","Peak performance!"];

const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function HeadphonePopup({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300" onClick={() => onClose()}>
      <div className="bg-white rounded-3xl p-10 max-w-md w-[90%] shadow-2xl text-center transform transition-all duration-500 scale-100" onClick={e => e.stopPropagation()}>
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-5 text-4xl animate-pulse">🎧</div>
        <h2 className="text-2xl font-light mb-2" style={{ fontFamily:"'Fraunces',serif" }}>Use headphones</h2>
        <p className="text-sm text-stone-500 leading-relaxed mb-1">For the best focus experience, we recommend headphones or earbuds.</p>
        <p className="text-xs text-stone-400 leading-relaxed mb-5">Our audio uses spatial separation, binaural beats, and subtle frequency layers that work best with direct ear delivery.</p>
        <div className="flex gap-2.5 mb-6">
          {[{i:"🧠",t:"Binaural beats\nrequire stereo"},{i:"🔇",t:"Blocks external\ndistractions"},{i:"🎵",t:"Hear every\nsubtle layer"}].map((f,i) => (
            <div key={i} className="flex-1 bg-stone-50 rounded-xl p-3 text-center hover:-translate-y-0.5 transition-transform">
              <span className="text-xl block mb-1">{f.i}</span>
              <span className="text-[11px] text-stone-400 leading-tight whitespace-pre-line">{f.t}</span>
            </div>
          ))}
        </div>
        <button onClick={() => onClose()} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors cursor-pointer">I have headphones on</button>
        <button onClick={() => onClose()} className="mt-2.5 text-sm text-stone-400 hover:text-stone-600 transition-colors cursor-pointer bg-transparent border-none">Continue without headphones</button>
      </div>
    </div>
  );
}

function CanvasVisualizer({ active }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const cx = cv.getContext("2d"); let id;
    const resize = () => { cv.width = cv.offsetWidth * 2; cv.height = 144; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      const w = cv.width, h = cv.height; cx.clearRect(0,0,w,h);
      const bars = 56, bw = w/bars, t = Date.now()/1000;
      for (let i = 0; i < bars; i++) {
        const x = i*bw;
        let bh = active ? ((Math.sin(t*1.8+i*.12)*.3+.5) + Math.random()*.25) * (1 - Math.abs(i-bars/2)/(bars/2)) * h*.65 : 1.5;
        const grad = cx.createLinearGradient(x,h,x,h-bh);
        grad.addColorStop(0,"rgba(99,102,241,.35)"); grad.addColorStop(.5,"rgba(129,140,248,.15)"); grad.addColorStop(1,"rgba(20,184,166,.05)");
        cx.fillStyle = grad; cx.beginPath(); cx.roundRect(x+1,h-bh,bw-2,bh,2); cx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, [active]);
  return <canvas ref={ref} className="w-full rounded-xl mb-3.5" style={{ height: 72 }} />;
}

function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const cx = cv.getContext("2d"); let W, H;
    const ps = Array.from({ length: 30 }, () => ({ x: Math.random()*2000, y: Math.random()*2000, r: Math.random()*1.2+.4, dx: (Math.random()-.5)*.12, dy: (Math.random()-.5)*.1, o: Math.random()*.12+.03 }));
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    let id;
    const draw = () => {
      cx.clearRect(0,0,W,H);
      ps.forEach(p => { p.x += p.dx; p.y += p.dy; if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0; cx.beginPath(); cx.arc(p.x,p.y,p.r,0,Math.PI*2); cx.fillStyle=`rgba(99,102,241,${p.o})`; cx.fill(); });
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
}

function FocusTimer({ onComplete }) {
  const [pre, setPre] = useState(25);
  const [sec, setSec] = useState(25*60);
  const [run, setRun] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (run && sec > 0) { ref.current = setInterval(() => setSec(p => { if (p <= 1) { clearInterval(ref.current); setRun(false); onComplete?.(); return 0; } return p-1; }), 1000); }
    return () => clearInterval(ref.current);
  }, [run, onComplete]);
  const pick = (m) => { setPre(m); setSec(m*60); setRun(false); clearInterval(ref.current); };
  const prog = 1 - sec/(pre*60);
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-7 mb-7 shadow-sm">
      <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />Focus timer</p>
      <div className="flex justify-center mb-5">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" style={{ filter:"drop-shadow(0 0 8px rgba(99,102,241,.15))" }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#f5f5f4" strokeWidth="2" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray={`${prog*276.46} 276.46`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-light tracking-wider tabular-nums" style={{ fontFamily:"'Fraunces',serif" }}>{fmt(sec)}</span>
            <span className="text-xs text-stone-400 mt-1">{run ? "Focusing..." : sec === 0 ? "Session complete!" : "Ready"}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {TIMER_PRESETS.map(m => <button key={m} onClick={() => pick(m)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${pre === m ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-stone-500 border-stone-200 hover:border-indigo-400"}`}>{m} min</button>)}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { if(sec<=0) setSec(pre*60); setRun(p => !p); }} className="px-7 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 cursor-pointer transition-all active:scale-95">{run ? "Pause" : sec === 0 ? "Restart" : "Start focus"}</button>
        <button onClick={() => { setRun(false); clearInterval(ref.current); setSec(pre*60); }} className="px-7 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:border-indigo-400 cursor-pointer transition-all">Reset</button>
      </div>
    </div>
  );
}

function RatingCard({ show, onSubmit }) {
  const [r, setR] = useState(0);
  const [done, setDone] = useState(false);
  if (!show) return null;
  const cls = ["","bg-red-400","bg-orange-400","bg-yellow-400","bg-green-500","bg-indigo-500"];
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-7 mb-7 shadow-sm">
      <p className="text-center font-medium mb-4">How productive was this session?</p>
      <div className="flex justify-center gap-2 mb-3">
        {[1,2,3,4,5].map(v => <button key={v} onClick={() => !done && setR(v)} className={`w-12 h-12 rounded-xl border text-xl transition-all cursor-pointer ${r>=v ? `${cls[v]} text-white border-transparent` : "border-stone-200 hover:border-stone-400 hover:scale-110"}`}>★</button>)}
      </div>
      <p className="text-center text-sm text-stone-500 min-h-[1.25rem] mb-3">{done ? "Saved! Every session is progress." : RATING_MSGS[r]}</p>
      {!done && <button onClick={() => { if(r>0){setDone(true);onSubmit?.(r)} }} disabled={r===0} className="block mx-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 cursor-pointer">Save rating</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function FocusMusic() {
  const engine = useRef(new SoothingEngine());
  const [channel, setChannel] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [amb, setAmb] = useState({});
  const [breathe, setBreathe] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showHP, setShowHP] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const ch = useMemo(() => CHANNELS.find(c => c.id === channel), [channel]);

  const doSelect = useCallback((id, presetAmb) => {
    setChannel(id); setPlaying(true);
    engine.current.play(id);
    if (presetAmb) {
      Object.keys(amb).forEach(aid => engine.current.toggleAmb(aid, 0));
      const newAmb = {};
      presetAmb.forEach(aid => { const a = AMBIENTS.find(x => x.id === aid); if(a) { engine.current.toggleAmb(aid, a.freq); newAmb[aid] = { v: .18 }; } });
      setAmb(newAmb);
    }
  }, [amb]);

  const selectChannel = useCallback((id) => {
    setShowHP(true); setPendingAction({ type: "channel", id });
  }, []);

  const applyPreset = useCallback((i) => {
    const p = PRESETS[i];
    setShowHP(true); setPendingAction({ type: "preset", ch: p.ch, amb: p.amb });
  }, []);

  const closeHP = useCallback(() => {
    setShowHP(false);
    if (pendingAction) {
      if (pendingAction.type === "channel") doSelect(pendingAction.id);
      else if (pendingAction.type === "preset") doSelect(pendingAction.ch, pendingAction.amb);
      setPendingAction(null);
    }
  }, [pendingAction, doSelect]);

  const togglePlay = useCallback(() => {
    if (!channel) { selectChannel("lofi"); return; }
    if (playing) { engine.current.stop(); setPlaying(false); }
    else { engine.current.play(channel); setPlaying(true); }
  }, [channel, playing, selectChannel]);

  const toggleAmb = useCallback((id, freq) => {
    const on = engine.current.toggleAmb(id, freq);
    setAmb(p => { const n = {...p}; if(on) n[id] = {v:.18}; else delete n[id]; return n; });
  }, []);

  const toggleBreathe = useCallback(() => {
    setBreathe(p => {
      if (!p) engine.current.startBreathe(); else engine.current.stopBreathe();
      return !p;
    });
  }, []);

  useEffect(() => { engine.current.vol(volume/100); }, [volume]);
  useEffect(() => () => engine.current.destroy(), []);

  return (
    <div className="min-h-screen bg-stone-50 relative">
      <Particles />
      <HeadphonePopup show={showHP} onClose={closeHP} />

      <div className="relative z-10 max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-10 animate-[fadeUp_.7s_ease_forwards]">
          <h1 className="text-4xl font-light tracking-tight mb-1.5" style={{ fontFamily:"'Fraunces',serif" }}>Focus sounds</h1>
          <p className="text-stone-400 text-sm leading-relaxed max-w-lg">Neuroscience-backed audio for ADHD focus. Breathing entrainment, research-grounded sound design, and adaptive mixing.</p>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />Quick start</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => applyPreset(i)} className="bg-white border border-stone-200/60 rounded-2xl p-4 text-left cursor-pointer transition-all hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100/50">
                <span className="text-xl block mb-1.5">{p.icon}</span>
                <span className="text-sm font-medium block">{p.name}</span>
                <span className="text-xs text-stone-400 block mt-0.5">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="mb-7">
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />Channels</p>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => selectChannel(c.id)} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all cursor-pointer hover:-translate-y-0.5 ${channel === c.id ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-stone-500 border-stone-200 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md hover:shadow-indigo-50"}`}>
                <span className="text-base">{c.icon}</span>{c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Player */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-7 mb-7 shadow-sm relative overflow-hidden">
          {breathe && <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full border-2 border-teal-300 animate-pulse pointer-events-none opacity-20" />}
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-all ${playing ? "bg-indigo-50" : "bg-stone-100"}`}>{ch?.icon || "🎵"}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base">{ch?.name || "Select a channel or preset"}</p>
              <p className="text-sm text-stone-400">{ch?.desc || "8 research-backed focus audio modes"}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {ch && <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${playing ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>{playing ? "Now playing" : "Paused"}</span>}
                {breathe && <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700">Breathing guide</span>}
              </div>
            </div>
          </div>

          <CanvasVisualizer active={playing} />

          <div className="flex items-center justify-center gap-4 mb-5 relative z-10">
            <button onClick={toggleBreathe} className={`w-11 h-11 rounded-full border flex items-center justify-center text-base transition-all cursor-pointer ${breathe ? "border-teal-400 text-teal-600 bg-teal-50" : "border-stone-200 text-stone-400 bg-white hover:border-teal-400"}`} title="Breathing guide">🫁</button>
            <button onClick={togglePlay} className="w-[72px] h-[72px] rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-200 active:scale-95">{playing ? "⏸" : "▶"}</button>
            <div className="w-11 h-11" />
          </div>

          <div className="flex items-center gap-3 px-2 relative z-10">
            <span className="text-sm text-stone-400">🔈</span>
            <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(+e.target.value)} className="flex-1 h-1 appearance-none rounded-full bg-stone-200 accent-indigo-500 cursor-pointer" />
            <span className="text-sm text-stone-400">🔊</span>
          </div>

          {ch && <div className="mt-4 p-4 rounded-xl bg-indigo-50 text-sm text-indigo-800/80 leading-relaxed relative z-10"><strong>Research:</strong> {ch.info.replace("Research: ","")}</div>}
        </div>

        {/* Ambient */}
        <div className="mb-7">
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />Ambient layers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {AMBIENTS.map(a => {
              const on = !!amb[a.id];
              return (
                <div key={a.id} className={`rounded-2xl border p-4 text-center transition-all cursor-pointer ${on ? "border-teal-400 bg-teal-50" : "border-stone-200/60 bg-white hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md hover:shadow-teal-50"}`}>
                  <div onClick={() => toggleAmb(a.id, a.freq)}>
                    <span className="text-2xl block mb-1">{a.icon}</span>
                    <span className={`text-xs font-medium block ${on ? "text-teal-700" : "text-stone-600"}`}>{a.name}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{a.desc}</span>
                  </div>
                  {on && <input type="range" min="0" max="100" value={Math.round((amb[a.id]?.v||.18)*100)} onChange={e => { const v = +e.target.value/100; engine.current.setAV(a.id, v); setAmb(p => ({...p,[a.id]:{v}})); }} onClick={e => e.stopPropagation()} className="w-full h-1 mt-3 appearance-none rounded-full bg-teal-200 accent-teal-500 cursor-pointer" />}
                </div>
              );
            })}
          </div>
        </div>

        <FocusTimer onComplete={() => setShowRating(true)} />
        <RatingCard show={showRating} onSubmit={r => console.log("Rating:", r)} />

        <p className="text-center text-[11px] text-stone-300 mt-10 leading-relaxed">Based on OHSU 2024 meta-analysis · Frontiers in Psychology 2020 · Northwestern Auditory Neuroscience Lab<br/>All audio synthesized in real-time · Zero external files</p>
      </div>
    </div>
  );
}
