import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", /* Change 82: font-display swap for faster text rendering */
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#B26A35",
};

/* Change 83: improved metadata with more keywords + better descriptions */
export const metadata: Metadata = {
  title: "Doboș Dumitrița — Consultant Nutriție Generală | Acreditare AIPNSF",
  description:
    "Slăbire sănătoasă cu Doboș Dumitrița — Consultant Nutriție Generală acreditat AIPNSF (Nr. 598). Maratonul de Slăbit: plan alimentar personalizat, 136+ membri, rezultate documentate (-18.3 kg). Quiz gratuit + consultație pe WhatsApp.",
  keywords: ["nutriție","slăbire sănătoasă","plan alimentar personalizat","consultant nutriție","Dumitrița Doboș","AIPNSF","maratonul de slăbit","rețete sănătoase","nutriționist acreditat","dieta sănătoasă"],
  /* Change 84: canonical URL */
  alternates: { canonical: "https://dumitrita-funnel.vercel.app" },
  openGraph: {
    title: "Doboș Dumitrița — Consultant Nutriție Generală",
    description: "Slăbire sănătoasă cu plan alimentar personalizat. -18.3 kg documentat. Quiz gratuit + consultație WhatsApp.",
    type: "website",
    locale: "ro_RO",
    url: "https://dumitrita-funnel.vercel.app",
    siteName: "Doboș Dumitrița — Nutriție",
    images: [{ url: "https://dumitrita-funnel.vercel.app/images/hero.jpg", width: 900, height: 1125, alt: "Doboș Dumitrița — Consultant Nutriție Generală acreditat AIPNSF" }],
  },
  /* Change 85: better twitter card */
  twitter: { card: "summary_large_image", title: "Doboș Dumitrița — Nutriție Acreditată AIPNSF", description: "Plan alimentar personalizat + Maratonul de Slăbit. Quiz gratuit, consultație pe WhatsApp." },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Dumitrița Nutriție" },
  formatDetection: { telephone: false },
  /* Change 86: category metadata */
  category: "health",
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
        {/* Change 87: preload hero image for LCP */}
        <link rel="preload" as="image" href="/images/hero.jpg" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <a href="#main-content" className="skip">Sari la conținut</a>
        {/* Change 88: improved noscript */}
        <noscript>
          <div style={{padding:"2rem",textAlign:"center",background:"#FDF5ED",color:"#3D322A",fontFamily:"Georgia,serif",minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <h1 style={{fontSize:"1.5rem",marginBottom:"1rem"}}>Doboș Dumitrița — Consultant Nutriție Generală</h1>
            <p style={{marginBottom:"0.5rem"}}>Acreditare AIPNSF · Nr. 598 · 2025</p>
            <p>Pentru experiența completă, activează JavaScript în browser.</p>
            <p style={{marginTop:"1rem"}}>
              Contactează-mă pe <a href="https://wa.me/393288461370" style={{color:"#25d366",fontWeight:"bold"}}>WhatsApp</a> sau <a href="https://instagram.com/dobos_dumitrita" style={{color:"#B26A35",fontWeight:"bold"}}>Instagram @dobos_dumitrita</a>
            </p>
          </div>
        </noscript>
        {children}
        {/* Change 89: enhanced JSON-LD with FAQ schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context":"https://schema.org","@type":"HealthAndBeautyBusiness",
              name:"Doboș Dumitrița — Consultant Nutriție Generală",
              description:"Consultant Nutriție Generală acreditat AIPNSF. Planuri alimentare personalizate, Maratonul de Slăbit și rețete sănătoase. 16.7K followers pe Instagram.",
              url:"https://dumitrita-funnel.vercel.app",
              image:"https://dumitrita-funnel.vercel.app/images/hero.jpg",
              sameAs:["https://instagram.com/dobos_dumitrita","https://www.threads.com/@dobos_dumitrita"],
              hasCredential:{"@type":"EducationalOccupationalCredential",credentialCategory:"Aviz Liberă Practică",recognizedBy:{"@type":"Organization",name:"AIPNSF"}},
              aggregateRating:{"@type":"AggregateRating",ratingValue:"5",reviewCount:"2",bestRating:"5"},
            }),
          }}
        />
        {/* Change 90: FAQ schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context":"https://schema.org","@type":"FAQPage",
              mainEntity:[
                {
                  "@type":"Question",name:"Cum funcționează Maratonul de Slăbit?",
                  acceptedAnswer:{"@type":"Answer",text:"Este un program cu suport zilnic prin grupul de WhatsApp (136+ membri), rețete noi în fiecare săptămână și plan alimentar personalizat."}
                },
                {
                  "@type":"Question",name:"Trebuie să renunț la alimentele preferate?",
                  acceptedAnswer:{"@type":"Answer",text:"Nu. Cu mine înveți să te alimentezi sănătos și gustos. Slăbirea sănătoasă nu înseamnă foame — înseamnă un plan clar și consistență."}
                },
                {
                  "@type":"Question",name:"Ce rezultate au avut participantele?",
                  acceptedAnswer:{"@type":"Answer",text:"Cea mai documentată transformare: -18.3 kg, -16 cm talie, -18 cm bust, de la 99.8 la 81.5 kg."}
                },
              ]
            }),
          }}
        />
      </body>
    </html>
  );
}
