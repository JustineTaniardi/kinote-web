-- Add userId column to StreakHistory
ALTER TABLE `StreakHistory` ADD COLUMN `userId` INT NOT NULL DEFAULT 1 AFTER `streakId`;

-- Add foreign key constraint for userId
ALTER TABLE `StreakHistory` ADD CONSTRAINT `StreakHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE;

-- Remove breakCount column from StreakHistory
ALTER TABLE `StreakHistory` DROP COLUMN `breakCount`;

-- Create index for userId and streakId for faster queries
CREATE INDEX `StreakHistory_userId_idx` ON `StreakHistory`(`userId`);
CREATE INDEX `StreakHistory_streakId_userId_idx` ON `StreakHistory`(`streakId`, `userId`);
