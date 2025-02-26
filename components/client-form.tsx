"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

export function ClientForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(
    initialData || {
      nombre: "",
      direccion: "",
      localidad: "",
      telefono: "",
      mail: "",
      rut: "",
      dicose: "",
      paraje: "",
      otros: "",
      estado: "activo",
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
      title: "Cliente guardado",
      description: "El cliente ha sido guardado exitosamente.",
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
          <Label htmlFor="direccion">Dirección</Label>
          <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="localidad">Localidad</Label>
          <Input id="localidad" name="localidad" value={formData.localidad} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mail">Email</Label>
          <Input id="mail" name="mail" type="email" value={formData.mail} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rut">RUT</Label>
          <Input id="rut" name="rut" value={formData.rut} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dicose">DICOSE</Label>
          <Input id="dicose" name="dicose" value={formData.dicose} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paraje">Paraje</Label>
          <Input id="paraje" name="paraje" value={formData.paraje} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="otros">Otros</Label>
        <Input id="otros" name="otros" value={formData.otros} onChange={handleChange} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="estado"
          checked={formData.estado === "activo"}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, estado: checked ? "activo" : "inactivo" }))}
        />
        <Label htmlFor="estado">Cliente activo</Label>
      </div>
      <Button type="submit">{initialData ? "Actualizar Cliente" : "Crear Cliente"}</Button>
    </form>
  )
}

