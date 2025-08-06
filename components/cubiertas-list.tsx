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
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "./spinner";
import { Download } from "lucide-react";
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
  const [filtros, setFiltros] = useState({
    ubicacion: "",
    marca: "",
    tipo: "",
    fechaDesde: "",
    fechaHasta: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetchCubiertas();
  }, []); // Solo cargar una vez al montar el componente

  const fetchCubiertas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cubiertas');
      const data = await response.json();
      setCubiertas(data.result || []);
    } catch (error) {
      console.error('Error fetching cubiertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: "l" });

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resumen de Cubiertas", 14, 15);

    // Agregar filtros aplicados si los hay
    let startY = 25;
    if (filtros.fechaDesde && filtros.fechaHasta) {
      const fromDate = new Date(filtros.fechaDesde).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      const toDate = new Date(filtros.fechaHasta).toLocaleDateString("es-UY", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      doc.setFontSize(12);
      doc.text(`Fecha Filtrada: ${fromDate} - ${toDate}`, 14, startY);
      startY += 10;
    }

    if (filtros.ubicacion) {
      doc.setFontSize(12);
      doc.text(`Ubicación: ${filtros.ubicacion}`, 14, startY);
      startY += 10;
    }

    if (filtros.marca) {
      doc.setFontSize(12);
      doc.text(`Marca: ${filtros.marca}`, 14, startY);
      startY += 10;
    }

    if (filtros.tipo) {
      doc.setFontSize(12);
      doc.text(`Tipo: ${filtros.tipo}`, 14, startY);
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

    // Usar todos los cubiertas filtrados para el PDF
    const rows = cubiertasFiltradas.map((cubierta) => [
      cubierta.fecha
        ? new Date(cubierta.fecha).toLocaleDateString("es-UY", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
        : "N/D",
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
    doc.text(`Total Cubiertas: ${cubiertasFiltradas.length}`, 14, finalY);
    doc.setFont("helvetica", "normal");

    doc.save("resumen_cubiertas.pdf");
  };

  // ✅ FILTRADO LOCAL
  const cubiertasFiltradas = cubiertas.filter((cubierta) => {
    // Filtro por ubicación
    if (filtros.ubicacion && cubierta.ubicacion !== filtros.ubicacion) {
      return false;
    }
    
    // Filtro por marca
    if (filtros.marca && cubierta.marca !== filtros.marca) {
      return false;
    }
    
    // Filtro por tipo
    if (filtros.tipo && cubierta.tipo !== filtros.tipo) {
      return false;
    }
    
    // Filtro por fecha desde
    if (filtros.fechaDesde) {
      const fechaCubierta = new Date(cubierta.fecha);
      const fechaDesde = new Date(filtros.fechaDesde);
      if (fechaCubierta < fechaDesde) {
        return false;
      }
    }
    
    // Filtro por fecha hasta
    if (filtros.fechaHasta) {
      const fechaCubierta = new Date(cubierta.fecha);
      const fechaHasta = new Date(filtros.fechaHasta);
      if (fechaCubierta > fechaHasta) {
        return false;
      }
    }
    
    return true;
  });

  const limpiarFiltros = () => {
    setFiltros({
      ubicacion: "",
      marca: "",
      tipo: "",
      fechaDesde: "",
      fechaHasta: ""
    });
  };

  if (loading) return <div><Loading /> Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cubiertas</h1>
        <div className="flex gap-2">
          <Button onClick={descargarPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button onClick={() => router.push("/cubiertas/nuevo")}>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Select
                value={filtros.ubicacion}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, ubicacion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ubicaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAMION">CAMION</SelectItem>
                  <SelectItem value="ZORRA">ZORRA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                value={filtros.marca}
                onChange={(e) => setFiltros(prev => ({ ...prev, marca: e.target.value }))}
                placeholder="Filtrar por marca"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input
                value={filtros.tipo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                placeholder="Filtrar por tipo"
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={descargarPDF} variant="outline">
                Descargar PDF
              </Button>
              <Button onClick={limpiarFiltros} variant="outline">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="grid gap-4">
        {cubiertasFiltradas.map((cubierta) => (
          <Card key={cubierta.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{cubierta.numero_cubierta}</h3>
                    <Badge variant={cubierta.ubicacion === 'CAMION' ? 'default' : 'secondary'}>
                      {cubierta.ubicacion}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Matrícula:</strong> {cubierta.matricula}
                    {cubierta.camion_modelo && ` - ${cubierta.camion_modelo}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Fecha:</strong> {new Date(cubierta.fecha).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Marca:</strong> {cubierta.marca} | <strong>Tipo:</strong> {cubierta.tipo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>KM Puesta:</strong> {cubierta.km_puesta.toLocaleString()}
                    {cubierta.km_sacada && ` | KM Sacada: ${cubierta.km_sacada.toLocaleString()}`}
                  </p>
                  {cubierta.comentario && (
                    <p className="text-sm text-gray-600">
                      <strong>Comentario:</strong> {cubierta.comentario}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/cubiertas/${cubierta.id}/editar`)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/cubiertas/${cubierta.id}`)}
                  >
                    Ver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cubiertasFiltradas.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron cubiertas
        </div>
      )}
    </div>
  );
} 