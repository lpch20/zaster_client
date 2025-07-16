"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { getCombustibles, deleteCombustible } from "@/api/RULE_getData";
import Swal from "sweetalert2";
import { Loading } from "./spinner";

interface Combustible {
  id: number;
  fecha: string;
  matricula: string;
  lugar: string;
  litros: number;
  precio: number;
  total: number;
}

// ✅ FUNCIÓN SIMPLE para formatear fecha
const formatDateUY = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  
  return date.toLocaleDateString('es-UY');
};

export default function CombustiblesList() {
  const [combustibles, setCombustibles] = useState<Combustible[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [matriculaFilter, setMatriculaFilter] = useState("");
  const [lugarFilter, setLugarFilter] = useState("");

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCombustibles();
  }, []);

  const fetchCombustibles = async () => {
    try {
      setLoading(true);
      const result = await getCombustibles();
      setCombustibles(result || []);
      setCurrentPage(1); // Resetear a página 1 cuando se cargan nuevos datos
    } catch (error) {
      console.error("Error fetching combustibles:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos de combustible.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteCombustibleHandler = async (id: number) => {
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
        await deleteCombustible(id);
        Swal.fire("Eliminado", "El registro ha sido eliminado.", "success");
        fetchCombustibles();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  const filteredCombustibles = combustibles.filter((combustible) => {
    const matchesSearch = Object.values(combustible).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ FILTRO DE FECHAS SIMPLE
    const matchesDateRange = () => {
      if (!dateFrom && !dateTo) return true;
      
      const combustibleDate = new Date(combustible.fecha);
      if (isNaN(combustibleDate.getTime())) return true;
      
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && toDate) {
        return combustibleDate >= fromDate && combustibleDate <= toDate;
      } else if (fromDate) {
        return combustibleDate >= fromDate;
      } else if (toDate) {
        return combustibleDate <= toDate;
      }
      return true;
    };

    const matchesMatricula = matriculaFilter
      ? combustible.matricula
          .toLowerCase()
          .includes(matriculaFilter.toLowerCase())
      : true;

    const matchesLugar = lugarFilter
      ? combustible.lugar.toLowerCase().includes(lugarFilter.toLowerCase())
      : true;

    return (
      matchesSearch && matchesDateRange() && matchesMatricula && matchesLugar
    );
  });

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredCombustibles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCombustibles = filteredCombustibles.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, matriculaFilter, lugarFilter]);

  const totalLitros = filteredCombustibles.reduce(
    (sum, c) => sum + (Number(c.litros) || 0),
    0
  );
  const totalMonto = filteredCombustibles.reduce(
    (sum, c) => sum + (Number(c.total) || 0),
    0
  );

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
        <h2 className="text-2xl font-bold">Gestión de Combustible</h2>
        <Link href="/combustible/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                placeholder="Filtrar por lugar"
                value={lugarFilter}
                onChange={(e) => setLugarFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDateFrom("");
                  setDateTo("");
                  setMatriculaFilter("");
                  setLugarFilter("");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ INFO DE PAGINACIÓN */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredCombustibles.length)} de {filteredCombustibles.length} registros de combustible
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {filteredCombustibles.length}
            </div>
            <p className="text-gray-600">Registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {Math.round(totalLitros).toLocaleString("es-UY")}
            </div>
            <p className="text-gray-600">Total Litros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              ${Math.round(totalMonto).toLocaleString("es-UY")}
            </div>
            <p className="text-gray-600">Total Monto</p>
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
                <TableHead>Lugar</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCombustibles.map((combustible) => (
                <TableRow key={combustible.id}>
                  <TableCell>
                    {formatDateUY(combustible.fecha)}
                  </TableCell>
                  <TableCell>{combustible.matricula}</TableCell>
                  <TableCell>{combustible.lugar}</TableCell>
                  <TableCell>
                    {Number(combustible.litros || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${Number(combustible.precio || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    $
                    {Number(Math.round(combustible.total) || 0).toLocaleString(
                      "es-UY"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/combustible/${combustible.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCombustibleHandler(combustible.id)}
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

      {filteredCombustibles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No se encontraron registros de combustible.
          </p>
        </div>
      )}
    </div>
  );
}