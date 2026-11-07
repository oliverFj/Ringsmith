/** Small SVG authoring primitives; the player owns timing and lifecycle. */
export const part=(svg,key)=>svg.querySelector(`[data-part="${key}"]`);
export const track=(target,frames,start=0,end=1,easing='cubic-bezier(.2,.7,.2,1)')=>({target,frames,start,end,easing});
export function trace(shape,start=0,end=1,{reverse=false,easing}={}){
 if(!shape?.getTotalLength)return null;
 const length=shape.getTotalLength();
 if(!Number.isFinite(length)||length<=0)return null;
 const dash=`${length} ${length}`;
 return track(shape,[{strokeDasharray:dash,strokeDashoffset:(reverse?-1:1)*length},{strokeDasharray:dash,strokeDashoffset:0}],start,end,easing);
}
export function parallax(target,{x:rangeX=6,y:rangeY=4}={}){
 if(!target)return {update(){},destroy(){}};
 const wrapper=target.ownerDocument.createElementNS('http://www.w3.org/2000/svg','g');
 wrapper.setAttribute('data-motion-helper','parallax');
 target.before(wrapper);wrapper.append(target);
 return {
  update({x=0,y=0,active=false}){wrapper.setAttribute('transform',`translate(${active?x*rangeX:0} ${active?y*rangeY:0})`);},
  destroy(){if(wrapper.parentNode){wrapper.before(target);wrapper.remove();}}
 };
}
