/** The highlight follows the PNG alpha; no estimated scene contour is used. */
export function LuoshenElementArt({src,label,lit=false,onError}:{src:string;label:string;lit?:boolean;onError?:()=>void}){
 return <svg className="luoshen-element-art" viewBox="0 0 1024 1536" role="img" aria-label={label} style={{display:'block',width:'100%',height:'100%',overflow:'visible',filter:lit?'drop-shadow(1px 0 0 #f5d477) drop-shadow(-1px 0 0 #f5d477) drop-shadow(0 1px 0 #f5d477) drop-shadow(0 -1px 0 #f5d477) drop-shadow(0 0 5px #e8bd53)':undefined}}><image href={src} width="1024" height="1536" preserveAspectRatio="xMidYMid meet" onError={onError}/></svg>;
}
