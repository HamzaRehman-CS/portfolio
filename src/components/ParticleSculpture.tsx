import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
export function ParticleSculpture({label,hint}:{label:string;hint:string}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [paused,setPaused]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let w=0,h=0,frame=0,visible=true,last=0,phase=0;
    const pointer={x:-1000,y:-1000};
    const dots=Array.from({length:1450},(_,i)=>{const a=i*2.399963229728653,y=1-2*(i+.5)/1450,r=Math.sqrt(1-y*y);return{x:Math.cos(a)*r,y,z:Math.sin(a)*r,dx:0,dy:0};});
    const draw=(time:number)=>{
      frame=0;const dt=Math.min((time-last)/1000||.016,.04);last=time;
      if(!paused&&!motion.matches)phase+=dt*.12;
      ctx.clearRect(0,0,w,h);const radius=Math.min(w,h)*.34;
      for(const p of dots){const twist=p.y*.9+phase,x=p.x*Math.cos(twist)+p.z*Math.sin(twist),z=-p.x*Math.sin(twist)+p.z*Math.cos(twist),ring=1+.16*Math.sin(p.y*5+phase*2),bx=w/2+x*radius*ring,by=h/2+p.y*radius*1.05,dx=bx-pointer.x,dy=by-pointer.y,distance=Math.hypot(dx,dy*1.4),force=motion.matches||paused?0:Math.max(0,1-distance/105),tx=dx/(Math.abs(dx)+8)*force*65,ty=dy/(Math.abs(dy)+12)*force*28,ease=1-Math.exp(-dt*(force>0?4:1.5));p.dx+=(tx-p.dx)*ease;p.dy+=(ty-p.dy)*ease;ctx.fillStyle=z>0?`rgba(164,190,163,${.45+z*.5})`:`rgba(98,124,105,${.18+(z+1)*.18})`;ctx.beginPath();ctx.arc(bx+p.dx,by+p.dy,(z+1)*.7+.5,0,Math.PI*2);ctx.fill();}
      if(visible&&!document.hidden&&!paused&&!motion.matches)frame=requestAnimationFrame(draw);
    };
    const start=()=>{if(!frame&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(draw);}};
    const resize=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);start();});resize.observe(canvas);
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;}});observer.observe(canvas);
    const move=(e:PointerEvent)=>{if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;};
    const leave=()=>{pointer.x=-1000;pointer.y=-1000;};
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();};
    canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',start);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',start);};
  },[paused]);
  return <div className="sculpture"><div className="sculpture-top"><span>EXPERIMENT / 001</span><button className="icon-button" aria-label={paused?'Play animation':'Pause animation'} onClick={()=>setPaused(!paused)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></div><canvas ref={canvasRef} aria-label="An interactive sculptural sphere made of green particles"/><span className="orbit-label">DESIGN × TECHNOLOGY</span><div className="sculpture-bottom"><span>{label}<small>{hint}</small></span><span className="spark">✳</span></div></div>;
}
