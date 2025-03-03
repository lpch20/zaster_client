// app/remitos/[id]/editar/RemitoEditor.tsx (Client Component)
"use client";
import { useEffect, useState } from "react";
import { getTripById } from "@/api/RULE_getData"; // Asume que hace fetch del lado del cliente
import { TripForm } from "./trip-form";

export default function TripEditor({ tripId }: { tripId: string }) {
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchtrip = async () => {
      try {
        const data = await getTripById(tripId);
        console.log("trip data", data); 
        setTripData(data.result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchtrip();
    
    
  }, [tripId]);

  if (loading) return <p>Cargando...</p>;
  if (!tripData) return <p>No se encontró el trip.</p>;


  return <TripForm initialData={tripData} />;
}
