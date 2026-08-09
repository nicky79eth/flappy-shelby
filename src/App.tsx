import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletButton from './components/WalletButton';
import Game from './components/Game';
import { leaderboardView, moduleAddress } from './lib/chain';

type Row={player:string;score:string};
const explorerTxUrl=(hash:string)=>`https://explorer.aptoslabs.com/txn/${hash}?network=shelbynet`;

function FlyingShelbyMark(){
  const wing=(side:number)=><g transform={`translate(42 22) scale(${side} 1)`}>
    <path d="M14-3 Q25-17 34-22 Q31-12 27-7 Q34-11 39-9 Q33-2 25 3 Q31 1 35 4 Q27 9 16 9Z"/>
    <path d="M18-1 Q27-10 33-15M19 3Q27 0 33-4"/>
  </g>;
  return <svg className="titleLogo" viewBox="0 0 84 44" aria-hidden="true">
    <g fill="rgba(255,47,146,.16)" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{wing(-1)}{wing(1)}</g>
    <g transform="translate(42 22)" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m-8-9 8-5 8 5 6 9-6 9-8 5-8-5-6-9z"/>
      <path d="m-8-9 8 9 8-9M-14 0 0 14 14 0M-8 9 0 0 8 9"/>
    </g>
  </svg>;
}

export default function App(){
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [last,setLast]=useState(0);
  const [best,setBest]=useState(0);
  const [rows,setRows]=useState<Row[]>([]);
  const [tx,setTx]=useState<string>();
  const [saving,setSaving]=useState(false);
  const [scoreSaved,setScoreSaved]=useState(false);
  const [restartSignal,setRestartSignal]=useState(0);
  const [gameEnded,setGameEnded]=useState(false);

  const refresh=useCallback(async()=>setRows(await leaderboardView(10) as Row[]),[]);
  useEffect(()=>{refresh()},[refresh]);

  const gameOver=useCallback((s:number)=>{
    setLast(s);
    setBest(b=>Math.max(b,s));
    setScoreSaved(false);
    setTx(undefined);
    setGameEnded(true);
  },[]);

  const submit=async()=>{
    if(!connected||!account||!moduleAddress||last<=0) return;
    setSaving(true);
    try{
      const result=await signAndSubmitTransaction({data:{function:`${moduleAddress}::flappy_score::submit_score`,functionArguments:[last],typeArguments:[]}});
      setTx(result.hash);
      setScoreSaved(true);
      await refresh();
    } finally {setSaving(false)}
  };

  const playAgain=()=>{
    setLast(0);
    setScoreSaved(false);
    setTx(undefined);
    setGameEnded(false);
    setRestartSignal(v=>v+1);
  };

  return <main>
    <header><div><div className="brandTitle"><FlyingShelbyMark/><h1>FLAPPY <span>SHELBY</span></h1></div><p>Arcade score • Petra Wallet • On-chain leaderboard</p></div><WalletButton/></header>
    <section className="layout">
      <div className="gameWrap">
        <Game onGameOver={gameOver} restartSignal={restartSignal}/>
        <div className="actions">
          <div><b>Last</b><strong>{last}</strong></div>
          <div><b>Best</b><strong>{best}</strong></div>
          {gameEnded&&<div className="gameButtons">
            <button onClick={submit} disabled={!connected||saving||scoreSaved||last<=0}>{saving?'Saving…':scoreSaved?'Saved on-chain':'Save score on-chain'}</button>
            <button className="secondary" onClick={playAgain} disabled={saving}>Play again</button>
          </div>}
        </div>
        {tx&&<p className="tx">✓ Submitted: <a href={explorerTxUrl(tx)} target="_blank" rel="noreferrer" title="View transaction on Aptos Explorer">{tx.slice(0,12)}… <span className="external">↗</span></a></p>}
      </div>
      <aside><h2>Leaderboard</h2>{rows.length===0?<p className="muted">Deploy Move module to activate on-chain scores.</p>:rows.map((r,i)=><div className="row" key={r.player}><span>#{i+1}</span><code>{r.player.slice(0,6)}…{r.player.slice(-4)}</code><b>{r.score}</b></div>)}<div className="network"><i></i>Shelbynet • Petra Wallet • On-chain</div></aside>
    </section>
  </main>
}
