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
  themeColor: "#B26A35",
};

export const metadata: Metadata = {
  title: "Doboș Dumitrița — Consultant Nutriție Generală",
  description:
    "Descoperă planul de nutriție potrivit pentru tine. Quiz gratuit + consultație personalizată de la Doboș Dumitrița — Consultant Nutriție Generală, acreditată AIPNSF.",
  keywords: ["nutriție","slăbire sănătoasă","plan alimentar","consultant nutriție","Dumitrița Doboș","AIPNSF","maraton de slăbit"],
  openGraph: {
    title: "Doboș Dumitrița — Consultant Nutriție Generală",
    description: "Quiz gratuit de nutriție. Acreditare AIPNSF.",
    type: "website",
    locale: "ro_RO",
    url: "https://dumitrita-funnel.vercel.app",
    siteName: "Doboș Dumitrița",
    images: [{ url: "https://dumitrita-funnel.vercel.app/images/hero.jpg", width: 900, height: 1125, alt: "Doboș Dumitrița" }],
  },
  twitter: { card: "summary_large_image", title: "Doboș Dumitrița — Nutriție", description: "Quiz gratuit de nutriție + consultație personalizată." },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Dumitrița Nutriție" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://instagram.com" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <a href="#main-content" className="skip">Sari la conținut</a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context":"https://schema.org","@type":"HealthAndBeautyBusiness",
              name:"Doboș Dumitrița — Consultant Nutriție Generală",
              description:"Consultant Nutriție Generală acreditat AIPNSF. Planuri alimentare personalizate, Maratonul de Slăbit și rețete sănătoase.",
              url:"https://dumitrita-funnel.vercel.app",
              image:"https://dumitrita-funnel.vercel.app/images/hero.jpg",
              sameAs:["https://instagram.com/dobos_dumitrita","https://www.threads.com/@dobos_dumitrita"],
              hasCredential:{"@type":"EducationalOccupationalCredential",credentialCategory:"Aviz Liberă Practică",recognizedBy:{"@type":"Organization",name:"AIPNSF"}},
            }),
          }}
        />
      </body>
    </html>
  );
}
