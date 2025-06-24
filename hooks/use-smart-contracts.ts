import { TREASURY_CONTRACT_ADDRESS } from "@/config/constants";
import {
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { abi as TREASURY_POOL_ABI } from "@/lib/chain/abi/treasury-pool-abi";
import { useMiniApp } from "@/providers/mini-app-provider";
import { toast } from "react-toastify";
import { Abi, erc20Abi, formatUnits } from "viem";
import { erc20Address } from "@/config/erc20-address";

export const useDepositIntoTreasury = () => {
  const publicClient = usePublicClient();
  const { address, chainId } = useMiniApp();
  const usdcAddress = erc20Address["USDC"][chainId];

  const commonParams = { abi: erc20Abi as Abi, address: usdcAddress, chainId };

  const { data } = useReadContracts({
    contracts: [
      { ...commonParams, functionName: "balanceOf", args: [address] },
      { ...commonParams, functionName: "decimals" },
    ],
  });

  const balance = (data?.[0]?.result as bigint) ?? 0n;
  const decimals = (data?.[1]?.result as number) ?? 0;

  const { writeContractAsync, isPending } = useWriteContract();

  const handlePayGame = async (price: number) => {
    try {
      const formatBalance = formatUnits(balance, decimals);
      if (!price || price <= 0) throw new Error("Not retrieve amount");
      if (price > 0 && price > Number(formatBalance)) {
        throw new Error(
          `Insufficent balance: price request is ${price} USDC, but your balance is ${formatBalance} USDC`,
        );
      }

      const trxHash = await writeContractAsync({
        abi: erc20Abi as Abi,
        address: usdcAddress,
        chainId,
        functionName: "transfer",
        args: [TREASURY_CONTRACT_ADDRESS, price],
      });
      const trxReceipt = await publicClient?.waitForTransactionReceipt({
        hash: trxHash,
      });
      return trxReceipt;
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : (error as string);
      toast.error(message);
    }
  };

  return {
    handlePayGame,
    isPending,
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
    ? (data as [bigint, bigint, bigint, bigint])
    : [0n, 0n, 0n, 0n];

  const [treasury, treamRevenue, gameEnd, gameNumber] = contractResponse;
  const formattedTreasury = formatUnits(treasury ?? 0n, 6);
  const gameEndMs = gameEnd ? Number(gameEnd) : 0;
  return {
    treasury,
    formattedTreasury,
    treamRevenue,
    gameEndMs,
    gameNumber,
    isLoading,
    isSuccess,
  };
};
