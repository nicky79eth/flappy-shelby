import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

const fullnode = import.meta.env.VITE_APTOS_SHELBYNET_FULLNODE || 'https://api.shelbynet.shelby.xyz/v1';
export const aptos = new Aptos(new AptosConfig({ fullnode }));
export const moduleAddress = import.meta.env.VITE_MODULE_ADDRESS as string | undefined;

export const leaderboardView = async (limit = 10) => {
  if (!moduleAddress) return [];
  try {
    const rows = await aptos.view({ payload: {
      function: `${moduleAddress}::flappy_score::leaderboard`,
      functionArguments: [limit],
      typeArguments: []
    }});
    return (rows[0] as Array<{player:string; score:string}> | undefined) ?? [];
  } catch { return []; }
};
