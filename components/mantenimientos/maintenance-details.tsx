"use client";

import { useEffect, useState } from "react";
import { getMantenimientoById, getCamiones } from "@/api/RULE_getData";
import dayjs from "dayjs";

export default function MaintenanceDetails({ id }: { id: string }) {
  const [item, setItem] = useState<any>(null);
  const [matricula, setMatricula] = useState<string>("");

  useEffect(() => {
    (async () => {
      const res = await getMantenimientoById(id);
      setItem(res);
      
      // ✅ Obtener matrícula del camión
      if (res?.camion_id) {
        try {
          const camionesRes = await getCamiones();
          const camiones = camionesRes.result || [];
          const camion = camiones.find((c: any) => String(c.id) === String(res.camion_id));
          const matriculaCamion = camion?.matricula || camion?.patente || `ID ${res.camion_id}`;
          setMatricula(matriculaCamion);
        } catch (e) {
          console.error('Error cargando matrícula del camión:', e);
          setMatricula(String(res.camion_id));
        }
      }
    })();
  }, [id]);

  if (!item) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div>Fecha: {dayjs(item.fecha).format("DD/MM/YYYY")}</div>
      <div>Camión: {matricula || item.camion_id}</div>
      <div>KMs: {item.kms}</div>
      <div>Lugar: {item.lugar}</div>
      <div>Descripción: {item.descripcion}</div>
    </div>
  );
}


