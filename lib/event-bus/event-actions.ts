import sdk from "@farcaster/frame-sdk";

const URL = process.env.NEXT_PUBLIC_URL ?? "";

export const shareCast = async (score: number) => {
  try {
    await sdk.actions.composeCast({
      text: `Check out this game! My score is ${score}.`,
      embeds: [URL],
    });
  } catch (error) {
    console.error(error);
  }
};
