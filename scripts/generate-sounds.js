#!/usr/bin/env node
/**
 * Generates synthetic bell/beep WAV files for the Muay Thai Timer.
 * Run: node scripts/generate-sounds.js
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;

function buildWav(samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);           // PCM chunk size
  buf.writeUInt16LE(1, 20);            // PCM format
  buf.writeUInt16LE(1, 22);            // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);            // block align
  buf.writeUInt16LE(16, 34);           // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buf;
}

// Boxing bell: sharp metallic "ding" with inharmonic partials
function bellStart() {
  const duration = 1.8;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Three partials with different decay rates (bell formant)
    out[i] =
      0.55 * Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 3.2) +
      0.30 * Math.sin(2 * Math.PI * 1320 * t) * Math.exp(-t * 5.0) +
      0.15 * Math.sin(2 * Math.PI * 2420 * t) * Math.exp(-t * 8.0);
  }
  return buildWav(out);
}

// Round-end bell: slightly lower, double strike
function bellEnd() {
  const duration = 2.2;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(n);
  const strikeAt = [0, 0.32]; // two hits
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    for (const offset of strikeAt) {
      const dt = t - offset;
      if (dt < 0) continue;
      s +=
        0.50 * Math.sin(2 * Math.PI * 660 * dt) * Math.exp(-dt * 3.5) +
        0.28 * Math.sin(2 * Math.PI * 990 * dt) * Math.exp(-dt * 5.5) +
        0.22 * Math.sin(2 * Math.PI * 1760 * dt) * Math.exp(-dt * 9.0);
    }
    out[i] = s * 0.65;
  }
  return buildWav(out);
}

// Short countdown beep: clean 1200 Hz with fast envelope
function beep() {
  const duration = 0.09;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Hann window for clean click-free beep
    const env = 0.5 * (1 - Math.cos(2 * Math.PI * t / duration));
    out[i] = 0.85 * Math.sin(2 * Math.PI * 1200 * t) * env;
  }
  return buildWav(out);
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.writeFileSync(path.join(assetsDir, 'bell-start.wav'), bellStart());
fs.writeFileSync(path.join(assetsDir, 'bell-end.wav'), bellEnd());
fs.writeFileSync(path.join(assetsDir, 'beep.wav'), beep());
console.log('Generated: assets/bell-start.wav, bell-end.wav, beep.wav');
