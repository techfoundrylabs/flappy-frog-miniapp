// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    FARCASTER_HEADER: z.string(),
    FARCASTER_PAYLOAD: z.string(),
    FARCASTER_SIGNATURE: z.string(),
    REDIS_URL: z.string().url(),
    REDIS_TOKEN: z.string(),
    NEYNAR_API_KEY: z.string(),
    CRON_SECRET: z.string(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_ENV: z
      .enum(["development", "production"])
      .optional()
      .default("development"),

    NEXT_PUBLIC_ICON_URL: z.string().url().optional(),
    NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME: z.string().default("my-miniapp"),
    NEXT_PUBLIC_ONCHAINKIT_API_KEY: z.string(),
    NEXT_PUBLIC_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_SPLASH_IMAGE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR: z.string().default("#FFFFFF"),
    NEXT_PUBLIC_IMAGE_URL: z.string().url().optional(),
    NEXT_PUBLIC_VERSION: z.string().default("1.0"),
    NEXT_PUBLIC_NETWORK: z
      .enum(["mainnet", "testnet"])
      .optional()
      .default("testnet"),
    NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS: z.string().startsWith("0x"),
    NEXT_PUBLIC_GAME_PRICE_USD: z.coerce.number().default(1),
    NEXT_PUBLIC_MAX_HEARTS: z.coerce.number().default(5),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME:
      process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    NEXT_PUBLIC_ONCHAINKIT_API_KEY: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_SPLASH_IMAGE_URL: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL,
    NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR:
      process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
    NEXT_PUBLIC_IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL,
    NEXT_PUBLIC_ICON_URL: process.env.NEXT_PUBLIC_ICON_URL,
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
    NEXT_PUBLIC_GAME_PRICE_USD: process.env.NEXT_PUBLIC_GAME_PRICE_USD,
    NEXT_PUBLIC_MAX_HEARTS: process.env.NEXT_PUBLIC_MAX_HEARTS,

    FARCASTER_HEADER: process.env.FARCASTER_HEADER,
    FARCASTER_PAYLOAD: process.env.FARCASTER_PAYLOAD,
    FARCASTER_SIGNATURE: process.env.FARCASTER_SIGNATURE,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  },
});
