import { z } from "zod";

const optionalContact = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(190).optional(),
);

export const guestInputSchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").max(80),
  lastName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  email: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().email("Adresse e-mail invalide").max(190).transform((value) => value.toLowerCase()).optional(),
  ),
  phone: optionalContact,
  groupId: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().cuid().optional(),
  ),
  maxGuests: z.coerce.number().int().min(1, "Une place minimum").max(20, "Maximum 20 places"),
  notes: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(2000).optional(),
  ),
});

export const guestUpdateSchema = guestInputSchema.extend({ id: z.string().cuid() });

export const importedGuestSchema = guestInputSchema.omit({ groupId: true }).extend({
  groupName: z.string().trim().max(100).optional(),
});

export type GuestInput = z.infer<typeof guestInputSchema>;
export type ImportedGuest = z.infer<typeof importedGuestSchema>;
