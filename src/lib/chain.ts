import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const fullnode = import.meta.env.VITE_APTOS_SHELBYNET_FULLNODE || 'https://api.shelbynet.shelby.xyz/v1';
export const aptos = new Aptos(new AptosConfig({
  network: Network.CUSTOM,
  fullnode,
}));

const DEFAULT_MODULE_ADDRESS = '0xf343f26657088d01fe41a7d8941131e64bfb248cb41a6635d7cd7210ff3f2c25';
export const moduleAddress = (import.meta.env.VITE_MODULE_ADDRESS || DEFAULT_MODULE_ADDRESS) as string;

export const leaderboardView = async (limit = 10) => {
  try {
    const rows = await aptos.view({ payload: {
      function: `${moduleAddress}::flappy_score::leaderboard`,
      functionArguments: [limit],
      typeArguments: []
    }});
    return (rows[0] as Array<{player:string; score:string}> | undefined) ?? [];
  } catch {
    return [];
  }
};
