"use client";

import {
  Sparkles,
  Crown,
  ShoppingCart,
  Coins,
  Gamepad2,
  Zap,
} from "lucide-react";
import Navigation from "./components/navigation";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: "attempts" | "avatar" | "powerup" | "special";
  image: string;
  quantity?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
  discount?: number;
}

interface ShopProps {
  onNavigate: (page: "user" | "ranking" | "game" | "shop" | "info") => void;
}

const shopItems: ShopItem[] = [
  // Game Attempts
  {
    id: "attempts-5",
    name: "5 Hop Attempts",
    description: "Continue your Flappy Frog journey",
    price: 0.001,
    currency: "ETH",
    type: "attempts",
    image: "/placeholder.svg?height=80&width=80",
    quantity: 5,
  },
  {
    id: "attempts-15",
    name: "15 Hop Attempts",
    description: "Extended gameplay for serious hoppers",
    price: 0.002,
    currency: "ETH",
    type: "attempts",
    image: "/placeholder.svg?height=80&width=80",
    quantity: 15,
    discount: 20,
  },
  {
    id: "attempts-unlimited",
    name: "Unlimited Hops (24h)",
    description: "Hop without limits for a full day",
    price: 0.005,
    currency: "ETH",
    type: "attempts",
    image: "/placeholder.svg?height=80&width=80",
    discount: 35,
  },

  // Frog Avatars (NFTs)
  {
    id: "avatar-golden",
    name: "Golden Frog",
    description: "Legendary shimmering frog avatar",
    price: 0.05,
    currency: "ETH",
    type: "avatar",
    image: "/placeholder.svg?height=80&width=80",
    rarity: "legendary",
  },
  {
    id: "avatar-ninja",
    name: "Ninja Frog",
    description: "Epic stealth frog with special abilities",
    price: 0.03,
    currency: "ETH",
    type: "avatar",
    image: "/placeholder.svg?height=80&width=80",
    rarity: "epic",
  },
  {
    id: "avatar-royal",
    name: "Royal Frog",
    description: "Rare crowned frog with royal cape",
    price: 0.02,
    currency: "ETH",
    type: "avatar",
    image: "/placeholder.svg?height=80&width=80",
    rarity: "rare",
  },
  {
    id: "avatar-cyber",
    name: "Cyber Frog",
    description: "Futuristic frog with neon glow",
    price: 0.015,
    currency: "ETH",
    type: "avatar",
    image: "/placeholder.svg?height=80&width=80",
    rarity: "rare",
  },

  // Power-ups
  {
    id: "powerup-shield",
    name: "Lily Pad Shield",
    description: "Protects from one collision",
    price: 0.003,
    currency: "ETH",
    type: "powerup",
    image: "/placeholder.svg?height=80&width=80",
    quantity: 3,
  },
  {
    id: "powerup-magnet",
    name: "Fly Magnet",
    description: "Attracts flies automatically",
    price: 0.004,
    currency: "ETH",
    type: "powerup",
    image: "/placeholder.svg?height=80&width=80",
    quantity: 5,
  },

  // Special Bundles
  {
    id: "special-starter",
    name: "Tadpole Starter Pack",
    description: "25 Attempts + Common Frog Avatar + Shield",
    price: 0.008,
    currency: "ETH",
    type: "special",
    image: "/placeholder.svg?height=80&width=80",
    discount: 50,
  },
  {
    id: "special-master",
    name: "Frog Master Bundle",
    description: "Unlimited 24h + Epic Avatar + All Power-ups",
    price: 0.035,
    currency: "ETH",
    type: "special",
    image: "/placeholder.svg?height=80&width=80",
    discount: 40,
  },
];

const getRarityColor = (rarity?: string) => {
  switch (rarity) {
    case "legendary":
      return "from-yellow-400 to-orange-500";
    case "epic":
      return "from-purple-400 to-pink-500";
    case "rare":
      return "from-blue-400 to-cyan-500";
    case "common":
      return "from-green-400 to-emerald-500";
    default:
      return "from-white/20 to-white/10";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "attempts":
      return <Gamepad2 className="w-5 h-5 text-green-400" />;
    case "avatar":
      return <Sparkles className="w-5 h-5 text-purple-400" />;
    case "powerup":
      return <Zap className="w-5 h-5 text-yellow-400" />;
    case "special":
      return <Crown className="w-5 h-5 text-orange-400" />;
    default:
      return <ShoppingCart className="w-5 h-5" />;
  }
};

export default function Shop({ onNavigate }: ShopProps) {
  const handlePurchase = (item: ShopItem) => {
    console.log(`Purchasing ${item.name}`);
  };

  const attemptsItems = shopItems.filter((item) => item.type === "attempts");
  const avatarItems = shopItems.filter((item) => item.type === "avatar");
  const powerupItems = shopItems.filter((item) => item.type === "powerup");
  const specialItems = shopItems.filter((item) => item.type === "special");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-4 pb-20">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-white text-3xl font-bold tracking-wider mb-2">
          FROG SHOP
        </h1>
        <div className="flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5 text-green-400" />
          <span className="text-blue-200 text-sm">
            Attempts, Avatars & Power-ups
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Attempts Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="w-6 h-6 text-green-400" />
            <h2 className="text-white text-xl font-bold">Game Attempts</h2>
          </div>
          <div className="space-y-3">
            {attemptsItems.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center border border-green-400/30">
                    <Gamepad2 className="w-8 h-8 text-green-400" />
                    {item.quantity && (
                      <span className="absolute text-white text-xs font-bold mt-6">
                        x{item.quantity}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      {item.discount && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          -{item.discount}%
                        </span>
                      )}
                    </div>
                    <p className="text-blue-200 text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">
                        {item.price} {item.currency}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frog Avatars Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-white text-xl font-bold">Frog Avatars</h2>
          </div>
          <div className="space-y-3">
            {avatarItems.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRarityColor(item.rarity)} flex items-center justify-center border border-white/30`}
                  >
                    <span className="text-2xl">🐸</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${
                          item.rarity === "legendary"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : item.rarity === "epic"
                              ? "bg-purple-500/20 text-purple-400"
                              : item.rarity === "rare"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {item.rarity}
                      </span>
                    </div>
                    <p className="text-blue-200 text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">
                        {item.price} {item.currency}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-purple-600 hover:to-pink-700 transition-all"
                  >
                    Mint
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Power-ups Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-white text-xl font-bold">Power-ups</h2>
          </div>
          <div className="space-y-3">
            {powerupItems.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center border border-yellow-400/30">
                    <Zap className="w-8 h-8 text-yellow-400" />
                    {item.quantity && (
                      <span className="absolute text-white text-xs font-bold mt-6">
                        x{item.quantity}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{item.name}</h3>
                    <p className="text-blue-200 text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">
                        {item.price} {item.currency}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-yellow-600 hover:to-orange-700 transition-all"
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Special Offers Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-orange-400" />
            <h2 className="text-white text-xl font-bold">Special Bundles</h2>
          </div>
          <div className="space-y-3">
            {specialItems.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-2xl p-4 border border-orange-400/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400/30 to-red-500/30 flex items-center justify-center border border-orange-400/50">
                    <Crown className="w-8 h-8 text-orange-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      {item.discount && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          -{item.discount}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-blue-200 text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">
                        {item.price} {item.currency}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-700 transition-all"
                  >
                    Get Bundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Navigation currentPage="shop" onNavigate={onNavigate} />
    </div>
  );
}
