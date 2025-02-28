// app/remitos/[id]/editar/RemitoEditor.tsx (Client Component)
"use client";
import { useEffect, useState } from "react";
import { RemittanceForm } from "@/components/remittance-form";
import { getRemitoById } from "@/api/RULE_getData"; // Asume que hace fetch del lado del cliente

export default function RemitoEditor({ remitoId }: { remitoId: string }) {
  const [remitoData, setRemitoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemito = async () => {
      try {
        const data = await getRemitoById(remitoId);
        console.log("remito data", data); 
        setRemitoData(data.result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRemito();
    
    
  }, [remitoId]);

  if (loading) return <p>Cargando...</p>;
  if (!remitoData) return <p>No se encontró el remito.</p>;


  return <RemittanceForm initialData={remitoData} />;
}
