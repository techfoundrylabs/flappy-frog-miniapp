export type AssetPairs = "ETH_USD";

type FeedPrice = Record<number, `0x${string}`>;

type ChainLinkFeedPrice = Record<AssetPairs, FeedPrice>;

export const chainLinkFeedPrice: ChainLinkFeedPrice = {
  ETH_USD: {
    8453: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    84532: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  },
};
