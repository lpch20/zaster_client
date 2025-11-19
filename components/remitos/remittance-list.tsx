// components/remittance-list.tsx - ARCHIVO COMPLETO CON LUGAR DE DESCARGA

"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Check, ChevronsUpDown } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { DateRangeFilter } from "@/components/shared/modals/date-range-filter";
import { Loading } from "@/components/shared/spinner";
import { getClientsById, getRemito } from "@/api/RULE_getData";
import Swal from "sweetalert2";
import { deleteRemitoById } from "@/api/RULE_deleteDate";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateUruguay, cn } from "@/lib/utils";
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

export function RemittanceList() {
  const [remittances, setRemittances] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  // ✅ FILTROS SEPARADOS DEL BUSCADOR
  const [searchTerm, setSearchTerm] = useState("");
  const [destinatarioFilter, setDestinatarioFilter] = useState("");
  const [remitoRangeFrom, setRemitoRangeFrom] = useState("");
  const [remitoRangeTo, setRemitoRangeTo] = useState("");
  const [choferFilter, setChoferFilter] = useState("");
  const [matriculaFilter, setMatriculaFilter] = useState("");

  // ✅ Estados para los comboboxes
  const [destinatarioOpen, setDestinatarioOpen] = useState(false);
  const [choferOpen, setChoferOpen] = useState(false);
  const [matriculaOpen, setMatriculaOpen] = useState(false);

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchRemitos = async () => {
    try {
      setIsLoading(true);
      const result = await getRemito();
      if (result && result.result) {
        const sortedTrips = result.result.sort((a: any, b: any) => {
          // Convierte las fechas a objetos Date para compararlas correctamente
          const dateA = new Date(a.fecha);
          const dateB = new Date(b.fecha);

          // Compara las fechas en orden descendente (más reciente primero)
          const dateComparison = dateB.getTime() - dateA.getTime();
          
          // ✅ Si las fechas son iguales, ordenar por número de remito (descendente)
          if (dateComparison === 0) {
            const remitoNumA = parseInt(a.numero_remito) || 0;
            const remitoNumB = parseInt(b.numero_remito) || 0;
            return remitoNumB - remitoNumA; // Descendente (mayor primero)
          }
          
          return dateComparison;
        });

        setRemittances(sortedTrips);
        setCurrentPage(1); // Resetear a página 1 cuando se cargan nuevos datos
      }
      setIsLoading(false);
      console.log(result);
    } catch (error) {
      console.error("Error fetching remitos:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRemitos();
  }, []);

  useEffect(() => {
    console.log(remittances);
  }, [remittances]);

  // ✅ FILTRADO CON BUSCADOR Y FILTROS SEPARADOS
  const filteredRemittances = remittances
    .filter((remittance) => {
      // 1. BUSCADOR GENERAL (busca en todos los campos)
      const matchesSearch =
        searchTerm === "" ||
        Object.values(remittance).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // 2. FILTRO POR RANGO DE FECHAS - ✅ Normalizar a zona horaria de Uruguay
      const matchesDateRange = () => {
        if (!dateRange?.from) return true;

        // ✅ Normalizar fechas a medianoche en Uruguay para comparación correcta
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

        const remittanceDateNormalized = normalizeDateToUruguay(remittance.fecha);
        const fromDateNormalized = dateRange.from ? normalizeDateToUruguay(dateRange.from) : null;
        const toDateNormalized = dateRange.to ? (() => {
          const toDate = normalizeDateToUruguay(dateRange.to);
          // Para la fecha "to", incluir todo el día (hasta las 23:59:59 = 02:59:59 UTC del día siguiente)
          const year = toDate.getUTCFullYear();
          const month = toDate.getUTCMonth();
          const day = toDate.getUTCDate();
          return new Date(Date.UTC(year, month, day + 1, 2, 59, 59));
        })() : null;
        
        // ✅ DEBUG: Log para verificar las fechas normalizadas
        if (dateRange?.from && remittance.numero_remito) {
          console.log("🔍 DEBUG fecha filtro:", {
            numero_remito: remittance.numero_remito,
            fechaOriginal: remittance.fecha,
            fechaNormalizada: remittanceDateNormalized.toISOString(),
            fromOriginal: dateRange.from.toISOString(),
            fromNormalizada: fromDateNormalized?.toISOString(),
            toOriginal: dateRange.to?.toISOString(),
            toNormalizada: toDateNormalized?.toISOString(),
            matches: remittanceDateNormalized >= fromDateNormalized! && remittanceDateNormalized <= toDateNormalized!
          });
        }

        if (fromDateNormalized && !toDateNormalized) {
          return remittanceDateNormalized >= fromDateNormalized;
        }

        if (fromDateNormalized && toDateNormalized) {
          return remittanceDateNormalized >= fromDateNormalized && remittanceDateNormalized <= toDateNormalized;
        }

        return true; // No date range selected, show all
      };

      // 3. FILTRO ESPECÍFICO POR DESTINATARIO
      const matchesDestinatario =
        destinatarioFilter === "" ||
        (remittance.destinatario_nombre &&
          remittance.destinatario_nombre
            .toLowerCase()
            .includes(destinatarioFilter.toLowerCase()));

      // 4. FILTRO ESPECÍFICO POR RANGO DE NÚMEROS DE REMITO (ej: 1-10)
      const matchesRemitoRange = () => {
        if (!remitoRangeFrom && !remitoRangeTo) return true;

        const remitoNum = parseInt(remittance.numero_remito);
        if (isNaN(remitoNum)) return true;

        const rangeFrom = remitoRangeFrom ? parseInt(remitoRangeFrom) : 0;
        const rangeTo = remitoRangeTo
          ? parseInt(remitoRangeTo)
          : Number.MAX_SAFE_INTEGER;

        return remitoNum >= rangeFrom && remitoNum <= rangeTo;
      };

      // 5. FILTRO ESPECÍFICO POR CHOFER
      const matchesChofer =
        choferFilter === "" ||
        (remittance.chofer_nombre &&
          remittance.chofer_nombre
            .toLowerCase()
            .includes(choferFilter.toLowerCase()));

      // 6. FILTRO ESPECÍFICO POR MATRÍCULA
      const matchesMatricula =
        matriculaFilter === "" ||
        (remittance.camion_matricula &&
          remittance.camion_matricula
            .toLowerCase()
            .includes(matriculaFilter.toLowerCase()));

      // ✅ TODOS LOS FILTROS DEBEN CUMPLIRSE (AND lógico)
      return (
        matchesSearch &&
        matchesDateRange() &&
        matchesDestinatario &&
        matchesRemitoRange() &&
        matchesChofer &&
        matchesMatricula
      );
    })
    .sort((a: any, b: any) => {
      // ✅ Ordenar por fecha (más reciente primero)
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      const dateComparison = dateB.getTime() - dateA.getTime();
      
      // ✅ Si las fechas son iguales, ordenar por número de remito (descendente)
      if (dateComparison === 0) {
        const remitoNumA = parseInt(a.numero_remito) || 0;
        const remitoNumB = parseInt(b.numero_remito) || 0;
        return remitoNumB - remitoNumA; // Descendente (mayor primero)
      }
      
      return dateComparison;
    });

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredRemittances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRemittances = filteredRemittances.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    dateRange,
    destinatarioFilter,
    remitoRangeFrom,
    remitoRangeTo,
    choferFilter,
    matriculaFilter,
  ]);

  // ✅ Obtener listas únicas de destinatarios, choferes y matrículas
  const destinatariosUnicos = Array.from(
    new Set(
      remittances
        .map((r: any) => r.destinatario_nombre)
        .filter((nombre) => nombre && nombre.trim() !== "")
    )
  ).sort();

  const choferesUnicos = Array.from(
    new Set(
      remittances
        .map((r: any) => r.chofer_nombre)
        .filter((nombre) => nombre && nombre.trim() !== "")
    )
  ).sort();

  const matriculasUnicas = Array.from(
    new Set(
      remittances
        .map((r: any) => r.camion_matricula)
        .filter((matricula) => matricula && matricula.trim() !== "")
    )
  ).sort();

  const deleteRemitoFunction = async (id: string) => {
    if (!id) return;

    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Eliminando remito...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await deleteRemitoById(id, token || "");
          Swal.close();

          // ✅ NUEVA RESPUESTA: El backend ahora devuelve un objeto con más información
          if (response.result && response.result.success) {
            const { liquidacionesEliminadas, viajesEliminados } = response.result;
            
            // ✅ Mostrar mensaje detallado de lo que se eliminó
            let mensaje = "Remito eliminado permanentemente";
            if (liquidacionesEliminadas > 0 || viajesEliminados > 0) {
              mensaje += `\n\n📊 Eliminación en cascada:`;
              if (liquidacionesEliminadas > 0) {
                mensaje += `\n• ${liquidacionesEliminadas} liquidación(es) eliminada(s) permanentemente`;
              }
              if (viajesEliminados > 0) {
                mensaje += `\n• ${viajesEliminados} viaje(s) eliminado(s) permanentemente`;
              }
            }
            mensaje += `\n\n✅ Ahora puedes volver a cargar un remito con el mismo número.`;
            
            Swal.fire({
              title: "Éxito",
              text: mensaje,
              icon: "success",
              confirmButtonText: "Entendido"
            });
            fetchRemitos(); // Recargar la lista de remitos
          } else {
            Swal.fire("Error", "No se pudo eliminar el remito.", "error");
          }
        } catch (error) {
          Swal.fire(
            "Error",
            "Hubo un problema al eliminar el remito.",
            "error"
          );
          console.error("Error al eliminar remito:", error);
        }
      }
    });
  };

  // ✅ FUNCIÓN PARA LIMPIAR TODOS LOS FILTROS
  const clearAllFilters = () => {
    setSearchTerm("");
    setDestinatarioFilter("");
    setRemitoRangeFrom("");
    setRemitoRangeTo("");
    setChoferFilter("");
    setMatriculaFilter("");
    setDateRange(undefined);
  };

  // ✅ VERIFICAR SI HAY FILTROS ACTIVOS
  const hasActiveFilters =
    searchTerm ||
    destinatarioFilter ||
    remitoRangeFrom ||
    remitoRangeTo ||
    choferFilter ||
    matriculaFilter ||
    dateRange;

  // ✅ FUNCIÓN PARA DESCARGAR PDF CON LUGAR DE DESCARGA
  const downloadPDF = async () => {
    const doc = new jsPDF({ orientation: "l" });

    // Añadir logo en la izquierda y título en la punta derecha
    try {
      const logo = await (await fetch('/logo.jpg')).blob().then(blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); }));
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      if (logo) doc.addImage(logo as string, 'JPEG', margin, 6, 40, 16);
      const title = "Resumen de Remitos";
      doc.setFontSize(16);
      const textWidth = doc.getTextWidth(title);
      doc.text(title, pageWidth - margin - textWidth, 18);
    } catch (e) {
      console.error('No se pudo cargar logo para PDF Remitos', e);
      doc.setFontSize(16);
      doc.text("Resumen de Remitos", 64, 18);
    }

    // Agregar filtros aplicados si los hay
    let startY = 25;
    if (dateRange?.from && dateRange?.to) {
      const fromDate = formatDateUruguay(dateRange.from);
      const toDate = formatDateUruguay(dateRange.to);
      doc.setFontSize(12);
      doc.text(`Fecha Filtrada: ${fromDate} - ${toDate}`, 14, startY);
      startY += 10;
    }

    if (destinatarioFilter) {
      doc.setFontSize(12);
      doc.text(`Destinatario: ${destinatarioFilter}`, 14, startY);
      startY += 10;
    }

    if (choferFilter) {
      doc.setFontSize(12);
      doc.text(`Chofer: ${choferFilter}`, 14, startY);
      startY += 10;
    }

    // ✅ Cabeceras de la tabla CON LUGAR DE DESCARGA
    const headers = [
      "Nº Remito",
      "Fecha",
      "Chofer",
      "Lugar de Carga",
      "Lugar de Descarga", // ✅ NUEVO CAMPO
      "Destinatario",
      "Matrícula",
      "Kilómetros",
      "Categoría",
      "Cantidad",
    ];

    // ✅ Usar todos los remitos filtrados para el PDF CON LUGAR DE DESCARGA
    const rows = filteredRemittances.map((remittance) => [
      remittance.numero_remito || "",
      remittance.fecha
        ? formatDateUruguay(remittance.fecha)
        : "N/D",
      remittance.chofer_nombre || "N/D",
      remittance.lugar_carga || "N/D",
      remittance.lugar_descarga || "N/D", // ✅ NUEVO CAMPO
      remittance.destinatario_nombre || "N/D",
      remittance.camion_matricula || "N/D",
      remittance.kilometros || "0",
      remittance.categoria || "N/D",
      remittance.cantidad || "0",
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 36,
      styles: { halign: "center", fontSize: 7 }, // ✅ Fuente más pequeña por la nueva columna
      headStyles: { fillColor: [22, 160, 133] },
      margin: { top: 20 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total de Remitos: ${filteredRemittances.length}`, 14, finalY);
    doc.setFont("helvetica", "normal");

    doc.save("resumen_remitos.pdf");
  };

  return (
    <div className="space-y-4">
      {/* ✅ SECCIÓN DE FILTROS SEPARADOS */}
      <div className="space-y-4">
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
            <Link href="/remitos/nuevo" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">+ Nuevo Remito</Button>
            </Link>
          </div>
        </div>

        {/* Segunda fila: Filtros específicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* ✅ Combobox para Destinatario */}
          <Popover open={destinatarioOpen} onOpenChange={setDestinatarioOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={destinatarioOpen}
                className="w-full justify-between"
              >
                {destinatarioFilter || "📍 Filtrar por destinatario..."}
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
                      value=""
                      onSelect={() => {
                        setDestinatarioFilter("");
                        setDestinatarioOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          destinatarioFilter === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todos los destinatarios
                    </CommandItem>
                    {destinatariosUnicos.map((destinatario: string) => (
                      <CommandItem
                        key={destinatario}
                        value={destinatario}
                        onSelect={() => {
                          setDestinatarioFilter(destinatario === destinatarioFilter ? "" : destinatario);
                          setDestinatarioOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            destinatarioFilter === destinatario ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {destinatario}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* ✅ Combobox para Chofer */}
          <Popover open={choferOpen} onOpenChange={setChoferOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={choferOpen}
                className="w-full justify-between"
              >
                {choferFilter || "👤 Filtrar por chofer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={true}>
                <CommandInput placeholder="Buscar chofer..." />
                <CommandList>
                  <CommandEmpty>No se encontró ningún chofer.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setChoferFilter("");
                        setChoferOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          choferFilter === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todos los choferes
                    </CommandItem>
                    {choferesUnicos.map((chofer: string) => (
                      <CommandItem
                        key={chofer}
                        value={chofer}
                        onSelect={() => {
                          setChoferFilter(chofer === choferFilter ? "" : chofer);
                          setChoferOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            choferFilter === chofer ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {chofer}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* ✅ Combobox para Matrícula */}
          <Popover open={matriculaOpen} onOpenChange={setMatriculaOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={matriculaOpen}
                className="w-full justify-between"
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

          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        {/* Tercera fila: Rango de remitos */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              📄 Rango de remitos:
            </span>
            <Input
              placeholder="Desde"
              type="number"
              value={remitoRangeFrom}
              onChange={(e) => setRemitoRangeFrom(e.target.value)}
              className="w-[100px]"
            />
            <span className="text-gray-400">-</span>
            <Input
              placeholder="Hasta"
              type="number"
              value={remitoRangeTo}
              onChange={(e) => setRemitoRangeTo(e.target.value)}
              className="w-[100px]"
            />
          </div>

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="whitespace-nowrap w-full sm:w-auto"
            >
              🗑️ Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* ✅ INFO DE RESULTADOS Y PAGINACIÓN */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-
          {Math.min(endIndex, filteredRemittances.length)} de{" "}
          {filteredRemittances.length} remitos
          {hasActiveFilters && (
            <span className="text-blue-600">
              {" "}
              (filtrados de {remittances.length} total)
            </span>
          )}
        </div>

        {/* ✅ BOTÓN PARA DESCARGAR PDF */}
        <div className="flex items-center gap-2">
          {filteredRemittances.length > 0 && (
            <Button onClick={downloadPDF} variant="outline">
              📄 Descargar PDF
            </Button>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
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

      {/* ✅ TABLA DE REMITOS CON LUGAR DE DESCARGA */}
      <Card>
        <CardContent className="p-0">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número de Remito</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Kilómetros</TableHead>
              <TableHead>Chofer</TableHead>
              <TableHead>Lugar de Carga</TableHead>
              <TableHead>Lugar de Descarga</TableHead> {/* ✅ NUEVA COLUMNA */}
              <TableHead>Destinatario</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {" "}
                  {/* ✅ Actualizado colSpan a 9 */}
                  <Loading />
                  <p className="mt-2">Cargando remitos...</p>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {currentRemittances.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    {" "}
                    {/* ✅ Actualizado colSpan a 9 */}
                    {hasActiveFilters
                      ? "No se encontraron remitos con los filtros aplicados"
                      : "No hay remitos disponibles"}
                  </TableCell>
                </TableRow>
              ) : (
                currentRemittances.map((remittance) => (
                  <TableRow key={remittance.id}>
                    <TableCell className="font-medium">
                      {remittance.numero_remito}
                    </TableCell>
                    <TableCell>
                      {remittance.fecha
                        ? new Date(remittance.fecha).toLocaleDateString(
                            "es-UY",
                            {
                              timeZone: "UTC", 
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : null}
                    </TableCell>
                    <TableCell>{remittance.kilometros || "N/D"}</TableCell>
                    <TableCell>{remittance.chofer_nombre || "N/D"}</TableCell>
                    <TableCell>{remittance.lugar_carga || "N/D"}</TableCell>
                    <TableCell>
                      {remittance.lugar_descarga || "N/D"}
                    </TableCell>{" "}
                    {/* ✅ NUEVA CELDA */}
                    <TableCell>
                      {remittance.destinatario_nombre || "N/D"}
                    </TableCell>
                    <TableCell>
                      {remittance.camion_matricula || "N/D"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/remitos/${remittance.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/remitos/${remittance.id}/editar`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRemitoFunction(remittance.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          )}
        </Table>
        </CardContent>
      </Card>
    </div>
  );
}
