"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getChoferesById } from "@/api/RULE_getData"

export function DriverDetails({ id }: { id: string }) {
  const [driver, setDriver] = useState<any>([])

  useEffect(() => {
    async function fetchClients() {
      try {
        if (driver) {
          const ids = [
            id
          ];
          const response = await getChoferesById(ids);
          console.log("response", response);
          if (response && response.result) {
            setDriver(
              response.result
            );
          }
        }
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      }
    }
    if (driver) fetchClients();
  }, [driver]);
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

