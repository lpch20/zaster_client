"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { DateRangeFilter } from "./date-range-filter"
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLiquidacion } from "@/api/RULE_getData"


export function PaymentList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [liquidacion, setLiquidacion] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const filteredClients = liquidacion?.filter((liquidacion) =>
    Object.values(liquidacion).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getCLiquidacionFunction = async () => {
    try {
      setIsLoading(true);
      const result = await getLiquidacion();
      const activeClients = result.result.filter(liquidacion => liquidacion.soft_delete === false);
      setLiquidacion(activeClients);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // const deleteClientsFunction = async (id) => {
  //   if (!id) return;

  //   Swal.fire({
  //     title: "¿Estás seguro?",
  //     text: "Esta acción no se puede deshacer",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Sí, eliminar",
  //     cancelButtonText: "Cancelar",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       Swal.fire({
  //         title: "Eliminando cliente...",
  //         allowOutsideClick: false,
  //         didOpen: () => {
  //           Swal.showLoading();
  //         },
  //       });

  //       try {
  //         const response = await deleteClientById(id, token);
  //         Swal.close();

  //         if (response.result === true) {
  //           Swal.fire("Éxito", "Cliente eliminado correctamente", "success");
  //           getClientsFunction(); // Recargar la lista de clientes
  //         } else {
  //           Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
  //         }
  //       } catch (error) {
  //         Swal.fire(
  //           "Error",
  //           "Hubo un problema al eliminar el cliente.",
  //           "error"
  //         );
  //         console.error("Error al eliminar cliente:", error);
  //       }
  //     }
  //   });
  // };

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
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
        <div className="flex justify-end">
          <Link href="/liquidaciones/nueva">
            <Button className="w-full sm:w-auto">Nueva Liquidación</Button>
          </Link>
        </div>
      </div>
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
            {filteredClients.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.chofer_nombre}</TableCell>
                <TableCell className="hidden sm:table-cell">{payment.viaje}</TableCell>
                <TableCell className="hidden md:table-cell">{payment.fecha}</TableCell>
                <TableCell>{payment.total_a_favor.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</TableCell>
                <TableCell>
                  <Badge variant={payment.pagado ? "success" : "destructive"}>
                    {payment.pagado ? "Pagado" : "Pendiente"}
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
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id.toString())}>
                        Copiar ID de la liquidación
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/liquidaciones/${payment.id}`}>Ver detalles</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/liquidaciones/${payment.id}/editar`}>Modificar</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

