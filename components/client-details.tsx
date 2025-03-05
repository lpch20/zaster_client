"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { getClientsById } from "@/api/RULE_getData"

export function ClientDetails({ id }: { id: string }) {
  const { toast } = useToast()

  const [clientData, setClientData] = useState("")

  const clientDataFunction = async() =>{
    try {
     const result = await getClientsById([id])
     console.log(result)
     setClientData(result.result[0])
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    // Here you would fetch the client data from your API
    // For now, we're using the sample data
    clientDataFunction();
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{clientData.nombre}</h2>
        <div className="space-x-2">
          <Link href={`/clientes/${id}/editar`}>
            <Button>Modificar Cliente</Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-semibold">Dirección:</dt>
              <dd>{clientData.direccion}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Localidad:</dt>
              <dd>{clientData.localidad}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Teléfono:</dt>
              <dd>{clientData.telefono}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Email:</dt>
              <dd>{clientData.mail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">RUT:</dt>
              <dd>{clientData.rut}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">DICOSE:</dt>
              <dd>{clientData.dicose}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Paraje:</dt>
              <dd>{clientData.paraje}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Otros:</dt>
              <dd>{clientData.otros}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

