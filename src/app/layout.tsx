import type { Metadata } from "next";
import { Playfair_Display, Lato, Great_Vibes } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "./Providers";
import "./globals.css";
import prisma from "@/lib/prisma";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export const dynamic = 'force-dynamic';

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  weight: ["400", "700"],
  variable: "--font-lato",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-greatvibes",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAJ Turkish Restaurant | Authentic Turkish Cuisine",
  description: "Experience the rich, authentic flavours of NAJ Turkish Restaurant. Offering traditional grills, mezes, and more in Sandwich and Broadstairs.",
  keywords: ["Turkish Restaurant", "Kebab", "Meze", "Sandwich", "Broadstairs", "Halal Food", "NAJ Turkish Restaurant"],
  openGraph: {
    title: "NAJ Turkish Restaurant | Authentic Turkish Cuisine",
    description: "Experience the rich, authentic flavours of NAJ Turkish Restaurant.",
    url: "https://najturkishrestaurant.com", // Replace with actual domain
    siteName: "NAJ Turkish Restaurant",
    images: [
      {
        url: "/logo.png", // Ensure you upload the logo as logo.png in the public folder
        width: 800,
        height: 600,
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {},
  });

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable} ${greatVibes.variable}`}>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
          <Footer />
          <WhatsAppWidget phoneNumber={settings.whatsappNumber} message={settings.whatsappMessage} />
        </Providers>
      </body>
    </html>
  );
}
