-- DropForeignKey
ALTER TABLE `StreakHistory` DROP FOREIGN KEY `StreakHistory_streakId_fkey`;

-- DropForeignKey
ALTER TABLE `StreakHistory` DROP FOREIGN KEY `StreakHistory_userId_fkey`;

-- DropIndex
DROP INDEX `StreakHistory_streakId_userId_idx` ON `StreakHistory`;

-- AlterTable
ALTER TABLE `StreakHistory` ALTER COLUMN `userId` DROP DEFAULT,
    ALTER COLUMN `description` DROP DEFAULT,
    ALTER COLUMN `title` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Task` ADD COLUMN `categoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StreakHistory` ADD CONSTRAINT `StreakHistory_streakId_fkey` FOREIGN KEY (`streakId`) REFERENCES `Streak`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StreakHistory` ADD CONSTRAINT `StreakHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
