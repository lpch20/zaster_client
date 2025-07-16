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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Swal from "sweetalert2";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loading } from "./spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getChoferes, getToken } from "@/api/RULE_getData";
import { deleteChoferById } from "@/api/RULE_deleteDate";

export function DriverList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chofer, setChofer] = useState<any>([]);

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const token: string = getToken();

  const filteredDrivers = chofer.filter((driver) =>
    Object.values(driver).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getChoferFunction = async () => {
    try {
      setIsLoading(true);
      const result = await getChoferes();
      const activeChoferes = result.result.filter(
        (chofer) => chofer.soft_delete === false
      );
      setChofer(activeChoferes);
      setCurrentPage(1); // Resetear a página 1 cuando se cargan nuevos datos
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const deleteChoferFunction = async (id) => {
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
          title: "Eliminando chofer...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await deleteChoferById(id, token);
          Swal.close();

          if (response.result === true) {
            Swal.fire("Éxito", "Chofer eliminado correctamente", "success");
            getChoferFunction(); // Recargar la lista de choferes
          } else {
            Swal.fire("Error", "No se pudo eliminar el chofer.", "error");
          }
        } catch (error) {
          Swal.fire(
            "Error",
            "Hubo un problema al eliminar el chofer.",
            "error"
          );
          console.error("Error al eliminar chofer:", error);
        }
      }
    });
  };

  useEffect(() => {
    getChoferFunction();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Buscar choferes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/choferes/nuevo">
          <Button>Nuevo Chofer</Button>
        </Link>
      </div>

      {/* ✅ INFO DE PAGINACIÓN */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredDrivers.length)} de {filteredDrivers.length} choferes
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
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
              {currentDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>{driver.nombre}</TableCell>
                  <TableCell>{driver.cedula}</TableCell>
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
                          <Link href={`/choferes/${driver.id}`}>
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/choferes/${driver.id}/editar`}>
                            Modificar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteChoferFunction(driver.id)}
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