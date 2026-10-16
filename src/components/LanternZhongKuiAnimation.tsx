import {useEffect,useId,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternSize} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import {lanternZhongKuiPoseRegistration as registration} from '../game/lanternZhongKuiPoseRegistration.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-acrobat.css';

const tile=lanternScrollPlacement.find(item=>item.number===11)!;
const background=assetPath('art/animations/lantern-zhongkui/background-v2.png');
const sources=registration.map(person=>assetPath(`art/animations/lantern-zhongkui/${person.id}-poses-${person.id==='staff'?'v3':'v2'}.png`));
const outlines=['M805 968 L858 966 L876 997 L869 1021 L888 1042 L896 1088 L891 1163 L875 1200 L879 1232 L857 1241 L829 1237 L816 1251 L796 1244 L790 1221 L783 1182 L765 1150 L753 1114 L762 1084 L765 1054 L779 1025 L798 1016 Z','M767 1100 L757 1114 L751 1145 L759 1182 L779 1203 L787 1190 L773 1167 L765 1143 L776 1110 Z',
'M649 930 L680 947 L695 980 L721 983 L727 1014 L741 1044 L748 1086 L730 1107 L735 1149 L714 1179 L661 1178 L649 1139 L633 1091 L627 1063 L640 1029 L660 1014 L655 983 Z',
'M652 1123 L694 1122 L716 1136 L722 1156 L752 1166 L749 1185 L720 1194 L705 1220 L721 1257 L715 1281 L684 1276 L665 1299 L645 1296 L629 1286 L636 1265 L651 1252 L637 1227 L615 1215 L620 1197 L628 1171 L643 1154 Z',
'M970 899 L982 900 L987 1234 L966 1242 L966 1172 L945 1206 L946 1238 L927 1245 L903 1235 L898 1215 L905 1181 L886 1157 L882 1116 L894 1083 L910 1070 L915 1044 L934 1032 L954 1040 L960 1066 L964 1040 L957 1022 L936 1031 L909 1027 L887 1014 L880 983 L886 964 L905 994 L927 1004 L946 996 L956 977 L965 973 Z'];
const frameAt=(elapsed:number,personId:string)=>{
  const t=elapsed-(personId==='front'?400:personId==='staff'?650:personId==='rear'?200:0);
  return t<650?0:t<1550?1:t<2900?2:t<3850?3:0;
};

export function LanternZhongKuiAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const id=useId().replace(/:/g,'');
  const [elapsed,setElapsed]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started:number|undefined;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,12000);
    const tick=(now:number)=>{
      if(!live)return;started??=now;const t=now-started,duration=reduced?1000:5600;
      if(t>=duration){live=false;done.current();return;}
      setElapsed(t);setOpacity(reduced?0:Math.min(1,t/200,(duration-t)/220));raf=requestAnimationFrame(tick);
    };
    const images=[background,...sources].map(src=>{const image=new Image();image.onload=()=>{if(live&&++loaded===sources.length+1){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};image.onerror=fail;image.src=src;return image;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(image=>{image.onload=null;image.onerror=null;});};
  },[reduced]);
  const h=tile.matrix,projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
  const {view}=viewport;
  const layers=[1,3,0,2];
  return <div className="lantern-acrobat-animation" role="status" aria-label="鍾馗情景演繹正在播放" data-phase={elapsed<1850?'opening':elapsed<3000?'response':'returning'} style={{opacity}}>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <svg width={tile.sourceWidth} height={tile.sourceHeight} style={{position:'absolute',inset:0,overflow:'visible'}} aria-hidden="true">
          <defs>
            <filter id={`${id}-feather`} x="-15%" y="-15%" width="130%" height="130%"><feMorphology operator="dilate" radius="2"/><feGaussianBlur stdDeviation="1.7"/></filter>
            <filter id={`${id}-edge`}><feMorphology in="SourceAlpha" operator="erode" radius="1.2" result="core"/><feComposite in="SourceGraphic" in2="core" operator="in"/></filter>
            <mask id={`${id}-repair`} maskUnits="userSpaceOnUse" x="600" y="880" width="410" height="440"><g fill="white" filter={`url(#${id}-feather)`}>{outlines.map((d,i)=><path key={i} d={d}/>)}</g></mask>
          </defs>
          <image href={background} width={tile.sourceWidth} height={tile.sourceHeight} preserveAspectRatio="none" mask={`url(#${id}-repair)`}/>
          {layers.map(index=>{
            const person=registration[index],frame=frameAt(elapsed,person.id),anchor=person.frames[frame];
            return <svg key={person.id} x={person.x-anchor.x*person.scaleX} y={person.y-anchor.y*person.scaleY} width={person.slotWidth*person.scaleX} height={person.height*person.scaleY} viewBox={`${frame*person.slotWidth} 0 ${person.slotWidth} ${person.height}`} preserveAspectRatio="none" overflow="hidden">
              <image href={sources[index]} width={person.width} height={person.height} filter={`url(#${id}-edge)`}/>
            </svg>;
          })}
        </svg>
      </div>
    </div>
    <p className="lantern-acrobat-caption">畫中情景演繹 · 鍾馗提袖，小鬼相應</p>
  </div>;
}
