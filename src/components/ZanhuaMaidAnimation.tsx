import {useEffect,useRef} from 'react';
import {assetPath} from '../game/assets.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import {maidMotionDuration,maidMotionPose,maidFanPoint,maidSkinChannels} from '../game/zanhuaMaidMotionV2.ts';
import type {SceneViewport} from './ScrollScene.tsx';

const patch={x:3480,y:360,width:710,height:1018},pad=96;
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const handOutlines=[
 [[72,535],[78,522],[100,520],[116,530],[126,553],[115,579],[98,590],[79,584],[70,565]],
 [[271,339],[281,326],[299,324],[306,342],[304,363],[301,388],[303,408],[285,423],[273,404],[271,382]]
];
function surface(){const c=document.createElement('canvas');c.width=patch.width;c.height=patch.height;return c;}
function registeredImage(image:HTMLImageElement,tint=false){
 const c=surface(),ctx=c.getContext('2d')!;ctx.drawImage(image,0,0,c.width,c.height);
 if(tint){const pixels=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<pixels.data.length;i+=4){pixels.data[i]*=.8;pixels.data[i+1]*=.87;pixels.data[i+2]*=.74;}ctx.putImageData(pixels,0,0);}
 return c;
}
function preparePlate(plate:HTMLImageElement,painting:HTMLImageElement,body:HTMLCanvasElement,fan:HTMLCanvasElement){
 const c=registeredImage(plate),ctx=c.getContext('2d')!,reference=surface(),ref=reference.getContext('2d')!;
 ref.drawImage(painting,patch.x,patch.y,patch.width,patch.height,0,0,patch.width,patch.height);
 // Match the undisturbed silk beside the figure. The original painting stays untouched.
 const sample=[[20,100],[35,430],[680,400],[680,850]],gain=[0,0,0];
 sample.forEach(([x,y])=>{const a=ref.getImageData(x,y,5,5).data,b=ctx.getImageData(x,y,5,5).data;for(let ch=0;ch<3;ch++){let s=0,t=0;for(let i=ch;i<a.length;i+=4){s+=a[i];t+=b[i];}gain[ch]+=s/Math.max(1,t)/sample.length;}});
 const pixels=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<pixels.data.length;i+=4)for(let ch=0;ch<3;ch++)pixels.data[i+ch]*=gain[ch];ctx.putImageData(pixels,0,0);
 const mask=surface(),m=mask.getContext('2d')!;
 // Cover the old silhouette and its fine outline, not a rectangular area of silk.
 for(let y=-12;y<=12;y+=4)for(let x=-12;x<=12;x+=4)if(x*x+y*y<=144){m.drawImage(body,x,y);m.drawImage(fan,x,y);}
 ctx.globalCompositeOperation='destination-in';ctx.filter='blur(1px)';ctx.drawImage(mask,0,0);
 return c;
}
function handsInFront(body:HTMLCanvasElement){
 const c=surface(),ctx=c.getContext('2d')!;ctx.beginPath();
 handOutlines.forEach(points=>{points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();});
 ctx.clip();ctx.drawImage(body,0,0);return c;
}

