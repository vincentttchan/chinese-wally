// Perimeters authored against original native pixels, never generated animation silhouettes.
let hitFeedbackTimer=0;
function clearHitFeedback(){clearTimeout(hitFeedbackTimer);$('hit-feedback')?.remove();$('layout').classList.remove('has-hit-feedback');}
function hitShapeForPerson(person){
 const path=hitContourPaths[person.id];
 if(path)return path;
 return null;
}
function hitShapeForObject(object){return object.polygon?{polygon:object.polygon}:null;}
function feedbackForDetail(detail){
 const figure=chapter.people.find(p=>(p.head&&p.head.every((n,i)=>n===detail.box[i]))||p.box.every((n,i)=>n===detail.box[i]));
 if(figure)return hitShapeForPerson(figure);
 const object=chapter.objects.find(o=>objectBox(o).every((n,i)=>n===detail.box[i]));
 return object?hitShapeForObject(object):null;
}
function showHitFeedback(shape){
 if(state.source!=='native'||!shape)return;
 clearHitFeedback();
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.id='hit-feedback';svg.classList.add('chapter-hit-feedback');svg.setAttribute('viewBox','0 0 '+chapter.width+' '+chapter.height);svg.setAttribute('width',chapter.width);svg.setAttribute('height',chapter.height);svg.setAttribute('aria-hidden','true');
 const make=()=>{
  let node;
  if(shape.d){node=document.createElementNS(ns,'path');node.setAttribute('d',shape.d);if(shape.transform)node.setAttribute('transform',shape.transform);}
  else if(shape.polygon){node=document.createElementNS(ns,'polygon');node.setAttribute('points',shape.polygon.map(p=>p.join(',')).join(' '));}
  else return null;
  node.setAttribute('vector-effect','non-scaling-stroke');return node;
 };
 const glow=make();if(!glow)return;glow.classList.add('hit-glow');const edge=make();edge.classList.add('hit-edge');svg.append(glow,edge);world.append(svg);$('layout').classList.add('has-hit-feedback');
 hitFeedbackTimer=setTimeout(clearHitFeedback,reduced.matches?1100:1900);
}
