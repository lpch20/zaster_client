"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react";
import { getGastos, deleteGasto } from "@/api/RULE_getData";
import Swal from "sweetalert2";
import { Loading } from "./spinner";

interface Gasto {
  id: number;
  fecha: string;
  matricula: string;
  categoria: string;
  proveedor: string;
  monto_pesos: number;
  monto_usd: number;
  forma_pago: string;
  descripcion: string;
}

// ✅ FUNCIÓN SIMPLE para formatear fecha
const formatDateUY = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  
  return date.toLocaleDateString('es-UY');
};

export default function GastosList() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [matriculaFilter, setMatriculaFilter] = useState("");
  const [proveedorFilter, setProveedorFilter] = useState("");
  const [formaPagoFilter, setFormaPagoFilter] = useState("todos");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [monedaFilter, setMonedaFilter] = useState("todos");

  // ✅ CATEGORÍAS SIN COMBUSTIBLE
  const categorias = [
    "Mantenimiento",
    "Repuestos",
    "Neumáticos",
    "Seguros",
    "Peajes",
    "Lavado",
    "Documentación",
    "Multas",
    "Otros"
  ];

  // ✅ FORMAS DE PAGO CORREGIDAS
  const formasPago = [
    "EFECTIVO",
    "TRANSFERENCIA",
    "CREDITO",
    "TARJETA_DEBITO",
    "TARJETA_CREDITO"
  ];

  useEffect(() => {
    fetchGastos();
  }, []);

  const fetchGastos = async () => {
    try {
      setLoading(true);
      const result = await getGastos();
      setGastos(result || []);
    } catch (error) {
      console.error("Error fetching gastos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos de gastos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteGastoHandler = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteGasto(id);
        Swal.fire("Eliminado", "El registro ha sido eliminado.", "success");
        fetchGastos();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  const filteredGastos = gastos.filter((gasto) => {
    const matchesSearch = Object.values(gasto).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ FILTRO DE FECHAS SIMPLE
    const matchesDateRange = () => {
      if (!dateFrom && !dateTo) return true;
      
      const gastoDate = new Date(gasto.fecha);
      if (isNaN(gastoDate.getTime())) return true;
      
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && toDate) {
        return gastoDate >= fromDate && gastoDate <= toDate;
      } else if (fromDate) {
        return gastoDate >= fromDate;
      } else if (toDate) {
        return gastoDate <= toDate;
      }
      return true;
    };

    const matchesMatricula = matriculaFilter
      ? gasto.matricula.toLowerCase().includes(matriculaFilter.toLowerCase())
      : true;

    const matchesProveedor = proveedorFilter
      ? gasto.proveedor.toLowerCase().includes(proveedorFilter.toLowerCase())
      : true;

    const matchesFormaPago = formaPagoFilter === "todos" || !formaPagoFilter
      ? true
      : gasto.forma_pago === formaPagoFilter;

    const matchesCategoria = categoriaFilter === "todas" || !categoriaFilter
      ? true
      : gasto.categoria === categoriaFilter;

    const matchesMoneda = () => {
      if (monedaFilter === "todos") return true;
      if (monedaFilter === "pesos") return gasto.monto_pesos > 0;
      if (monedaFilter === "usd") return gasto.monto_usd > 0;
      return true;
    };

    return (
      matchesSearch &&
      matchesDateRange() &&
      matchesMatricula &&
      matchesProveedor &&
      matchesFormaPago &&
      matchesCategoria &&
      matchesMoneda()
    );
  });

  const totalPesos = filteredGastos.reduce((sum, g) => sum + (Number(g.monto_pesos) || 0), 0);
  const totalUSD = filteredGastos.reduce((sum, g) => sum + (Number(g.monto_usd) || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Gastos</h2>
        <Link href="/gastos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Búsqueda General</Label>
              <Input
                id="search"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                placeholder="Filtrar por matrícula"
                value={matriculaFilter}
                onChange={(e) => setMatriculaFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                placeholder="Filtrar por proveedor"
                value={proveedorFilter}
                onChange={(e) => setProveedorFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formaPago">Forma de Pago</Label>
              <Select value={formaPagoFilter} onValueChange={setFormaPagoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las formas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las formas</SelectItem>
                  {formasPago.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <Select value={monedaFilter} onValueChange={setMonedaFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las monedas</SelectItem>
                  <SelectItem value="pesos">Solo Pesos</SelectItem>
                  <SelectItem value="usd">Solo USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setDateFrom("");
                setDateTo("");
                setMatriculaFilter("");
                setProveedorFilter("");
                setFormaPagoFilter("todos");
                setCategoriaFilter("todas");
                setMonedaFilter("todos");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredGastos.length}</div>
            <p className="text-gray-600">Registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">${totalPesos.toLocaleString("es-UY")}</div>
            <p className="text-gray-600">Total Pesos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">US$ {totalUSD.toLocaleString("es-UY")}</div>
            <p className="text-gray-600">Total USD</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Monto $</TableHead>
                <TableHead>Monto USD</TableHead>
                <TableHead>Forma de Pago</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>
                    {formatDateUY(gasto.fecha)}
                  </TableCell>
                  <TableCell>{gasto.matricula}</TableCell>
                  <TableCell>{gasto.categoria}</TableCell>
                  <TableCell>{gasto.proveedor}</TableCell>
                  <TableCell>
                    {Number(gasto.monto_pesos || 0) > 0 ? `${Number(gasto.monto_pesos).toLocaleString("es-UY")}` : "-"}
                  </TableCell>
                  <TableCell>
                    {Number(gasto.monto_usd || 0) > 0 ? `US$ ${Number(gasto.monto_usd).toLocaleString("es-UY")}` : "-"}
                  </TableCell>
                  <TableCell>{gasto.forma_pago.replace('_', ' ')}</TableCell>
                  <TableCell className="max-w-xs truncate" title={gasto.descripcion}>
                    {gasto.descripcion}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/gastos/${gasto.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGastoHandler(gasto.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredGastos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron registros de gastos.</p>
        </div>
      )}
    </div>
  );
}