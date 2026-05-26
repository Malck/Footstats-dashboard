-- AlterTable
ALTER TABLE "player_stats" ADD COLUMN     "teamId" INTEGER;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
