import { TREASURY_CONTRACT_ADDRESS } from "@/config/constants";
import {
  useBalance,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { abi as TREASURY_POOL_ABI } from "@/lib/chain/abi/treasury-pool-abi";
import { Abi, formatEther, parseEther } from "viem";
import { useBasePairPrice } from "@/hooks/use-base-pair-price";
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
  const { getUsdPrice } = useBasePairPrice();
  const { getWalletBalance } = useMiniApp();

  const { writeContractAsync } = useWriteContract();

  const handlePayGame = async () => {
    try {
      const amount = await getUsdPrice();

      const balance = await getWalletBalance();

      if (amount > Number(balance)) throw new Error("Insufficent balance");

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

export const useGetTreasury = () => {
  const { chainId } = useChain();
  const { data, refetch } = useReadContract({
    ...commonContractParams,
    functionName: "getTreasuryBalance",
    chainId,
    query: { refetchInterval: 5000 },
  });

  const getFormatEth = (value: bigint | undefined) => {
    const treasuryAmount = value ? (value as bigint) : BigInt("0");
    const treasuryAmountFormatted = formatEther(treasuryAmount);
    return treasuryAmountFormatted;
  };

  const treasuryValue = getFormatEth(data as bigint | undefined);

  const getTreasuryValue = async () => {
    const { data: treasury } = await refetch();
    const treasuryAmount = getFormatEth(treasury as bigint | undefined);
    return treasuryAmount;
  };

  return {
    treasuryValue,
    getTreasuryValue,
  };
};
