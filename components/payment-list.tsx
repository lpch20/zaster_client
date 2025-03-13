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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

dayjs.extend(utc);
dayjs.extend(timezone);

import { getLiquidacion } from "@/api/RULE_getData";
import { updateLiquidacionStatus } from "@/api/RULE_updateData";

export function PaymentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState("todos"); // "todos", "pagado" o "pendiente"
  const [liquidacion, setLiquidacion] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  const downloadPDF = () => {
    const doc = new jsPDF();

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

    // Cabeceras de la tabla
    const headers = ["ID", "Chofer", "Viaje", "Fecha", "Total", "Estado"];
    // Construcción de las filas
    const rows = filteredClients.map((payment) => {
      const fechaUruguaya = dayjs(payment.date)
        .tz("America/Montevideo")
        .format("DD/MM/YYYY HH:mm:ss");
      return [
        payment.id,
        payment.chofer_nombre,
        payment.viaje_numero_viaje,
        fechaUruguaya,
        payment.total_a_favor.toLocaleString("es-UY", {
          style: "currency",
          currency: "UYU",
        }),
        payment.liquidacion_pagada ? "Pagado" : "Pendiente",
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startY,
      styles: { halign: "center" },
      headStyles: { fillColor: [22, 160, 133] },
    });

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
            className="w-full sm:w-[200px]"
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
          <Link href="/liquidaciones/nueva">
            <Button className="w-full sm:w-auto">Nueva Liquidación</Button>
          </Link>
        </div>
      </div>

      {/* Mostrar botón de descarga PDF si se aplicó filtro por fecha o estado y hay resultados */}
      {((dateRange?.from && dateRange?.to) || statusFilter !== "todos") &&
        filteredClients.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={downloadPDF}>Descargar PDF Resumen</Button>
          </div>
        )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chofer</TableHead>
              <TableHead className="hidden sm:table-cell">Viaje</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((payment) => {
              const fechaUruguaya = dayjs(payment.date)
                .tz("America/Montevideo")
                .format("DD/MM/YYYY HH:mm:ss");

              return (
                <TableRow key={payment.id}>
                  <TableCell>{payment.chofer_nombre}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {payment.viaje_numero_viaje}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {fechaUruguaya}
                  </TableCell>
                  <TableCell>
                    {payment.total_a_favor.toLocaleString("es-UY", {
                      style: "currency",
                      currency: "UYU",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.liquidacion_pagada ? "success" : "destructive"
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
