import {useEffect,useRef} from 'react';
import {assetPath} from '../game/assets.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import {zanhuaMaidDuration,zanhuaMaidPerformance,zanhuaMaidPoint,zanhuaMaidWeights} from '../game/zanhuaMaidPerformance.ts';
import type {SceneViewport} from './ScrollScene.tsx';

const patch={x:3480,y:360,width:710,height:1018},pad=96;
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
// The approved full figure defines the silhouette; original pigments preserve its finish.
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
  const timeout=window.setTimeout(finish,8000);
  const lost=(event:Event)=>{event.preventDefault();finish();};output.addEventListener('webglcontextlost',lost);
  const load=(src:string)=>{const image=new Image();image.src=src;return image.decode().then(()=>image);};
  Promise.all([load(zanhuaImage),load(assetPath('art/zanhua/animation/P3-maid-study-v1.png')),load(assetPath('art/zanhua/animation/P4-full-background-v1.png'))]).then(([original,study,silk])=>{
   if(stopped)return;window.clearTimeout(timeout);
   const surface=()=>{const c=document.createElement('canvas');c.width=patch.width;c.height=patch.height;return c;};
   const mask=surface(),m=mask.getContext('2d')!;m.drawImage(study,0,0,patch.width,patch.height);
   const sprite=surface(),s=sprite.getContext('2d')!;
   s.drawImage(original,patch.x,patch.y,patch.width,patch.height,0,0,patch.width,patch.height);
   s.globalCompositeOperation='destination-in';s.drawImage(mask,0,0);
   const repair=surface(),r=repair.getContext('2d')!;
   r.drawImage(silk,20,400,864,1238,0,0,patch.width,patch.height);
   // Match neighbouring silk and expose the clean plate only under the old figure.
   const sample=surface(),sampleContext=sample.getContext('2d')!;
   sampleContext.drawImage(original,patch.x,patch.y,patch.width,patch.height,0,0,patch.width,patch.height);
   const a=sampleContext.getImageData(500,400,180,540).data,b=r.getImageData(500,400,180,540).data;
   const sums=[0,0,0],base=[0,0,0];
   for(let i=0;i<a.length;i+=16)for(let c=0;c<3;c++){sums[c]+=a[i+c];base[c]+=b[i+c];}
   const gain=sums.map((v,c)=>Math.max(.8,Math.min(1.2,v/base[c]))),pixels=r.getImageData(0,0,patch.width,patch.height);
   for(let i=0;i<pixels.data.length;i+=4)for(let c=0;c<3;c++)pixels.data[i+c]*=gain[c];
   r.putImageData(pixels,0,0);
   const erase=surface(),e=erase.getContext('2d')!;
   for(const [x,y] of [[-2,0],[2,0],[0,-2],[0,2],[0,0]])e.drawImage(mask,x,y);
   r.globalCompositeOperation='destination-in';r.filter='blur(1px)';r.drawImage(erase,0,0);r.filter='none';
   const shader=(kind:number,source:string)=>{const value=gl.createShader(kind)!;resources.shaders.push(value);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS))throw Error('Maid shader unavailable');return value;};
   const program=gl.createProgram()!;resources.programs.push(program);
   gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 a_position;attribute vec2 a_uv;uniform vec2 u_size;varying vec2 v_uv;void main(){vec2 p=a_position/u_size;gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0,1);v_uv=a_uv;}'));
   gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D u_image;uniform float u_opacity;varying vec2 v_uv;void main(){gl_FragColor=texture2D(u_image,v_uv)*u_opacity;}'));
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Maid program unavailable');gl.useProgram(program);
   const position=gl.getAttribLocation(program,'a_position'),uv=gl.getAttribLocation(program,'a_uv');
   gl.uniform2f(gl.getUniformLocation(program,'u_size'),output.width,output.height);
   const opacity=gl.getUniformLocation(program,'u_opacity');
   const texture=(image:HTMLCanvasElement)=>{const t=gl.createTexture()!;resources.textures.push(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
   const buffer=(data:Float32Array|Uint16Array,target:number=gl.ARRAY_BUFFER,dynamic=false)=>{const value=gl.createBuffer()!;resources.buffers.push(value);gl.bindBuffer(target,value);gl.bufferData(target,data,dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);return value;};
   const cols=51,rows=73,points:Array<{x:number;y:number;weights:ReturnType<typeof zanhuaMaidWeights>}>=[],coords:number[]=[],indices:number[]=[];
   for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const px=x/cols*patch.width,py=y/rows*patch.height;points.push({x:px,y:py,weights:zanhuaMaidWeights(px,py)});coords.push(x/cols,y/rows);}
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*(cols+1)+x;indices.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);}
   const vertices=new Float32Array(points.length*2),mesh=buffer(vertices,gl.ARRAY_BUFFER,true),texcoords=buffer(new Float32Array(coords)),triangles=buffer(new Uint16Array(indices),gl.ELEMENT_ARRAY_BUFFER);
   const quad=buffer(new Float32Array([pad,pad,pad+patch.width,pad,pad,pad+patch.height,pad+patch.width,pad+patch.height]));
   const quadUV=buffer(new Float32Array([0,0,1,0,0,1,1,1])),quadIndices=buffer(new Uint16Array([0,1,2,1,3,2]),gl.ELEMENT_ARRAY_BUFFER);
   const figureTexture=texture(sprite),silkTexture=texture(repair);
   const bind=(p:WebGLBuffer,t:WebGLBuffer,i:WebGLBuffer,image:WebGLTexture)=>{
    gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,t);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,i);gl.bindTexture(gl.TEXTURE_2D,image);
   };
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.viewport(0,0,output.width,output.height);gl.clearColor(0,0,0,0);
   const paint=(now:number)=>{
    if(stopped)return;start??=now;const time=now-start;
    if(time>=zanhuaMaidDuration){finish();return;}
    const pose=zanhuaMaidPerformance(time);
    output.dataset.motionStage=time<1200?'turn':time<2400?'lift':time<4650?'fan':'return';
    points.forEach((p,i)=>{const q=zanhuaMaidPoint(p.x,p.y,pose,p.weights);vertices[i*2]=q.x+pad;vertices[i*2+1]=q.y+pad;});
    gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(opacity,smooth(time/300)*smooth((zanhuaMaidDuration-time)/350));
    bind(quad,quadUV,quadIndices,silkTexture);gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh);gl.bufferSubData(gl.ARRAY_BUFFER,0,vertices);
    bind(mesh,texcoords,triangles,figureTexture);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    raf=requestAnimationFrame(paint);
   };raf=requestAnimationFrame(paint);
  }).catch(finish);
  return()=>{stopped=true;cancelAnimationFrame(raf);window.clearTimeout(timeout);output.removeEventListener('webglcontextlost',lost);resources.buffers.forEach(b=>gl.deleteBuffer(b));resources.textures.forEach(t=>gl.deleteTexture(t));resources.programs.forEach(p=>gl.deleteProgram(p));resources.shaders.forEach(s=>gl.deleteShader(s));};
 },[]);
 const {view}=viewport;
 return <div className="zanhua-dog-animation" role="status" aria-label="執扇侍女原位轉身、抬扇搧風的遊戲演繹">
  <canvas ref={canvas} className="zanhua-maid-in-painting" width={patch.width+pad*2} height={patch.height+pad*2}
   style={{transform:`translate(${view.x+(patch.x-pad)*view.scale}px,${view.y+(patch.y-pad)*view.scale}px) scale(${view.scale})`}} aria-hidden="true"/>
 </div>;
}
