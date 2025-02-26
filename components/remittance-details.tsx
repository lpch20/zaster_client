"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// This would typically come from an API call
const sampleRemittance = {
  id: 1,
  numero_remito: "R001",
  fecha: "2023-05-15",
  cliente: "Empresa A",
  viaje: "V001",
  remitente: "Remitente A",
  destinatario: "Destinatario A",
  lugar_carga: "Puerto de Montevideo",
  lugar_descarga: "Tacuarembó",
  detalle_carga: "50 cajas de mercadería",
  peso: 1000,
  volumen: 10,
  observaciones: "Entrega urgente",
  total: 5000,
}

export function RemittanceDetails({ id }: { id: string }) {
  const [remittance, setRemittance] = useState(sampleRemittance)

  useEffect(() => {
    // Here you would fetch the remittance data from your API
    // For now, we're using the sample data
    setRemittance(sampleRemittance)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Remito #{remittance.numero_remito}</h2>
        <div className="space-x-2">
          <Button variant="outline">Imprimir Remito</Button>
          <Link href={`/remitos/${id}/editar`}>
            <Button>Editar Remito</Button>
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
                <dt className="font-semibold">Fecha:</dt>
                <dd>{remittance.fecha}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Cliente:</dt>
                <dd>{remittance.cliente}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Viaje:</dt>
                <dd>{remittance.viaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Remitente:</dt>
                <dd>{remittance.remitente}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Destinatario:</dt>
                <dd>{remittance.destinatario}</dd>
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
                <dt className="font-semibold">Lugar de Carga:</dt>
                <dd>{remittance.lugar_carga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Lugar de Descarga:</dt>
                <dd>{remittance.lugar_descarga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Detalle de Carga:</dt>
                <dd>{remittance.detalle_carga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Peso:</dt>
                <dd>{remittance.peso} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Volumen:</dt>
                <dd>{remittance.volumen} m³</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Observaciones:</dt>
                <dd>{remittance.observaciones}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Total:</dt>
                <dd>{remittance.total.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

