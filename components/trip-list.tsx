"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { DateRangeFilter } from "./date-range-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getClientsById, getTrip } from "@/api/RULE_getData";
import { Loading } from "./spinner";
import { updateTripStatus } from "@/api/RULE_updateData";

export function TripList({ limit }: { limit?: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [destinatarioFilter, setDestinatarioFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [trips, setTrips] = useState<any[]>([]);
  const [clients, setCLients] = useState([]);

  const getTotalTrip = async () => {
    try {
      setLoading(true);
      const result = await getTrip();
      setTrips(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getClient = async () => {
    try {
      // Construimos un array de objetos con los IDs requeridos
      const ids = trips.flatMap((trip) => [
        +trip.facturar_a,
        trip.destinatario_id,
        trip.remitente_id,
      ]);
      // Filtrar valores nulos o indefinidos y dejar solo los únicos
      const uniqueIds = Array.from(new Set(ids.filter((id) => id != null)));

      console.log("IDs enviados:", ids);
      setLoading(true);
      // Llama a la API pasando el array de objetos
      const result = await getClientsById(uniqueIds);
      setCLients(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const toggleTripStatus = async (id: number) => {
    try {
      // Actualiza localmente el estado del viaje
      const updatedTrips = trips.map((trip) =>
        trip.id === id ? { ...trip, cobrado: !trip.cobrado } : trip
      );
      setTrips(updatedTrips);

      // Encuentra el viaje actualizado para enviarlo al backend
      const updatedTrip = updatedTrips.find((trip) => trip.id === id);

      console.log(updatedTrip)

      if (updatedTrip) {
        // Llama a la API para actualizar el viaje en el backend
        await updateTripStatus(updatedTrip.id);
      }
    } catch (error) {
      console.error("Error al actualizar estado del viaje:", error);
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  useEffect(() => {
    getTotalTrip();
  }, []);

  useEffect(() => {
    getClient();
  }, [trips]);

  useEffect(() => {
    console.log(clients);
  }, [clients]);

  // Filtrar los viajes según búsqueda, destinatario y rango de fecha
  const filteredTrips = trips
    .filter((trip) => {
      // Filtro general: busca en todas las propiedades de tipo string
      const matchesSearch = Object.values(trip).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Convertir el destinatario_id a string
      const tripDestId = trip.destinatario_id
        ? trip.destinatario_id.toString()
        : "";
      // Buscar el cliente cuyo id (convertido a string) coincida
      const client = clients.find(
        (client: any) => client.id.toString() === tripDestId
      );
      // Si el viaje ya trae un campo "destinatario" con nombre, lo usamos; si no, usamos el del cliente
      const destinatarioName =
        trip.destinatario || (client ? client.nombre : "");

      // Puedes agregar un console.log para depurar:
      console.log(
        `Trip ${trip.id}: destinatarioName=${destinatarioName}, filtro=${destinatarioFilter}`
      );

      const matchesDestinatario =
        destinatarioFilter === "" ||
        destinatarioName
          .toLowerCase()
          .includes(destinatarioFilter.toLowerCase());

      // Filtro por rango de fechas
      const tripDate = new Date(trip.fecha_viaje);
      const matchesDateRange =
        dateRange?.from && dateRange?.to
          ? tripDate >= dateRange.from && tripDate <= dateRange.to
          : true;

      return matchesSearch && matchesDestinatario && matchesDateRange;
    })
    .slice(0, limit);

  return (
    <div className="space-y-4">
      {/* Filtros y botón de nuevo viaje */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar viajes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Input
            placeholder="Filtrar por destinatario..."
            value={destinatarioFilter}
            onChange={(e) => setDestinatarioFilter(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div className="flex justify-end">
          <Link href="/viajes/nuevo">
            <Button className="w-full sm:w-auto">Nuevo Viaje</Button>
          </Link>
        </div>
      </div>

      {/* Tabla de viajes */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead className=" sm:table-cell">Fecha</TableHead>
              <TableHead className=" md:table-cell">Remitente</TableHead>
              <TableHead className=" md:table-cell">Destinatario</TableHead>
              {/* <TableHead className="hidden lg:table-cell">Camión</TableHead>
              <TableHead className="hidden lg:table-cell">Chofer</TableHead> */}
              <TableHead>Total</TableHead>
              <TableHead>Cobrado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <div>
              Cargando....
              <Loading></Loading>
            </div>
          ) : (
            <TableBody>
              {filteredTrips.map((trip) => {
                // Busca en el array de clientes el que coincide con el destinatario y el cliente a facturar
                const destinatarioClient = clients.find(
                  (client: any) => client.id == trip.destinatario_id
                );
                const remitenteClient = clients.find(
                  (client: any) => client.id == trip.remitente_id
                );
                return (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.numero_viaje}</TableCell>
                    <TableCell className=" sm:table-cell">
                      {new Date(trip.fecha_viaje).toLocaleDateString("es-UY", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className=" md:table-cell">
                      {remitenteClient ? remitenteClient.nombre : "N/D"}
                    </TableCell>
                    <TableCell className=" md:table-cell">
                      {destinatarioClient ? destinatarioClient.nombre : "N/D"}
                    </TableCell>
                    {/* <TableCell className="hidden lg:table-cell">
                      {trip.camion}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {trip.chofer}
                    </TableCell> */}
                    <TableCell>
                      {"$ " +
                        trip.total_monto_uy.toLocaleString("es-UY", {
                          style: "currency",
                          currency: "UYU",
                        })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trip.cobrado ? "success" : "destructive"}>
                        {trip.cobrado ? "Cobrado" : "No Cobrado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/viajes/${trip.id}`}>
                              Ver detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/viajes/${trip.id}/editar`}>
                              Modificar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleTripStatus(trip.id)}
                          >
                            {trip.cobrado
                              ? "Marcar como No Cobrado"
                              : "Marcar como Cobrado"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
