// app/gastos/[id]/editar/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GastosForm } from "@/components/gastos/gastos-form";
import { Loading } from "@/components/shared/spinner";
import { getGastoById } from "@/api/RULE_getData";
import Swal from "sweetalert2";

interface GastoData {
  id?: number;
  fecha: string;
  matricula: string;
  categoria: string;
  proveedor: string;
  monto_pesos: number;
  monto_usd: number;
  forma_pago: string;
  descripcion: string;
  img_1?: string;
  img_2?: string;
  img_3?: string;
  img_4?: string;
  img_5?: string;
}

export default function EditGastoPage() {
  const params = useParams();
  const router = useRouter();
  const [gastoData, setGastoData] = useState<GastoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGasto = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const id = params?.id;
        if (!id) {
          throw new Error("ID de gasto no válido");
        }

        console.log("🔍 DEBUG - Cargando gasto con ID:", id);
        
        const response = await getGastoById(Number(id));
        console.log("🔍 DEBUG - Respuesta completa:", response);
        
        // ✅ Manejar diferentes estructuras de respuesta
        let gasto: GastoData | null = null;
        
        if (response && response.result) {
          // Si response.result existe
          gasto = response.result;
          console.log("✅ DEBUG - Usando response.result");
        } else if (response && response.data) {
          // Si response.data existe
          gasto = response.data;
          console.log("✅ DEBUG - Usando response.data");
        } else if (response && typeof response === 'object') {
          // Si response es directamente el objeto
          gasto = response;
          console.log("✅ DEBUG - Usando response directo");
        }

        if (!gasto || !gasto.id) {
          throw new Error("Gasto no encontrado");
        }

        // ✅ Formatear fecha si es necesario
        if (gasto.fecha) {
          // Convertir fecha a formato YYYY-MM-DD para el input date
          const date = new Date(gasto.fecha);
          gasto.fecha = date.toISOString().split('T')[0];
        }

        console.log("✅ DEBUG - Gasto procesado:", gasto);
        setGastoData(gasto);

      } catch (err) {
        console.error("❌ ERROR - Error al cargar gasto:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar la información del gasto",
          icon: "error",
          confirmButtonText: "Volver"
        }).then(() => {
          router.push("/gastos");
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGasto();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loading />
        <p className="text-gray-600">Cargando información del gasto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push("/gastos")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver a Gastos
        </button>
      </div>
    );
  }

  if (!gastoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-gray-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Gasto no encontrado</h2>
          <p>El gasto solicitado no existe o ha sido eliminado.</p>
        </div>
        <button
          onClick={() => router.push("/gastos")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver a Gastos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Gasto</h1>
      </div>
      
      
      <GastosForm initialData={gastoData} />
    </div>
  );
}