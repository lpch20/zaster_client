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
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      
      // ✅ DEBUG: Logs para verificar cuántos camiones se reciben
      console.log("🔍 DEBUG truck-list - Result completo:", result);
      console.log("🔍 DEBUG truck-list - result.result existe?:", !!result.result);
      console.log("🔍 DEBUG truck-list - result.result es array?:", Array.isArray(result.result));
      console.log("🔍 DEBUG truck-list - Total camiones recibidos del backend:", result.result?.length || 0);
      
      // ✅ FILTRAR camiones activos (maneja null, undefined y false)
      // Usar !camion.soft_delete en lugar de === false para manejar null/undefined
      const activeCamiones = (result.result || []).filter(
        (camion) => camion !== null && !camion.soft_delete
      );
      
      console.log("🔍 DEBUG truck-list - Camiones después de filtrar:", activeCamiones.length);
      console.log("🔍 DEBUG truck-list - Ejemplo de camión:", activeCamiones[0]);
      
      setCamion(activeCamiones);
      setIsLoading(false);
    } catch (error) {
      console.error("❌ ERROR truck-list - Error al cargar camiones:", error);
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

      <Card>
        <CardContent className="p-0">
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
                    <div className="flex space-x-2">
                      <Link href={`/camiones/${truck.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/camiones/${truck.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCamionFunction(truck.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
        </CardContent>
      </Card>
    </div>
  );
}
