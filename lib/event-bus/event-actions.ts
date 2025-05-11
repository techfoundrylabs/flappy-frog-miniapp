import { APP_URL } from "@/config/constants";
import sdk from "@farcaster/frame-sdk";

export const shareCast = async (score: number) => {
  try {
    await sdk.actions.composeCast({
      text: `Check out this game! My score is ${score}.\nWould you like to try to beat this score and try to win the treasury pool?.\nCome on, press the button and play`,
      embeds: [APP_URL],
    });
  } catch (error) {
    console.error(error);
  }
};
