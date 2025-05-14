import { TREASURY_CONTRACT_ADDRESS } from "@/config/constants";
import {
  useChainId,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { abi as TREASURY_POOL_ABI } from "@/lib/chain/abi/treasury-pool-abi";
import { Abi, formatEther, parseEther } from "viem";
import { useBasePairPrice } from "@/hooks/use-base-pair-price";

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
  const chainId = useChainId();
  const { getUsdPrice } = useBasePairPrice();

  const { writeContractAsync } = useWriteContract();

  const handlePayGame = async () => {
    try {
      const amount = (await getUsdPrice()) ?? 0;

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
  const chainId = useChainId();
  const { data: treasury, refetch } = useReadContract({
    ...commonContractParams,
    functionName: "getTreasuryBalance",
    chainId,
  });

  const getTreasuryValue = async () => {
    await refetch();
    const treasuryAmount = treasury ? (treasury as bigint) : BigInt("0");
    const treasuryAmountFormatted = formatEther(treasuryAmount);
    return treasuryAmountFormatted;
  };

  return {
    getTreasuryValue,
  };
};
