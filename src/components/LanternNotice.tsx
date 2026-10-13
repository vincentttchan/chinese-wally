import {lanternJournalAtlas,lanternJournalItems} from '../game/lanternCollection.ts';
import '../lantern-feedback.css';

export function LanternNotice({text,detail,findingId,quiet=false,duration}:{text:string;detail?:string;findingId?:string;quiet?:boolean;duration?:number}) {
  const item=findingId?lanternJournalItems[findingId]:undefined;
  return <aside className={`lantern-feedback-notice ${quiet?'is-quiet':''}`} style={{animationDuration:`${duration??(quiet?2000:3600)}ms`}} role="status" aria-live="polite" aria-atomic="true">
    {item&&<span className="feedback-illustration" aria-hidden="true"><img src={lanternJournalAtlas} alt="" style={{left:`${-(item.index%3)*100}%`,top:`${-Math.floor(item.index/3)*100}%`}}/></span>}
    <div><p>{text}</p>{detail&&<span>{detail}</span>}</div>
  </aside>;
}
