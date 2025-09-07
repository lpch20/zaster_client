import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import AuthGuard from "@/components/AuthGuard";
import { SubscriptionGuard } from "@/components/subscription-guard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zaster CRM",
  description: "CRM para gestión de viajes de camiones",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen`}>
        <AuthProvider>
          <AuthGuard>
            <SubscriptionGuard>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8 md:ml-64">
                  {children}
                </main>
              </div>
            </SubscriptionGuard>
          </AuthGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
