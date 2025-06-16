import { GAME_PRICE_USD } from "@/config/constants";
import { AssetPairs, chainLinkFeedPrice } from "@/config/contracts-address";
import { getEthUsdPrice } from "@/lib/base";
import { abi } from "@/lib/chain/abi/chainlink-price-feed";
import { useMiniApp } from "@/providers/mini-app-provider";
import { useQuery } from "@tanstack/react-query";
import { useReadContracts } from "wagmi";

export const useBasePairPrice = () => {
  const { refetch: updatePrice } = useQuery({
    queryKey: ["base-pair-price"],
    queryFn: getEthUsdPrice,
  });

  const getUsdPrice = async () => {
    const { data: price } = await updatePrice();
    return GAME_PRICE_USD / Number(price);
  };

  return { getUsdPrice };
};

export const useTokenPrice = () => {
  const { chainId } = useMiniApp();
  const assetPair: AssetPairs = "ETH_USD";
  const contractAddress = chainLinkFeedPrice[assetPair][chainId];
  const { refetch } = useReadContracts({
    contracts: [
      {
        abi: abi,
        address: contractAddress,
        functionName: "latestAnswer",
      },
      {
        abi: abi,
        address: contractAddress,
        functionName: "decimals",
      },
    ],
  });

  const fetchPriceFeed = async () => {
    try {
      const { data, isSuccess } = await refetch();
      if (!isSuccess || !data) throw new Error("Failed to retrieve price data");

      const price = Number(data[0].result);
      const decimals = Number(data[1].result);

      const tokenPriceUsd = price / 10 ** decimals;
      return GAME_PRICE_USD / tokenPriceUsd;
    } catch (error) {
      console.error("fetchPriceFeed error:", error);
      return null;
    }
  };

  return { fetchPriceFeed };
};
