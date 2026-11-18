// OSRS sound effects: decode a synth from the game cache (index 4) and render it the way the game client does,
// as signed 8-bit samples at 22050 Hz. Ported from the client's SoundEffect, Instrument, SoundEnvelope and AudioFilter,
// keeping Java's int and float arithmetic so the output matches the game.
const OsrsSynth = (() => {
  const RATE = 22050;
  const fr = Math.fround;
  // Java's (int) cast of a double: truncate, saturate
  const toInt = d => d !== d ? 0 : d >= 2147483647 ? 2147483647 : d <= -2147483648 ? -2147483648 : Math.trunc(d);
  // (int)((long)a * (long)b >> 16)
  const mulShr16 = (a, b) => Math.floor(a * b / 65536) | 0;

  // the client's noise table is java.util.Random(0).nextInt() & 2, minus 1; its sine table has 32768 steps
  const NOISE = new Int32Array(32768), SINE = new Int32Array(32768);
  {
    const MASK = (1n << 48n) - 1n;
    let seed = 0x5DEECE66Dn & MASK;
    for (let i = 0; i < 32768; i++) {
      seed = (seed * 0x5DEECE66Dn + 0xBn) & MASK;
      NOISE[i] = (Number(seed >> 16n) & 2) - 1;
      SINE[i] = toInt(Math.sin(i / 5215.1903) * 16384);
    }
  }

  function reader(b) {
    let p = 0;
    return {
      g1: () => b[p++],
      g2: () => (b[p++] << 8) | b[p++],
      g4: () => (b[p++] << 24) | (b[p++] << 16) | (b[p++] << 8) | b[p++],
      usmart: () => b[p] < 128 ? b[p++] : ((b[p++] << 8) | b[p++]) - 32768,
      smart: () => b[p] < 128 ? b[p++] - 64 : ((b[p++] << 8) | b[p++]) - 49152,
      peek: () => b[p],
    };
  }

  /* ---------- envelopes ---------- */
  function envelope(r) {
    const e = { form: 0, start: 0, end: 0, segments: 2, durations: [0, 65535], phases: [0, 65535], ticks: 0, index: 0, step: 0, amp: 0, max: 0 };
    if (r) { e.form = r.g1(); e.start = r.g4(); e.end = r.g4(); segments(e, r); }
    return e;
  }
  function segments(e, r) {
    e.segments = r.g1();
    e.durations = []; e.phases = [];
    for (let i = 0; i < e.segments; i++) { e.durations.push(r.g2()); e.phases.push(r.g2()); }
  }
  function reset(e) { e.ticks = 0; e.index = 0; e.step = 0; e.amp = 0; e.max = 0; }
  function step(e, n) {
    if (e.max >= e.ticks) {
      e.amp = e.phases[e.index++] << 15;
      if (e.index >= e.segments) e.index = e.segments - 1;
      e.ticks = toInt(e.durations[e.index] / 65536 * n);
      if (e.ticks > e.max) e.step = toInt(((e.phases[e.index] << 15) - e.amp) / (e.ticks - e.max));
    }
    e.amp = (e.amp + e.step) | 0;
    e.max++;
    return (e.amp - e.step) >> 15;
  }

  /* ---------- filter: two pole/zero sets swept by an envelope ---------- */
  const coef = [new Float64Array(32), new Float64Array(32)], coefInt = [new Int32Array(32), new Int32Array(32)];
  let fwd = 0, fwdInt = 0;
  const grid = () => [[new Int32Array(16), new Int32Array(16)], [new Int32Array(16), new Int32Array(16)]];
  function filter(r, env) {
    const f = { pairs: [0, 0], unity: [0, 0], phases: grid(), mags: grid() };
    const b = r.g1();
    f.pairs[0] = b >> 4; f.pairs[1] = b & 15;
    if (b === 0) return f;
    f.unity[0] = r.g2(); f.unity[1] = r.g2();
    const moving = r.g1();
    for (let d = 0; d < 2; d++) for (let i = 0; i < f.pairs[d]; i++) { f.phases[d][0][i] = r.g2(); f.mags[d][0][i] = r.g2(); }
    for (let d = 0; d < 2; d++) for (let i = 0; i < f.pairs[d]; i++) {
      if (moving & (1 << (d * 4) << i)) { f.phases[d][1][i] = r.g2(); f.mags[d][1][i] = r.g2(); }
      else { f.phases[d][1][i] = f.phases[d][0][i]; f.mags[d][1][i] = f.mags[d][0][i]; }
    }
    if (moving !== 0 || f.unity[1] !== f.unity[0]) segments(env, r);
    return f;
  }
  function magnitude(f, d, i, t) {
    const m = fr(fr(f.mags[d][0][i] + fr(t * (f.mags[d][1][i] - f.mags[d][0][i]))) * fr(0.0015258789));
    return fr(1 - fr(Math.pow(10, fr(-m / 20))));
  }
  function phase(f, d, i, t) {
    const p = fr(fr(f.phases[d][0][i] + fr(t * (f.phases[d][1][i] - f.phases[d][0][i]))) * fr(1.2207031e-4));
    return fr(fr(fr(32.703197) * fr(Math.pow(2, p))) * fr(3.1415927) / 11025);
  }
  function compute(f, d, t) {
    if (d === 0) {
      const u = fr(fr(f.unity[0] + fr((f.unity[1] - f.unity[0]) * t)) * fr(0.0030517578));
      fwd = fr(Math.pow(0.1, fr(u / 20)));
      fwdInt = toInt(fwd * 65536);
    }
    const n = f.pairs[d];
    if (n === 0) return 0;
    const c = coef[d];
    let m = magnitude(f, d, 0, t);
    c[0] = fr(fr(-2 * m) * fr(Math.cos(phase(f, d, 0, t))));
    c[1] = fr(m * m);
    for (let i = 1; i < n; i++) {
      m = magnitude(f, d, i, t);
      const a = fr(fr(-2 * m) * fr(Math.cos(phase(f, d, i, t)))), b = fr(m * m);
      c[i * 2 + 1] = fr(c[i * 2 - 1] * b);
      c[i * 2] = fr(fr(c[i * 2 - 1] * a) + fr(c[i * 2 - 2] * b));
      for (let k = i * 2 - 1; k >= 2; k--) c[k] = fr(c[k] + fr(fr(c[k - 1] * a) + fr(c[k - 2] * b)));
      c[1] = fr(c[1] + fr(fr(c[0] * a) + b));
      c[0] = fr(c[0] + a);
    }
    if (d === 0) for (let k = 0; k < n * 2; k++) c[k] = fr(c[k] * fwd);
    for (let k = 0; k < n * 2; k++) coefInt[d][k] = toInt(c[k] * 65536);
    return n * 2;
  }

  /* ---------- instruments ---------- */
  function instrument(r) {
    const t = { pitch: envelope(r), volume: envelope(r), pitchMod: null, pitchModAmp: null, volMod: null, volModAmp: null, release: null, attack: null };
    if (r.peek() !== 0) { t.pitchMod = envelope(r); t.pitchModAmp = envelope(r); } else r.g1();
    if (r.peek() !== 0) { t.volMod = envelope(r); t.volModAmp = envelope(r); } else r.g1();
    if (r.peek() !== 0) { t.release = envelope(r); t.attack = envelope(r); } else r.g1();
    t.osc = [];
    for (let i = 0; i < 10; i++) {
      const vol = r.usmart();
      if (vol === 0) break;
      t.osc.push({ vol, pitch: r.smart(), delay: r.usmart() });
    }
    t.delayTime = r.usmart(); t.delayDecay = r.usmart();
    t.duration = r.g2(); t.offset = r.g2();
    t.filterEnv = envelope(null);
    t.filter = filter(r, t.filterEnv);
    return t;
  }

  function wave(ph, amp, form) {
    if (form === 1) return (ph & 32767) < 16384 ? amp : -amp;
    if (form === 2) return Math.imul(SINE[ph & 32767], amp) >> 14;
    if (form === 3) return (Math.imul(amp, ph & 32767) >> 14) - amp;
    if (form === 4) return Math.imul(amp, NOISE[((ph / 2607) | 0) & 32767]);
    return 0;
  }

  // one instrument: n samples over ms milliseconds, as 16-bit ints
  function synthesize(t, n, ms) {
    const S = new Int32Array(n);
    if (ms < 10) return S;
    const spm = n / ms;
    reset(t.pitch); reset(t.volume);
    let pmStep = 0, pmBase = 0, pmPhase = 0, vmStep = 0, vmBase = 0, vmPhase = 0;
    if (t.pitchMod) {
      reset(t.pitchMod); reset(t.pitchModAmp);
      pmStep = toInt((t.pitchMod.end - t.pitchMod.start) * 32.768 / spm);
      pmBase = toInt(t.pitchMod.start * 32.768 / spm);
    }
    if (t.volMod) {
      reset(t.volMod); reset(t.volModAmp);
      vmStep = toInt((t.volMod.end - t.volMod.start) * 32.768 / spm);
      vmBase = toInt(t.volMod.start * 32.768 / spm);
    }
    const o = t.osc.map(h => ({
      phase: 0,
      delay: toInt(h.delay * spm),
      vol: ((h.vol << 14) / 100) | 0,
      pitchStep: toInt((t.pitch.end - t.pitch.start) * 32.768 * Math.pow(1.0057929410678534, h.pitch) / spm),
      pitchBase: toInt(t.pitch.start * 32.768 / spm),
    }));
    for (let i = 0; i < n; i++) {
      let pitch = step(t.pitch, n), vol = step(t.volume, n);
      if (t.pitchMod) {
        const rate = step(t.pitchMod, n), amp = step(t.pitchModAmp, n);
        pitch = (pitch + (wave(pmPhase, amp, t.pitchMod.form) >> 1)) | 0;
        pmPhase = (pmPhase + pmBase + (Math.imul(rate, pmStep) >> 16)) | 0;
      }
      if (t.volMod) {
        const rate = step(t.volMod, n), amp = step(t.volModAmp, n);
        vol = Math.imul(vol, (wave(vmPhase, amp, t.volMod.form) >> 1) + 32768) >> 15;
        vmPhase = (vmPhase + vmBase + (Math.imul(rate, vmStep) >> 16)) | 0;
      }
      for (const h of o) {
        const at = h.delay + i;
        if (at < n) {
          S[at] += wave(h.phase, Math.imul(vol, h.vol) >> 15, t.pitch.form);
          h.phase = (h.phase + (Math.imul(pitch, h.pitchStep) >> 16) + h.pitchBase) | 0;
        }
      }
    }
    // gating: alternate silence and sound at rates set by the release and attack envelopes
    if (t.release) {
      reset(t.release); reset(t.attack);
      let count = 0, muted = true;
      for (let i = 0; i < n; i++) {
        const rv = step(t.release, n), av = step(t.attack, n);
        const thr = (Math.imul(muted ? rv : av, t.release.end - t.release.start) >> 8) + t.release.start;
        count += 256;
        if (count >= thr) { count = 0; muted = !muted; }
        if (muted) S[i] = 0;
      }
    }
    // echo
    if (t.delayTime > 0 && t.delayDecay > 0) {
      const d = toInt(t.delayTime * spm);
      for (let i = d; i < n; i++) S[i] = (S[i] + ((Math.imul(S[i - d], t.delayDecay) / 100) | 0)) | 0;
    }
    if (t.filter.pairs[0] > 0 || t.filter.pairs[1] > 0) applyFilter(t, S, n);
    for (let i = 0; i < n; i++) S[i] = S[i] < -32768 ? -32768 : S[i] > 32767 ? 32767 : S[i];
    return S;
  }

  function applyFilter(t, S, n) {
    const f = t.filter, env = t.filterEnv;
    reset(env);
    let e = step(env, n + 1);
    let ff = compute(f, 0, e / 65536), fb = compute(f, 1, e / 65536);
    if (n < ff + fb) return;
    const C0 = coefInt[0], C1 = coefInt[1];
    let i = 0, lim = Math.min(fb, n - ff);
    for (; i < lim; i++) {
      let acc = mulShr16(S[i + ff], fwdInt);
      for (let k = 0; k < ff; k++) acc += mulShr16(S[i + ff - 1 - k], C0[k]);
      for (let k = 0; k < i; k++) acc -= mulShr16(S[i - 1 - k], C1[k]);
      S[i] = acc | 0;
      e = step(env, n + 1);
    }
    lim = 128;
    for (;;) {
      if (lim > n - ff) lim = n - ff;
      for (; i < lim; i++) {
        let acc = mulShr16(S[i + ff], fwdInt);
        for (let k = 0; k < ff; k++) acc += mulShr16(S[i + ff - 1 - k], C0[k]);
        for (let k = 0; k < fb; k++) acc -= mulShr16(S[i - 1 - k], C1[k]);
        S[i] = acc | 0;
        e = step(env, n + 1);
      }
      if (i >= n - ff) {
        for (; i < n; i++) {
          let acc = 0;
          for (let k = i + ff - n; k < ff; k++) acc += mulShr16(S[i + ff - 1 - k], C0[k]);
          for (let k = 0; k < fb; k++) acc -= mulShr16(S[i - 1 - k], C1[k]);
          S[i] = acc | 0;
          step(env, n + 1);
        }
        return;
      }
      ff = compute(f, 0, e / 65536);
      fb = compute(f, 1, e / 65536);
      lim += 128;
    }
  }

  /* ---------- sound effects: up to 10 instruments mixed to 8-bit ---------- */
  function decode(bytes) {
    const r = reader(bytes);
    const instruments = [];
    for (let i = 0; i < 10; i++) {
      if (r.peek() !== 0) instruments.push(instrument(r));
      else r.g1();
    }
    return { instruments, loopStart: r.g2(), loopEnd: r.g2() };
  }

  function render(bytes) {
    const fx = typeof bytes.instruments === 'object' ? bytes : decode(bytes);
    let ms = 0;
    for (const t of fx.instruments) ms = Math.max(ms, t.duration + t.offset);
    const out = new Int8Array(toInt(ms * RATE / 1000));
    for (const t of fx.instruments) {
      const n = toInt(t.duration * RATE / 1000), off = toInt(t.offset * RATE / 1000);
      const s = synthesize(t, n, t.duration);
      for (let i = 0; i < n; i++) {
        let v = (s[i] >> 8) + out[i + off];
        if (((v + 128) & -256) !== 0) v = (v >> 31) ^ 127;
        out[i + off] = v;
      }
    }
    return out;
  }

  return { RATE, decode, render };
})();
if (typeof module !== 'undefined') module.exports = OsrsSynth;
