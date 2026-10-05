import { level, witnesses } from './level.ts';

export type GameState = {
  phase: 'intro' | 'exploring' | 'complete';
  clues: string[];
  feedback: 'need-clues' | 'mismatch' | null;
};
export type GameAction = { type: 'start' | 'restart' | 'dismiss-feedback' } | { type: 'inspect'; id: string };
export const createGame = (): GameState => ({ phase: 'intro', clues: [], feedback: null });
export function reduceGame(state: GameState, action: GameAction): GameState {
  if (action.type === 'restart' || action.type === 'start') {
    return { phase: 'exploring', clues: [], feedback: null };
  }
  if (action.type === 'dismiss-feedback') return { ...state, feedback: null };
  if (state.phase !== 'exploring' || action.type !== 'inspect') return state;
  const actor = level.actors.find(item => item.id === action.id);
  if (!actor) return state;
  if (actor.kind === 'witness') {
    return { ...state, clues: state.clues.includes(action.id) ? state.clues : [...state.clues, action.id], feedback: null };
  }
  if (state.clues.length < witnesses.length) return { ...state, feedback: 'need-clues' };
  if (actor.kind === 'target') return { ...state, phase: 'complete', feedback: null };
  return { ...state, feedback: 'mismatch' };
}
