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
  themeColor: "#B8703A",
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
    url: "https://dumitrita-funnel.vercel.app",
    siteName: "Doboș Dumitrița — Nutriție",
    images: [
      {
        url: "https://dumitrita-funnel.vercel.app/images/hero.jpg",
        width: 900,
        height: 1125,
        alt: "Doboș Dumitrița — Consultant Nutriție Generală",
      },
    ],
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
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Sari la conținut</a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HealthAndBeautyBusiness",
              name: "Doboș Dumitrița — Consultant Nutriție Generală",
              description:
                "Consultant Nutriție Generală acreditat AIPNSF. Planuri alimentare personalizate, Maratonul de Slăbit și rețete sănătoase.",
              url: "https://dumitrita-funnel.vercel.app",
              image: "https://dumitrita-funnel.vercel.app/images/hero.jpg",
              priceRange: "$$",
              knowsAbout: [
                "Nutriție",
                "Slăbire sănătoasă",
                "Plan alimentar",
                "Rețete sănătoase",
              ],
              sameAs: [
                "https://instagram.com/dobos_dumitrita",
                "https://www.threads.com/@dobos_dumitrita",
              ],
              hasCredential: {
                "@type": "EducationalOccupationalCredential",
                credentialCategory: "Aviz Liberă Practică",
                recognizedBy: {
                  "@type": "Organization",
                  name: "AIPNSF — Asociația Internațională de Psihologie, Nutriție, Sport și Fitness",
                },
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
