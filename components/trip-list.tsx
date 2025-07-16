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
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
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
import { deleteTrypById } from "@/api/RULE_deleteDate";

export function TripList({ limit }: { limit?: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [facturadoFilterBy, setFacturadoFilterBy] = useState("");
  const [lugarCargaFilter, setLugarCargaFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [destinatarioFilter, setDestinatarioFilter] = useState("");
  const [cobradoFilter, setCobradoFilter] = useState("todos");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [trips, setTrips] = useState<any[]>([]);
  const [clients, setCLients] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);
  
  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    getTotalTrip();
  }, []);

  useEffect(() => {
    getClient();
  }, [trips]);

  const getTotalTrip = async () => {
    try {
      setLoading(true);
      const result = await getTrip();
      const sortedTrips = result.result.sort(
        (a: any, b: any) =>
          new Date(b.fecha_viaje).getTime() - new Date(a.fecha_viaje).getTime()
      );
      setTrips(sortedTrips);
      setCurrentPage(1); // Resetear a página 1 cuando se cargan nuevos datos
    } finally {
      setLoading(false);
    }
  };

  const getClient = async () => {
    try {
      setLoading(true);
      const ids = trips.flatMap((trip) => [
        +trip.facturar_a,
        trip.destinatario_id,
        trip.remitente_id,
      ]);
      const uniqueIds = Array.from(
        new Set(ids.filter((id) => id != null))
      ) as number[];
      const result = await getClientsById(uniqueIds);
      setCLients(result.result);
    } finally {
      setLoading(false);
    }
  };

  const toggleTripStatus = async (id: number) => {
    try {
      const updated = trips.map((t) =>
        t.id === id ? { ...t, cobrado: !t.cobrado } : t
      );
      setTrips(updated);
      const trip = updated.find((t) => t.id === id);
      if (trip) await updateTripStatus(trip.id);
    } catch {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const deleteTripFunction = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });
    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Eliminando viaje...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const resp = await deleteTrypById(id, token);
      Swal.close();
      if (resp.result) {
        Swal.fire("Éxito", "Viaje eliminado", "success");
        getTotalTrip();
      } else {
        Swal.fire("Error", "No se pudo eliminar el viaje.", "error");
      }
    } catch {
      Swal.fire("Error", "Hubo un problema al eliminar el viaje.", "error");
    }
  };

  // ✅ FILTROS (sin slice para tener todos los datos filtrados)
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = Object.values(trip).some(
      (v) =>
        typeof v === "string" &&
        v.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const destinatarioClient = clients.find(
      (c: any) => c?.id?.toString() === String(trip.destinatario_id)
    );
    const destinatarioName = destinatarioClient?.nombre || "";
    const matchesDest =
      destinatarioFilter === "" ||
      destinatarioName
        .toLowerCase()
        .includes(destinatarioFilter.toLowerCase());

    const invoice = trip.numero_factura?.toString() || "";
    const matchesInvoice =
      invoiceFilter === "" || invoice.includes(invoiceFilter);

    const matchesFacturadoA =
      facturadoFilterBy === "" ||
      destinatarioName
        .toLowerCase()
        .includes(facturadoFilterBy.toLowerCase());

    const remitente = trip.remitente_name || "";
    const matchesCarga =
      lugarCargaFilter === "" ||
      remitente.toLowerCase().includes(lugarCargaFilter.toLowerCase());

    const date = new Date(trip.fecha_viaje);
    const matchesDate =
      dateRange?.from && dateRange?.to
        ? date >= dateRange.from && date <= dateRange.to
        : true;

    const matchesCob =
      cobradoFilter === "todos" ||
      (cobradoFilter === "cobrado" && trip.cobrado) ||
      (cobradoFilter === "no_cobrado" && !trip.cobrado);

    return (
      matchesSearch &&
      matchesDest &&
      matchesInvoice &&
      matchesFacturadoA &&
      matchesCarga &&
      matchesDate &&
      matchesCob
    );
  });

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = limit ? filteredTrips.slice(0, limit) : filteredTrips.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, invoiceFilter, facturadoFilterBy, lugarCargaFilter, destinatarioFilter, cobradoFilter, dateRange]);

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "l" });
    const recipientFull = destinatarioFilter
    ? clients.find(c =>
        c != null &&
        typeof c.nombre === "string" &&
        c.nombre.toLowerCase().includes(destinatarioFilter.toLowerCase())
      )?.nombre ?? ""
    : "";

    const titleText = recipientFull
      ? `Resumen de Viajes - ${recipientFull}`
      : "Resumen de Viajes";

    doc.setFontSize(16);
    doc.text(titleText, 14, 15);

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

    const headers = [
      "Fecha",
      "Lugar de Carga",
      "Lugar de Descarga",
      "Kilómetros",
      "Tarifa",
      "Remito",
      "Gastos",
      "Kms",
      "IVA",
      "Cobrado",
      "Total UY",
    ];

    // ✅ Usar todos los viajes filtrados para el PDF (no solo la página actual)
    const rows = filteredTrips.map((trip) => [
      new Date(trip.fecha_viaje).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      trip.lugar_carga || "N/D",
      trip.lugar_descarga || "N/D",
      trip.kms?.toLocaleString("es-UY") || "0",
      `$${trip.tarifa?.toLocaleString("es-UY") || "0"}`,
      trip.remito_numero || "",
      (
        +trip.lavado +
        +trip.peaje +
        +trip.balanza +
        +trip.inspeccion +
        +trip.sanidad
      ).toLocaleString("es-UY") || "0",
      trip.iva_status ? 22 : "No aplica",
      trip.cobrado ? "Si" : "No",
      `$${trip.total_monto_uy?.toLocaleString("es-UY") || "0"}`,
    ]);

    const totalUY = filteredTrips.reduce((acc, trip) => {
      const t = Number(trip.total_monto_uy);
      return acc + (isNaN(t) ? 0 : t);
    }, 0);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY,
      styles: { halign: "center", fontStyle: "bold" },
      headStyles: { fillColor: [22, 160, 133] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    const label = "TOTAL UY:";
    const value = `$${totalUY.toLocaleString("es-UY")}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const labelWidth = doc.getTextWidth(label);
    const valueWidth = doc.getTextWidth(value);
    const marginRight = 14;

    const labelX = pageWidth - valueWidth - labelWidth - marginRight - 5;
    const valueX = pageWidth - valueWidth - marginRight;

    doc.text(label, labelX, finalY);
    doc.text(value, valueX, finalY);
    doc.setFont("helvetica", "normal");

    doc.save("resumen_viajes.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar viajes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-[300px]"
        />
        <Input
          placeholder="Nº de factura..."
          value={invoiceFilter}
          onChange={(e) => setInvoiceFilter(e.target.value)}
          className="w-full sm:w-[200px]"
        />
        <Input
          placeholder="Facturado a..."
          value={facturadoFilterBy}
          onChange={(e) => setFacturadoFilterBy(e.target.value)}
          className="w-full sm:w-[200px]"
        />
        <Input
          placeholder="Lugar de carga..."
          value={lugarCargaFilter}
          onChange={(e) => setLugarCargaFilter(e.target.value)}
          className="w-full sm:w-[300px]"
        />
        <Input
          placeholder="Filtrar por destinatario..."
          value={destinatarioFilter}
          onChange={(e) => setDestinatarioFilter(e.target.value)}
          className="w-full sm:w-[300px]"
        />
        <Select
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
        <div className="flex justify-end sm:ml-auto">
          <Link href="/viajes/nuevo">
            <Button>Nuevo Viaje</Button>
          </Link>
        </div>
      </div>

      {/* ✅ INFO DE PAGINACIÓN Y BOTÓN PDF */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredTrips.length)} de {filteredTrips.length} viajes
        </div>
        {filteredTrips.length > 0 && (
          <Button onClick={downloadPDF}>Descargar PDF Resumen</Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nº Factura</TableHead>
              <TableHead>Nº Remito</TableHead>
              <TableHead className="sm:table-cell">Fecha</TableHead>
              <TableHead className="md:table-cell">Remitente</TableHead>
              <TableHead className="md:table-cell">Destinatario</TableHead>
              <TableHead>Kms</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Cobrado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <div className="p-4">
              <Loading />
            </div>
          ) : (
            <TableBody>
              {currentTrips.map((trip) => {
                const destinatarioClient = clients.find(
                  (c: any) => c?.id?.toString() === String(trip.destinatario_id)
                );
                return (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.numero_viaje}</TableCell>
                    <TableCell>{trip.numero_factura}</TableCell>
                    <TableCell>{trip.remito_numero}</TableCell>
                    <TableCell className="sm:table-cell">
                      {new Date(trip.fecha_viaje).toLocaleDateString("es-UY", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="md:table-cell">
                      {trip.remitente_name || "N/D"}
                    </TableCell>
                    <TableCell className="md:table-cell">
                      {destinatarioClient?.nombre || "N/D"}
                    </TableCell>
                    <TableCell>{trip.kms}</TableCell>
                    <TableCell className="w-28">
                      {trip.total_monto_uy.toLocaleString("es-UY", {
                        style: "currency",
                        currency: "UYU",
                      })}
                    </TableCell>
                    <TableCell className="w-32">
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
                              ? "Marcar No Cobrado"
                              : "Marcar Cobrado"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteTripFunction(trip.id)}
                            className="cursor-pointer bg-red-400"
                          >
                            Eliminar
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

      {/* ✅ CONTROLES DE PAGINACIÓN */}
      {!limit && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}