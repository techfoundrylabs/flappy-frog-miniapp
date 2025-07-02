import { env } from "@/app/env";

export const ONCHAINKIT_PROJECT_NAME = env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME;
export const ONCHAINKIT_API_KEY = env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
export const APP_URL = env.NEXT_PUBLIC_URL;
export const SPLASH_IMAGE_URL = env.NEXT_PUBLIC_SPLASH_IMAGE_URL;
export const SPLASH_BACKGROUND_COLOR = `#${env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`;
export const IMAGE_URL = env.NEXT_PUBLIC_IMAGE_URL;
export const ICON_URL = env.NEXT_PUBLIC_ICON_URL;
export const VERSION = env.NEXT_PUBLIC_VERSION;
export const APP_ENV = env.NEXT_PUBLIC_APP_ENV;
export const NETWORK = env.NEXT_PUBLIC_NETWORK;
export const GAME_PRICE_USD = env.NEXT_PUBLIC_GAME_PRICE_USD;
export const MAX_HEARTS = env.NEXT_PUBLIC_MAX_HEARTS;

export const TREASURY_CONTRACT_ADDRESS =
  env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS;

export const CRON_SECRET = env.CRON_SECRET;

export const IS_MAINNET = NETWORK === "mainnet";

export const MINIAPP_METADATA_DESCRIPTION =
  "Fly, dodge, and dominate! Join the flight frenzy on the Base chain. Collect points, beat the pipes, and climb to the top for a chance to win the Treasury Pool in Ethereum (ETH). Connect your wallet and take off!";
