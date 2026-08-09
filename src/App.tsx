import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletButton from './components/WalletButton';
import Game from './components/Game';
import { leaderboardView, moduleAddress } from './lib/chain';

type Row={player:string;score:string};
export default function App(){
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [last,setLast]=useState(0); const [best,setBest]=useState(0); const [rows,setRows]=useState<Row[]>([]); const [tx,setTx]=useState<string>(); const [saving,setSaving]=useState(false);
  const refresh=useCallback(async()=>setRows(await leaderboardView(10) as Row[]),[]);
  useEffect(()=>{refresh()},[refresh]);
  const gameOver=useCallback((s:number)=>{setLast(s);setBest(b=>Math.max(b,s));},[]);
  const submit=async()=>{
    if(!connected||!account||!moduleAddress||last<=0) return;
    setSaving(true);
    try{
      const result=await signAndSubmitTransaction({ data:{ function:`${moduleAddress}::flappy_score::submit_score`, functionArguments:[last], typeArguments:[] }});
      setTx(result.hash); await refresh();
    } finally {setSaving(false)}
  };
  return <main>
    <header><div><h1>FLAPPY <span>SHELBY</span></h1><p>Arcade score • Petra • On-chain leaderboard</p></div><WalletButton/></header>
    <section className="layout">
      <div className="gameWrap"><Game onGameOver={gameOver}/><div className="actions"><div><b>Last</b><strong>{last}</strong></div><div><b>Best</b><strong>{best}</strong></div><button onClick={submit} disabled={!connected||last<=0||saving}>{saving?'Saving…':'Save score on-chain'}</button></div>{tx&&<p className="tx">✓ Submitted: {tx.slice(0,12)}…</p>}</div>
      <aside><h2>Leaderboard</h2>{rows.length===0?<p className="muted">Deploy Move module to activate on-chain scores.</p>:rows.map((r,i)=><div className="row" key={r.player}><span>#{i+1}</span><code>{r.player.slice(0,6)}…{r.player.slice(-4)}</code><b>{r.score}</b></div>)}<div className="network"><i></i>Shelbynet • Petra • On-chain</div></aside>
    </section>
  </main>
}
