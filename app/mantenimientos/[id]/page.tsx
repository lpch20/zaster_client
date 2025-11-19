"use client";

import MaintenanceDetails from "@/components/mantenimientos/maintenance-details";

export default function MantenimientoDetallePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Detalle de Mantenimiento</h1>
      <MaintenanceDetails id={params.id} />
    </div>
  );
}


