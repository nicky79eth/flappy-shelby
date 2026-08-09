import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function WalletButton(){
  const { account, connected, connect, disconnect, wallets } = useWallet();
  if (connected && account) return <button className="wallet" onClick={disconnect}>{account.address.toString().slice(0,6)}…{account.address.toString().slice(-4)}</button>;
  const petra = wallets.find(w => w.name.toLowerCase().includes('petra'));
  return <button className="wallet" onClick={() => petra && connect(petra.name)}>Connect Wallet</button>;
}
