import { APP_URL } from "@/config/constants";
import sdk from "@farcaster/frame-sdk";

export const shareCast = async (score: number) => {
  try {
    console.log("=====>", score);
    await sdk.actions.composeCast({
      text: `Check out this game!\nWould you like to try to beat this score and try to win the treasury pool?.\nCome on, press the button and play`,
      embeds: [`${APP_URL}/cast`],
    });
  } catch (error) {
    console.error(error);
  }
};
