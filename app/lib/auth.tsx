"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("isAuthenticated")
      setIsAuthenticated(storedAuth === "true")
    }

    checkAuth()

    // Escucha cambios en localStorage (en otras pestañas o después de borrar)
    window.addEventListener("storage", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
    }
  }, [])

  const login = async (username: string, password: string) => {
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isAuthenticated", "true")
      setIsAuthenticated(true)

      // Dispara evento manual para que otros componentes reaccionen
      window.dispatchEvent(new Event("storage"))
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("isAuthenticated")
    setIsAuthenticated(false)

    // Dispara evento para actualizar `isAuthenticated` en otros lugares
    window.dispatchEvent(new Event("storage"))
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
