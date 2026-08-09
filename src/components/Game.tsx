import { useEffect, useRef, useState } from 'react';

type Props = { onGameOver:(score:number)=>void };

type Pipe = { x:number; gapY:number; counted:boolean };

export default function Game({onGameOver}:Props){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const [score,setScore] = useState(0);
  const [running,setRunning] = useState(false);
  const state = useRef({ y:220, vy:0, pipes:[] as Pipe[], frame:0, score:0 });

  const reset = () => {
    state.current = { y:220, vy:0, pipes:[], frame:0, score:0 };
    setScore(0); setRunning(true);
  };
  const flap = () => { if(!running) reset(); else state.current.vy = -7.4; };

  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{ if(e.code==='Space'){e.preventDefault();flap();} };
    window.addEventListener('keydown',key); return ()=>window.removeEventListener('keydown',key);
  });

  useEffect(()=>{
    const c=canvasRef.current; if(!c) return; const ctx=c.getContext('2d')!;
    const W=c.width,H=c.height;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0a1740'); g.addColorStop(1,'#071020'); ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      for(let i=0;i<30;i++){ctx.globalAlpha=.25;ctx.fillStyle='#8db5ff';ctx.fillRect((i*97+state.current.frame*.12)%W,(i*53)%H,2,2)} ctx.globalAlpha=1;
      ctx.fillStyle='#45f3ff'; ctx.font='700 20px system-ui'; ctx.fillText('SHELBYNET',18,30);
      const s=state.current;
      if(running){
        s.frame++; s.vy += .42; s.y += s.vy;
        if(s.frame%92===0) s.pipes.push({x:W+20,gapY:100+Math.random()*(H-240),counted:false});
        s.pipes.forEach(p=>p.x-=2.8); s.pipes=s.pipes.filter(p=>p.x>-70);
        for(const p of s.pipes){
          if(!p.counted && p.x<88){p.counted=true;s.score++;setScore(s.score)}
          const hitX=88+18>p.x && 88-18<p.x+62; const hitY=s.y-16<p.gapY-72 || s.y+16>p.gapY+72;
          if(hitX&&hitY){setRunning(false);onGameOver(s.score)}
        }
        if(s.y<0||s.y>H){setRunning(false);onGameOver(s.score)}
      }
      for(const p of s.pipes){ctx.fillStyle='#17d6b0';ctx.fillRect(p.x,0,62,p.gapY-72);ctx.fillRect(p.x,p.gapY+72,62,H-(p.gapY+72));ctx.fillStyle='#7bffe6';ctx.fillRect(p.x-5,p.gapY-84,72,12);ctx.fillRect(p.x-5,p.gapY+72,72,12)}
      ctx.save();ctx.translate(88,state.current.y);ctx.rotate(Math.min(.45,state.current.vy*.04));ctx.fillStyle='#ffcf42';ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(5,-7,7,7);ctx.fillStyle='#111';ctx.fillRect(9,-5,3,3);ctx.fillStyle='#ff6a4a';ctx.fillRect(11,2,15,6);ctx.restore();
      ctx.fillStyle='#fff';ctx.font='800 36px system-ui';ctx.textAlign='center';ctx.fillText(String(score),W/2,56);ctx.textAlign='start';
      if(!running){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='800 28px system-ui';ctx.fillText(state.current.frame?'GAME OVER':'FLAPPY SHELBY',W/2,H/2-30);ctx.font='16px system-ui';ctx.fillText('Click / Space to flap',W/2,H/2+10);ctx.textAlign='start'}
      raf.current=requestAnimationFrame(draw);
    };draw(); return()=>cancelAnimationFrame(raf.current);
  },[running,onGameOver,score]);

  return <canvas ref={canvasRef} width={390} height={600} onPointerDown={flap} />;
}
