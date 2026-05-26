/*
  Warnings:

  - The primary key for the `leagues` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `leagueSeason` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leagueSeason` to the `standings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "standings" DROP CONSTRAINT "standings_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_leagueId_fkey";

-- DropIndex
DROP INDEX "leagues_id_season_key";

-- AlterTable
ALTER TABLE "leagues" DROP CONSTRAINT "leagues_pkey",
ADD CONSTRAINT "leagues_pkey" PRIMARY KEY ("id", "season");

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "leagueSeason" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "standings" ADD COLUMN     "leagueSeason" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_leagueId_leagueSeason_fkey" FOREIGN KEY ("leagueId", "leagueSeason") REFERENCES "leagues"("id", "season") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_leagueId_leagueSeason_fkey" FOREIGN KEY ("leagueId", "leagueSeason") REFERENCES "leagues"("id", "season") ON DELETE RESTRICT ON UPDATE CASCADE;
