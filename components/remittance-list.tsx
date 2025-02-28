"use client";

import { useEffect, useState } from "react";
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
import { getRemito } from "@/api/RULE_insertData";
import { Loading } from "./spinner";

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
          setRemittances(result.result);
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
              <TableHead>Matrícula</TableHead>
              <TableHead>Nombre Chofer</TableHead>
              <TableHead>Lugar de Carga</TableHead>
              <TableHead>Consignatario</TableHead>
              <TableHead>Destinatario ID</TableHead>
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
                    {new Date(remittance.fecha).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{remittance.matricula}</TableCell>
                  <TableCell>{remittance.chofer_nombre}</TableCell>
                  <TableCell>{remittance.lugar_carga}</TableCell>
                  <TableCell>{remittance.consignatario}</TableCell>
                  <TableCell>{remittance.destinatario_id}</TableCell>
                  <TableCell>
                    <Link href={`/remitos/${remittance.id}`}>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </Link>
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
