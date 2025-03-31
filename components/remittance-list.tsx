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
import { MoreHorizontal } from "lucide-react";
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

export function RemittanceList() {
  const [remittances, setRemittances] = useState([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
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
        }
        setIsLoading(false);
        console.log(result);
      } catch (error) {
        console.error("Error fetching remitos:", error);
        setIsLoading(false);
      }
    };


    fetchRemitos();

  }, []);


  useEffect(() => {
    console.log(remittances);
  }, [remittances]);

  const filteredRemittances = remittances
    .filter((remittance) =>
      Object.values(remittance).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter((remittance) => {
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
    })
    .sort((a: any, b: any) => {
      // Ordenar por número de remito (de mayor a menor)
      return Number(b.numero_remito) - Number(a.numero_remito);
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar remitos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div className="flex justify-end">
          <Link href="/remitos/nuevo">
            <Button className="w-full sm:w-auto">Nuevo Remito</Button>
          </Link>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número de Remito</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Kilometro</TableHead>
              <TableHead>Nombre Chofer</TableHead>
              <TableHead>Lugar de Carga</TableHead>
              <TableHead>Lugar de Descarga</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <div className="flex justify-end items-end p-6">
              <Loading />
              <h6>Cargando.....</h6>
            </div>
          ) : (
            <TableBody>
              {filteredRemittances.map((remittance) => (
                <TableRow key={remittance.id}>
                  <TableCell>{remittance.numero_remito}</TableCell>
                  <TableCell>
                    {remittance.fecha
                      ? new Date(remittance.fecha)
                          .toISOString()
                          .slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("/")
                      : ""}
                  </TableCell>
                  <TableCell>{remittance.kilometros}</TableCell>
                  <TableCell>{remittance.chofer_nombre}</TableCell>
                  <TableCell>{remittance.lugar_carga}</TableCell>
                  <TableCell>{remittance.destinatario_nombre}</TableCell>
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
                          <Link href={`/remitos/${remittance.id}`}>
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/remitos/${remittance.id}/editar`}>
                            Modificar
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
