import "./globals.css";
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zastre CRM",
  description: "CRM para gestión de viajes de camiones",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen`}>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8 md:ml-64">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

