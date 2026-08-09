import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletButton from './components/WalletButton';
import Game from './components/Game';
import { leaderboardView, moduleAddress } from './lib/chain';

type Row={player:string;score:string};
const explorerTxUrl=(hash:string)=>`https://explorer.aptoslabs.com/txn/${hash}?network=shelbynet`;
const SHELBY_LOGO='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAoCAYAAACFFRgXAAABoklEQVR42u1XMU7EMBDcjYDyWiLR8gYKkBt+gLagoKLgOq7gARQgSq65jvsAjT/BCgoegrgWSnQyTZAOdLHX9jrKoYyUKrI9nszuTgAGDPgF1NzMGeuSSDCJeVR9UC3motqE90qTViWMTG+ZSj+qEnbGuua50PDjGpyWUvghsqAWWtbAjI2+kGln5X0FAMuQ0s7YdwDYTe0aOR7e/nOZpUQpZKpDtvGpXOV8ph9Pl+69UYSdsVelWpWPdNtaicL3gQNHAdLHgf3PPWvvoorOp9CqOgJbjJDpM/cctcEh8ONHoH+fZIefgGoLZKo1gk9sEVaJm9fKEy6vSzhjD/qahyvYMFQtn/z1XynsjH3W+tuIxZavaj0kDhPPGyPTPKIrzZBpIiLc1QgOrL8EgInYEimzfg3OOv1rbsJPW56YNSqUUHft2mDRIdPU87oYWQAYJ3eJtoORCVMnnMD382KDoyG9L7mkJPT7RMBUVQQFeY1Mt85YAwBPWkEoVWFJ5d80xNXIRvdhiV8zJ97LRoUfZDrqlHCOukUDfAFlEQYMGNBPfANkPc/OA0joEQAAAABJRU5ErkJggg==';

function FlyingShelbyMark(){const wing=(side:number)=><g transform={`translate(42 22) scale(${side} 1)`}><path d="M14-3 Q25-17 34-22 Q31-12 27-7 Q34-11 39-9 Q33-2 25 3 Q31 1 35 4 Q27 9 16 9Z"/><path d="M18-1 Q27-10 33-15M19 3Q27 0 33-4"/></g>;return <svg className="titleLogo" viewBox="0 0 84 44" aria-hidden="true"><g fill="rgba(255,92,173,.16)" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{wing(-1)}{wing(1)}</g><image href={SHELBY_LOGO} x="21" y="3" width="42" height="38" preserveAspectRatio="xMidYMid meet"/></svg>}
function PetraMark(){return <svg className="networkLogo petraLogo" viewBox="0 0 32 32" aria-hidden="true" shapeRendering="geometricPrecision"><rect width="32" height="32" rx="4" fill="#6438FF"/><path fill="#fff" d="M7 11.3C7 7.82 9.82 5 13.3 5H25l-6.2 6.2h-5.6v13.3H7V11.3Z"/><path fill="#fff" d="m13.2 18.4 5.6-5.6 6.1 6.1-8.7 8.1-6.1-6.1 3.1-2.5Z"/></svg>}

export default function App(){
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [last,setLast]=useState(0); const [best,setBest]=useState(0); const [rows,setRows]=useState<Row[]>([]); const [tx,setTx]=useState<string>(); const [saving,setSaving]=useState(false); const [scoreSaved,setScoreSaved]=useState(false); const [restartSignal,setRestartSignal]=useState(0); const [gameEnded,setGameEnded]=useState(false);
  const refresh=useCallback(async()=>setRows(await leaderboardView(10) as Row[]),[]); useEffect(()=>{refresh()},[refresh]);
  const gameOver=useCallback((s:number)=>{setLast(s);setBest(b=>Math.max(b,s));setScoreSaved(false);setTx(undefined);setGameEnded(true)},[]);
  const submit=async()=>{if(!connected||!account||!moduleAddress||last<=0)return;setSaving(true);try{const result=await signAndSubmitTransaction({data:{function:`${moduleAddress}::flappy_score::submit_score`,functionArguments:[last],typeArguments:[]}});setTx(result.hash);setScoreSaved(true);await refresh()}finally{setSaving(false)}};
  const playAgain=()=>{setLast(0);setScoreSaved(false);setTx(undefined);setGameEnded(false);setRestartSignal(v=>v+1)};
  return <main>
    <header><div><div className="brandTitle"><FlyingShelbyMark/><h1>Flappy <span>Shelby</span></h1></div><p>Arcade score • Petra Wallet • On-chain leaderboard</p></div><WalletButton/></header>
    <section className="layout"><div className="gameWrap"><Game onGameOver={gameOver} restartSignal={restartSignal}/><div className="actions"><div><b>Last</b><strong>{last}</strong></div><div><b>Best</b><strong>{best}</strong></div>{gameEnded&&<div className="gameButtons"><button onClick={submit} disabled={!connected||saving||scoreSaved||last<=0}>{saving?'Saving…':scoreSaved?'Saved on-chain':'Save score on-chain'}</button><button className="secondary" onClick={playAgain} disabled={saving}>Play again</button></div>}</div>{tx&&<p className="tx">✓ Submitted: <a href={explorerTxUrl(tx)} target="_blank" rel="noreferrer">{tx.slice(0,12)}… <span className="external">↗</span></a></p>}</div><aside><h2>Leaderboard</h2>{rows.length===0?<p className="muted">Deploy Move module to activate on-chain scores.</p>:rows.map((r,i)=><div className="row" key={r.player}><span>#{i+1}</span><code>{r.player.slice(0,6)}…{r.player.slice(-4)}</code><b>{r.score}</b></div>)}<div className="network"><span className="networkItem"><img className="networkLogo" src={SHELBY_LOGO} alt="" aria-hidden="true"/>Shelbynet</span><span>•</span><span className="networkItem"><PetraMark/>Petra Wallet</span><span>•</span><span>On-chain</span></div></aside></section>
    <footer className="siteFooter"><div className="footerInfo"><strong>Flappy Shelby</strong><span>Built on Shelbynet · On-chain Arcade Game</span><small>Scores are submitted on-chain through Petra Wallet.</small></div><nav className="footerLinks" aria-label="Project links"><a href="https://github.com/nicky79eth/flappy-shelby" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://x.com/0xNickyy" target="_blank" rel="noreferrer">X ↗</a><a href="https://docs.shelby.xyz/" target="_blank" rel="noreferrer">Docs ↗</a></nav></footer>
  </main>
}
