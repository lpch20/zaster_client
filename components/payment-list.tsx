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
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MoreHorizontal, Eye, Edit, Check, X, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dayjs from "dayjs";
import { fixUruguayTimezone } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogoDataUrl } from "@/lib/pdfUtils";

import { getLiquidacion, getRemitoById } from "@/api/RULE_getData";
import { updateLiquidacionStatus } from "@/api/RULE_updateData";
import { deleteLiquidacionById } from "@/api/RULE_deleteDate";

export function PaymentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState("todos"); // "todos", "pagado" o "pendiente"
  const [choferFilter, setChoferFilter] = useState("todos"); // Nuevo filtro por chofer
  const [liquidacion, setLiquidacion] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const getCLiquidacionFunction = async () => {
    try {
      setIsLoading(true);
      const result = await getLiquidacion();
      const activeClients = result.result.filter(
        (liq: any) => liq.soft_delete === false
      );
      console.log("🔍 DEBUG - Datos de liquidación recibidos:", activeClients[0]);
      console.log("🔍 DEBUG - fecha_remito:", activeClients[0]?.fecha_remito);
      console.log("🔍 DEBUG - date:", activeClients[0]?.date);
      console.log("🔍 DEBUG - lugar_carga:", activeClients[0]?.lugar_carga);
      console.log("🔍 DEBUG - destino:", activeClients[0]?.destino);
      console.log("🔍 DEBUG - numero_remito:", activeClients[0]?.numero_remito);
      console.log("🔍 DEBUG - viaje_id:", activeClients[0]?.viaje_id);
      console.log("🔍 DEBUG - chofer_nombre:", activeClients[0]?.chofer_nombre);
      // Si viatico viene 0 o null, intentar obtener premio directo del remito asociado
      const enhanced = await Promise.all(
        activeClients.map(async (p: any) => {
          try {
            // VIATICO: preferir remito.premio si falta
            const viaticoVal = p.viatico ?? p.premio ?? 0;
            if ((viaticoVal === null || Number(viaticoVal) === 0) && p.remito_id) {
              const rem = await getRemitoById(String(p.remito_id));
              p.viatico = Number(rem?.result?.premio) || 0;
            } else {
              p.viatico = Number(viaticoVal) || 0;
            }

            // GASTOS: si en la liquidación no hay gastos (>0), tomar balanza+inspeccion del remito
            if ((!p.gastos || Number(p.gastos) === 0) && p.remito_id) {
              try {
                const rem2 = await getRemitoById(String(p.remito_id));
                const bal = Number(rem2?.result?.balanza ?? 0);
                const ins = Number(rem2?.result?.inspeccion ?? 0);
                p.gastos = bal + ins;
              } catch (e) {
                console.error("Error obteniendo remito para gastos:", e);
                p.gastos = Number(p.gastos) || 0;
              }
            } else {
              p.gastos = Number(p.gastos) || 0;
            }

            // Recalcular total_a_favor localmente para mostrar en listado/PDF
            const subtotal = Number(p.subtotal) || 0;
            const pernocte = Number(p.pernocte) || 0;
            const limite_premio = Number(p.limite_premio) || 0;
            p.total_a_favor = subtotal + pernocte + Number(p.gastos) + limite_premio;

          } catch (e) {
            console.error("Error procesando liquidacion para viatico/gastos:", e);
            p.viatico = Number(p.viatico) || Number(p.premio) || 0;
            p.gastos = Number(p.gastos) || 0;
            p.total_a_favor = Number(p.total_a_favor) || 0;
          }
          return p;
        })
      );

      setLiquidacion(enhanced);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // Filtrado y ordenamiento: se filtra por búsqueda, fecha, estado y chofer, luego se ordena por fecha del remito
  const filteredClients = liquidacion.filter((payment) => {
    // Filtro de búsqueda
    const matchesSearch = Object.values(payment).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtro de fecha - usar fecha_remito en lugar de date
    let matchesDate = true;
    if (dateRange && dateRange.from && dateRange.to) {
      const fechaRemito = payment.fecha_remito || payment.date; // Fallback a date si no hay fecha_remito
      const paymentDate = dayjs(fechaRemito);
      const fromDate = dayjs(dateRange.from).startOf("day");
      const toDate = dayjs(dateRange.to).endOf("day");
      matchesDate =
        (paymentDate.isSame(fromDate) || paymentDate.isAfter(fromDate)) &&
        (paymentDate.isSame(toDate) || paymentDate.isBefore(toDate));
    }

    // Filtro por estado: usar liquidacion_pagada
    let matchesStatus = true;
    if (statusFilter === "pagado") {
      matchesStatus = payment.liquidacion_pagada === true;
    } else if (statusFilter === "pendiente") {
      matchesStatus = payment.liquidacion_pagada === false;
    }

    // ✅ Nuevo filtro por chofer
    let matchesChofer = true;
    if (choferFilter !== "todos") {
      matchesChofer = payment.chofer_nombre === choferFilter;
    }

    return matchesSearch && matchesDate && matchesStatus && matchesChofer;
  }).sort((a, b) => {
    // Ordenar por fecha del remito (más reciente primero)
    const fechaA = a.fecha_remito || a.date;
    const fechaB = b.fecha_remito || b.date;
    
    // Convertir a timestamp para comparar (más reciente = timestamp mayor)
    const timestampA = new Date(fechaA).getTime();
    const timestampB = new Date(fechaB).getTime();
    
    return timestampB - timestampA; // Orden descendente (más reciente primero)
  });

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredClients.slice(startIndex, endIndex);

  // ✅ Obtener lista única de choferes para el filtro
  const choferesUnicos = Array.from(
    new Set(liquidacion.map(payment => payment.chofer_nombre).filter(Boolean))
  ).sort();

  // Función para generar el PDF de liquidaciones filtradas.
  const downloadIndividualPDF = async (payment: any) => {
    // Crear un nuevo documento jsPDF en orientación horizontal como el resumen
    const doc = new jsPDF({
      orientation: "l",
    });

    // Añadir logo si está disponible y colocar título en punta contraria
    try {
      const logoRes = await getLogoDataUrl();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      if (logoRes?.dataUrl) doc.addImage(logoRes.dataUrl, logoRes.mime.includes('png') ? 'PNG' : 'JPEG', margin, 6, 40, 16);

      // Título alineado a la derecha (punta opuesta al logo)
      const title = `Liquidación - ${payment.chofer_nombre}`;
      doc.setFontSize(16);
      const textWidth = doc.getTextWidth(title);
      doc.text(title, pageWidth - margin - textWidth, 18);
    } catch (e) {
      console.error('Error cargando logo individual PDF', e);
      doc.setFontSize(16);
      doc.text(`Liquidación - ${payment.chofer_nombre}`, 60, 18);
    }

    // ✅ Cabeceras de la tabla con las mismas columnas que el resumen
      const headers = ["FECHA", "N° REMITO", "LUGAR DE CARGA", "DESTINO", "KMS", "VIATICO", "PERNOCTE", "GASTOS", "TOTAL"];
    
    // Construcción de la fila con los datos de la liquidación individual
    const fechaRemito = payment.fecha_remito || payment.date;
    const fechaUruguaya = fixUruguayTimezone(fechaRemito);
    

    
      const row = [
      fechaUruguaya,
      payment.numero_remito || "N/D",
      payment.lugar_carga || "N/D",
      payment.destino || "N/D",
      payment.kms_viaje || "N/D",
      // Mostrar viático: preferir payment.viatico (viene del remito.premio) o payment.viatico existente
      (payment.viatico !== undefined && payment.viatico !== null
        ? Number(payment.viatico)
        : Number(payment.premio) || 0
      ).toLocaleString("es-UY") || "0",
      payment.pernocte?.toLocaleString("es-UY") || "0",
      payment.gastos?.toLocaleString("es-UY") || "0",
      payment.total_a_favor?.toLocaleString("es-UY", {
        style: "currency",
        currency: "UYU",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      }) || "0,00",
    ];

    autoTable(doc, {
      head: [headers],
      body: [row],
      startY: 36,
      styles: { halign: "center", fontStyle: "bold" },
      headStyles: { fillColor: [22, 160, 133] },
    });

    // ✅ Nombre del archivo con nombre del chofer
    doc.save(`Liquidacion - ${payment.chofer_nombre}.pdf`);
  };

  const downloadPDF = () => {
    // Crear un nuevo documento jsPDF en orientación horizontal ('l' para landscape)
    const doc = new jsPDF({
      orientation: "l",
    });

    // ✅ Título del PDF - incluir chofer si está filtrado
    doc.setFontSize(16);
    let titleText = "Resumen de Liquidaciones";
    let fileName = "resumen_liquidaciones.pdf";
    
    if (choferFilter !== "todos") {
      titleText = `Resumen de Liquidaciones - ${choferFilter}`;
      fileName = `resumen_liquidaciones_${choferFilter.replace(/\s+/g, '_')}.pdf`;
    }
    
    doc.text(titleText, 14, 15);

    // Agregar filtros aplicados
    let startY = 25;
    if (dateRange?.from && dateRange?.to) {
      const fromDate = fixUruguayTimezone(dateRange.from);
      const toDate = fixUruguayTimezone(dateRange.to);
      doc.setFontSize(12);
      doc.text(`Fecha: ${fromDate} - ${toDate}`, 14, startY);
      startY += 10;
    }
    if (statusFilter !== "todos") {
      doc.setFontSize(12);
      doc.text(
        `Estado: ${statusFilter === "pagado" ? "Pagado" : "Pendiente"}`,
        14,
        startY
      );
      startY += 10;
    }
    // ✅ Agregar filtro de chofer si está aplicado
    if (choferFilter !== "todos") {
      doc.setFontSize(12);
      doc.text(`Chofer: ${choferFilter}`, 14, startY);
      startY += 10;
    }

    // ✅ Cabeceras de la tabla con nuevas columnas
    const headers = ["FECHA", "N° REMITO", "LUGAR DE CARGA", "DESTINO", "KMS", "VIATICO", "PERNOCTE", "GASTOS", "TOTAL"];
    
    // ✅ Ordenar liquidaciones por fecha de más antigua a más reciente para el PDF
    const sortedLiquidacionesForPDF = [...filteredClients].sort((a, b) => {
      const fechaA = a.fecha_remito || a.date;
      const fechaB = b.fecha_remito || b.date;
      const dateA = new Date(fechaA);
      const dateB = new Date(fechaB);
      return dateA.getTime() - dateB.getTime(); // Orden ascendente (más antigua primero)
    });
    
    // Construcción de las filas
    const rows = sortedLiquidacionesForPDF.map((payment) => {
      // ✅ Mostrar fecha del remito sin hora en el PDF también
      const fechaRemito = payment.fecha_remito || payment.date; // Fallback a date si no hay fecha_remito
      const fechaUruguaya = fixUruguayTimezone(fechaRemito);
      

      
      return [
        fechaUruguaya,
        payment.numero_remito || "N/D",
        payment.lugar_carga || "N/D",
        payment.destino || "N/D",
        payment.kms_viaje || "N/D",
        payment.viatico?.toLocaleString("es-UY") || "0",
        payment.pernocte?.toLocaleString("es-UY") || "0",
        payment.gastos?.toLocaleString("es-UY") || "0",
        (Number(payment.total_a_favor) || 0).toLocaleString("es-UY", {
          style: "currency",
          currency: "UYU",
        })
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 36,
      styles: { halign: "center", fontStyle: "bold" }, // Letra en negrita
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Calcular el total final de la columna "Total"
    const totalLiquidaciones = sortedLiquidacionesForPDF.reduce((acc, payment) => {
      const total = Number(payment.total_a_favor);
      return acc + (isNaN(total) ? 0 : total);
    }, 0);

    // Calcular la posición Y después de la tabla
    const finalY = (doc as any).lastAutoTable.finalY + 10; // Añadir un pequeño espacio

    // Establecer el tamaño de fuente más grande para el total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold"); // Poner en negrita

    // Calcular la posición X para alinear a la derecha
    const totalLabelText = "TOTAL UYU:";
    const totalValueText = totalLiquidaciones.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const totalLabelWidth = doc.getTextWidth(totalLabelText);
    const totalValueWidth = doc.getTextWidth(totalValueText);
    const marginFromRight = 14; // Margen desde el borde derecho

    const totalLabelX =
      pageWidth - totalValueWidth - totalLabelWidth - marginFromRight - 5; // Ajuste fino
    const totalValueX = pageWidth - totalValueWidth - marginFromRight;

    // Agregar el texto "TOTAL UYU:" y el valor total
    doc.text(totalLabelText, totalLabelX, finalY);
    doc.text(totalValueText, totalValueX, finalY);

    doc.setFont("helvetica", "normal"); // Volver al estilo normal para otros textos

    doc.save(fileName);
  };

  const toggleLiquidacionStatus = async (id: number) => {
    try {
      console.log("Actualizando estado de liquidación:", id);
      // Actualiza el estado en el array, invirtiendo el valor de liquidacion_pagada
      const updatedLiquidaciones = liquidacion.map((liq) =>
        liq.id === id
          ? { ...liq, liquidacion_pagada: !liq.liquidacion_pagada }
          : liq
      );

      setLiquidacion(updatedLiquidaciones);

      const updatedLiquidacion = updatedLiquidaciones.find(
        (liq) => liq.id === id
      );
      console.log(
        "Estado después de la actualización local:",
        updatedLiquidacion
      );

      if (updatedLiquidacion) {
        const response = await updateLiquidacionStatus(updatedLiquidacion.id);
        console.log("Respuesta del servidor:", response);
      }
    } catch (error) {
      console.error("Error al actualizar estado de liquidación:", error);
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const deleteLiquidacionFunction = async (id: number) => {
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
          title: "Eliminando liquidación...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await deleteLiquidacionById(id.toString(), token || "");
          Swal.close();

          if (response.result) {
            Swal.fire("Éxito", "Liquidación eliminada correctamente", "success");
            getCLiquidacionFunction(); // Recargar la lista de liquidaciones
          } else {
            Swal.fire("Error", "No se pudo eliminar la liquidación.", "error");
          }
        } catch (error) {
          Swal.fire(
            "Error",
            "Hubo un problema al eliminar la liquidación.",
            "error"
          );
          console.error("Error al eliminar liquidación:", error);
        }
      }
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    getCLiquidacionFunction();
  }, []);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, choferFilter, dateRange]);

  return (
    <div className="space-y-4">
      {/* ✅ FILTROS ESTANDARIZADOS */}
      <div className="space-y-3 sm:space-y-4">
        {/* Primera fila: Buscador general + Botón nuevo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="🔍 Buscar en todos los campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {filteredClients.length > 0 && (
              <Button onClick={downloadPDF} variant="outline" className="w-full sm:w-auto">
                📄 Descargar PDF
              </Button>
            )}
            <Link href="/liquidaciones/nueva" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">+ Nueva Liquidación</Button>
            </Link>
          </div>
        </div>

        {/* Segunda fila: Filtros específicos */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <Select
            name="status_filter"
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="💳 Estado de Pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pagado">✅ Pagado</SelectItem>
              <SelectItem value="pendiente">❌ Pendiente</SelectItem>
            </SelectContent>
          </Select>

          <Select
            name="chofer_filter"
            value={choferFilter}
            onValueChange={setChoferFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="👨‍💼 Chofer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los choferes</SelectItem>
              {choferesUnicos.map((chofer) => (
                <SelectItem key={chofer} value={chofer}>
                  {chofer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          {/* Botón para limpiar filtros */}
          {(searchTerm || statusFilter !== "todos" || choferFilter !== "todos" || dateRange) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("todos");
                setChoferFilter("todos");
                setDateRange(undefined);
              }}
              className="whitespace-nowrap w-full sm:w-auto"
            >
              🗑️ Limpiar Filtros
            </Button>
          )}
        </div>
      </div>


      <Card>
        <CardContent className="p-0">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chofer</TableHead>
              <TableHead>Nº Remito</TableHead>
              <TableHead>KMs</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPayments.map((payment) => {
              const fechaAUsar = payment.fecha_remito || payment.date;
              console.log(`🔍 ID ${payment.id}: fecha_remito=${payment.fecha_remito}, date=${payment.date}, usando=${fechaAUsar}`);
              
              return (
                <TableRow key={payment.id}>
                  <TableCell>{payment.chofer_nombre}</TableCell>
                  <TableCell>{payment.numero_remito || "N/D"}</TableCell>
                  <TableCell>{payment.kms_viaje || "N/D"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {fixUruguayTimezone(fechaAUsar)}
                  </TableCell>
                  <TableCell>
                    {(
                      Number(payment.total_a_favor) ||
                      ((Number(payment.subtotal) || 0) + (Number(payment.gastos) || 0) + (Number(payment.pernocte) || 0) + (Number(payment.limite_premio) || 0))
                    ).toLocaleString("es-UY", {
                      style: "currency",
                      currency: "UYU",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.liquidacion_pagada ? "default" : "destructive"
                      }
                    >
                      {payment.liquidacion_pagada ? "Pagado" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/liquidaciones/${payment.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/liquidaciones/${payment.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLiquidacionStatus(payment.id)}
                        className={payment.liquidacion_pagada ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                      >
                        {payment.liquidacion_pagada ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadIndividualPDF(payment)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLiquidacionFunction(payment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      {/* ✅ INFO DE PAGINACIÓN */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} de {filteredClients.length} liquidaciones
        </div>
      </div>

      {/* ✅ CONTROLES DE PAGINACIÓN */}
      {totalPages > 1 && (
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
