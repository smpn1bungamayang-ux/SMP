import { useState, useEffect } from 'react';
import { sound, AudioSettingsState } from '../utils/audio';

export function useAudioState(): AudioSettingsState {
  const [state, setState] = useState<AudioSettingsState>(() => sound.getState());

  useEffect(() => {
    const unsubscribe = sound.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return state;
}
