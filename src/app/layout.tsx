import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const editorial = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-editorial", weight: ["400", "500", "600", "700"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Noces — Vos invités, simplement",
  description: "Invitations digitales, RSVP et accueil de vos invités jusqu'au jour J.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className={`${editorial.variable} ${sans.variable} font-[family-name:var(--font-sans)] antialiased`}>{children}</body></html>;
}
