import { getNeynarClient } from "@/lib/neynar";

export const fetchUser = async (fid: number) => {
  try {
    const neymarClinet = getNeynarClient();

    const usersInfo = (await neymarClinet.fetchBulkUsers({ fids: [fid] }))
      .users;

    const userInfo = usersInfo[0];

    return userInfo;
  } catch (error) {
    console.error(error);
  }
};
