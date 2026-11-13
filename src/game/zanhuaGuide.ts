export type GuideFlags=Partial<Record<'drag'|'focus'|'find'|'zoom'|'journal',boolean>>;
export const zanhuaGuideKey='chinese-wally:zanhua:play-guide:v1';
export function guideStep(flags:GuideFlags,state:{searching:boolean;studying:boolean;hasDog:boolean;found:boolean}){
 if(state.searching&&!flags.drag)return 'drag';
 if(state.searching&&!flags.focus)return 'focus';
 if(state.hasDog&&!flags.journal)return 'journal';
 if(state.studying&&!flags.zoom)return 'zoom';
 if(state.searching&&!state.found&&!flags.find)return 'find';
 return null;
}
