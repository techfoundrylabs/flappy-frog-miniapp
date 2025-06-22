"use client";

import { refillHearts } from "@/actions";
import { BaseLayout } from "@/components/menu/base-layout";
import { useDepositIntoTreasury } from "@/hooks/use-smart-contracts";
import { useMiniApp } from "@/providers/mini-app-provider";
import { Crown, Gamepad2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  quantity?: number;
  price: number;
  originalPrice?: number;
  currency: string;
  discount?: number;
  popular?: boolean;
  bestValue?: boolean;
  type: "attempts" | "nft" | "bundle";
  rarity?: "common" | "rare" | "epic" | "legendary";
}

const shopItems: ShopItem[] = [
  // Game Attempts
  {
    id: "attempts-5",
    name: "5 Hop Attempts",
    description: "Continue your journey",
    price: 1.0,
    quantity: 5,
    currency: "USDC",
    type: "attempts",
  },
  {
    id: "attempts-15",
    name: "15 Hop Attempts",
    description: "Extended gameplay",
    price: 2.4,
    originalPrice: 3.0,
    quantity: 15,
    currency: "USDC",
    discount: 20,
    type: "attempts",
    popular: true,
  },
  {
    id: "attempts-50",
    name: "50 Hop Attempts",
    description: "Mega pack",
    price: 6.5,
    originalPrice: 10.0,
    quantity: 50,
    currency: "USDC",
    discount: 35,
    type: "attempts",
  },

  // NFT Avatars
  {
    id: "nft-common",
    name: "Pond Frog",
    description: "Classic green frog",
    price: 12.0,
    currency: "USDC",
    type: "nft",
    rarity: "common",
  },
  {
    id: "nft-rare",
    name: "Royal Frog",
    description: "Crowned frog with cape",
    price: 28.0,
    currency: "USDC",
    type: "nft",
    rarity: "rare",
    popular: true,
  },
  {
    id: "nft-epic",
    name: "Ninja Frog",
    description: "Stealth frog with abilities",
    price: 55.0,
    currency: "USDC",
    type: "nft",
    rarity: "epic",
  },
  {
    id: "nft-legendary",
    name: "Golden Frog",
    description: "Legendary shimmering frog",
    price: 120.0,
    currency: "USDC",
    type: "nft",
    rarity: "legendary",
  },

  // Bundles
  {
    id: "bundle-starter",
    name: "Tadpole Starter Pack",
    description: "25 Attempts + Common Avatar + Shields",
    price: 15.0,
    originalPrice: 19.5,
    currency: "USDC",
    discount: 23,
    type: "bundle",
  },
  {
    id: "bundle-gamer",
    name: "Pro Gamer Bundle",
    description: "50 Attempts + Rare Avatar + Power-up Combo",
    price: 32.0,
    originalPrice: 45.5,
    currency: "USDC",
    discount: 30,
    popular: true,
    type: "bundle",
  },
  {
    id: "bundle-master",
    name: "Frog Master Bundle",
    description: "Unlimited 24h + Epic Avatar + All Power-ups + Exclusive Skin",
    price: 75.0,
    originalPrice: 125.0,
    currency: "USDC",
    discount: 40,
    bestValue: true,
    type: "bundle",
  },
];

const getRarityColor = (rarity?: string) => {
  switch (rarity) {
    case "legendary":
      return "border-yellow-400 bg-yellow-400/10";
    case "epic":
      return "border-purple-400 bg-purple-400/10";
    case "rare":
      return "border-blue-400 bg-blue-400/10";
    case "common":
      return "border-green-400 bg-green-400/10";
    default:
      return "border-blue-400/30 bg-blue-600/70";
  }
};

