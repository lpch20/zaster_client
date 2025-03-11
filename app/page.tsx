"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TripList } from "@/components/trip-list"
import { RecentActivityFeed } from "@/components/recent-activity-feed"
import { Overview } from "@/components/overview"
import { useEffect, useState } from "react"
import { getToken } from "@/lib/token"
import { api } from "@/lib/api"
import { Loading } from "./../components/spinner"
import { getCountCamiones, getCountChoferes, getCountClients, getCountLiquidacion, getCountRemito, getCountTrip } from "@/api/RULE_getData"

export default function Home() {
  const [viajesTotales, setViajesTotales] = useState<number | null>(null);
  const [clientesActivos, setClientesActivos] = useState<number | null>(null);
  const [camionesEnRuta, setCamionesEnRuta] = useState<number | null>(null);
  const [choferesTotales, setChoferesTotales] = useState<number | null>(null);
  const [camionesTotales, setCamionesTotales] = useState<number | null>(null);
  const [remitosTotales, setRemitosTotales] = useState<number | null>(null);
  const [liquidacionesTotales, setLiquidacionesTotales] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const viajesCount = await getCountTrip();
        setViajesTotales(viajesCount.result);

        const clientesCount = await getCountClients();
        setClientesActivos(clientesCount.result);

        const camionesCount = await getCountCamiones();
        setCamionesTotales(camionesCount.result);

        const choferesCount = await getCountChoferes();
        setChoferesTotales(choferesCount.result);

        const remitosCount = await getCountRemito();
        setRemitosTotales(remitosCount.result);

        const liquidacionesCount = await getCountLiquidacion();
        setLiquidacionesTotales(liquidacionesCount.result);


      } catch (error) {
        console.error("Error fetching counts:", error);
        // Handle error appropriately, maybe set state to display an error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loading /> : viajesTotales !== null ? viajesTotales : "Error"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loading /> : clientesActivos !== null ? clientesActivos : "Error"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Camiones en Ruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loading /> : camionesTotales !== null ? camionesTotales : "Error"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Choferes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loading /> : choferesTotales !== null ? choferesTotales : "Error"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loading /> : remitosTotales !== null ? remitosTotales : "Error"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loading /> : liquidacionesTotales !== null ? liquidacionesTotales : "Error"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <TripList limit={5} /> */}
    </div>
  )
}