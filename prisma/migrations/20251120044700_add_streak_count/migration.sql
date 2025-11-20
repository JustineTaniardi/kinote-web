/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Streak` DROP FOREIGN KEY `Streak_dayId_fkey`;

-- DropIndex
DROP INDEX `User_emailVerificationToken_key` ON `User`;

-- AlterTable
ALTER TABLE `Streak` ADD COLUMN `dayIds` JSON NOT NULL,
    ADD COLUMN `streakCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `dayId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `emailVerificationToken`,
    DROP COLUMN `emailVerifiedAt`;

-- AddForeignKey
ALTER TABLE `Streak` ADD CONSTRAINT `Streak_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `Day`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
