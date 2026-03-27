import { ReactNode } from "react";
import { BottomNav } from "@/components/app-ui";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

export const metadata = {
  title: "Maraton App",
  description: "Aplicația ta zilnică",
  manifest: "/manifest.json",
};

export default function MaratonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg relative">
      <PwaInstallPrompt />
      <main 
        className="flex-1 max-w-md mx-auto w-full relative" 
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
