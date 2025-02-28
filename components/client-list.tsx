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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Loading } from "./spinner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sampleClients = [
  {
    id: 1,
    nombre: "Empresa A",
    direccion: "Calle 123, Ciudad X",
    telefono: "1234567890",
    mail: "contacto@empresaa.com",
    rut: "123456789",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Empresa B",
    direccion: "Avenida 456, Ciudad Y",
    telefono: "0987654321",
    mail: "info@empresab.com",
    rut: "987654321",
    estado: "inactivo",
  },
  // Add more sample clients here
];

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState(sampleClients);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filteredClients = clients.filter((client) =>
    Object.values(client).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleClientStatus = (id: number) => {
    setClients(
      clients.map((client) =>
        client.id === id
          ? {
              ...client,
              estado: client.estado === "activo" ? "inactivo" : "activo",
            }
          : client
      )
    );
  };

  return (
    <div className="space-y-4">
   
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Link href="/clientes/nuevo">
            <Button>Nuevo Cliente</Button>
          </Link>
        </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>RUT</TableHead>
              <TableHead>Estado</TableHead>
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
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.nombre}</TableCell>
                  <TableCell>{client.direccion}</TableCell>
                  <TableCell>{client.telefono}</TableCell>
                  <TableCell>{client.mail}</TableCell>
                  <TableCell>{client.rut}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.estado === "activo" ? "success" : "destructive"
                      }
                    >
                      {client.estado === "activo" ? "Activo" : "Inactivo"}
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
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(client.id.toString())
                          }
                        >
                          Copiar ID del cliente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/clientes/${client.id}`}>
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/clientes/${client.id}/editar`}>
                            Modificar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleClientStatus(client.id)}
                        >
                          {client.estado === "activo"
                            ? "Dar de baja"
                            : "Dar de alta"}
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
