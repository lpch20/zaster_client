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
import Link from "next/link";
import { getRemito } from "@/api/RULE_insertData";

export function RemittanceList() {
  const [remittances, setRemittances] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRemitos = async () => {
      try {
        const result = await getRemito();
        if (result && result.result) {
          setRemittances(result.result);
        }

        console.log(result)
      } catch (error) {
        console.error("Error fetching remitos:", error);
      }
    };

    fetchRemitos();
  }, []);

  const filteredRemittances = remittances.filter((remittance) =>
    Object.values(remittance).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar remitos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/remitos/nuevo">
          <Button>Nuevo Remito</Button>
        </Link>
      </div>
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
        <TableBody>
          {filteredRemittances.map((remittance) => (
            <TableRow key={remittance.id}>
              <TableCell>{remittance.numero_remito}</TableCell>
              <TableCell>{new Date(remittance.fecha).toLocaleDateString()}</TableCell>
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
      </Table>
    </div>
  );
}