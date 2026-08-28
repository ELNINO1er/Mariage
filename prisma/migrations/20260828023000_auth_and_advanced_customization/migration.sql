ALTER TABLE `User` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL;
UPDATE `User` SET `emailVerifiedAt` = `createdAt`;

ALTER TABLE `Wedding`
  ADD COLUMN `customAccent` VARCHAR(9) NULL,
  ADD COLUMN `fontStyle` VARCHAR(191) NOT NULL DEFAULT 'romantic',
  ADD COLUMN `backgroundStyle` VARCHAR(191) NOT NULL DEFAULT 'paper',
  ADD COLUMN `cornerStyle` VARCHAR(191) NOT NULL DEFAULT 'soft',
  ADD COLUMN `motionStyle` VARCHAR(191) NOT NULL DEFAULT 'gentle',
  ADD COLUMN `heroOverlay` INTEGER NOT NULL DEFAULT 35;

CREATE TABLE `PasswordResetToken` (
  `id` VARCHAR(191) NOT NULL, `userId` VARCHAR(191) NOT NULL, `tokenHash` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL, `usedAt` DATETIME(3) NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`), INDEX `PasswordResetToken_userId_expiresAt_idx`(`userId`,`expiresAt`), PRIMARY KEY (`id`),
  CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EmailVerificationToken` (
  `id` VARCHAR(191) NOT NULL, `userId` VARCHAR(191) NOT NULL, `tokenHash` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL, `usedAt` DATETIME(3) NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `EmailVerificationToken_tokenHash_key`(`tokenHash`), INDEX `EmailVerificationToken_userId_expiresAt_idx`(`userId`,`expiresAt`), PRIMARY KEY (`id`),
  CONSTRAINT `EmailVerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
