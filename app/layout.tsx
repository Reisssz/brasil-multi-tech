import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { SITE } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: {
    default: `${SITE.name} — Celulares, notebooks e acessórios com garantia`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Compre celulares novos e seminovos, notebooks e acessórios com garantia de até 12 meses, desconto no Pix e parcelamento em até 18x. Entrega para todo o Brasil.",
  keywords: [
    "celulares seminovos",
    "iphone seminovo",
    "smartphones",
    "acessórios para celular",
    "brasil multi tech",
  ],
  openGraph: {
    title: `${SITE.name} — Tecnologia acessível, com garantia de verdade`,
    description:
      "Celulares, notebooks e acessórios com garantia, desconto no Pix e parcelamento em até 18x.",
    siteName: SITE.name,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          <TopBar />
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
