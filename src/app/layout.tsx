import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#6b8c3e",
};

export const metadata: Metadata = {
  title: "Quiz Nutriție | Dumitrița Doboș - Consultant Nutriție Generală",
  description:
    "Descoperă planul de nutriție potrivit pentru tine. Completează quiz-ul gratuit și primește recomandări personalizate de la Doboș Dumitrița — Consultant Nutriție Generală, acreditată AIPNSF.",
  keywords: [
    "nutriție",
    "slăbire sănătoasă",
    "rețete sănătoase",
    "plan alimentar",
    "nutriționist",
    "Dumitrița Doboș",
    "dieta",
    "alimentație sănătoasă",
    "maraton de slăbit",
    "consultant nutriție",
  ],
  openGraph: {
    title: "Quiz Nutriție | Doboș Dumitrița - Consultant Nutriție Generală",
    description:
      "Completează quiz-ul gratuit și descoperă ce tip de alimentație ți se potrivește. Acreditare AIPNSF.",
    type: "website",
    locale: "ro_RO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiz Nutriție | Doboș Dumitrița",
    description:
      "Descoperă planul de nutriție potrivit pentru tine. Quiz gratuit + consultație personalizată.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dumitrița Nutriție",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <head>
        <link rel="apple-touch-icon" href="/images/profile.jpg" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
