"use client";

import { useEffect, useState } from "react";
import { getMantenimientoById } from "@/api/RULE_getData";
import dayjs from "dayjs";

export default function MaintenanceDetails({ id }: { id: string }) {
  const [item, setItem] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const res = await getMantenimientoById(id);
      setItem(res);
    })();
  }, [id]);

  if (!item) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div>Fecha: {dayjs(item.fecha).format("DD/MM/YYYY HH:mm")}</div>
      <div>Camión ID: {item.camion_id}</div>
      <div>KMs: {item.kms}</div>
      <div>Lugar: {item.lugar}</div>
      <div>Descripción: {item.descripcion}</div>
    </div>
  );
}


