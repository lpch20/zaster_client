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
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { getCombustibles, deleteCombustible } from "@/api/RULE_getData";
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Combustible {
  id: number;
  fecha: string;
  matricula: string;
  lugar: string;
  litros: number;
  precio: number;
  total: number;
}

// ✅ FUNCIÓN ROBUSTA para formatear fecha - Soluciona problemas de zona horaria
const formatDateUY = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Si la fecha viene en formato YYYY-MM-DD, crear la fecha directamente
    // para evitar problemas de zona horaria
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month es 0-indexado
      return date.toLocaleDateString('es-UY');
    }
    
    // Si la fecha viene con timestamp o formato ISO, extraer solo la parte de fecha
    if (dateString.includes('T') || dateString.includes(' ')) {
      const dateOnly = dateString.split('T')[0].split(' ')[0];
      if (dateOnly.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateOnly.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-UY');
      }
    }
    
    // Para otros formatos, intentar crear la fecha y ajustar por zona horaria
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    // Ajustar por la diferencia de zona horaria para evitar el desfase de un día
    const offsetDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    return offsetDate.toLocaleDateString('es-UY');
    
  } catch (error) {
    console.error('Error formateando fecha:', dateString, error);
    return 'Fecha inválida';
  }
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
  const itemsPerPage = 15;

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

    // ✅ FILTRO DE FECHAS MEJORADO - Maneja problemas de zona horaria
    const matchesDateRange = () => {
      if (!dateFrom && !dateTo) return true;
      
      // Crear fecha del combustible de manera segura
      let combustibleDate: Date;
      if (combustible.fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = combustible.fecha.split('-').map(Number);
        combustibleDate = new Date(year, month - 1, day);
      } else {
        combustibleDate = new Date(combustible.fecha);
        if (isNaN(combustibleDate.getTime())) return true;
        // Ajustar por zona horaria
        combustibleDate = new Date(combustibleDate.getTime() + (combustibleDate.getTimezoneOffset() * 60000));
      }
      
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

  // ✅ FUNCIÓN PARA DESCARGAR PDF
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "l" });

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resumen de Combustibles", 14, 15);

    // Agregar filtros aplicados si los hay
    let startY = 25;
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      const toDate = new Date(dateTo).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      doc.setFontSize(12);
      doc.text(`Fecha Filtrada: ${fromDate} - ${toDate}`, 14, startY);
      startY += 10;
    }

    if (matriculaFilter) {
      doc.setFontSize(12);
      doc.text(`Matrícula: ${matriculaFilter}`, 14, startY);
      startY += 10;
    }

    if (lugarFilter) {
      doc.setFontSize(12);
      doc.text(`Lugar: ${lugarFilter}`, 14, startY);
      startY += 10;
    }

    // Cabeceras de la tabla
    const headers = [
      "Fecha",
      "Matrícula",
      "Lugar",
      "Litros",
      "Precio por Litro",
      "Total",
    ];

    // Usar todos los combustibles filtrados para el PDF
    const rows = filteredCombustibles.map((combustible) => [
      combustible.fecha
        ? formatDateUY(combustible.fecha)
        : "N/D",
      combustible.matricula || "N/D",
      combustible.lugar || "N/D",
      Number(combustible.litros || 0).toFixed(1),
      Number(combustible.precio || 0).toLocaleString("es-UY", {
        style: "currency",
        currency: "UYU",
      }),
      Number(combustible.total || 0).toLocaleString("es-UY", {
        style: "currency",
        currency: "UYU",
      }),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY,
      styles: { halign: "center", fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { top: 20 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Registros: ${filteredCombustibles.length}`, 14, finalY);
    doc.text(`Total Litros: ${totalLitros.toFixed(1)}`, 14, finalY + 10);
    doc.text(`Total Monto: ${totalMonto.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
    })}`, 14, finalY + 20);
    doc.setFont("helvetica", "normal");

    doc.save("resumen_combustibles.pdf");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ FILTROS ESTANDARIZADOS */}
      <div className="space-y-3 sm:space-y-4">
        {/* Primera fila: Buscador general + Botón nuevo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="🔍 Buscar en todos los campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={downloadPDF} variant="outline" className="w-full sm:w-auto">
              📄 Descargar PDF
            </Button>
            <Link href="/combustible/nuevo" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">+ Nuevo Registro</Button>
            </Link>
          </div>
        </div>

        {/* Segunda fila: Filtros específicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Input
            placeholder="📅 Fecha desde..."
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          <Input
            placeholder="📅 Fecha hasta..."
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />

          <Input
            placeholder="🚛 Matrícula..."
            value={matriculaFilter}
            onChange={(e) => setMatriculaFilter(e.target.value)}
          />

          <Input
            placeholder="⛽ Lugar..."
            value={lugarFilter}
            onChange={(e) => setLugarFilter(e.target.value)}
          />
        </div>

        {/* Tercera fila: Limpiar filtros */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          {/* Botón para limpiar filtros */}
          {(searchTerm || dateFrom || dateTo || matriculaFilter || lugarFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setDateFrom("");
                setDateTo("");
                setMatriculaFilter("");
                setLugarFilter("");
              }}
              className="whitespace-nowrap w-full sm:w-auto"
            >
              🗑️ Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

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