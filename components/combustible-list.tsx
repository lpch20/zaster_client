"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import { Loading } from "@/components/spinner";
import { format } from "date-fns";

import {
  getCombustibles,
  deleteCombustibleById,
  getToken,
} from "@/api/RULE_getData";

export default function CombustibleList() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchMatricula, setSearchMatricula] = useState("");
  const [filterLugar, setFilterLugar] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const token: string = getToken();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getCombustibles();
      // forzamos que siempre sea array
      setData(Array.isArray(res.result) ? res.result : []);
    } catch (error) {
      console.error("Error cargando combustibles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // protegemos el filtro
  const items = Array.isArray(data) ? data : [];
  const filtered = items.filter((item) => {
    return (
      (!searchMatricula ||
        item.matricula.toLowerCase().includes(searchMatricula.toLowerCase())) &&
      (!filterLugar ||
        item.lugar.toLowerCase().includes(filterLugar.toLowerCase())) &&
      (!fechaDesde || new Date(item.fecha) >= new Date(fechaDesde)) &&
      (!fechaHasta || new Date(item.fecha) <= new Date(fechaHasta))
    );
  });

  const deleteItem = async (id: number) => {
    Swal.fire({
      title: "¿Eliminar este registro?",
      text: "No podrás deshacer esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Eliminando...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        try {
          const resp = await deleteCombustibleById(id, token);
          Swal.close();
          if (resp.result) {
            Swal.fire("Eliminado", "Registro eliminado exitosamente", "success");
            loadData();
          } else {
            Swal.fire("Error", "No se pudo eliminar", "error");
          }
        } catch (err) {
          Swal.close();
          Swal.fire("Error", "Hubo un problema al eliminar", "error");
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="space-y-4 p-4">
      {/* filtros y botón “Nuevo” */}
      <div className="flex flex-col lg:flex-row items-center gap-2">
        <Input
          placeholder="Buscar matrícula..."
          value={searchMatricula}
          onChange={(e) => setSearchMatricula(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar lugar..."
          value={filterLugar}
          onChange={(e) => setFilterLugar(e.target.value)}
          className="max-w-sm"
        />
        <Input
          type="date"
          placeholder="Desde..."
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Hasta..."
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
        <Button onClick={loadData}>Actualizar</Button>
        <Link href="/combustible/nuevo">
          <Button className="ml-auto">Nuevo Combustible</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>Litros</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          {isLoading ? (
            <div className="flex justify-center items-center p-6">
              <Loading />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : (
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {format(new Date(item.fecha), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{item.matricula}</TableCell>
                  <TableCell>{item.lugar}</TableCell>
                  <TableCell>{item.litros}</TableCell>
                  <TableCell>${item.precio}</TableCell>
                  <TableCell>${item.total}</TableCell>
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
                          <Link href={`/combustibles/${item.id}`}>
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/combustibles/${item.id}/editar`}>
                            Modificar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer bg-red-400"
                          onClick={() => deleteItem(item.id)}
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
