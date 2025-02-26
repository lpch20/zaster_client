"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// This would typically come from an API call
const sampleTrip = {
  id: 1,
  numero_viaje: "V001",
  numero_remito: "R001",
  fecha_viaje: "2023-05-15",
  remitente: "Empresa A",
  lugar_carga: "Puerto de Montevideo",
  destinatario: "Empresa B",
  lugar_descarga: "Tacuarembó",
  camion: "CAM001",
  chofer: "Juan Pérez",
  guias: "G001, G002",
  detalle_carga: "50 cajas de mercadería",
  kms: 400,
  tarifa: 50,
  precio_flete: 20000,
  total_monto_uy: 20000,
}

export function TripDetails({ id }: { id: string }) {
  const [trip, setTrip] = useState(sampleTrip)

  useEffect(() => {
    // Here you would fetch the trip data from your API
    // For now, we're using the sample data
    setTrip(sampleTrip)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Viaje #{trip.numero_viaje}</h2>
        <div className="space-x-2">
          <Button variant="outline">Generar Remito</Button>
          <Link href={`/viajes/${id}/editar`}>
            <Button>Editar Viaje</Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Número de Remito:</dt>
                <dd>{trip.numero_remito}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Fecha de Viaje:</dt>
                <dd>{trip.fecha_viaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Camión:</dt>
                <dd>{trip.camion}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Chofer:</dt>
                <dd>{trip.chofer}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Remitente:</dt>
                <dd>{trip.remitente}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Lugar de Carga:</dt>
                <dd>{trip.lugar_carga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Destinatario:</dt>
                <dd>{trip.destinatario}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Lugar de Descarga:</dt>
                <dd>{trip.lugar_descarga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Guías:</dt>
                <dd>{trip.guias}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Detalle de Carga:</dt>
                <dd>{trip.detalle_carga}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Información Financiera</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Kilómetros:</dt>
                <dd>{trip.kms}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Tarifa:</dt>
                <dd>{trip.tarifa.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Precio Flete:</dt>
                <dd>{trip.precio_flete.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Total:</dt>
                <dd>{trip.total_monto_uy.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

