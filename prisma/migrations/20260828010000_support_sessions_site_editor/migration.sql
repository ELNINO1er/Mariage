ALTER TABLE `Wedding`
  ADD COLUMN `heroEyebrow` VARCHAR(180) NULL,
  ADD COLUMN `storyTitle` VARCHAR(240) NULL,
  ADD COLUMN `storyText` TEXT NULL,
  ADD COLUMN `siteSections` JSON NULL;

CREATE TABLE `AdminSupportSession` (
  `id` VARCHAR(191) NOT NULL,
  `adminId` VARCHAR(191) NOT NULL,
  `weddingId` VARCHAR(191) NOT NULL,
  `reason` VARCHAR(500) NOT NULL,
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NOT NULL,
  `endedAt` DATETIME(3) NULL,
  INDEX `AdminSupportSession_adminId_expiresAt_idx` (`adminId`, `expiresAt`),
  INDEX `AdminSupportSession_weddingId_startedAt_idx` (`weddingId`, `startedAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `AdminSupportSession_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AdminSupportSession_weddingId_fkey` FOREIGN KEY (`weddingId`) REFERENCES `Wedding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
