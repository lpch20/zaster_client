"use client";

import { useEffect, useState } from "react";
import { PaymentForm } from "@/components/payment-form";
import { getLiquidacionById } from "@/api/RULE_getData";

export default function EditarLiquidacionPage({ params }: { params: { id: string } }) {
  const [clientData, setClientData] = useState({});

  const clientDataFunction = async () => {
    try {
      const result = await getLiquidacionById([params.id]);
      console.log("Datos obtenidos:", result.result);
      setClientData(result.result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    clientDataFunction();
    console.log("ID:", params.id);
  }, [params.id]);

  // Si todavía no se cargaron los datos, muestra un loading
  if (!clientData || Object.keys(clientData).length === 0) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Liquidación</h1>
      <PaymentForm initialData={clientData} />
    </div>
  );
}
