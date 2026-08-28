import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const getPublicInvitation = cache(async (weddingSlug: string, token: string) => {
  await connection();
  if (weddingSlug.length > 191 || token.length < 32 || token.length > 96) return null;

  return prisma.invitation.findFirst({
    where: { token, guest: { wedding: { slug: weddingSlug } } },
    select: {
      token: true,
      guest: {
        select: {
          firstName: true,
          lastName: true,
          maxGuests: true,
          status: true,
          companions: { select: { name: true }, orderBy: { id: "asc" } },
          rsvp: { select: { guestCount: true, childrenCount: true, contactPhone: true, message: true, status: true } },
          wedding: {
            select: {
              slug: true,
              partnerOne: true,
              partnerTwo: true,
              weddingDate: true,
              rsvpDeadline: true,
              city: true,
              country: true,
              coverImageUrl: true,
              partnerOneImageUrl: true,
              partnerTwoImageUrl: true,
              message: true,
              dressCode: true,
              contactPhone: true,
              theme: true,
              accentColor: true,
              siteLayout: true,
              heroEyebrow: true,
              storyTitle: true,
              storyText: true,
              siteSections: true,
              customAccent: true,
              fontStyle: true,
              backgroundStyle: true,
              cornerStyle: true,
              motionStyle: true,
              heroOverlay: true,
              venues: { orderBy: { startsAt: "asc" } },
              schedule: { orderBy: [{ position: "asc" }, { startsAt: "asc" }] },
              galleryPhotos: {
                where: { status: "APPROVED" },
                select: { id: true, imageUrl: true, width: true, height: true, caption: true, guest: { select: { firstName: true } } },
                orderBy: { createdAt: "desc" },
                take: 60,
              },
              guestBookEntries: {
                where: { status: "APPROVED" },
                select: { id: true, message: true, createdAt: true, guest: { select: { firstName: true } } },
                orderBy: { createdAt: "desc" },
                take: 60,
              },
            },
          },
        },
      },
    },
  });
});
