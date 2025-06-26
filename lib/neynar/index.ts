import { env } from "@/app/env";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const config = new Configuration({
  apiKey: env.NEYNAR_API_KEY,
});

const client = new NeynarAPIClient(config);

export async function fetchFarcasterUser(fid: number) {
  try {
    const fids = [fid];

    const { users } = await client.fetchBulkUsers({ fids });
    const user = users[0];
    return user;
  } catch (error) {
    console.error(error);
  }
}
