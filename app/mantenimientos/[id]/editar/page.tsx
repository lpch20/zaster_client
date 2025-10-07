"use client";

import { useEffect, useState } from "react";
import MaintenanceForm from "@/components/maintenance-form";
import { getMantenimientoById } from "@/api/RULE_getData";
import { Loading } from "@/components/spinner";

export default function EditarMantenimientoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMantenimientoById(id);
        setInitialData(res || null);
      } catch (err) {
        console.error('Error cargando mantenimiento:', err);
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-4"><Loading /> Cargando...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Mantenimiento #{id}</h1>
      <MaintenanceForm initialData={initialData} />
    </div>
  );
}


