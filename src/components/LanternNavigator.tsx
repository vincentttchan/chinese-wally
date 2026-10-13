import { lanternFullScroll } from '../game/lanternFestival.ts';

export function LanternNavigator({window, onNavigate, image=lanternFullScroll, stops=[{x:.10,label:'第三庭院'},{x:.65,label:'第二庭院'},{x:.94,label:'第一庭院'}]}: {window: {left: number; width: number}; onNavigate: (x: number) => void; image?:string;stops?:{x:number;label:string}[]}) {
  const center = Math.max(0, Math.min(1, window.left + window.width / 2));
  return <nav className="lantern-navigator" aria-label="畫卷導覽">
    <div className="lantern-navigator-strip">
      <img src={image} alt="" draggable={false}/>
      <span className="lantern-navigator-window" style={{left: `${window.left * 100}%`, width: `${window.width * 100}%`}}/>
      <input type="range" min="0" max="1000" step="1" value={Math.round(center * 1000)} aria-label="移動畫卷位置" aria-valuetext={`由左至右，畫卷位置 ${Math.round(center * 100)}%`} onChange={event => onNavigate(Number(event.target.value) / 1000)}/>
    </div>
    <div className="lantern-navigator-courts">
      {stops.map(stop=><button key={stop.label} onClick={() => onNavigate(stop.x)}>{stop.label}</button>)}
    </div>
  </nav>;
}
