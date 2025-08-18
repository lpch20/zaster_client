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
import { Checkbox } from "@/components/ui/checkbox";
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
import { getClients, getTrip } from "@/api/RULE_getData";
import { Loading } from "./spinner";
import { updateTripStatus } from "@/api/RULE_updateData";
import { ReferenciaCobroModal } from "./referencia-cobro-modal";
import { FacturaModal } from "./factura-modal";
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
import { fixUruguayTimezone } from "@/lib/utils";

export function TripList({ limit }: { limit?: number }) {
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [facturadoFilterBy, setFacturadoFilterBy] = useState("");
  const [lugarCargaFilter, setLugarCargaFilter] = useState("");
  const [destinatarioFilter, setDestinatarioFilter] = useState("");
  const [cobradoFilter, setCobradoFilter] = useState("todos");
  const [facturadoFilter, setFacturadoFilter] = useState("todos"); // ✅ NUEVO: Filtro de facturación

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ✅ NUEVO: Estado para viajes seleccionados
  const [selectedTrips, setSelectedTrips] = useState<number[]>([]);

  const getDataTrip = async () => {
    try {
      setLoading(true);
      const [tripsResult, clientsResult] = await Promise.all([
        getTrip(),
        getClients(),
      ]);

      if (tripsResult && tripsResult.result) {
        const sortedTrips = tripsResult.result.sort((a: any, b: any) => {
          return Number(b.numero_viaje) - Number(a.numero_viaje);
        });
        setTrips(sortedTrips);
        setCurrentPage(1);
      }

      if (clientsResult && clientsResult.result) {
        // ✅ FILTRAR clientes activos y null
        const activeClients = clientsResult.result.filter(
          (c: any) => c !== null && !c.soft_delete
        );
        setClients(activeClients);

        console.log("🔍 DEBUG - Clientes cargados:", activeClients);
        console.log(
          "🔍 DEBUG - IDs de clientes:",
          activeClients.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            tipo: typeof c.id,
          }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDataTrip();
  }, []);

  const updateStatusTrip = async (id: number) => {
    try {
      const result = await updateTripStatus(id);
      if (result) {
        Swal.fire("Éxito", "Estado actualizado correctamente", "success");
        getDataTrip();
      } else {
        Swal.fire("Error", "No se pudo actualizar el estado.", "error");
      }
    } catch {
      Swal.fire("Error", "Hubo un problema al actualizar el estado.", "error");
    }
  };

  // ✅ FUNCIÓN PARA MARCAR TODOS LOS FILTRADOS COMO COBRADOS/NO COBRADOS
  const updateAllFilteredTripsStatus = async (cobrado: boolean) => {
    if (filteredTrips.length === 0) {
      Swal.fire("Info", "No hay viajes para actualizar", "info");
      return;
    }

    const statusText = cobrado ? "cobrados" : "no cobrados";
    const confirmResult = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas marcar todos los ${filteredTrips.length} viajes filtrados como ${statusText}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar todos",
      cancelButtonText: "Cancelar",
    });

    if (confirmResult.isConfirmed) {
      try {
        setLoading(true);

        // Actualizar todos los viajes filtrados uno por uno
        for (const trip of filteredTrips) {
          await updateTripStatus(trip.id);
        }

        Swal.fire(
          "Éxito",
          `Todos los viajes han sido marcados como ${statusText}`,
          "success"
        );
        getDataTrip();
      } catch (error) {
        console.error("Error actualizando viajes:", error);
        Swal.fire(
          "Error",
          "Hubo un problema al actualizar los viajes",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteTripFunction = async (id: number) => {
    if (!id) return;

    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        const response = await deleteTrypById(id);
        if (response.result === true) {
          Swal.fire("Éxito", "Viaje eliminado correctamente", "success");
          getDataTrip();
        } else {
          Swal.fire("Error", "No se pudo eliminar el viaje.", "error");
        }
      }
    } catch {
      Swal.fire("Error", "Hubo un problema al eliminar el viaje.", "error");
    }
  };

  // ✅ FUNCIÓN HELPER PARA COMPARAR IDs
  const compareIds = (id1: any, id2: any): boolean => {
    const str1 = String(id1).trim();
    const str2 = String(id2).trim();
    const stringMatch = str1 === str2;
    const num1 = Number(id1);
    const num2 = Number(id2);
    const numberMatch = !isNaN(num1) && !isNaN(num2) && num1 === num2;
    return stringMatch || numberMatch;
  };

  // ✅ FILTROS CON CORRECCIÓN
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = Object.values(trip).some(
      (v) =>
        typeof v === "string" &&
        v.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Filtro Destinatario (por ID seleccionado)
    const matchesDest =
      destinatarioFilter === "" ||
      destinatarioFilter === "todos" ||
      compareIds(trip.destinatario_id, destinatarioFilter);

    const invoice = trip.numero_factura?.toString() || "";
    const matchesInvoice =
      invoiceFilter === "" || invoice.includes(invoiceFilter);

    // ✅ Filtro Facturado A (por ID seleccionado)
    const matchesFacturadoA =
      facturadoFilterBy === "" ||
      facturadoFilterBy === "todos" ||
      compareIds(trip.facturar_a, facturadoFilterBy);

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

    // ✅ NUEVO: Filtro de facturación basado en número de factura
    const matchesFacturado =
      facturadoFilter === "todos" ||
      (facturadoFilter === "facturado" &&
        trip.numero_factura &&
        trip.numero_factura.toString().trim() !== "") ||
      (facturadoFilter === "no_facturado" &&
        (!trip.numero_factura || trip.numero_factura.toString().trim() === ""));

    return (
      matchesSearch &&
      matchesDest &&
      matchesInvoice &&
      matchesFacturadoA &&
      matchesCarga &&
      matchesDate &&
      matchesCob &&
      matchesFacturado
    );
  });

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = limit
    ? filteredTrips.slice(0, limit)
    : filteredTrips.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    invoiceFilter,
    facturadoFilterBy,
    lugarCargaFilter,
    destinatarioFilter,
    cobradoFilter,
    facturadoFilter, // ✅ NUEVO: Incluir filtro de facturación
    dateRange,
  ]);

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "l" });

    // ✅ Obtener nombres para el título del PDF
    const destinatarioClient =
      destinatarioFilter && destinatarioFilter !== "todos"
        ? clients.find((c) => compareIds(c.id, destinatarioFilter))
        : null;
    const facturadoClient =
      facturadoFilterBy && facturadoFilterBy !== "todos"
        ? clients.find((c) => compareIds(c.id, facturadoFilterBy))
        : null;

    let titleText = "Resumen de Viajes";
    if (destinatarioClient)
      titleText += ` - Destinatario: ${destinatarioClient.nombre}`;
    if (facturadoClient)
      titleText += ` - Facturado A: ${facturadoClient.nombre}`;

    doc.setFontSize(16);
    doc.text(titleText, 14, 15);

    let startY = 25;
    if (dateRange?.from && dateRange?.to) {
      const fromDate = fixUruguayTimezone(dateRange.from);
      const toDate = fixUruguayTimezone(dateRange.to);
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
      "IVA",
      "Cobrado",
      "Facturado A",
      "Ref. Cobro",
      "Total UY",
    ];

    const rows = filteredTrips.map((trip) => {
      const facturadoClient = clients.find((c: any) =>
        compareIds(c.id, trip.facturar_a)
      );
      const facturadoName = facturadoClient?.nombre || "N/D";

      return [
        fixUruguayTimezone(trip.fecha_viaje),
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
        trip.iva_status ? "22%" : "No aplica",
        trip.cobrado ? "Si" : "No",
        facturadoName,
        trip.referencia_cobro || "N/D",
        `${
          trip?.total_monto_uy?.toLocaleString("es-UY", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"
        }`,
      ];
    });

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
    const value = `${totalUY.toLocaleString("es-UY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
      {/* ✅ FILTROS MEJORADOS CON DROPDOWNS */}
      <div className="space-y-3 sm:space-y-4">
        {/* Primera fila: Buscador general */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="🔍 Buscar en todos los campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-center sm:justify-end">
            <Link href="/viajes/nuevo" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">+ Nuevo Viaje</Button>
            </Link>
          </div>
        </div>

        {/* Segunda fila: Filtros específicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Input
            placeholder="📄 Nº de factura..."
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
          />

          {/* ✅ DROPDOWN FACTURADO A */}
          <Select
            value={facturadoFilterBy}
            onValueChange={setFacturadoFilterBy}
          >
            <SelectTrigger>
              <SelectValue placeholder="💰 Facturado a..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los clientes</SelectItem>
              {clients
                .filter(
                  (client, index, self) =>
                    // ✅ Filtrar duplicados por ID
                    index === self.findIndex((c) => compareIds(c.id, client.id))
                )
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((client: any) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.nombre}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="📍 Lugar de carga..."
            value={lugarCargaFilter}
            onChange={(e) => setLugarCargaFilter(e.target.value)}
          />

          {/* ✅ DROPDOWN DESTINATARIO */}
          <Select
            value={destinatarioFilter}
            onValueChange={setDestinatarioFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="🎯 Destinatario..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los destinatarios</SelectItem>
              {clients
                .filter(
                  (client, index, self) =>
                    // ✅ Filtrar duplicados por ID
                    index === self.findIndex((c) => compareIds(c.id, client.id))
                )
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((client: any) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.nombre}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tercera fila: Estado y fecha */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <Select value={cobradoFilter} onValueChange={setCobradoFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="💳 Estado de cobro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="cobrado">✅ Cobrado</SelectItem>
              <SelectItem value="no_cobrado">❌ No Cobrado</SelectItem>
            </SelectContent>
          </Select>

          {/* ✅ NUEVO: Filtro de facturación */}
          <Select value={facturadoFilter} onValueChange={setFacturadoFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="📄 Con/Sin Factura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los viajes</SelectItem>
              <SelectItem value="facturado">📄 Con Nº de Factura</SelectItem>
              <SelectItem value="no_facturado">❌ Sin Nº de Factura</SelectItem>
            </SelectContent>
          </Select>

          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          {/* Botón para limpiar filtros */}
          {(searchTerm ||
            invoiceFilter ||
            facturadoFilterBy ||
            lugarCargaFilter ||
            destinatarioFilter ||
            cobradoFilter !== "todos" ||
            facturadoFilter !== "todos" ||
            dateRange) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setInvoiceFilter("");
                setFacturadoFilterBy("");
                setLugarCargaFilter("");
                setDestinatarioFilter("");
                setCobradoFilter("todos");
                setFacturadoFilter("todos"); // ✅ NUEVO: Resetear filtro de facturación
                setDateRange(undefined);
              }}
              className="whitespace-nowrap w-full sm:w-auto"
            >
              🗑️ Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* ✅ INFO DE RESULTADOS Y CONTROLES */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-
              {Math.min(endIndex, filteredTrips.length)} de {filteredTrips.length}{" "}
              viajes
              {(searchTerm ||
                invoiceFilter ||
                facturadoFilterBy ||
                lugarCargaFilter ||
                destinatarioFilter ||
                cobradoFilter !== "todos" ||
                facturadoFilter !== "todos" ||
                dateRange) && (
                <span className="text-blue-600">
                  {" "}
                  (filtrados de {trips.length} total)
                </span>
              )}
              <br />
              <span className="font-semibold text-green-600">
                💰 Total General: $
                {filteredTrips
                  .reduce((acc, trip) => {
                    const t = Number(trip.total_monto_uy);
                    return acc + (isNaN(t) ? 0 : t);
                  }, 0)
                  .toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </span>
            </div>
            {/* ✅ Paginación */}
            {!limit && totalPages > 1 && (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Controles: PDF + Acciones Masivas + Paginación */}
        <div className="w-full">
          {filteredTrips.length > 0 && (
            <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3">
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="w-full sm:w-auto whitespace-nowrap"
              >
                📄 Descargar PDF
              </Button>

              <ReferenciaCobroModal onSuccess={getDataTrip} />

              <FacturaModal 
                onSuccess={getDataTrip}
                trips={filteredTrips}
                selectedTrips={selectedTrips}
                onSelectionChange={setSelectedTrips}
              />

              <Button
                onClick={() => updateAllFilteredTripsStatus(true)}
                variant="outline"
                className="w-full sm:w-auto whitespace-nowrap text-green-600 border-green-600 hover:bg-green-50"
                disabled={loading}
              >
                ✅ Marcar todos como cobrados
              </Button>

              <Button
                onClick={() => updateAllFilteredTripsStatus(false)}
                variant="outline"
                className="w-full sm:w-auto whitespace-nowrap text-red-600 border-red-600 hover:bg-red-50"
                disabled={loading}
              >
                ❌ Marcar todos como no cobrados
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ TABLA RESPONSIVE */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedTrips.length === filteredTrips.length && filteredTrips.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTrips(filteredTrips.map(trip => trip.id));
                      } else {
                        setSelectedTrips([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-[80px]">Número</TableHead>
                <TableHead className="w-[100px]">Nº Factura</TableHead>
                <TableHead className="w-[100px]">Nº Remito</TableHead>
                <TableHead className="w-[100px] hidden sm:table-cell">
                  Fecha
                </TableHead>
                <TableHead className="w-[150px] hidden md:table-cell">
                  Remitente
                </TableHead>
                <TableHead className="w-[150px] hidden lg:table-cell">
                  Destinatario
                </TableHead>
                <TableHead className="w-[150px] hidden lg:table-cell">
                  Facturado A
                </TableHead>
                <TableHead className="w-[80px] hidden sm:table-cell">
                  Kms
                </TableHead>
                <TableHead className="w-[120px]">Total</TableHead>
                <TableHead className="w-[120px] hidden xl:table-cell">
                  Ref. Cobro
                </TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <Loading />
                    <p className="mt-2">Cargando viajes...</p>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {currentTrips.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="text-center py-8 text-gray-500"
                    >
                      {searchTerm ||
                      invoiceFilter ||
                      facturadoFilterBy ||
                      lugarCargaFilter ||
                      destinatarioFilter ||
                      cobradoFilter !== "todos" ||
                      dateRange
                        ? "No se encontraron viajes con los filtros aplicados"
                        : "No hay viajes disponibles"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTrips.map((trip) => {
                    const destinatarioClient = clients.find((c: any) =>
                      compareIds(c.id, trip.destinatario_id)
                    );

                    const facturadoClient = clients.find((c: any) =>
                      compareIds(c.id, trip.facturar_a)
                    );

                    return (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedTrips.includes(trip.id)}
                            onCheckedChange={() => {
                              if (selectedTrips.includes(trip.id)) {
                                setSelectedTrips(selectedTrips.filter(id => id !== trip.id));
                              } else {
                                setSelectedTrips([...selectedTrips, trip.id]);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {trip.numero_viaje}
                        </TableCell>
                        <TableCell>{trip.numero_factura || "N/D"}</TableCell>
                        <TableCell>{trip.remito_numero || "N/D"}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {trip.fecha_viaje
                            ? fixUruguayTimezone(trip.fecha_viaje)
                            : "N/D"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div
                            className="max-w-[150px] truncate"
                            title={trip.remitente_name}
                          >
                            {trip.remitente_name || "N/D"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div
                            className="max-w-[150px] truncate"
                            title={destinatarioClient?.nombre}
                          >
                            {destinatarioClient?.nombre || "N/D"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div
                            className="max-w-[150px] truncate"
                            title={facturadoClient?.nombre}
                          >
                            {facturadoClient?.nombre || "N/D"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right">
                          {trip.kms || "0"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="text-green-600">
                            $
                            {(trip.total_monto_uy || 0).toLocaleString(
                              "es-UY",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div
                            className="max-w-[120px] truncate"
                            title={trip.referencia_cobro}
                          >
                            {trip.referencia_cobro || "N/D"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              trip.cobrado
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            <span>{trip.cobrado ? "✅" : "❌"}</span>
                            <span>{trip.cobrado ? "Cobrado" : "Pendiente"}</span>
                          </div>
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
                              <DropdownMenuItem asChild>
                                <Link href={`/viajes/${trip.id}`}>
                                  👁️ Ver detalles
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/viajes/${trip.id}/editar`}>
                                  ✏️ Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateStatusTrip(trip.id)}
                              >
                                🔄 Cambiar estado cobrado
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteTripFunction(trip.id)}
                                className="text-red-600"
                              >
                                🗑️ Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}
