"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CubiertasForm } from "@/components/cubiertas-form";
import { Loading } from "@/components/spinner";

interface CubiertaData {
  id: number;
  fecha: string;
  camion_id?: string;
  matricula: string;
  numero_cubierta: string;
  km_puesta: number;
  km_sacada?: number;
  ubicacion: string;
  marca: string;
  tipo: string;
  comentario?: string;
}

export default function EditarCubiertaPage() {
  const params = useParams();
  const [cubierta, setCubierta] = useState<CubiertaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCubierta = async () => {
      try {
        const response = await fetch(`/api/cubiertas/${params.id}`);
        const data = await response.json();
        setCubierta(data.result);
      } catch (error) {
        console.error('Error fetching cubierta:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCubierta();
    }
  }, [params.id]);

  if (loading) return <div><Loading /> Cargando...</div>;
  if (!cubierta) return <div>Cubierta no encontrada</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Cubierta</h1>
      <CubiertasForm initialData={cubierta} />
    </div>
  );
} 