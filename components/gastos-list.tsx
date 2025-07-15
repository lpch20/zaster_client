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
  getGastos,
  deleteGastoById,
  getToken,
} from "@/api/RULE_getData";

export default function GastosList() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // filtros
  const [searchMatricula, setSearchMatricula] = useState("");
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterFormaPago, setFilterFormaPago] = useState("");
  const [filterMonto, setFilterMonto] = useState("");
  const [filterCurrency, setFilterCurrency] = useState<"$" | "USD">("$");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const token: string = getToken();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getGastos();
      setData(Array.isArray(res.result) ? res.result : []);
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = data.filter((item) => {
    const fecha = new Date(item.fecha);
    const desdeOk = !fechaDesde || fecha >= new Date(fechaDesde);
    const hastaOk = !fechaHasta || fecha <= new Date(fechaHasta);
    const matOk =
      !searchMatricula ||
      item.matricula.toLowerCase().includes(searchMatricula.toLowerCase());
    const provOk =
      !filterProveedor ||
      item.proveedor.toLowerCase().includes(filterProveedor.toLowerCase());
    const catOk =
      !filterCategoria ||
      item.categoria.toLowerCase().includes(filterCategoria.toLowerCase());
    const pagoOk =
      !filterFormaPago ||
      item.formaPago.toLowerCase().includes(filterFormaPago.toLowerCase());
    let montoOk = true;
    if (filterMonto) {
      const montoNum = parseFloat(filterMonto) || 0;
      if (filterCurrency === "$") {
        montoOk = item.monto >= montoNum;
      } else {
        montoOk = item.montoUsd >= montoNum;
      }
    }
    return desdeOk && hastaOk && matOk && provOk && catOk && pagoOk && montoOk;
  });

  const deleteItem = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar este registro?",
      text: "No podrás deshacer esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      Swal.fire({
        title: "Eliminando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const resp = await deleteGastoById(id, token);
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
  };

  return (
    <div className="space-y-4 p-4">
      {/* filtros y botón “Nuevo” */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="max-w-xs"
          placeholder="Desde..."
        />
        <Input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="max-w-xs"
          placeholder="Hasta..."
        />
        <Input
          placeholder="Matrícula..."
          value={searchMatricula}
          onChange={(e) => setSearchMatricula(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Proveedor..."
          value={filterProveedor}
          onChange={(e) => setFilterProveedor(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Categoría..."
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Forma de pago..."
          value={filterFormaPago}
          onChange={(e) => setFilterFormaPago(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            step="0.01"
            placeholder="Monto..."
            value={filterMonto}
            onChange={(e) => setFilterMonto(e.target.value)}
            className="max-w-sm "
          />
          <select
            value={filterCurrency}
            onChange={(e) =>
              setFilterCurrency(e.target.value as "$" | "USD")
            }
            className="border rounded px-2 py-2"
          >
            <option value="$">$</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <Link href="/gastos/nuevo">
          <Button className="ml-auto">Nuevo Gasto</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loading />
            <span className="ml-2">Cargando...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Monto $</TableHead>
                <TableHead>Monto USD</TableHead>
                <TableHead>Forma de pago</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {format(new Date(item.fecha), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{item.matricula}</TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell>{item.proveedor}</TableCell>
                  <TableCell>${item.monto.toFixed(2)}</TableCell>
                  <TableCell>${item.montoUsd.toFixed(2)}</TableCell>
                  <TableCell>{item.formaPago}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
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
                          <Link href={`/gastos/${item.id}`}>Ver detalles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/gastos/${item.id}/editar`}>
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
          </Table>
        )}
      </div>
    </div>
  );
}
