import { APP_URL } from "@/config/constants";
import sdk from "@farcaster/frame-sdk";

export const shareCastPoint = async (
  fid: number | undefined,
  score: number,
) => {
  try {
    await sdk.actions.composeCast({
      text: `My latest game score is ${score}!\nHit the button and show me what you’ve got!🚀​`,
      embeds: [`${APP_URL}/share/${fid}/${score}`],
    });
  } catch (error) {
    console.error(error);
  }
};

export const shareCastRank = async (
  fid: number | undefined,
  score: number,
  rank: number,
) => {
  try {
    await sdk.actions.composeCast({
      text: `Flappy Frog domination! Scored ${score} and claimed rank ${rank}!🐸🎖️​\nDo you think can leap past me and win the treasury pool?🏆\nChallenge accepted? Hit the button and flap to the top!🚀`,
      embeds: [`${APP_URL}/share/${fid}/${score}/${rank}`],
    });
  } catch (error) {
    console.error(error);
  }
};
