"use client";

import { RemittanceForm } from "@/components/remittance-form";

export default function NuevoRemitoPage() {
  return (
    <div className="min-h-screen p-4 space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Remito</h1>
      <RemittanceForm />
    </div>
  );
}