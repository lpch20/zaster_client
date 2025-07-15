// app/gastos/[id]/editar/page.tsx (actualizada)
"use client";

import { GastosForm } from "@/components/gastos-form";
import { useEffect, useState } from "react";
import api from "@/api/RULE_index";
import { Loading } from "@/components/spinner";

export default function EditarGastosPage({ params }: { params: { id: string } }) {
  const [gastoData, setGastoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGasto = async () => {
      try {
        const response = await api.get(`/getGastos/${params.id}`);
        setGastoData(response.data.result);
      } catch (error) {
        console.error("Error fetching gasto:", error);
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