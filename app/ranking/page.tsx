import { getTopPlayers } from "@/actions";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { BaseLayout } from "@/components/menu/base-layout";

const RankingPage = async () => {
  const topPlayers = await getTopPlayers();
  return (
    <BaseLayout title="Top 10 Players" className="py-8 mb-20">
      <Leaderboard topPlayers={topPlayers} />
    </BaseLayout>
  );
};

export default RankingPage;
