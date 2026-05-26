-- AlterTable
ALTER TABLE "player_stats" ADD COLUMN     "goalsConceded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saves" INTEGER NOT NULL DEFAULT 0;
