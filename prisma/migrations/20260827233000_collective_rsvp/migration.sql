ALTER TABLE `Wedding`
  ADD COLUMN `publicRsvpEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `publicRsvpToken` VARCHAR(96) NULL,
  ADD COLUMN `publicRsvpMaxGuests` INTEGER NOT NULL DEFAULT 6;

CREATE UNIQUE INDEX `Wedding_publicRsvpToken_key` ON `Wedding`(`publicRsvpToken`);
