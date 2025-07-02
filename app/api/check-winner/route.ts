import { getTopPlayers, TopPlayers } from "@/actions";
import { env } from "@/app/env";
import { IS_MAINNET, TREASURY_CONTRACT_ADDRESS } from "@/config/constants";
import { abi } from "@/lib/chain/abi/treasury-pool-abi";
import { fetchFarcasterUser } from "@/lib/neynar";
import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

export const GET = async (request: Request) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    const client = createPublicClient({
      chain: IS_MAINNET ? base : baseSepolia,
      transport: http(),
    });

    const gameInfo = (await client.readContract({
      address: TREASURY_CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: "getGameInfo",
    })) as [bigint, bigint, bigint, bigint];

    const isGameEnded = Number(gameInfo[2]) === 0;
    const game = Number(gameInfo[3]);

    if (isGameEnded) {
      const winner = (await getTopPlayers(1)) as TopPlayers;
      const name = winner[0].name;
      const fid = winner[0].fid;

      const user = await fetchFarcasterUser(fid);

      const winnerEthAddress = user?.verified_addresses.primary.eth_address;

      const walletClient = createWalletClient({
        chain: IS_MAINNET ? base : baseSepolia,
        transport: http(),
      });

      const account = privateKeyToAccount("0x.....");

      const { request } = await client.simulateContract({
        account,
        abi,
        address: TREASURY_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "payWinner",
        args: [winnerEthAddress],
      });
      const hash = await walletClient.writeContract(request);

      const trx = await client.waitForTransactionReceipt({ hash });

      if (trx.status === "reverted") throw new Error("Trx reverted");

      return NextResponse.json(
        {
          success: true,
          message: `Winner of the game ${game} is ${name} address ${winnerEthAddress} trx-hash ${trx.transactionHash}`,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Game is not ended" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
};
