import { APP_URL } from "@/config/constants";
import sdk from "@farcaster/frame-sdk";

export const shareCast = async (
  fid: number | undefined,
  score: number,
  rank: number = 0,
) => {
  try {
    const addtionalText = !!rank && rank > 0 ? ` and my rank is ${rank}` : "";
    await sdk.actions.composeCast({
      text: `Check out this game! My score is ${score}${addtionalText}.\nWould you like to try to beat this score and try to win the treasury pool?.\nCome on, press the button and play`,
      embeds: [`${APP_URL}/share/${fid}/${score}`],
    });
  } catch (error) {
    console.error(error);
  }
};
