import { lanternTargets } from './lanternFestival.ts';

export type LanternState = {phase: 'intro' | 'searching' | 'found' | 'complete'; index: number; found: string[]; help: number; wrong: boolean};
export const initialLanternState: LanternState = {phase: 'intro', index: 0, found: [], help: 0, wrong: false};
type Action = {type: 'begin' | 'next' | 'help' | 'clear-wrong' | 'restart'} | {type: 'inspect'; id: string};
export function lanternReducer(state: LanternState, action: Action): LanternState {
  if (action.type === 'restart') return {...initialLanternState, phase: 'searching'};
  if (action.type === 'begin' && state.phase === 'intro') return {...state, phase: 'searching'};
  if (action.type === 'clear-wrong') return {...state, wrong: false};
  if (action.type === 'next' && state.phase === 'found') return state.index === lanternTargets.length - 1
    ? {...state, phase: 'complete'} : {...state, phase: 'searching', index: state.index + 1, help: 0, wrong: false};
  if (state.phase !== 'searching') return state;
  if (action.type === 'help') return {...state, help: Math.min(3, state.help + 1)};
  if (action.type === 'inspect') return action.id === lanternTargets[state.index].id
    ? {...state, phase: 'found', found: [...state.found, action.id], wrong: false}
    : {...state, wrong: true};
  return state;
}
