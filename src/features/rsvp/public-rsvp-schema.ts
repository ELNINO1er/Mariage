import { z } from "zod";

const optionalText = (maximum: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(maximum).optional(),
);

export const publicRsvpSchema = z.object({
  weddingSlug: z.string().trim().min(1).max(191),
  token: z.string().min(32).max(96),
  firstName: z.string().trim().min(2, "Prénom trop court").max(80),
  lastName: z.string().trim().min(2, "Nom trop court").max(80),
  email: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().toLowerCase().email("E-mail invalide").max(190).optional()),
  phone: optionalText(40),
  status: z.enum(["CONFIRMED", "DECLINED"]),
  guestCount: z.coerce.number().int().min(0).max(20),
  childrenCount: z.coerce.number().int().min(0).max(20),
  companions: z.array(z.string().trim().min(2).max(120)).max(19),
  message: optionalText(1000),
  website: optionalText(200),
}).superRefine((data, context) => {
  if (!data.email && !data.phone) context.addIssue({ code: "custom", message: "Indiquez un e-mail ou un téléphone.", path: ["email"] });
  if (data.status === "CONFIRMED" && data.guestCount < 1) context.addIssue({ code: "custom", message: "Choisissez au moins une personne.", path: ["guestCount"] });
  if (data.childrenCount > data.guestCount) context.addIssue({ code: "custom", message: "Le nombre d’enfants est trop élevé.", path: ["childrenCount"] });
  if (data.companions.length > Math.max(0, data.guestCount - 1)) context.addIssue({ code: "custom", message: "Trop d’accompagnateurs.", path: ["companions"] });
});

export type PublicRsvpInput = z.infer<typeof publicRsvpSchema>;
