import { evidenceId, getEvidenceActors, isEvidence, level } from './level.ts';
import type { GameLevel } from './level.ts';

export type GameState = {
  phase: 'intro' | 'exploring' | 'complete';
  clues: string[];
  feedback: 'need-clues' | 'mismatch' | null;
};
export type GameAction = { type: 'start' | 'restart' | 'dismiss-feedback' } | { type: 'inspect'; id: string };
export const createGame = (): GameState => ({ phase: 'intro', clues: [], feedback: null });
export function reduceGame(state: GameState, action: GameAction): GameState {
  return reduceGameForLevel(state, action, level);
}

export function reduceGameForLevel(state: GameState, action: GameAction, scene: GameLevel): GameState {
  if (action.type === 'restart' || action.type === 'start') {
    return { phase: 'exploring', clues: [], feedback: null };
  }
  if (action.type === 'dismiss-feedback') return { ...state, feedback: null };
  if (state.phase !== 'exploring' || action.type !== 'inspect') return state;
  const actor = scene.actors.find(item => item.id === action.id);
  if (!actor) return state;
  if (isEvidence(actor)) {
    const id = evidenceId(actor);
    return { ...state, clues: state.clues.includes(id) ? state.clues : [...state.clues, id], feedback: null };
  }
  if (getEvidenceActors(scene).some(item => !state.clues.includes(item.id))) return { ...state, feedback: 'need-clues' };
  if (actor.kind === 'target') return { ...state, phase: 'complete', feedback: null };
  return { ...state, feedback: 'mismatch' };
}
