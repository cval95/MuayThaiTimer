import { Audio } from 'expo-av';

let bellStart: Audio.Sound | null = null;
let bellEnd: Audio.Sound | null = null;
let beepSound: Audio.Sound | null = null;

export async function loadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const [bs, be, bp] = await Promise.all([
      Audio.Sound.createAsync(require('../../assets/bell-start.wav')),
      Audio.Sound.createAsync(require('../../assets/bell-end.wav')),
      Audio.Sound.createAsync(require('../../assets/beep.wav')),
    ]);
    bellStart = bs.sound;
    bellEnd = be.sound;
    beepSound = bp.sound;
  } catch (_) {}
}

async function play(sound: Audio.Sound | null): Promise<void> {
  try {
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (_) {}
}

export const playBellStart = () => play(bellStart);
export const playBellEnd = () => play(bellEnd);
export const playBeep = () => play(beepSound);

export async function unloadSounds(): Promise<void> {
  try {
    await Promise.all([
      bellStart?.unloadAsync(),
      bellEnd?.unloadAsync(),
      beepSound?.unloadAsync(),
    ]);
    bellStart = null;
    bellEnd = null;
    beepSound = null;
  } catch (_) {}
}
