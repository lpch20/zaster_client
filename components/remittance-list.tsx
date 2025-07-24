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
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
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
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { DateRangeFilter } from "./date-range-filter";
import { Loading } from "./spinner";
import { getClientsById, getRemito } from "@/api/RULE_getData";
import Swal from "sweetalert2";
import { deleteRemitoById } from "@/api/RULE_deleteDate";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function RemittanceList() {
  const [remittances, setRemittances] = useState([]);
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

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
          return dateB.getTime() - dateA.getTime();
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

      // 2. FILTRO POR RANGO DE FECHAS
      const matchesDateRange = () => {
        if (!dateRange?.from) return true;

        const remittanceDate = new Date(remittance.fecha);
        const fromDate = dateRange.from;
        const toDate = dateRange.to;

        if (fromDate && !toDate) {
          return remittanceDate >= fromDate;
        }

        if (fromDate && toDate) {
          return remittanceDate >= fromDate && remittanceDate <= toDate;
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
      // Ordenar por número de remito (de mayor a menor)
      return Number(b.numero_remito) - Number(a.numero_remito);
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

  const deleteRemitoFunction = async (id) => {
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
          const response = await deleteRemitoById(id, token);
          Swal.close();

          if (response.result === true) {
            Swal.fire("Éxito", "Remito eliminado correctamente", "success");
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
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "l" });

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resumen de Remitos", 14, 15);

    // Agregar filtros aplicados si los hay
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
        ? new Date(remittance.fecha).toLocaleDateString("es-UY", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
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
      startY,
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
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="🔍 Buscar en todos los campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end">
            <Link href="/remitos/nuevo">
              <Button className="w-full sm:w-auto">+ Nuevo Remito</Button>
            </Link>
          </div>
        </div>

        {/* Segunda fila: Filtros específicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="📍 Filtrar por destinatario..."
            value={destinatarioFilter}
            onChange={(e) => setDestinatarioFilter(e.target.value)}
          />
          <Input
            placeholder="👤 Filtrar por chofer..."
            value={choferFilter}
            onChange={(e) => setChoferFilter(e.target.value)}
          />
          <Input
            placeholder="🚛 Filtrar por matrícula..."
            value={matriculaFilter}
            onChange={(e) => setMatriculaFilter(e.target.value)}
          />
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        {/* Tercera fila: Rango de remitos */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
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
              className="whitespace-nowrap"
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
      <div className="rounded-md border">
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
                            <Link href={`/remitos/${remittance.id}`}>
                              Ver detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/remitos/${remittance.id}/editar`}>
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteRemitoFunction(remittance.id)}
                            className="text-red-600"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