export default function Shop() {
  const { handlePayGame } = useDepositIntoTreasury();
  const { fid } = useMiniApp();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handlePurchase = async (item: ShopItem) => {
    console.log(`Purchasing ${item.name} for $${item.price} USDC`);
    setLoadingItemId(item.id);
    switch (item.type) {
      case "attempts":
        await buyAttemps(item.price, item.quantity!);
        break;
      case "nft":
        await buyNft();
        break;
      case "bundle":
        console.log("TO DO");
    }
    setLoadingItemId(null);
  };

  const buyAttemps = async (priceToPay: number, quantity: number) => {
    try {
      const result = await handlePayGame(priceToPay);
      if (!!result && result.status === "success") {
        await refillHearts(fid!, quantity);
        toast.success("You have refilled... go to flap");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const buyNft = async () => {
    toast.info("TO DO");
  };

  const attemptsItems = shopItems.filter((item) => item.type === "attempts");
  const nftItems = shopItems.filter((item) => item.type === "nft");
  // const bundleItems = shopItems.filter((item) => item.type === "bundle");

  const renderCompactCard = (
    item: ShopItem,
    buttonText: string,
    buttonColor: string,
  ) => (
    <div
      key={item.id}
      className={`relative rounded-2xl p-4 border ${
        item.type === "nft"
          ? getRarityColor(item.rarity)
          : "border-blue-400/30 bg-blue-600/70"
      }`}
    >
      {/* Badges */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {item.bestValue && (
          <span className="bg-amber-500 text-white text-[8px] px-2 py-1 rounded-full ">
            BEST VALUE
          </span>
        )}
        {item.popular && !item.bestValue && (
          <span className="bg-green-500 text-white text-[8px] px-2 py-1 rounded-full ">
            POPULAR
          </span>
        )}
        {item.discount && (
          <span className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-full ">
            -{item.discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-blue-500/50 flex items-center justify-center border border-blue-400/30 flex-shrink-0">
          {item.type === "nft" ? (
            <span className="text-lg">🐸</span>
          ) : item.type === "bundle" ? (
            <Crown className="w-5 h-5 text-amber-400" />
          ) : (
            <span className="text-lg">
              <Gamepad2 className="w-5 h-5 text-green-400" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white  text-[10px] leading-tight">{item.name}</h3>
          <p className="text-blue-200 text-[8px]">{item.description}</p>
          {item.rarity && (
            <span
              className={`inline-block mt-1 text-[8px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                item.rarity === "legendary"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : item.rarity === "epic"
                    ? "bg-purple-500/20 text-purple-300"
                    : item.rarity === "rare"
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-green-500/20 text-green-300"
              }`}
            >
              {item.rarity}
            </span>
          )}
        </div>

        {/* Price & Button */}
        <div className="text-right flex-shrink-0">
          <div className="mb-2">
            <div className="flex items-center justify-end gap-1">
              <span className="text-green-400  text-[12px]">${item.price}</span>
            </div>
            {item.originalPrice && (
              <span className="text-gray-400 text-[8px] line-through">
                ${item.originalPrice}
              </span>
            )}
          </div>
          <button
            disabled={loadingItemId !== null && loadingItemId !== item.id}
            onClick={() => handlePurchase(item)}
            className={`${buttonColor} text-white px-3 py-1.5 rounded-lg  text-[8px]`}
          >
            {loadingItemId === item.id ? (
              <span className="loading loading-spinner loading-xs "></span>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <BaseLayout title="Flappy Frog Shop" className="mb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Game Attempts Section */}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 className="w-5 h-5 text-green-400" />
            <h2 className="text-white text-[13px] ">Game Attemps</h2>
          </div>
          <div className="space-y-3">
            {attemptsItems.map((item) =>
              renderCompactCard(item, "Buy", "bg-green-500 hover:bg-green-600"),
            )}
          </div>
        </section>

        {/* NFT Avatars Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-white text-[13px] ">Frog NFTs</h2>
          </div>
          <div className="space-y-3">
            {nftItems.map((item) =>
              renderCompactCard(
                item,
                "Mint",
                "bg-purple-500 hover:bg-purple-600",
              ),
            )}
          </div>
        </section>

        {/* Special Bundles Section */}
        {/*         <section>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-white text-[13px]">Special Bundles</h2>
          </div>
          <div className="space-y-3">
            {bundleItems.map((item) =>
              renderCompactCard(
                item,
                "Get Bundle",
                "bg-orange-500 hover:bg-orange-600",
              ),
            )}
          </div>
        </section> */}
      </div>
    </BaseLayout>
  );
}
