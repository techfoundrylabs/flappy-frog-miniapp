import { refillHearts } from "@/actions";
import { IS_MAINNET, TREASURY_CONTRACT_ADDRESS } from "@/config/constants";
import { getEthUsdPrice } from "@/lib/base";
import { useAddFrame, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useEffect } from "react";
import { base, baseSepolia } from "viem/chains";
import { formatEther, parseEther } from "viem/utils";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";

const CHAIN = IS_MAINNET ? base : baseSepolia;

export const useMiniappWallet = () => {
  const { context } = useMiniKit();

  const addFrame = useAddFrame();

  const { connectAsync, connectors } = useConnect();
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const { data: balance, refetch } = useBalance({ address, chainId: CHAIN.id });

  const { data: hash, sendTransactionAsync } = useSendTransaction();
  const {
    data: trxResult,
    error: trxError,
    status: statusTrx,
    isSuccess: isSuccessTrx,
    isLoading: isLoadingTrx,
    isError: isErrorTrx,
  } = useWaitForTransactionReceipt({
    hash,
    chainId,
  });

  const farcasterConnector = connectors[0];

  const formattedBalance = formatEther(balance?.value ?? BigInt(0));

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

  const refillHeart = useCallback(async () => {
    if (!!context) {
      await refetch();
      await refillHearts(context.user.fid);
    }
  }, [context, refetch]);

  useEffect(() => {
    if (chainId !== CHAIN.id) {
      switchChainAsync({ chainId: CHAIN.id });
    }
    if (!isConnected && !isConnecting) {
      handleWallectConnect();
    }
    if (!context?.client.added) {
      checkFrameAndAdd();
    }
  }, [
    chainId,
    checkFrameAndAdd,
    context?.client.added,
    handleWallectConnect,
    isConnected,
    isConnecting,
    isSuccessTrx,
    refillHeart,
    switchChainAsync,
  ]);

  const pay = async () => {
    try {
      const amount = (await getEthUsdPrice()) ?? 0;
      const trxHash = await sendTransactionAsync({
        to: TREASURY_CONTRACT_ADDRESS as `0x${string}`,
        value: parseEther(amount.toString()),
        chainId,
      });
      return await publicClient?.waitForTransactionReceipt({ hash: trxHash });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    address,
    isConnected,
    formattedBalance,
    context,
    pay,
    trxError,
    trxResult,
    statusTrx,
    isLoadingTrx,
    isSuccessTrx,
    isErrorTrx,
    refetch,
  };
};
