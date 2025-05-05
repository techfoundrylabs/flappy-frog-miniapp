import { NEYNAR_API_KEY } from "@/lib/neynar/config";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

let client: NeynarAPIClient | undefined = undefined;

export const getNeynarClient = () => {
  if (!NEYNAR_API_KEY) throw new Error("No Neynar Api Key found");
  if (!client) {
    const config = new Configuration({
      apiKey: NEYNAR_API_KEY,
    });
    client = new NeynarAPIClient(config);
  }
  return client;
};
