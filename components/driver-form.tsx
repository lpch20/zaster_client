"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function DriverForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(
    initialData || {
      nombre: "",
      cedula: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    // Here you would typically send the data to your backend
    toast({
      title: "Chofer guardado",
      description: "El chofer ha sido guardado exitosamente.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cedula">Cédula</Label>
          <Input id="cedula" name="cedula" value={formData.cedula} onChange={handleChange} required />
        </div>
      </div>
      <Button type="submit">Guardar Chofer</Button>
    </form>
  )
}

