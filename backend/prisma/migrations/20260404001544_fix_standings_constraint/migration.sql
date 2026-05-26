/*
  Warnings:

  - You are about to drop the column `season` on the `standings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[playerId,season,leagueId]` on the table `player_stats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leagueId,leagueSeason,teamId]` on the table `standings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `leagueId` to the `player_stats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_teamId_fkey";

-- DropIndex
DROP INDEX "player_stats_playerId_season_key";

-- DropIndex
DROP INDEX "standings_leagueId_season_teamId_key";

-- AlterTable
ALTER TABLE "player_stats" ADD COLUMN     "leagueId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "players" ALTER COLUMN "teamId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "standings" DROP COLUMN "season";

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_playerId_season_leagueId_key" ON "player_stats"("playerId", "season", "leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "standings_leagueId_leagueSeason_teamId_key" ON "standings"("leagueId", "leagueSeason", "teamId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_leagueId_season_fkey" FOREIGN KEY ("leagueId", "season") REFERENCES "leagues"("id", "season") ON DELETE RESTRICT ON UPDATE CASCADE;
