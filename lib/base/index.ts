interface CoinbaseAsssetPair {
  amount: string;
  base: string;
  currency: string;
}

interface CoinbaseAsssetPairResponse {
  data: CoinbaseAsssetPair;
}

const API_BASE_URL = "https://api.coinbase.com";

export const getEthUsdPrice = async () => {
  try {
    const endpoint = `${API_BASE_URL}/v2/prices/ETH-USD/spot`;
    const response = await fetch(endpoint);
    if (!response.ok)
      throw new Error("Error to fetch data price from coinbase");
    const { data: assetPair } =
      (await response.json()) as CoinbaseAsssetPairResponse;
    return assetPair.amount;
  } catch (error) {
    console.error(error);
  }
};
