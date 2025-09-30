"use client";

import React, { useEffect, useState } from "react";
import { getCombustibleById } from "@/api/RULE_getData";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateUruguay } from "@/lib/utils";

export default function CombustibleDetail({ id }: { id: string }) {
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCombustibleById(id);
        setItem(res.result || res);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  if (!item) return <div>Cargando...</div>;

  const kms = Number(item.kms || 0);
  const litros = Number(item.litros || 0);
  const autonomia = litros > 0 ? (kms / litros).toFixed(2) : "-";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div>Fecha: {formatDateUruguay(item.fecha)}</div>
          <div>Matrícula: {item.matricula}</div>
          <div>Lugar: {item.lugar}</div>
          <div>KMs: {kms || "-"}</div>
          <div>Litros: {litros}</div>
          <div>Precio: {item.precio}</div>
          <div>Total: {item.total}</div>
          <div>Autonomía (km/l): {autonomia}</div>
        </CardContent>
      </Card>
    </div>
  );
}


