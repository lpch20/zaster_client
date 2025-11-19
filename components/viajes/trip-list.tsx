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
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MoreHorizontal, ChevronLeft, ChevronRight, Eye, Edit, Check, X, Trash2, ChevronsUpDown } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { DateRangeFilter } from "@/components/shared/modals/date-range-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getClients, getTrip } from "@/api/RULE_getData";
import { Loading } from "@/components/shared/spinner";
import { updateTripStatus } from "@/api/RULE_updateData";
import { ReferenciaCobroModal } from "@/components/shared/modals/referencia-cobro-modal";
import { FacturaModal } from "@/components/shared/modals/factura-modal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogoDataUrl } from "@/lib/pdfUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteTrypById } from "@/api/RULE_deleteDate";
import { fixUruguayTimezone, cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function TripList({ limit }: { limit?: number }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [facturadoFilterBy, setFacturadoFilterBy] = useState("");
  const [lugarCargaFilter, setLugarCargaFilter] = useState("");
  const [destinatarioFilter, setDestinatarioFilter] = useState("");
  const [matriculaFilter, setMatriculaFilter] = useState("");
  const [cobradoFilter, setCobradoFilter] = useState("todos");
  const [facturadoFilter, setFacturadoFilter] = useState("todos"); // ✅ NUEVO: Filtro de facturación

  // ✅ Estados para los comboboxes
  const [facturadoOpen, setFacturadoOpen] = useState(false);
  const [destinatarioOpen, setDestinatarioOpen] = useState(false);
  const [matriculaOpen, setMatriculaOpen] = useState(false);

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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
        
        // ✅ ORDENAR ALFABÉTICAMENTE POR NOMBRE
        const sortedClients = activeClients.sort((a: any, b: any) => {
          const nameA = (a.nombre || "").toLowerCase();
          const nameB = (b.nombre || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setClients(sortedClients);

        console.log("🔍 DEBUG - Clientes cargados:", sortedClients);
        console.log(
          "🔍 DEBUG - IDs de clientes:",
          sortedClients.map((c: any) => ({
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
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
        const response = await deleteTrypById(id.toString(), storedToken);
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

    // ✅ NUEVO: Filtro por Matrícula
    const matchesMatricula =
      matriculaFilter === "" ||
      matriculaFilter === "todos" ||
      (trip.camion_matricula &&
        trip.camion_matricula.toLowerCase().includes(matriculaFilter.toLowerCase()));

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

    // ✅ Normalizar fechas a zona horaria de Uruguay para comparación correcta
    const normalizeDateToUruguay = (date: Date | string): Date => {
      let year: number, month: number, day: number;
      
      if (typeof date === 'string') {
        // ✅ Si viene como string ISO, extraer directamente del formato
        const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
          year = parseInt(isoMatch[1], 10);
          month = parseInt(isoMatch[2], 10) - 1;
          day = parseInt(isoMatch[3], 10);
        } else {
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) return new Date();
          year = dateObj.getFullYear();
          month = dateObj.getMonth();
          day = dateObj.getDate();
        }
      } else {
        // ✅ Si viene como Date (del calendario), usar métodos locales
        if (isNaN(date.getTime())) return new Date();
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDate();
      }
      
      // ✅ Crear fecha a medianoche en Uruguay (UTC-3) = 03:00 UTC del mismo día
      return new Date(Date.UTC(year, month, day, 3, 0, 0));
    };
    
    const normalizedTripDate = normalizeDateToUruguay(trip.fecha_viaje);
    
    const matchesDate =
      dateRange?.from && dateRange?.to
        ? (() => {
            // Normalizar las fechas del rango a medianoche en Uruguay
            const fromDate = normalizeDateToUruguay(dateRange.from);
            // Para la fecha "to", incluir todo el día (hasta las 23:59:59)
            const toDate = new Date(dateRange.to);
            const toYear = toDate.getFullYear();
            const toMonth = toDate.getMonth();
            const toDay = toDate.getDate();
            // Crear fecha al final del día en Uruguay (23:59:59 = 02:59:59 UTC del día siguiente)
            const normalizedToDate = new Date(Date.UTC(toYear, toMonth, toDay + 1, 2, 59, 59));
            
            return normalizedTripDate >= fromDate && normalizedTripDate <= normalizedToDate;
          })()
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
      matchesFacturado &&
      matchesMatricula
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
    matriculaFilter,
    cobradoFilter,
    facturadoFilter, // ✅ NUEVO: Incluir filtro de facturación
    dateRange,
  ]);

  // ✅ Obtener listas únicas de matrículas
  const matriculasUnicas = Array.from(
    new Set(
      trips
        .map((t: any) => t.camion_matricula)
        .filter((matricula) => matricula && matricula.trim() !== "")
    )
  ).sort();

  const downloadPDF = async () => {
    const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" });

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

    // Dibujar header y logo
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    // Calcular anchos de columna proporcionales para A4 landscape
    const usableWidth = pageWidth - margin * 2;
    // Proporciones para las 12 columnas (sum ~= 104)
    const props = [7, 17, 17, 6, 6, 6, 6, 6, 4, 13, 7, 9];
    const sumProps = props.reduce((s, v) => s + v, 0);
    const colWidths = props.map((p) => Math.max(8, (usableWidth * p) / sumProps));
    try {
      const logoRes = await getLogoDataUrl();
      if (logoRes?.dataUrl) doc.addImage(logoRes.dataUrl, logoRes.mime.includes('png') ? 'PNG' : 'JPEG', margin, 6, 50, 20);
    } catch (e) {
      console.error('Error cargando logo para PDF viajes', e);
    }

    doc.setFontSize(18);
    doc.text(titleText, pageWidth - margin - doc.getTextWidth(titleText), 20);

    let startY = 42;
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

    // ✅ Ordenar viajes por fecha de más antigua a más reciente para el PDF
    const sortedTripsForPDF = [...filteredTrips].sort((a, b) => {
      const dateA = new Date(a.fecha_viaje);
      const dateB = new Date(b.fecha_viaje);
      return dateA.getTime() - dateB.getTime(); // Orden ascendente (más antigua primero)
    });

    const rows = sortedTripsForPDF.map((trip) => {
      const facturadoClient = clients.find((c: any) =>
        compareIds(c.id, trip.facturar_a)
      );
      const facturadoName = facturadoClient?.nombre || "N/D";

      const precioFleteBase = Number(trip.precio_flete) || (Number(trip.kms) * Number(trip.tarifa)) || 0;
      const gastosBase = (+trip.lavado + +trip.peaje + +trip.balanza + +trip.inspeccion + +trip.sanidad) || 0;
      const baseNeto = precioFleteBase + gastosBase;
      const totalUY = Number(trip.total_monto_uy) || 0;
      const ivaMonto = Math.max(0, totalUY - baseNeto);

      return [
        fixUruguayTimezone(trip.fecha_viaje),
        trip.lugar_carga || "N/D",
        trip.lugar_descarga || "N/D",
        (Number(trip.kms) || 0).toLocaleString("es-UY"),
        `$${(Number(trip.tarifa) || 0).toLocaleString("es-UY")}`,
        trip.remito_numero || "",
        gastosBase.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        ivaMonto.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        trip.cobrado ? "Si" : "No",
        facturadoName,
        trip.referencia_cobro || "N/D",
        `${(Number(trip?.total_monto_uy) || 0).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ];
    });

    const totalUY = sortedTripsForPDF.reduce((acc, trip) => {
      const t = Number(trip.total_monto_uy);
      return acc + (isNaN(t) ? 0 : t);
    }, 0);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY,
      styles: { halign: "center", fontStyle: "bold", fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: margin, right: margin },
      columnStyles: colWidths.reduce((acc: any, w: number, idx: number) => {
        acc[idx] = { cellWidth: w };
        return acc;
      }, {}),
      tableWidth: 'auto',
      tableLineWidth: 0.1,
      didDrawPage: (data: any) => {
        // Ajustar última columna para ocupar cualquier espacio restante
        try {
          const table = (doc as any).lastAutoTable;
          if (!table) return;
          const used = table.table.width;
          const remaining = usableWidth - used;
          if (remaining > 8) {
            const lastCol = table.table.columns[table.table.columns.length - 1];
            if (lastCol) lastCol.width = lastCol.width + remaining;
          }
        } catch (e) {
          // noop
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    const label = "TOTAL UY:";
    const value = `${totalUY.toLocaleString("es-UY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

          {/* ✅ Combobox para Facturado A */}
          <Popover open={facturadoOpen} onOpenChange={setFacturadoOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={facturadoOpen}
                className="w-full justify-between"
              >
                {facturadoFilterBy && facturadoFilterBy !== "todos"
                  ? clients.find((c: any) => compareIds(c.id, facturadoFilterBy))?.nombre || "💰 Facturado a..."
                  : "💰 Facturado a..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={true}>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList>
                  <CommandEmpty>No se encontró ningún cliente.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="todos"
                      onSelect={() => {
                        setFacturadoFilterBy("todos");
                        setFacturadoOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          facturadoFilterBy === "todos" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todos los clientes
                    </CommandItem>
                    {clients
                      .filter(
                        (client, index, self) =>
                          index === self.findIndex((c) => compareIds(c.id, client.id))
                      )
                      .sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map((client: any) => (
                        <CommandItem
                          key={client.id}
                          value={client.nombre}
                          onSelect={() => {
                            setFacturadoFilterBy(client.id.toString() === facturadoFilterBy ? "todos" : client.id.toString());
                            setFacturadoOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              compareIds(facturadoFilterBy, client.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {client.nombre}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Input
            placeholder="📍 Lugar de carga..."
            value={lugarCargaFilter}
            onChange={(e) => setLugarCargaFilter(e.target.value)}
          />

          {/* ✅ Combobox para Destinatario */}
          <Popover open={destinatarioOpen} onOpenChange={setDestinatarioOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={destinatarioOpen}
                className="w-full justify-between"
              >
                {destinatarioFilter && destinatarioFilter !== "todos"
                  ? clients.find((c: any) => compareIds(c.id, destinatarioFilter))?.nombre || "🎯 Destinatario..."
                  : "🎯 Destinatario..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={true}>
                <CommandInput placeholder="Buscar destinatario..." />
                <CommandList>
                  <CommandEmpty>No se encontró ningún destinatario.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="todos"
                      onSelect={() => {
                        setDestinatarioFilter("todos");
                        setDestinatarioOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          destinatarioFilter === "todos" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todos los destinatarios
                    </CommandItem>
                    {clients
                      .filter(
                        (client, index, self) =>
                          index === self.findIndex((c) => compareIds(c.id, client.id))
                      )
                      .sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map((client: any) => (
                        <CommandItem
                          key={client.id}
                          value={client.nombre}
                          onSelect={() => {
                            setDestinatarioFilter(client.id.toString() === destinatarioFilter ? "todos" : client.id.toString());
                            setDestinatarioOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              compareIds(destinatarioFilter, client.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {client.nombre}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Tercera fila: Estado, matrícula y fecha */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          {/* ✅ Combobox para Matrícula */}
          <Popover open={matriculaOpen} onOpenChange={setMatriculaOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={matriculaOpen}
                className="w-full sm:w-[200px] justify-between"
              >
                {matriculaFilter || "🚛 Filtrar por matrícula..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={true}>
                <CommandInput placeholder="Buscar matrícula..." />
                <CommandList>
                  <CommandEmpty>No se encontró ninguna matrícula.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setMatriculaFilter("");
                        setMatriculaOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          matriculaFilter === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todas las matrículas
                    </CommandItem>
                    {matriculasUnicas.map((matricula: string) => (
                      <CommandItem
                        key={matricula}
                        value={matricula}
                        onSelect={() => {
                          setMatriculaFilter(matricula === matriculaFilter ? "" : matricula);
                          setMatriculaOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            matriculaFilter === matricula ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {matricula}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
            matriculaFilter ||
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
                setMatriculaFilter("");
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
                matriculaFilter ||
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
      <Card>
        <CardContent className="p-0">
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
                <TableHead className="w-[80px] hidden sm:table-cell text-center">
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
                      matriculaFilter ||
                      cobradoFilter !== "todos" ||
                      facturadoFilter !== "todos" ||
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
                        <TableCell className="hidden sm:table-cell trip-list-cell">
                          {trip.fecha_viaje
                            ? fixUruguayTimezone(trip.fecha_viaje)
                            : "N/D"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell trip-list-cell">
                          <div
                            className="max-w-[150px] truncate"
                            title={trip.remitente_name}
                          >
                            {trip.remitente_name || "N/D"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell trip-list-cell">
                          <div
                            className="max-w-[150px] truncate"
                            title={destinatarioClient?.nombre}
                          >
                            {destinatarioClient?.nombre || "N/D"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell trip-list-cell">
                          <div
                            className="max-w-[150px] truncate"
                            title={facturadoClient?.nombre}
                          >
                            {facturadoClient?.nombre || "N/D"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center trip-list-cell">
                          {trip.kms || "0"}
                        </TableCell>
                        <TableCell className="text-left font-medium">
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
                          <div className="flex space-x-2">
                            <Link href={`/viajes/${trip.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/viajes/${trip.id}/editar`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatusTrip(trip.id)}
                              className={trip.cobrado ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                            >
                              {trip.cobrado ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteTripFunction(trip.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
