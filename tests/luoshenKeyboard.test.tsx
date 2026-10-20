import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {LuoshenNote} from '../src/components/LuoshenPanels.tsx';
test('ending observation returns keyboard focus to the note when its next action appears',async()=>{
 const window=new Window();for(const [key,value] of Object.entries({window,document:window.document,navigator:window.navigator,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,configurable:true});
 const el=window.document.createElement('div');window.document.body.append(el);const root=createRoot(el as unknown as HTMLElement);
 const render=async(seen:boolean,busy=false)=>act(async()=>root.render(<LuoshenNote viewport={{view:{x:0,y:0,scale:1},frame:{width:390,height:844}}} label="回到岸邊 · 1／3" title="回到岸邊" compact folded={false} onFold={()=>{}} busy={busy} primaryAction={seen?<button>繼續</button>:undefined}><p>{seen?'冠髮與鬚貌依然可認。':'看看岸邊的曹植。'}</p><button>靠近看</button></LuoshenNote>));
 try{await render(false);const note=el.querySelector('section')!;assert.equal(window.document.activeElement,note);(el.querySelector('button')! as unknown as HTMLElement).focus();await render(true);assert.equal(window.document.activeElement,note);await render(true,true);assert.ok(note.hasAttribute('inert'));await render(true,false);assert.equal(window.document.activeElement,note);}finally{await act(async()=>root.unmount());await window.happyDOM.abort();}
});
