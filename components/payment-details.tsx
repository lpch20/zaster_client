"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// This would typically come from an API call
const samplePayment = {
  id: 1,
  chofer: "Juan Pérez",
  viaje: "V001",
  fecha: "2023-05-15",
  monto_bruto: 3000,
  descuentos: 500,
  monto_neto: 2500,
  metodo_pago: "Transferencia Bancaria",
  observaciones: "Pago por viaje a Tacuarembó",
  pagado: true,
}

export function PaymentDetails({ id }: { id: string }) {
  const [payment, setPayment] = useState(samplePayment)

  useEffect(() => {
    // Here you would fetch the payment data from your API
    // For now, we're using the sample data
    setPayment(samplePayment)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Liquidación #{payment.id}</h2>
        <div className="space-x-2">
          <Button variant="outline">Imprimir Liquidación</Button>
          <Link href={`/liquidaciones/${id}/editar`}>
            <Button>Editar Liquidación</Button>
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
                <dt className="font-semibold">Chofer:</dt>
                <dd>{payment.chofer}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Viaje:</dt>
                <dd>{payment.viaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Fecha:</dt>
                <dd>{payment.fecha}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Estado:</dt>
                <dd>
                  <Badge variant={payment.pagado ? "success" : "destructive"}>
                    {payment.pagado ? "Pagado" : "Pendiente"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Detalles Financieros</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Monto Bruto:</dt>
                <dd>{payment.monto_bruto.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Descuentos:</dt>
                <dd>{payment.descuentos.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Monto Neto:</dt>
                <dd>{payment.monto_neto.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Método de Pago:</dt>
                <dd>{payment.metodo_pago}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{payment.observaciones}</p>
        </CardContent>
      </Card>
    </div>
  )
}

