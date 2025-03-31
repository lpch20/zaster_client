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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TripList({ limit }: { limit?: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [destinatarioFilter, setDestinatarioFilter] = useState("");
  const [cobradoFilter, setCobradoFilter] = useState("todos"); // Nuevo filtro para estado cobrado
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [trips, setTrips] = useState<any[]>([]);
  const [clients, setCLients] = useState([]);

  const getTotalTrip = async () => {
    try {
      setLoading(true);
      const result = await getTrip();
      const sortedTrips = result.result.sort(
        (a: any, b: any) => Number(a.numero_viaje) - Number(b.numero_viaje)
      );
      setTrips(sortedTrips);
      console.log(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getClient = async () => {
    try {
      const ids = trips.flatMap((trip) => [
        +trip.facturar_a,
        trip.destinatario_id,
        trip.remitente_id,
      ]);
      const uniqueIds = Array.from(new Set(ids.filter((id) => id != null)));
      console.log("IDs enviados:", ids);
      setLoading(true);
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
      console.log("Actualizando estado de trip:", id);
      const updatedTrips = trips.map((trip) =>
        trip.id === id ? { ...trip, cobrado: !trip.cobrado } : trip
      );
      setTrips(updatedTrips);

      const updatedTrip = updatedTrips.find((trip) => trip.id === id);
      console.log("Estado después de la actualización local:", updatedTrip);

      if (updatedTrip) {
        const response = await updateTripStatus(updatedTrip.id);
        console.log("Respuesta del servidor:", response); // 👀 Ver qué devuelve el backend
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

  // Filtrar los viajes según búsqueda, destinatario, fecha y estado cobrado
  const filteredTrips = trips
    .filter((trip) => {
      const matchesSearch = Object.values(trip).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const tripDestId = trip.destinatario_id
        ? trip.destinatario_id.toString()
        : "";
      const client = clients.find(
        (client: any) => client.id.toString() === tripDestId
      );
      const destinatarioName =
        trip.destinatario || (client ? client.nombre : "");
      const matchesDestinatario =
        destinatarioFilter === "" ||
        destinatarioName
          .toLowerCase()
          .includes(destinatarioFilter.toLowerCase());
      const tripDate = new Date(trip.fecha_viaje);
      const matchesDateRange =
        dateRange?.from && dateRange?.to
          ? tripDate >= dateRange.from && tripDate <= dateRange.to
          : true;
      // Nuevo filtro para estado cobrado:
      const matchesCobrado =
        cobradoFilter === "todos" ||
        (cobradoFilter === "cobrado" && trip.cobrado) ||
        (cobradoFilter === "no_cobrado" && !trip.cobrado);
      return (
        matchesSearch &&
        matchesDestinatario &&
        matchesDateRange &&
        matchesCobrado
      );
    })
    .slice(0, limit);

  // Función para generar el PDF con los detalles de cada viaje y un resumen final
  const downloadPDF = () => {
    // Crear un nuevo documento jsPDF en orientación horizontal ('l' para landscape)
    const doc = new jsPDF({
      orientation: 'l',
    });
  
    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resumen de Viajes", 14, 15);
  
    // Si se ha aplicado un filtro por fecha, lo mostramos
    let startY = 25;
    if (dateRange?.from && dateRange?.to) {
      const fromDate = new Date(dateRange.from).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      const toDate = new Date(dateRange.to).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      doc.setFontSize(12);
      doc.text(`Fecha Filtrada: ${fromDate} - ${toDate}`, 14, startY);
      startY += 10;
    }
  
    // Definición de cabeceras de la tabla
    const headers = [
      "Fecha",
      "Lugar de Carga",
      "Lugar de Descarga",
      "Kilómetros",
      "Tarifa",
      "Remito",
      "Gastos",
      "IVA",
      "Cobrado",
      "Total UY",
    ];
  
    // Construimos las filas de la tabla a partir de los viajes filtrados
    const rows = filteredTrips.map((trip) => [
      new Date(trip.fecha_viaje).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      trip.lugar_carga || "N/D",
      trip.lugar_descarga || "N/D",
      trip.kms?.toLocaleString('es-UY') || '0', // Separador de miles para Kilómetros
      `$${trip.tarifa?.toLocaleString('es-UY') || '0'}`, // Separador de miles para Tarifa
      trip.remito || 0,
      (+trip.lavado +
        +trip.peaje +
        +trip.balanza +
        +trip.inspeccion +
        +trip.sanidad)?.toLocaleString('es-UY') || '0', // Separador de miles para Gastos (opcional)
      trip.iva_status ? 22 : "No aplica" || 0,
      trip.cobrado ? "Si" : "No",
      `$${trip.total_monto_uy?.toLocaleString('es-UY') || '0'}`, // Separador de miles para Total UY
    ]);
  
    // Se calcula el total final de la columna "Total UY"
    const totalUY = filteredTrips.reduce((acc, trip) => {
      const totalTrip = Number(trip.total_monto_uy);
      return acc + (isNaN(totalTrip) ? 0 : totalTrip);
    }, 0);
  
    // Omitimos agregar la fila del total a 'rows' para manejar el estilo aparte
  
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startY,
      styles: { halign: "center", fontStyle: 'bold' }, // Aplicar negrita a todo el cuerpo de la tabla
      headStyles: { fillColor: [22, 160, 133] },
    });
  
    // Calcular la posición Y después de la tabla
    const finalY = doc.lastAutoTable.finalY + 10; // Añadir un pequeño espacio
  
    // Establecer el tamaño de fuente más grande para el total
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Opcional: poner en negrita (ya está)
  
    // Calcular la posición X para alinear a la derecha
    const totalLabelText = "TOTAL UY:";
    const totalValueText = `$${totalUY.toLocaleString('es-UY')}`; // Separador de miles para el total final
    const pageWidth = doc.internal.pageSize.getWidth();
    const totalLabelWidth = doc.getTextWidth(totalLabelText);
    const totalValueWidth = doc.getTextWidth(totalValueText);
    const marginFromRight = 14; // Margen desde el borde derecho
  
    const totalLabelX = pageWidth - totalValueWidth - totalLabelWidth - marginFromRight - 5; // Ajuste fino
    const totalValueX = pageWidth - totalValueWidth - marginFromRight;
  
    // Agregar el texto "TOTAL UY:" y el valor total
    doc.text(totalLabelText, totalLabelX, finalY);
    doc.text(totalValueText, totalValueX, finalY);
  
    doc.setFont('helvetica', 'normal'); // Volver al estilo normal para otros textos
  
    doc.save("resumen_viajes.pdf");
  };

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
          {/* Agregamos el filtro de Cobrado/No Cobrado */}
          <Select
            name="cobrado_filter"
            value={cobradoFilter}
            onValueChange={setCobradoFilter}
            className="w-full sm:w-[200px]"
          >
            <SelectTrigger>
              <SelectValue placeholder="Cobrado / No Cobrado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="cobrado">Cobrado</SelectItem>
              <SelectItem value="no_cobrado">No Cobrado</SelectItem>
            </SelectContent>
          </Select>

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

      {/* Botón para descargar PDF si se han aplicado filtros y hay resultados */}
      {(destinatarioFilter || dateRange) && filteredTrips.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={downloadPDF}>Descargar PDF Resumen</Button>
        </div>
      )}

      {/* Tabla de viajes */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead className=" sm:table-cell">Fecha</TableHead>
              <TableHead className=" md:table-cell">Remitente</TableHead>
              <TableHead className=" md:table-cell">Destinatario</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Cobrado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <div>
              Cargando....
              <Loading />
            </div>
          ) : (
            <TableBody>
              {filteredTrips.map((trip) => {
                const destinatarioClient = clients.find(
                  (client: any) => client.id == trip.destinatario_id
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
                      {trip.remitente_name ? trip.remitente_name : "N/D"}
                    </TableCell>
                    <TableCell className=" md:table-cell">
                      {destinatarioClient ? destinatarioClient.nombre : "N/D"}
                    </TableCell>
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
