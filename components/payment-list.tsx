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

import { getLiquidacion } from "@/api/RULE_getData";
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
      setLiquidacion(activeClients);
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

  // ✅ Obtener lista única de choferes para el filtro
  const choferesUnicos = Array.from(
    new Set(liquidacion.map(payment => payment.chofer_nombre).filter(Boolean))
  ).sort();

  // Función para generar el PDF de liquidaciones filtradas.
  const downloadIndividualPDF = (payment: any) => {
    // Crear un nuevo documento jsPDF en orientación horizontal como el resumen
    const doc = new jsPDF({
      orientation: "l",
    });

    // ✅ Título del PDF con nombre del chofer
    doc.setFontSize(16);
    doc.text(`Liquidación - ${payment.chofer_nombre}`, 14, 15);

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
      payment.viatico?.toLocaleString("es-UY") || "0",
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
      startY: 25,
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
        (+payment.total_a_favor + +payment.gastos + +payment.pernocte + +payment.limite_premio).toLocaleString("es-UY", {
          style: "currency",
          currency: "UYU",
        })
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startY,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar liquidaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Select
            name="status_filter"
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
            </SelectContent>
          </Select>
          {/* ✅ Nuevo filtro por chofer */}
          <Select
            name="chofer_filter"
            value={choferFilter}
            onValueChange={setChoferFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chofer" />
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
        </div>
        <div className="flex justify-end">
          <div className="flex gap-2">
            {filteredClients.length > 0 && (
              <Button onClick={downloadPDF} variant="outline">
                📄 Descargar PDF
              </Button>
            )}
            <Link href="/liquidaciones/nueva">
              <Button className="w-full sm:w-auto">Nueva Liquidación</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Mostrar filtros activos */}
      {(searchTerm || statusFilter !== "todos" || choferFilter !== "todos" || dateRange) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: {searchTerm}
            </Badge>
          )}
          {statusFilter !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              Estado: {statusFilter === "pagado" ? "Pagado" : "Pendiente"}
            </Badge>
          )}
          {choferFilter !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              Chofer: {choferFilter}
            </Badge>
          )}
          {dateRange?.from && dateRange?.to && (
            <Badge variant="secondary" className="text-xs">
              Fecha: {fixUruguayTimezone(dateRange.from)} - {fixUruguayTimezone(dateRange.to)}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("todos");
              setChoferFilter("todos");
              setDateRange(undefined);
            }}
            className="text-xs"
          >
            Limpiar filtros
          </Button>
        </div>
      )}


      <div className="rounded-md border">
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
            {filteredClients.map((payment) => {
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
                    {(+payment.total_a_favor + +payment.gastos + +payment.pernocte + +payment.limite_premio).toLocaleString("es-UY", {
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
                          <Link href={`/liquidaciones/${payment.id}`}>
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/liquidaciones/${payment.id}/editar`}>
                            Modificar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleLiquidacionStatus(payment.id)}
                        >
                          {payment.liquidacion_pagada
                            ? "Marcar como No Pagado"
                            : "Marcar como Pagado"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadIndividualPDF(payment)}
                        >
                          Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteLiquidacionFunction(payment.id)}
                          className="text-red-600"
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
        </Table>
      </div>
    </div>
  );
}
