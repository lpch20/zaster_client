"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { getCubiertas, deleteCubierta } from "@/api/RULE_getData";
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CubiertaData {
  id: number;
  fecha: string;
  matricula: string;
  numero_cubierta: string;
  km_puesta: number;
  km_sacada?: number;
  ubicacion: string;
  marca: string;
  tipo: string;
  comentario?: string;
  camion_modelo?: string;
}

export function CubiertasList() {
  const [cubiertas, setCubiertas] = useState<CubiertaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [matriculaFilter, setMatriculaFilter] = useState("");
  const [ubicacionFilter, setUbicacionFilter] = useState("todas");
  const [marcaFilter, setMarcaFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const router = useRouter();

  useEffect(() => {
    fetchCubiertas();
  }, []);

  const fetchCubiertas = async () => {
    try {
      setLoading(true);
      const { getCubiertas } = await import('@/api/RULE_getData');
      const data = await getCubiertas();
      setCubiertas(data.result || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching cubiertas:', error);
      Swal.fire("Error", "No se pudieron cargar los datos de cubiertas.", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteCubiertaHandler = async (id: number) => {
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
        console.log('Eliminando cubierta con ID:', id);
        await deleteCubierta(id);
        Swal.fire("Eliminado", "El registro ha sido eliminado.", "success");
        fetchCubiertas();
      } catch (error) {
        console.error('Error eliminando cubierta:', error);
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  const formatDateUY = (dateString: string) => {
    if (!dateString) return "N/D";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/D";
    }
  };

  const filteredCubiertas = cubiertas.filter((cubierta) => {
    const matchesSearch = Object.values(cubierta).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ FILTRO DE FECHAS
    const matchesDateRange = () => {
      if (!dateFrom && !dateTo) return true;
      
      const cubiertaDate = new Date(cubierta.fecha);
      if (isNaN(cubiertaDate.getTime())) return true;
      
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && toDate) {
        return cubiertaDate >= fromDate && cubiertaDate <= toDate;
      } else if (fromDate) {
        return cubiertaDate >= fromDate;
      } else if (toDate) {
        return cubiertaDate <= toDate;
      }
      return true;
    };

    const matchesMatricula = matriculaFilter
      ? cubierta.matricula.toLowerCase().includes(matriculaFilter.toLowerCase())
      : true;

    const matchesUbicacion = ubicacionFilter && ubicacionFilter !== "todas"
      ? cubierta.ubicacion === ubicacionFilter
      : true;

    const matchesMarca = marcaFilter
      ? cubierta.marca.toLowerCase().includes(marcaFilter.toLowerCase())
      : true;

    const matchesTipo = tipoFilter
      ? cubierta.tipo.toLowerCase().includes(tipoFilter.toLowerCase())
      : true;

    return (
      matchesSearch && 
      matchesDateRange() && 
      matchesMatricula && 
      matchesUbicacion && 
      matchesMarca && 
      matchesTipo
    );
  });

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredCubiertas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCubiertas = filteredCubiertas.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, matriculaFilter, ubicacionFilter, marcaFilter, tipoFilter]);

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: "l" });

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resumen de Cubiertas", 14, 15);

    // Agregar filtros aplicados si los hay
    let startY = 25;
    if (dateFrom && dateTo) {
      doc.setFontSize(12);
      doc.text(`Fecha Filtrada: ${formatDateUY(dateFrom)} - ${formatDateUY(dateTo)}`, 14, startY);
      startY += 10;
    }

    if (ubicacionFilter) {
      doc.setFontSize(12);
      doc.text(`Ubicación: ${ubicacionFilter}`, 14, startY);
      startY += 10;
    }

    if (marcaFilter) {
      doc.setFontSize(12);
      doc.text(`Marca: ${marcaFilter}`, 14, startY);
      startY += 10;
    }

    if (tipoFilter) {
      doc.setFontSize(12);
      doc.text(`Tipo: ${tipoFilter}`, 14, startY);
      startY += 10;
    }

    // Cabeceras de la tabla
    const headers = [
      "Fecha",
      "Matrícula",
      "N° Cubierta",
      "KM Puesta",
      "KM Sacada",
      "Ubicación",
      "Marca",
      "Tipo",
      "Comentario",
    ];

    // Usar cubiertas filtradas para el PDF
    const rows = filteredCubiertas.map((cubierta) => [
      formatDateUY(cubierta.fecha),
      cubierta.matricula || "N/D",
      cubierta.numero_cubierta || "N/D",
      cubierta.km_puesta?.toLocaleString("es-UY") || "N/D",
      cubierta.km_sacada?.toLocaleString("es-UY") || "N/D",
      cubierta.ubicacion || "N/D",
      cubierta.marca || "N/D",
      cubierta.tipo || "N/D",
      cubierta.comentario || "N/D",
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY,
      styles: { halign: "center", fontSize: 7 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { top: 20 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Cubiertas: ${filteredCubiertas.length}`, 14, finalY);
    doc.setFont("helvetica", "normal");

    doc.save("resumen_cubiertas.pdf");
  };

  if (loading) return <div><Loading /> Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Cubiertas</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={descargarPDF} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button onClick={() => router.push("/cubiertas/nuevo")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cubierta
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en todos los campos..."
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Matrícula</Label>
              <Input
                value={matriculaFilter}
                onChange={(e) => setMatriculaFilter(e.target.value)}
                placeholder="Filtrar por matrícula"
              />
            </div>

            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Select
                value={ubicacionFilter}
                onValueChange={(value) => setUbicacionFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ubicaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="CAMION">CAMION</SelectItem>
                  <SelectItem value="ZORRA">ZORRA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                value={marcaFilter}
                onChange={(e) => setMarcaFilter(e.target.value)}
                placeholder="Filtrar por marca"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                placeholder="Filtrar por tipo"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={descargarPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setDateFrom("");
                  setDateTo("");
                  setMatriculaFilter("");
                  setUbicacionFilter("todas");
                  setMarcaFilter("");
                  setTipoFilter("");
                }} 
                variant="outline"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredCubiertas.length}</div>
            <p className="text-gray-600">Registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {filteredCubiertas.reduce((sum, c) => sum + (Number(c.km_puesta) || 0), 0).toLocaleString("es-UY")}
            </div>
            <p className="text-gray-600">Total KM Puesta</p>
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
                <TableHead>N° Cubierta</TableHead>
                <TableHead>KM Puesta</TableHead>
                <TableHead>KM Sacada</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Comentario</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCubiertas.map((cubierta) => (
                <TableRow key={cubierta.id}>
                  <TableCell>
                    {formatDateUY(cubierta.fecha)}
                  </TableCell>
                  <TableCell>{cubierta.matricula}</TableCell>
                  <TableCell>{cubierta.numero_cubierta}</TableCell>
                  <TableCell>
                    {Number(cubierta.km_puesta || 0).toLocaleString("es-UY")}
                  </TableCell>
                  <TableCell>
                    {cubierta.km_sacada 
                      ? Number(cubierta.km_sacada).toLocaleString("es-UY")
                      : "-"
                    }
                  </TableCell>
                  <TableCell>{cubierta.ubicacion}</TableCell>
                  <TableCell>{cubierta.marca}</TableCell>
                  <TableCell>{cubierta.tipo}</TableCell>
                  <TableCell className="max-w-xs truncate" title={cubierta.comentario}>
                    {cubierta.comentario || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/cubiertas/${cubierta.id}/editar`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCubiertaHandler(cubierta.id)}
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

      {/* Controles de paginación */}
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

      {filteredCubiertas.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron cubiertas
        </div>
      )}
    </div>
  );
} 