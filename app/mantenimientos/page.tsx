"use client";

import MaintenanceList from "@/components/maintenance-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MantenimientosPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mantenimientos</h1>
        <Link href="/mantenimientos/nuevo">
          <Button>+ Nuevo Mantenimiento</Button>
        </Link>
      </div>
      <MaintenanceList />
    </div>
  );
}


