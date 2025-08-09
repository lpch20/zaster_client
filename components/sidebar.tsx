"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import {
  Home,
  Truck,
  Users,
  FileText,
  DollarSign,
  Settings,
  Menu,
  X,
  CreditCard,    // nuevo para Gastos
  Fuel,    // nuevo para Combustibles
  Circle,    // nuevo para Cubiertas
  LogOut,    // nuevo para cerrar sesión
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    // Usar la función logout del contexto de autenticación
    logout();
    // Cerrar sidebar en móvil
    setIsOpen(false);
    // Redirigir al login
    router.push("/login");
  };

  const menuItems = [
    { href: "/", icon: Home, label: "Balance" },
    { href: "/viajes", icon: Truck, label: "Viajes" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/camiones", icon: Truck, label: "Camiones" },
    { href: "/choferes", icon: Users, label: "Choferes" },
    { href: "/remitos", icon: FileText, label: "Remitos" },
    { href: "/liquidaciones", icon: DollarSign, label: "Liquidaciones de Choferes" },
    // Nuevas rutas:
    { href: "/gastos", icon: CreditCard, label: "Gastos" },
    { href: "/combustible", icon: Fuel, label: "Combustible" },
    { href: "/cubiertas", icon: Circle, label: "Cubiertas" },
    // Configuración al final
    { href: "/configuracion", icon: Settings, label: "Configuración" },
  ];

  return (
    <>
      <Button
        variant="ghost"
        className="fixed top-0 left-0 z-50 m-4 bg-white md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-200 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Zaster CRM</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center p-2 rounded-md transition-colors
                      ${isActive
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
