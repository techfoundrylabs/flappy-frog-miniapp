import { getEthUsdPrice } from "@/lib/base";
import { useQuery } from "@tanstack/react-query";

export const useBasePairPrice = () => {
  const { data: usdPrice, refetch: updatePrice } = useQuery({
    queryKey: ["base-pair-price"],
    queryFn: getEthUsdPrice,
    staleTime: 0,
  });

  const getUsdPrice = async () => {
    await updatePrice();
    return usdPrice;
  };

  return { getUsdPrice };
};
