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
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { formatDateTimeUruguay } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

dayjs.extend(utc);
dayjs.extend(timezone);

import { getLiquidacion } from "@/api/RULE_getData";
import { updateLiquidacionStatus } from "@/api/RULE_updateData";
import { deleteLiquidacionById } from "@/api/RULE_deleteDate";

export function PaymentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState("todos"); // "todos", "pagado" o "pendiente"
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
      setLiquidacion(activeClients);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // Filtrado: se filtra por búsqueda, fecha y estado.
  const filteredClients = liquidacion.filter((payment) => {
    // Filtro de búsqueda
    const matchesSearch = Object.values(payment).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtro de fecha
    let matchesDate = true;
    if (dateRange && dateRange.from && dateRange.to) {
      const paymentDate = dayjs(payment.date).tz("America/Montevideo");
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

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Función para generar el PDF de liquidaciones filtradas.
  const downloadIndividualPDF = (payment: any) => {
    // Crear un nuevo documento jsPDF en orientación vertical
    const doc = new jsPDF({
      orientation: "p",
    });

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Liquidación Individual", 14, 15);

    // ✅ Información de la liquidación - fecha sin hora
    const fechaUruguaya = dayjs(payment.date)
      .tz("America/Montevideo")
      .format("DD/MM/YYYY");

    doc.setFontSize(12);
    doc.text(`ID: ${payment.id}`, 14, 30);
    doc.text(`Chofer: ${payment.chofer_nombre}`, 14, 40);
    doc.text(`Nº Remito: ${payment.numero_remito || "N/D"}`, 14, 50);
    doc.text(`Fecha: ${fechaUruguaya}`, 14, 60);
    doc.text(`KMs Viaje: ${payment.kms_viaje}`, 14, 70);
    doc.text(`Precio por KM: $${payment.precio_km}`, 14, 80);
    doc.text(`Subtotal: $${payment.subtotal?.toLocaleString("es-UY")}`, 14, 90);
    doc.text(`Gastos: $${payment.gastos?.toLocaleString("es-UY")}`, 14, 100);
    doc.text(`Pernocte: $${payment.pernocte?.toLocaleString("es-UY")}`, 14, 110);
    doc.text(`Límite Premio: $${payment.limite_premio?.toLocaleString("es-UY")}`, 14, 120);
    doc.text(`Total: $${payment.total_a_favor?.toLocaleString("es-UY")}`, 14, 130);
    doc.text(`Estado: ${payment.liquidacion_pagada ? "Pagado" : "Pendiente"}`, 14, 140);

    doc.save(`liquidacion_${payment.id}.pdf`);
  };

  const downloadPDF = () => {
    // Crear un nuevo documento jsPDF en orientación horizontal ('l' para landscape)
    const doc = new jsPDF({
      orientation: "l",
    });

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resumen de Liquidaciones", 14, 15);

    // Agregar filtros aplicados
    let startY = 25;
    if (dateRange?.from && dateRange?.to) {
      const fromDate = dayjs(dateRange.from).format("DD/MM/YYYY");
      const toDate = dayjs(dateRange.to).format("DD/MM/YYYY");
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

    // ✅ Cabeceras de la tabla con nuevas columnas
    const headers = ["ID", "Chofer", "Nº Remito", "KMs", "Fecha", "Total", "Estado"];
    // Construcción de las filas
    const rows = filteredClients.map((payment) => {
      // ✅ Mostrar fecha sin hora en el PDF también
      const fechaUruguaya = dayjs(payment.date)
        .tz("America/Montevideo")
        .format("DD/MM/YYYY");
      return [
        payment.id?.toLocaleString("es-UY") || "N/D", // Separador de miles para ID
        payment.chofer_nombre || "N/D",
        payment.numero_remito || "N/D",
        payment.kms_viaje || "N/D",
        fechaUruguaya,
        payment.total_a_favor?.toLocaleString("es-UY", {
          style: "currency",
          currency: "UYU",
          minimumFractionDigits: 2, // Asegura dos decimales
          maximumFractionDigits: 2,
          useGrouping: true, // Habilita el separador de miles
        }) || "0,00",
        payment.liquidacion_pagada ? "Pagado" : "Pendiente",
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
    const totalLiquidaciones = filteredClients.reduce((acc, payment) => {
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

    doc.save("resumen_liquidaciones.pdf");
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
              // ✅ Mostrar fecha sin hora
              const fechaUruguaya = dayjs(payment.date)
                .tz("America/Montevideo")
                .format("DD/MM/YYYY");

              return (
                <TableRow key={payment.id}>
                  <TableCell>{payment.chofer_nombre}</TableCell>
                  <TableCell>{payment.numero_remito || "N/D"}</TableCell>
                  <TableCell>{payment.kms_viaje || "N/D"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {fechaUruguaya}
                  </TableCell>
                  <TableCell>
                    ${payment.total_a_favor.toLocaleString("es-UY", {
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
