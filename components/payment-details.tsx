"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getLiquidacionById } from "@/api/RULE_getData";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function PaymentDetails({ id }: { id: string }) {
  const [payment, setPayment] = useState<any>({});

  const liquidacionByID = async () => {
    try {
      const result = await getLiquidacionById([id]);
      // Asumimos que result.result trae el objeto de liquidación
      setPayment(result.result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    liquidacionByID();
  }, [id]);

  // Formateo de la fecha en zona horaria de Montevideo
  const fechaFormateada = payment.date
    ? dayjs(payment.date).tz("America/Montevideo").format("DD/MM/YYYY HH:mm:ss")
    : "";

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
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">ID:</dt>
                <dd>{payment.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Chofer:</dt>
                <dd>{payment.chofer_nombre}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Viaje:</dt>
                <dd>{payment.viaje_numero_viaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Fecha:</dt>
                <dd>{fechaFormateada}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Kms Viaje:</dt>
                <dd>{payment.kms_viaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Mínimo Kms Liquidar:</dt>
                <dd>{payment.minimo_kms_liquidar}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Límite Premio:</dt>
                <dd>{payment.limite_premio}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Kms a Liquidar:</dt>
                <dd>{payment.kms_liquidar}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Detalles Financieros */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles Financieros</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Precio por Km:</dt>
                <dd>
                  {payment.precio_km
                    ? Number(payment.precio_km).toLocaleString("es-UY", {
                        style: "currency",
                        currency: "UYU",
                      })
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Subtotal:</dt>
                <dd>
                  {payment.subtotal
                    ? Number(payment.subtotal).toLocaleString("es-UY", {
                        style: "currency",
                        currency: "UYU",
                      })
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Pernocte:</dt>
                <dd>
                  {payment.pernocte
                    ? Number(payment.pernocte).toLocaleString("es-UY", {
                        style: "currency",
                        currency: "UYU",
                      })
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Gastos:</dt>
                <dd>
                  {payment.gastos
                    ? Number(payment.gastos).toLocaleString("es-UY", {
                        style: "currency",
                        currency: "UYU",
                      })
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Total a Favor (sin gastos):</dt>
                <dd>
                  {((Number(payment.subtotal) || 0) + (Number(payment.pernocte) || 0) + (Number(payment.limite_premio) || 0))
                    ? ((Number(payment.subtotal) || 0) + (Number(payment.pernocte) || 0) + (Number(payment.limite_premio) || 0)).toLocaleString("es-UY", {
                        style: "currency",
                        currency: "UYU",
                      })
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Estado:</dt>
                <dd>
                  <Badge variant={payment.liquidacion_pagada ? "success" : "destructive"}>
                    {payment.liquidacion_pagada ? "Pagado" : "Pendiente"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Observaciones, si existieran */}
      {payment.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{payment.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
