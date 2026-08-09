import { useEffect, useRef, useState } from 'react';

type Props = { onGameOver:(score:number)=>void };
type Pipe = { x:number; gapY:number; counted:boolean };

const SHELBY_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAoCAYAAACFFRgXAAABoklEQVR42u1XMU7EMBDcjYDyWiLR8gYKkBt+gLagoKLgOq7gARQgSq65jvsAjT/BCgoegrgWSnQyTZAOdLHX9jrKoYyUKrI9nszuTgAGDPgF1NzMGeuSSDCJeVR9UC3motqE90qTViWMTG+ZSj+qEnbGuua50PDjGpyWUvghsqAWWtbAjI2+kGln5X0FAMuQ0s7YdwDYTe0aOR7e/nOZpUQpZKpDtvGpXOV8ph9Pl+69UYSdsVelWpWPdNtaicL3gQNHAdLHgf3PPWvvoorOp9CqOgJbjJDpM/cctcEh8ONHoH+fZIefgGoLZKo1gk9sEVaJm9fKEy6vSzhjD/qahyvYMFQtn/z1XynsjH3W+tuIxZavaj0kDhPPGyPTPKIrzZBpIiLc1QgOrL8EgInYEimzfg3OOv1rbsJPW56YNSqUUHft2mDRIdPU87oYWQAYJ3eJtoORCVMnnMD382KDoyG9L7mkJPT7RMBUVQQFeY1Mt85YAwBPWkEoVWFJ5d80xNXIRvdhiV8zJ97LRoUfZDrqlHCOukUDfAFlEQYMGNBPfANkPc/OA0joEQAAAABJRU5ErkJggg==';

export default function Game({onGameOver}:Props){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const raf = useRef(0);
  const [score,setScore] = useState(0);
  const [running,setRunning] = useState(false);
  const state = useRef({ y:220, vy:0, pipes:[] as Pipe[], frame:0, score:0 });

  useEffect(()=>{
    const logo = new Image();
    logo.src = SHELBY_LOGO;
    logoRef.current = logo;
  },[]);

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
    const drawWing=(side:number, flapPhase:number)=>{
      ctx.save();
      ctx.scale(side,1);
      ctx.strokeStyle='#ff5bb5';
      ctx.fillStyle='rgba(255,47,146,.16)';
      ctx.lineWidth=2.2;
      ctx.lineJoin='round';
      ctx.shadowColor='#ff2f92';
      ctx.shadowBlur=10;
      ctx.beginPath();
      ctx.moveTo(14,-3);
      ctx.quadraticCurveTo(25,-17-flapPhase,34,-22-flapPhase);
      ctx.quadraticCurveTo(31,-12-flapPhase*.5,27,-7);
      ctx.quadraticCurveTo(34,-11-flapPhase*.35,39,-9-flapPhase*.25);
      ctx.quadraticCurveTo(33,-2,25,3);
      ctx.quadraticCurveTo(31,1,35,4);
      ctx.quadraticCurveTo(27,9,16,9);
      ctx.closePath();
      ctx.fill();ctx.stroke();
      ctx.globalAlpha=.75;
      ctx.beginPath();ctx.moveTo(18,-1);ctx.quadraticCurveTo(27,-10-flapPhase*.6,33,-15-flapPhase*.5);ctx.stroke();
      ctx.beginPath();ctx.moveTo(19,3);ctx.quadraticCurveTo(27,0,33,-4-flapPhase*.2);ctx.stroke();
      ctx.restore();
    };
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#170a2a'); g.addColorStop(1,'#070913'); ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      for(let i=0;i<34;i++){
        ctx.globalAlpha=.34;
        ctx.fillStyle=i%3===0?'#ff5fae':'#9a5cff';
        ctx.fillRect((i*97+state.current.frame*.12)%W,(i*53)%H,2,2);
      }
      ctx.globalAlpha=1;
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
      for(const p of s.pipes){
        const pg=ctx.createLinearGradient(p.x,0,p.x+62,0);
        pg.addColorStop(0,'#bd1769'); pg.addColorStop(.52,'#ff2f92'); pg.addColorStop(1,'#ff75bc');
        ctx.fillStyle=pg;
        ctx.fillRect(p.x,0,62,p.gapY-72);
        ctx.fillRect(p.x,p.gapY+72,62,H-(p.gapY+72));
        ctx.shadowColor='#ff2f92';ctx.shadowBlur=10;
        ctx.fillStyle='#ff8ac7';ctx.fillRect(p.x-5,p.gapY-84,72,12);ctx.fillRect(p.x-5,p.gapY+72,72,12);
        ctx.shadowBlur=0;
      }

      ctx.save();
      ctx.translate(88,state.current.y);
      ctx.rotate(Math.min(.45,state.current.vy*.04));
      const flapPhase = running ? Math.sin(state.current.frame*.32)*5 : 0;
      drawWing(-1,flapPhase);
      drawWing(1,flapPhase);
      ctx.shadowColor='#ff2f92';
      ctx.shadowBlur=18;
      const logo=logoRef.current;
      if(logo?.complete){
        ctx.drawImage(logo,-21,-19,42,38);
      } else {
        ctx.fillStyle='#ff3dad';
        ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.fill();
      }
      ctx.shadowBlur=0;
      ctx.restore();

      ctx.fillStyle='#fff';ctx.font='800 36px system-ui';ctx.textAlign='center';ctx.fillText(String(score),W/2,56);ctx.textAlign='start';
      if(!running){ctx.fillStyle='rgba(3,2,10,.5)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='800 28px system-ui';ctx.fillText(state.current.frame?'GAME OVER':'FLAPPY SHELBY',W/2,H/2-30);ctx.font='16px system-ui';ctx.fillStyle='#ff74bb';ctx.fillText('Click / Space to flap',W/2,H/2+10);ctx.textAlign='start'}
      raf.current=requestAnimationFrame(draw);
    };draw(); return()=>cancelAnimationFrame(raf.current);
  },[running,onGameOver,score]);

  return <canvas ref={canvasRef} width={390} height={600} onPointerDown={flap} />;
}
