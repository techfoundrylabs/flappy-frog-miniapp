import { TREASURY_CONTRACT_ADDRESS } from "@/config/constants";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { abi as TREASURY_POOL_ABI } from "@/lib/chain/abi/treasury-pool-abi";
import { Abi, formatEther, parseEther } from "viem";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useChain } from "@/hooks/use-chain";
import { useMiniApp } from "@/providers/mini-app-provider";

interface ContractCommonParams {
  address: `0x${string}`;
  abi: Abi;
}
const commonContractParams: ContractCommonParams = {
  address: TREASURY_CONTRACT_ADDRESS as `0x${string}`,
  abi: TREASURY_POOL_ABI,
};

export const useDepositIntoTreasury = () => {
  const publicClient = usePublicClient();
  const { chainId } = useChain();
  const { fetchPriceFeed } = useTokenPrice();
  const { getWalletBalance } = useMiniApp();

  const { writeContractAsync } = useWriteContract();

  const handlePayGame = async () => {
    try {
      const amount = await fetchPriceFeed();

      const balance = await getWalletBalance();

      if (!amount || amount <= 0) throw new Error("Not retrieve amount");
      if (amount > 0 && amount > Number(balance))
        throw new Error("Insufficent balance");

      const trxHash = await writeContractAsync({
        ...commonContractParams,
        chainId,
        functionName: "deposit",
        value: parseEther(amount.toString()),
      });
      const trxReceipt = await publicClient?.waitForTransactionReceipt({
        hash: trxHash,
      });
      return trxReceipt;
    } catch (error) {
      console.error(error);
    }
  };

  return {
    handlePayGame,
  };
};

export const useGetTreasuryPoolData = () => {
  const { data, isLoading, isSuccess } = useReadContract({
    address: TREASURY_CONTRACT_ADDRESS as `0x${string}`,
    abi: TREASURY_POOL_ABI,
    functionName: "getGameInfo",
    query: {
      staleTime: Infinity,
      refetchInterval: 600_000,
    },
  });
  const contractResponse = Array.isArray(data)
    ? (data as [bigint, bigint])
    : [0n, 0n];

  const [treasury, gameEnd] = contractResponse;
  const formattedTreasury = formatEther(treasury ?? 0n);
  const gameEndMs = gameEnd ? Number(gameEnd) : 0;
  return { treasury, formattedTreasury, gameEndMs, isLoading, isSuccess };
};
