/*
  Warnings:

  - Added the required column `title` to the `StreakHistory` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `StreakHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `StreakHistory` DROP FOREIGN KEY `StreakHistory_streakId_fkey`;

-- DropForeignKey
ALTER TABLE `StreakHistory` DROP FOREIGN KEY `StreakHistory_userId_fkey`;

-- DropIndex
DROP INDEX `StreakHistory_streakId_userId_idx` ON `StreakHistory`;

-- AlterTable
ALTER TABLE `StreakHistory` ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT 'Session',
    ALTER COLUMN `userId` DROP DEFAULT,
    MODIFY `description` VARCHAR(191) NOT NULL DEFAULT '';

-- Update existing rows with empty descriptions
UPDATE `StreakHistory` SET `description` = '' WHERE `description` IS NULL;

-- AddForeignKey
ALTER TABLE `StreakHistory` ADD CONSTRAINT `StreakHistory_streakId_fkey` FOREIGN KEY (`streakId`) REFERENCES `Streak`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StreakHistory` ADD CONSTRAINT `StreakHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
