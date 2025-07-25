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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Loading } from "./spinner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getClients, getToken } from "@/api/RULE_getData";
import { deleteClientById } from "@/api/RULE_deleteDate";
import Swal from "sweetalert2";

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const token: string = getToken();

  const filteredClients = clients?.filter((client) =>
    Object.values(client).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getClientsFunction = async () => {
    try {
      setIsLoading(true);
      const result = await getClients();
      const activeClients = result.result.filter(client => client.soft_delete === false);
      setClients(activeClients);
      setCurrentPage(1); // Resetear a página 1 cuando se cargan nuevos datos
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const deleteClientsFunction = async (id) => {
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
          title: "Eliminando cliente...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await deleteClientById(id, token);
          Swal.close();

          if (response.result === true) {
            Swal.fire("Éxito", "Cliente eliminado correctamente", "success");
            getClientsFunction(); // Recargar la lista de clientes
          } else {
            Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
          }
        } catch (error) {
          Swal.fire(
            "Error",
            "Hubo un problema al eliminar el cliente.",
            "error"
          );
          console.error("Error al eliminar cliente:", error);
        }
      }
    });
  };

  useEffect(() => {
    getClientsFunction();
  }, []);

  useEffect(() => {
    console.log(clients);
  }, [clients]);

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

      {/* ✅ INFO DE PAGINACIÓN */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} de {filteredClients.length} clientes
        </div>
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
              {currentClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.nombre}</TableCell>
                  <TableCell>{client.direccion}</TableCell>
                  <TableCell>{client.telefono}</TableCell>
                  <TableCell>{client.mail}</TableCell>
                  <TableCell>{client.rut}</TableCell>
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
                          onClick={() => deleteClientsFunction(client.id)}
                          className=" cursor-pointer bg-red-400"
                        >
                          Eliminar
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