"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import { useSubscription } from "@/hooks/shared/use-subscription";
import {
  Home,
  Truck,
  Users,
  FileText,
  DollarSign,
  Settings,
  Menu,
  X,
  CreditCard, // nuevo para Gastos
  Fuel, // nuevo para Combustibles
  Circle, // nuevo para Cubiertas
  LogOut, // nuevo para cerrar sesión
  CheckCircle, // para suscripción activa
  AlertTriangle, // para suscripción inactiva
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("sidebarOpen") === "true";
      }
    } catch (e) {
      console.error("No se pudo leer sidebarOpen de localStorage:", e);
    }
    return false;
  });
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { subscription, hasActiveSubscription } = useSubscription();

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Guardar persistencia cuando cambia
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarOpen", String(isOpen));
      }
    } catch (e) {
      console.error("No se pudo guardar sidebarOpen:", e);
    }
  }, [isOpen]);

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
    {
      href: "/liquidaciones",
      icon: DollarSign,
      label: "Liquidaciones de Choferes",
    },
    // Nuevas rutas:
    { href: "/gastos", icon: CreditCard, label: "Gastos" },
    { href: "/combustible", icon: Fuel, label: "Combustible" },
    { href: "/cubiertas", icon: Circle, label: "Cubiertas" },
    { href: "/mantenimientos", icon: FileText, label: "Mantenimientos" },
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-200 ease-in-out flex flex-col
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
     <div className="flex items-center justify-center h-16 border-b flex-shrink-0">
          {/* Mostrar logo si existe, sino mostrar título */}
          {/* Usamos state y onError para fallback en cliente */}
          {typeof window !== "undefined" ? (
            // Import dinámico para evitar errores en Server Components
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.jpg" alt="Zaster CRM" className="w-full h-full " onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <h1 className="text-2xl font-bold text-blue-600">CRM</h1>
          )}
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
                      ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }
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

        {/* Estado de Suscripción y Botón de Salir */}
        <div className="mt-auto p-4 border-t space-y-2 flex-shrink-0">
          {/* Estado de Suscripción */}
          <div
            className={`flex items-center p-2 rounded-md text-xs ${
              hasActiveSubscription
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {hasActiveSubscription ? (
              <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 mr-2 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {hasActiveSubscription
                  ? "Suscripción Activa"
                  : "Sin Suscripción"}
              </div>
              {subscription && subscription.plan_type && (
                <div className="text-xs opacity-75 truncate">
                  {subscription.plan_type === "monthly"
                    ? "Plan Mensual"
                    : "Plan Anual"}
                </div>
              )}
            </div>
          </div>

          {/* Botón de Cerrar Sesión - SIEMPRE VISIBLE */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
