// app/combustible/[id]/editar/page.tsx
"use client";

import { CombustibleForm } from "@/components/combustible-form";
import { useEffect, useState } from "react";
import api from "@/api/RULE_index";
import { Loading } from "@/components/spinner";

export default function EditarCombustiblePage({ params }: { params: { id: string } }) {
  const [combustibleData, setCombustibleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombustible = async () => {
      try {
        const response = await api.get(`/getCombustible/${params.id}`);
        setCombustibleData(response.data.result);
      } catch (error) {
        console.error("Error fetching combustible:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCombustible();
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
      <h1 className="text-3xl font-bold">Editar Combustible</h1>
      <CombustibleForm initialData={combustibleData} />
    </div>
  );
}