"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function TruckForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(
    initialData || {
      identificador: "",
      matricula: "",
      modelo: "",
      matricula_zorra: "",
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
      title: "Camión guardado",
      description: "El camión ha sido guardado exitosamente.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="identificador">Identificador</Label>
          <Input
            id="identificador"
            name="identificador"
            value={formData.identificador}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input id="matricula" name="matricula" value={formData.matricula} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="matricula_zorra">Matrícula Zorra</Label>
          <Input
            id="matricula_zorra"
            name="matricula_zorra"
            value={formData.matricula_zorra}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <Button type="submit">Guardar Camión</Button>
    </form>
  )
}

