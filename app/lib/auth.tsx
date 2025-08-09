"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { loginAuth } from "@/api/RULE_auth"
import { useRouter } from 'next/navigation'; // Import useRouter

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const checkAuth = () => {
      let token;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token")
      }

      const expiration = localStorage.getItem("tokenExpiration")

      if (token && expiration) {
        const now = new Date().getTime()
        if (now > parseInt(expiration)) {
          // Token vencido, eliminarlo y redirigir a login
          logout();
          // Redirect to login page after logout
          router.push('/login');
        } else {
          setIsAuthenticated(true)
        }
      } else {
        setIsAuthenticated(false)
      }
    }

    checkAuth()
    
    // Escuchar cambios en localStorage (entre pestañas)
    window.addEventListener("storage", checkAuth)
    
    // Escuchar evento personalizado para cambios en la misma pestaña
    window.addEventListener("authChange", checkAuth)

    // Verificar autenticación periódicamente
    const interval = setInterval(checkAuth, 1000)

    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("authChange", checkAuth)
      clearInterval(interval)
    }
  }, [router]) // Add router to the dependency array

  const login = async (username: string, password: string) => {
    try {
      console.log(username, password)
      const response = await loginAuth(username, password)
      console.log(response)

      const token = response.result.token // Asegúrate de que el backend devuelva un token
      const expiresIn = 60 * 60 * 1000 // 1 hora en milisegundos
      const expirationTime = new Date().getTime() + expiresIn

      if (token) {
        localStorage.setItem("token", token)
        localStorage.setItem("tokenExpiration", expirationTime.toString())
        setIsAuthenticated(true)

        // Dispara evento manual para sincronizar autenticación
        window.dispatchEvent(new Event("storage"))
        window.dispatchEvent(new Event("authChange"))

        return true
      }
    } catch (error: any) {
      console.error("Error de autenticación:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("tokenExpiration")
    setIsAuthenticated(false)

    // Dispara eventos para notificar el cambio de autenticación
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("authChange"))
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}