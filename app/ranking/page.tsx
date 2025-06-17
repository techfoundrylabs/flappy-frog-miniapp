import { getTopPlayers } from "@/actions";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { BaseLayout } from "@/components/menu/base-layout";
import { TreasuryPoolInfo } from "@/components/treasury-pool-info/treasury-pool-info";

const RankingPage = async () => {
  const topPlayers = await getTopPlayers();
  return (
    <>
      <BaseLayout title=" Treasury Pool Info" className="py-8 mb-20">
        <div className="flex w-full flex-col gap-y-12">
          <TreasuryPoolInfo />
          <Leaderboard topPlayers={topPlayers} />
        </div>
      </BaseLayout>
    </>
  );
};

export default RankingPage;
