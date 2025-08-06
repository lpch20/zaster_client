"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/spinner";

interface CubiertaData {
  id: number;
  fecha: string;
  matricula: string;
  numero_cubierta: string;
  km_puesta: number;
  km_sacada?: number;
  ubicacion: string;
  marca: string;
  tipo: string;
  comentario?: string;
  camion_modelo?: string;
}

export default function CubiertaDetallePage() {
  const params = useParams();
  const router = useRouter();
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Detalles de Cubierta</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/cubiertas/${cubierta.id}/editar`)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/cubiertas")}
          >
            Volver
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Cubierta {cubierta.numero_cubierta}
            <Badge variant={cubierta.ubicacion === 'CAMION' ? 'default' : 'secondary'}>
              {cubierta.ubicacion}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Fecha:</strong> {new Date(cubierta.fecha).toLocaleDateString()}
            </div>
            <div>
              <strong>Matrícula:</strong> {cubierta.matricula}
              {cubierta.camion_modelo && ` - ${cubierta.camion_modelo}`}
            </div>
            <div>
              <strong>Marca:</strong> {cubierta.marca}
            </div>
            <div>
              <strong>Tipo:</strong> {cubierta.tipo}
            </div>
            <div>
              <strong>KM Puesta:</strong> {cubierta.km_puesta.toLocaleString()}
            </div>
            {cubierta.km_sacada && (
              <div>
                <strong>KM Sacada:</strong> {cubierta.km_sacada.toLocaleString()}
              </div>
            )}
          </div>
          
          {cubierta.comentario && (
            <div>
              <strong>Comentario:</strong>
              <p className="mt-1 text-gray-600">{cubierta.comentario}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 