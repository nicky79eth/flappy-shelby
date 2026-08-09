import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletButton from './components/WalletButton';
import Game from './components/Game';
import { leaderboardView, moduleAddress } from './lib/chain';

type Row={player:string;score:string};
const explorerTxUrl=(hash:string)=>`https://explorer.aptoslabs.com/txn/${hash}?network=shelbynet`;

function FlyingShelbyMark(){
  return <svg className="titleLogo" viewBox="0 0 84 44" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 22 23 15 13 7l3 12-10-5 8 11-8 2 15 8 11-6"/>
      <path d="m52 22 9-7 10-8-3 12 10-5-8 11 8 2-15 8-11-6"/>
      <path d="m34 13 8-5 8 5 6 9-6 9-8 5-8-5-6-9z"/>
      <path d="m34 13 8 9 8-9M28 22l14 14 14-14M34 31l8-9 8 9"/>
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

  const refresh=useCallback(async()=>setRows(await leaderboardView(10) as Row[]),[]);
  useEffect(()=>{refresh()},[refresh]);

  const gameOver=useCallback((s:number)=>{
    setLast(s);
    setBest(b=>Math.max(b,s));
    setScoreSaved(false);
    setTx(undefined);
  },[]);

  const submit=async()=>{
    if(!connected||!account||!moduleAddress||last<=0) return;
    setSaving(true);
    try{
      const result=await signAndSubmitTransaction({ data:{ function:`${moduleAddress}::flappy_score::submit_score`, functionArguments:[last], typeArguments:[] }});
      setTx(result.hash);
      setScoreSaved(true);
      await refresh();
    } finally {setSaving(false)}
  };

  const playAgain=()=>{
    if(!scoreSaved) return;
    setLast(0);
    setScoreSaved(false);
    setTx(undefined);
    setRestartSignal(v=>v+1);
  };

  return <main>
    <header><div><div className="brandTitle"><FlyingShelbyMark/><h1>FLAPPY <span>SHELBY</span></h1></div><p>Arcade score • Petra • On-chain leaderboard</p></div><WalletButton/></header>
    <section className="layout">
      <div className="gameWrap">
        <Game onGameOver={gameOver} restartSignal={restartSignal}/>
        <div className="actions">
          <div><b>Last</b><strong>{last}</strong></div>
          <div><b>Best</b><strong>{best}</strong></div>
          {!scoreSaved
            ? <button onClick={submit} disabled={!connected||last<=0||saving}>{saving?'Saving…':'Save score on-chain'}</button>
            : <button onClick={playAgain}>Play again</button>}
        </div>
        {tx&&<p className="tx">✓ Submitted: <a href={explorerTxUrl(tx)} target="_blank" rel="noreferrer" title="View transaction on Aptos Explorer">{tx.slice(0,12)}… <span className="external">↗</span></a></p>}
      </div>
      <aside><h2>Leaderboard</h2>{rows.length===0?<p className="muted">Deploy Move module to activate on-chain scores.</p>:rows.map((r,i)=><div className="row" key={r.player}><span>#{i+1}</span><code>{r.player.slice(0,6)}…{r.player.slice(-4)}</code><b>{r.score}</b></div>)}<div className="network"><i></i>Shelbynet • Petra Wallet • On-chain</div></aside>
    </section>
  </main>
}
