
/** Split each silhouette row so exposed edges borrow neighbouring silk from the same original. */
export function zanhuaFigureBoundaries(path:string,width:number,extraHead?:string):number[]{
 const ctx=document.createElement('canvas').getContext('2d');if(!ctx)throw new Error('No outline context');
 const body=new Path2D(path),head=extraHead?new Path2D(extraHead):null;
 return Array.from({length:46},(_,n)=>{
  let left=width,right=0;
  for(let x=0;x<width;x+=2){const y=Math.min(1377,n*30+15);if(ctx.isPointInPath(body,x,y)||(head&&ctx.isPointInPath(head,x-180,y-10))){left=Math.min(left,x);right=Math.max(right,x);}}
  return left<=right?(left+right)/2:width/2;
 });
}
