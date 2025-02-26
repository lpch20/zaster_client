"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// This would typically come from an API call
const sampleTruck = {
  id: 1,
  identificador: "CAM001",
  matricula: "ABC123",
  modelo: "Volvo FH16",
  matricula_zorra: "XYZ789",
}

export function TruckDetails({ id }: { id: string }) {
  const [truck, setTruck] = useState(sampleTruck)

  useEffect(() => {
    // Here you would fetch the truck data from your API
    // For now, we're using the sample data
    setTruck(sampleTruck)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Camión: {truck.identificador}</h2>
        <Link href={`/camiones/${id}/editar`}>
          <Button>Editar Camión</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información del Camión</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-semibold">Identificador:</dt>
              <dd>{truck.identificador}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Matrícula:</dt>
              <dd>{truck.matricula}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Modelo:</dt>
              <dd>{truck.modelo}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Matrícula Zorra:</dt>
              <dd>{truck.matricula_zorra}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

