"use client";

import { useState } from "react";
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
import { Loading } from "./spinner";
import Link from "next/link";

const sampleTrucks = [
  {
    id: 1,
    identificador: "CAM001",
    matricula: "ABC123",
    modelo: "Volvo FH16",
    matricula_zorra: "XYZ789",
  },
  {
    id: 2,
    identificador: "CAM002",
    matricula: "DEF456",
    modelo: "Scania R500",
    matricula_zorra: "UVW321",
  },
  // Add more sample trucks here
];

export function TruckList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filteredTrucks = sampleTrucks.filter((truck) =>
    Object.values(truck).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Buscar camiones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/camiones/nuevo">
          <Button>Nuevo Camión</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificador</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Matrícula Zorra</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <div className="flex justify-center items-center p-6">
              <Loading />
              <h6 className="ml-2">Cargando...</h6>
            </div>
          ) : (
            <TableBody>
              {filteredTrucks.map((truck) => (
                <TableRow key={truck.id}>
                  <TableCell>{truck.identificador}</TableCell>
                  <TableCell>{truck.matricula}</TableCell>
                  <TableCell>{truck.modelo}</TableCell>
                  <TableCell>{truck.matricula_zorra}</TableCell>
                  <TableCell>
                    <Link href={`/camiones/${truck.id}`}>
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
