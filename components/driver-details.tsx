"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// This would typically come from an API call
const sampleDriver = {
  id: 1,
  nombre: "Juan Pérez",
  cedula: "1234567-8",
}

export function DriverDetails({ id }: { id: string }) {
  const [driver, setDriver] = useState(sampleDriver)

  useEffect(() => {
    // Here you would fetch the driver data from your API
    // For now, we're using the sample data
    setDriver(sampleDriver)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chofer: {driver.nombre}</h2>
        <Link href={`/choferes/${id}/editar`}>
          <Button>Editar Chofer</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información del Chofer</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-semibold">Nombre:</dt>
              <dd>{driver.nombre}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Cédula:</dt>
              <dd>{driver.cedula}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

