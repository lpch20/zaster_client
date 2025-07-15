// app/gastos/[id]/editar/page.tsx (actualizada)
"use client";

import { GastosForm } from "@/components/gastos-form";
import { useEffect, useState } from "react";
import { getGastoById } from "@/api/RULE_getData";
import { Loading } from "@/components/spinner";

interface GastoData {
  fecha: string;
  matricula: string;
  categoria: string;
  proveedor: string;
  monto_pesos: number;
  monto_usd: number;
  forma_pago: string;
  descripcion: string;
}

export default function EditarGastosPage({ params }: { params: { id: string } }) {
  const [gastoData, setGastoData] = useState<GastoData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGasto = async () => {
      try {
        const result = await getGastoById(params.id);
        setGastoData(result || undefined);
      } catch (error) {
        console.error("Error fetching gasto:", error);
        setGastoData(undefined);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGasto();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Gasto</h1>
      <GastosForm initialData={gastoData} />
    </div>
  );
}