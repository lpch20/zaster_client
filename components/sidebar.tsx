"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Truck, Users, FileText, DollarSign, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/viajes", icon: Truck, label: "Viajes" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/camiones", icon: Truck, label: "Camiones" },
    { href: "/choferes", icon: Users, label: "Choferes" },
    { href: "/remitos", icon: FileText, label: "Remitos" },
    { href: "/liquidaciones", icon: DollarSign, label: "Liquidaciones de Choferes" },
    { href: "/configuracion", icon: Settings, label: "Configuración" },
  ]

  return (
    <>
      <Button variant="ghost" className="fixed top-0 left-0 z-50 m-4 bg-white md:hidden" onClick={toggleSidebar}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-200 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Zaster CRM</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

