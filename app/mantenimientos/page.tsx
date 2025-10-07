"use client";

import MaintenanceList from "@/components/maintenance-list";


export default function MantenimientosPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mantenimientos</h1>
      </div>
      <MaintenanceList />
    </div>
  );
}


