-- AlterTable
ALTER TABLE `User` ADD COLUMN `platformRole` ENUM('USER', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE `Wedding`
  ADD COLUMN `partnerOneImageUrl` VARCHAR(191) NULL,
  ADD COLUMN `partnerTwoImageUrl` VARCHAR(191) NULL,
  ADD COLUMN `publicGuestListEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `publicGuestListToken` VARCHAR(96) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Wedding_publicGuestListToken_key` ON `Wedding`(`publicGuestListToken`);
