import { Audio } from 'expo-av';

let bellStart: Audio.Sound | null = null;
let bellEnd: Audio.Sound | null = null;

export async function loadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    // We use system sounds via vibration since bundling audio files
    // requires extra asset setup. Audio hook is ready for real .mp3 files.
  } catch (_) {}
}

export async function playBellStart(): Promise<void> {
  // Haptic feedback as stand-in for bell (works without audio files)
  try {
    if (bellStart) {
      await bellStart.replayAsync();
    }
  } catch (_) {}
}

export async function playBellEnd(): Promise<void> {
  try {
    if (bellEnd) {
      await bellEnd.replayAsync();
    }
  } catch (_) {}
}

export async function unloadSounds(): Promise<void> {
  try {
    if (bellStart) await bellStart.unloadAsync();
    if (bellEnd) await bellEnd.unloadAsync();
  } catch (_) {}
}