/** Two independent layers, registered to the original painting and linked at both hands. */
export function ZanhuaMaidAnimation({viewport,onDone}:{viewport:SceneViewport;onDone:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),done=useRef(onDone);done.current=onDone;
 useEffect(()=>{
  const output=canvas.current;
  if(!output||matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  const gl=output.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true});
  if(!gl){done.current();return;}
  let stopped=false,raf=0,start:number|undefined;
  const resources:{buffers:WebGLBuffer[];textures:WebGLTexture[];programs:WebGLProgram[];shaders:WebGLShader[]}={buffers:[],textures:[],programs:[],shaders:[]};
  const finish=()=>{if(stopped)return;stopped=true;cancelAnimationFrame(raf);done.current();};
  const timeout=window.setTimeout(finish,10000);
  const lost=(event:Event)=>{event.preventDefault();finish();};output.addEventListener('webglcontextlost',lost);
  const load=(src:string)=>{const image=new Image();image.src=src;return image.decode().then(()=>image);};
  const base='art/zanhua/animation/maid-rig-v1/';
  Promise.all([load(assetPath(base+'maid-body-registered.png')),load(assetPath(base+'fan-registered.png')),load(assetPath(base+'clean-plate.jpg')),load(zanhuaImage)]).then(([bodyImage,fanImage,plate,painting])=>{
   if(stopped)return;window.clearTimeout(timeout);
   const body=registeredImage(bodyImage,true),fan=registeredImage(fanImage,true);
   const shader=(kind:number,source:string)=>{const value=gl.createShader(kind)!;resources.shaders.push(value);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS))throw Error('Maid shader unavailable');return value;};
   const program=gl.createProgram()!;resources.programs.push(program);
   gl.attachShader(program,shader(gl.VERTEX_SHADER,`
    attribute vec2 a_position; attribute vec2 a_uv;
    attribute vec4 a_torso; attribute vec2 a_cloth; attribute vec4 a_bones;
    uniform vec2 u_size; uniform float u_skinned;
    uniform mat3 u_torso; uniform mat3 u_head; uniform mat3 u_fan;
    uniform mat3 u_lower_upper; uniform mat3 u_lower_fore; uniform mat3 u_raised_upper; uniform mat3 u_raised_fore;
    uniform vec2 u_cloth_lower; uniform vec2 u_cloth_raised;
    varying vec2 v_uv;
    void main(){
     vec3 p=vec3(a_position,1.0); vec2 q=p.xy;
     if(u_skinned>0.5){
      q=a_torso.x*p.xy+a_torso.y*((u_torso*p).xy-p.xy)+a_torso.z*((u_head*p).xy-p.xy)+a_torso.w*(u_fan*p).xy;
      q+=a_bones.x*(u_lower_upper*p).xy+a_bones.y*(u_lower_fore*p).xy+a_bones.z*(u_raised_upper*p).xy+a_bones.w*(u_raised_fore*p).xy;
      q+=a_cloth.x*u_cloth_lower+a_cloth.y*u_cloth_raised;
     }
     q=(q+vec2(${pad}.0))/u_size;
     gl_Position=vec4(q.x*2.0-1.0,1.0-q.y*2.0,0,1); v_uv=a_uv;
    }`));
   gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D u_image;varying vec2 v_uv;void main(){gl_FragColor=texture2D(u_image,v_uv);}'));
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Maid program unavailable');gl.useProgram(program);
   const position=gl.getAttribLocation(program,'a_position'),uv=gl.getAttribLocation(program,'a_uv');
   const skinAttributes=['a_torso','a_cloth','a_bones'].map(name=>gl.getAttribLocation(program,name));
   const skinned=gl.getUniformLocation(program,'u_skinned');
   const matrixNames=['u_torso','u_head','u_fan','u_lower_upper','u_lower_fore','u_raised_upper','u_raised_fore'];
   const matrices=matrixNames.map(name=>gl.getUniformLocation(program,name));
   const clothLocations=['u_cloth_lower','u_cloth_raised'].map(name=>gl.getUniformLocation(program,name));
   gl.uniform2f(gl.getUniformLocation(program,'u_size'),output.width,output.height);
   const texture=(image:HTMLCanvasElement)=>{const t=gl.createTexture()!;resources.textures.push(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
   const buffer=(data:Float32Array|Uint16Array,target:number=gl.ARRAY_BUFFER,dynamic=false)=>{const value=gl.createBuffer()!;resources.buffers.push(value);gl.bindBuffer(target,value);gl.bufferData(target,data,dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);return value;};
   const cols=71,rows=102,points:Array<{x:number;y:number}>=[],coords:number[]=[],indices:number[]=[];
   for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){points.push({x:x/cols*patch.width,y:y/rows*patch.height});coords.push(x/cols,y/rows);}
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*(cols+1)+x;indices.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);}
   const mesh=buffer(new Float32Array(points.flatMap(p=>[p.x,p.y]))),texcoords=buffer(new Float32Array(coords)),triangles=buffer(new Uint16Array(indices),gl.ELEMENT_ARRAY_BUFFER);
   const skin=points.map(p=>maidSkinChannels(p.x,p.y));
   const skinBuffers=[buffer(new Float32Array(skin.flatMap(s=>s.torso))),buffer(new Float32Array(skin.flatMap(s=>s.cloth))),buffer(new Float32Array(skin.flatMap(s=>s.bones)))];
   const corners=[{x:0,y:0},{x:patch.width,y:0},{x:0,y:patch.height},{x:patch.width,y:patch.height}];
   const quadVertices=new Float32Array(corners.flatMap(p=>[p.x,p.y]));
   const fixedQuad=buffer(quadVertices),fanQuad=buffer(new Float32Array(8),gl.ARRAY_BUFFER,true),quadUV=buffer(new Float32Array([0,0,1,0,0,1,1,1])),quadTriangles=buffer(new Uint16Array([0,1,2,1,3,2]),gl.ELEMENT_ARRAY_BUFFER);
   const bodyTexture=texture(body),fanTexture=texture(fan),handsTexture=texture(handsInFront(body)),plateTexture=texture(preparePlate(plate,painting,body,fan));
   const draw=(p:WebGLBuffer,t:WebGLBuffer,i:WebGLBuffer,image:WebGLTexture,count:number,isBody=false)=>{
    gl.uniform1f(skinned,isBody?1:0);
    skinAttributes.forEach((attribute,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,skinBuffers[i]);gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,i===1?2:4,gl.FLOAT,false,0,0);});
    gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,t);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,i);gl.bindTexture(gl.TEXTURE_2D,image);gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);
   };
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.viewport(0,0,output.width,output.height);gl.clearColor(0,0,0,0);
   const paint=(now:number)=>{
    if(stopped)return;start??=now;const time=now-start;
    if(time>=maidMotionDuration){finish();return;}
    const pose=maidMotionPose(time);
    output.dataset.motionStage=time<1250?'turn':time<2850?'lift':time<6000?'fan':'return';
    const values=[pose.torso,pose.head,pose.fan,pose.arms[0].upper,pose.arms[0].fore,pose.arms[1].upper,pose.arms[1].fore];
    values.forEach((m,i)=>gl.uniformMatrix3fv(matrices[i],false,new Float32Array([m.a,m.b,0,m.c,m.d,0,m.tx,m.ty,1])));
    pose.cloth.forEach((q,i)=>gl.uniform2f(clothLocations[i],q.x,q.y));
    corners.forEach((p,i)=>{const q=maidFanPoint(p.x,p.y,pose);quadVertices[i*2]=q.x;quadVertices[i*2+1]=q.y;});
    gl.bindBuffer(gl.ARRAY_BUFFER,fanQuad);gl.bufferSubData(gl.ARRAY_BUFFER,0,quadVertices);
    gl.clear(gl.COLOR_BUFFER_BIT);
    output.style.opacity=String(smooth(time/550)*smooth((maidMotionDuration-time)/550));
    draw(fixedQuad,quadUV,quadTriangles,plateTexture,6);
    draw(mesh,texcoords,triangles,bodyTexture,indices.length,true);
    draw(fanQuad,quadUV,quadTriangles,fanTexture,6);
    draw(mesh,texcoords,triangles,handsTexture,indices.length,true);
    raf=requestAnimationFrame(paint);
   };raf=requestAnimationFrame(paint);
  }).catch(finish);
  return()=>{stopped=true;cancelAnimationFrame(raf);window.clearTimeout(timeout);output.removeEventListener('webglcontextlost',lost);resources.buffers.forEach(b=>gl.deleteBuffer(b));resources.textures.forEach(t=>gl.deleteTexture(t));resources.programs.forEach(p=>gl.deleteProgram(p));resources.shaders.forEach(s=>gl.deleteShader(s));};
 },[]);
 const {view}=viewport;
 return <div className="zanhua-dog-animation" role="status" aria-label="執扇侍女在原畫中轉身、抬扇搧風的遊戲演繹">
  <canvas ref={canvas} className="zanhua-maid-in-painting" width={patch.width+pad*2} height={patch.height+pad*2}
   style={{opacity:0,transform:`translate(${view.x+(patch.x-pad)*view.scale}px,${view.y+(patch.y-pad)*view.scale}px) scale(${view.scale})`}} aria-hidden="true"/>
 </div>;
}
