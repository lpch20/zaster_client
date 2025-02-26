"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

// This would typically come from an API call
const sampleClient = {
  id: 1,
  nombre: "Empresa A",
  direccion: "Calle 123, Ciudad X",
  localidad: "Ciudad X",
  telefono: "1234567890",
  mail: "contacto@empresaa.com",
  rut: "123456789",
  dicose: "D12345",
  paraje: "Zona Industrial",
  otros: "Cliente preferencial",
  estado: "activo",
}

export function ClientDetails({ id }: { id: string }) {
  const [client, setClient] = useState(sampleClient)
  const { toast } = useToast()

  useEffect(() => {
    // Here you would fetch the client data from your API
    // For now, we're using the sample data
    setClient(sampleClient)
  }, [])

  const toggleClientStatus = () => {
    const newStatus = client.estado === "activo" ? "inactivo" : "activo"
    setClient({ ...client, estado: newStatus })
    toast({
      title: "Estado del cliente actualizado",
      description: `El cliente ha sido ${newStatus === "activo" ? "activado" : "desactivado"} exitosamente.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{client.nombre}</h2>
        <div className="space-x-2">
          <Link href={`/clientes/${id}/editar`}>
            <Button>Modificar Cliente</Button>
          </Link>
          <Button variant="outline" onClick={toggleClientStatus}>
            {client.estado === "activo" ? "Dar de Baja" : "Dar de Alta"}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-semibold">Estado:</dt>
              <dd>
                <Badge variant={client.estado === "activo" ? "success" : "destructive"}>
                  {client.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Dirección:</dt>
              <dd>{client.direccion}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Localidad:</dt>
              <dd>{client.localidad}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Teléfono:</dt>
              <dd>{client.telefono}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Email:</dt>
              <dd>{client.mail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">RUT:</dt>
              <dd>{client.rut}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">DICOSE:</dt>
              <dd>{client.dicose}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Paraje:</dt>
              <dd>{client.paraje}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Otros:</dt>
              <dd>{client.otros}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

