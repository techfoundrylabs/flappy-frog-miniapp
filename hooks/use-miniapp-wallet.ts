import { useChain } from "@/hooks/use-chain";
import { useAddFrame, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useEffect } from "react";
import { formatEther } from "viem/utils";
import { useAccount, useBalance, useConnect } from "wagmi";

export const useMiniappWallet = () => {
  const { context } = useMiniKit();

  const addFrame = useAddFrame();
  const { chainId, updateChain } = useChain();

  const { connectAsync, connectors } = useConnect();
  const { address, isConnected, isConnecting } = useAccount();
  const { refetch: refetchBalance } = useBalance({
    address,
    chainId,
  });

  const farcasterConnector = connectors[0];

  updateChain();

  const getWalletBalance = async () => {
    const { data: balance } = await refetchBalance();
    const formattedBalance = formatEther(balance?.value ?? BigInt(0));
    return formattedBalance;
  };

  const handleWallectConnect = useCallback(async () => {
    try {
      await connectAsync({
        connector: farcasterConnector,
      });
    } catch (error) {
      console.error(error);
    }
  }, [connectAsync, farcasterConnector]);

  const checkFrameAndAdd = useCallback(async () => {
    try {
      await addFrame();
    } catch (error) {
      console.warn("addFrame was rejected by the user", error);
    }
  }, [addFrame]);

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      handleWallectConnect();
    }

    if (!context?.client.added) {
      checkFrameAndAdd();
    }
  }, [
    checkFrameAndAdd,
    context?.client.added,
    handleWallectConnect,
    isConnected,
    isConnecting,
  ]);

  return {
    address,
    isConnected,
    context,
    getWalletBalance,
  };
};
