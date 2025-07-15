"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/spinner";

import {
  getCountTrip,
  getCountClients,
  getCountCamiones,
  getCountChoferes,
  getCountRemito,
  getCountLiquidacion,
  getCountCombustibles, // ahora existe
  getCountGastos,       // ahora existe
} from "@/api/RULE_getData";

export default function Home() {
  const [viajesTotales, setViajesTotales] = useState<number | null>(null);
  const [clientesActivos, setClientesActivos] = useState<number | null>(null);
  const [camionesTotales, setCamionesTotales] = useState<number | null>(null);
  const [choferesTotales, setChoferesTotales] = useState<number | null>(null);
  const [remitosTotales, setRemitosTotales] = useState<number | null>(null);
  const [liquidacionesTotales, setLiquidacionesTotales] = useState<number | null>(null);
  const [combustiblesTotales, setCombustiblesTotales] = useState<number | null>(null);
  const [gastosTotales, setGastosTotales] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          viajesCount,
          clientesCount,
          camionesCount,
          choferesCount,
          remitosCount,
          liquidacionesCount,
          combustiblesCount,
          gastosCount,
        ] = await Promise.all([
          getCountTrip(),
          getCountClients(),
          getCountCamiones(),
          getCountChoferes(),
          getCountRemito(),
          getCountLiquidacion(),
          getCountCombustibles(),
          getCountGastos(),
        ]);

        setViajesTotales(viajesCount.result);
        setClientesActivos(clientesCount.result);
        setCamionesTotales(camionesCount.result);
        setChoferesTotales(choferesCount.result);
        setRemitosTotales(remitosCount.result);
        setLiquidacionesTotales(liquidacionesCount.result);
        setCombustiblesTotales(combustiblesCount.result);
        setGastosTotales(gastosCount.result);

      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderValue = (value: number | null) =>
    isLoading ? <Loading /> : value != null ? value : "Error";

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Viajes */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Viajes Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(viajesTotales)}
            </div>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(clientesActivos)}
            </div>
          </CardContent>
        </Card>

        {/* Camiones */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Camiones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(camionesTotales)}
            </div>
          </CardContent>
        </Card>

        {/* Choferes */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Choferes Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(choferesTotales)}
            </div>
          </CardContent>
        </Card>

        {/* Remitos */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remitos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(remitosTotales)}
            </div>
          </CardContent>
        </Card>

        {/* Liquidaciones */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Liquidaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(liquidacionesTotales)}
            </div>
          </CardContent>
        </Card>

        {/* Combustibles */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Combustibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(combustiblesTotales)}
            </div>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renderValue(gastosTotales)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}