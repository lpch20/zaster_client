"use client"

import { useAuth } from "../app/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authChecked } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Esperar a que se complete la verificación de autenticación inicial
    if (authChecked) {
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [isAuthenticated, authChecked, pathname, router]);

  return <>{children}</>;
}
