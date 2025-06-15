"use client";
import { InfoCard } from "@/components/info-card";
import { BaseLayout } from "@/components/menu/base-layout";
import { IS_MAINNET } from "@/config/constants";
import { useMiniApp } from "@/providers/mini-app-provider";
import { formattedName } from "@/utils";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { Coins, ExternalLink, Link, Wallet } from "lucide-react";
import Image from "next/image";

const UserPage = () => {
  const {
    address,
    chainName,
    chainExplorer,
    userName,
    userAvatar,
    formattedBalance,
  } = useMiniApp();
  const openUrl = useOpenUrl();
  const openExplorerHandler = () => {
    const url = `${chainExplorer}/address/${address}`;
    openUrl(url);
  };
  return (
    <BaseLayout title="User Info" className="py-8 mb-12">
      <div className="w-full flex flex-col gap-y-4">
        <div className="flex w-full flex-col justify-center items-center gap-y-2">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <Image
                src={userAvatar ?? ""}
                alt=""
                className="w-fit"
                width={"140"}
                height={"200"}
              />
            </div>
          </div>

          <h1 className="uppercase">{userName}</h1>
        </div>

        <InfoCard
          Icon={<Link className="w-4 h-4 text-white" />}
          cardTitle="Chain"
          cardInfo={chainName}
          addInfo={
            <span className="bg-blue-500/30 text-white px-3 py-1 rounded-full text-[8px] font-medium border border-blue-400/40">
              {IS_MAINNET ? "Mainnet" : "Testnet"}
            </span>
          }
        />

        <InfoCard
          Icon={<Wallet className="w-4 h-4 text-white" />}
          cardTitle="Wallet"
          cardInfo={formattedName(address)}
          addInfo={
            <button
              className="bg-blue-500/30 px-3 py-1 rounded-full border border-blue-400/40"
              onClick={openExplorerHandler}
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
          }
        />

        <InfoCard
          Icon={<Coins className="w-4 h-4 text-white" />}
          cardTitle="Balance"
          cardInfo={formattedBalance}
        />
      </div>
    </BaseLayout>
  );
};

export default UserPage;
