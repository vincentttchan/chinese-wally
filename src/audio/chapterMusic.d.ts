export type SoundState='off'|'loading'|'on'|'error';
export type ChapterMusic={toggle:()=>Promise<void>;setQuiet:(quiet:boolean)=>void;dispose:()=>void};
export function createChapterMusic(url:string,onState:(state:SoundState)=>void,initialQuiet?:boolean):ChapterMusic;
