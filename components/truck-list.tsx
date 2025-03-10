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
import { MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "./spinner";
import Link from "next/link";
import { getCamiones, getToken } from "@/api/RULE_getData";
import { deleteCamionById } from "@/api/RULE_deleteDate";

export function TruckList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [camion, setCamion] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const token:string = getToken();

  const filteredTrucks = camion.filter((truck) =>
    Object.values(truck).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getCamionFunction = async () => {
    try {
      setIsLoading(true);
      const result = await getCamiones();
      const activeCamiones = result.result.filter(
        (camion) => camion.soft_delete === false
      );
      setCamion(activeCamiones);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };


  const deleteCamionFunction = async (id) => {
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
          const response = await deleteCamionById(id, token);
          Swal.close();

          if (response.result === true) {
            Swal.fire("Éxito", "Cliente eliminado correctamente", "success");
            getCamionFunction(); // Recargar la lista de clientes
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
    getCamionFunction();
  }, []);

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
                          <Link href={`/camiones/${truck.id}`}>
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/camiones/${truck.id}/editar`}>
                            Modificar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteCamionFunction(truck.id)}
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
    </div>
  );
}
