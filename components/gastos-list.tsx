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
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { getGastos, deleteGasto } from "@/api/RULE_getData";
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  img_1?: string;
  img_2?: string;
  img_3?: string;
  img_4?: string;
  img_5?: string;
}

// ✅ FUNCIÓN ROBUSTA para formatear fecha (igual que en otros componentes)
const formatDateUY = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // ✅ Detectar formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-UY');
    }
    
    // ✅ Detectar formatos ISO o timestamp
    if (dateString.includes('T') || dateString.includes(' ')) {
      const dateOnly = dateString.split('T')[0].split(' ')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-UY');
    }
    
    // ✅ Para otros formatos, crear Date y aplicar ajuste de timezone
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    // ✅ Aplicar ajuste de timezone para evitar desfase de un día
    const adjustedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    return adjustedDate.toLocaleDateString('es-UY');
    
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
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

  // ✅ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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
      console.log("🔍 DEBUG - Fetching gastos...");
      
      const result = await getGastos();
      console.log("🔍 DEBUG - Respuesta completa:", result);
      console.log("🔍 DEBUG - Tipo de result:", typeof result);
      console.log("🔍 DEBUG - Es array result?", Array.isArray(result));
      
      // ✅ CORREGIR: Manejar diferentes estructuras de respuesta
      let gastosArray: Gasto[] = [];
      
      if (Array.isArray(result)) {
        // Si result es directamente un array
        gastosArray = result;
      } else if (result && result.result && Array.isArray(result.result)) {
        // Si result tiene una propiedad 'result' que es array
        gastosArray = result.result;

      } else if (result && Array.isArray(result.data)) {
        // Si result tiene una propiedad 'data' que es array
        gastosArray = result.data;

      } else {

        gastosArray = [];
      }
      
      console.log("🔍 DEBUG - Gastos procesados:", gastosArray);
      console.log("🔍 DEBUG - Cantidad de gastos:", gastosArray.length);
      
      setGastos(gastosArray);
      setCurrentPage(1); // Resetear a página 1 cuando se cargan nuevos datos
    } catch (error) {
      console.error("❌ ERROR - Error fetching gastos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos de gastos.", "error");
      setGastos([]); // ✅ Asegurar que gastos sea un array vacío en caso de error
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

  // ✅ VALIDAR que gastos sea un array antes de filtrar
  const filteredGastos = Array.isArray(gastos) ? gastos.filter((gasto) => {
    const matchesSearch = Object.values(gasto).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ FILTRO DE FECHAS ROBUSTO (igual que en otros componentes)
    const matchesDateRange = () => {
      if (!dateFrom && !dateTo) return true;
      
      try {
        // ✅ Crear fecha del gasto usando la misma lógica robusta
        let gastoDate: Date;
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(gasto.fecha)) {
          const [year, month, day] = gasto.fecha.split('-').map(Number);
          gastoDate = new Date(year, month - 1, day);
        } else if (gasto.fecha.includes('T') || gasto.fecha.includes(' ')) {
          const dateOnly = gasto.fecha.split('T')[0].split(' ')[0];
          const [year, month, day] = dateOnly.split('-').map(Number);
          gastoDate = new Date(year, month - 1, day);
        } else {
          const date = new Date(gasto.fecha);
          if (isNaN(date.getTime())) return true;
          gastoDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        }
        
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
      } catch (error) {
        console.error('Error en filtro de fechas:', error);
        return true;
      }
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
      if (monedaFilter === "pesos") return Number(gasto.monto_pesos || 0) > 0;
      if (monedaFilter === "usd") return Number(gasto.monto_usd || 0) > 0;
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
  }) : []; // ✅ Si gastos no es array, devolver array vacío

  // ✅ PAGINACIÓN - Calcular datos de la página actual
  const totalPages = Math.ceil(filteredGastos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGastos = filteredGastos.slice(startIndex, endIndex);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, matriculaFilter, proveedorFilter, formaPagoFilter, categoriaFilter, monedaFilter]);

  const totalPesos = filteredGastos.reduce((sum, g) => sum + (Number(g.monto_pesos) || 0), 0);
  const totalUSD = filteredGastos.reduce((sum, g) => sum + (Number(g.monto_usd) || 0), 0);

  // ✅ FUNCIÓN PARA DESCARGAR PDF
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "l" });

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Resumen de Gastos", 14, 15);

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

    if (proveedorFilter) {
      doc.setFontSize(12);
      doc.text(`Proveedor: ${proveedorFilter}`, 14, startY);
      startY += 10;
    }

    if (categoriaFilter !== "todas") {
      doc.setFontSize(12);
      doc.text(`Categoría: ${categoriaFilter}`, 14, startY);
      startY += 10;
    }

    // Cabeceras de la tabla
    const headers = [
      "Fecha",
      "Matrícula",
      "Categoría",
      "Proveedor",
      "Monto UYU",
      "Monto USD",
      "Forma de Pago",
      "Descripción",
    ];

    // Usar todos los gastos filtrados para el PDF
    const rows = filteredGastos.map((gasto) => [
      formatDateUY(gasto.fecha),
      gasto.matricula || "N/D",
      gasto.categoria || "N/D",
      gasto.proveedor || "N/D",
      Number(gasto.monto_pesos || 0).toLocaleString("es-UY", {
        style: "currency",
        currency: "UYU",
      }),
      Number(gasto.monto_usd || 0).toLocaleString("es-UY", {
        style: "currency",
        currency: "USD",
      }),
      gasto.forma_pago || "N/D",
      gasto.descripcion || "N/D",
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
    doc.text(`Total Gastos: ${filteredGastos.length}`, 14, finalY);
    doc.text(`Total UYU: ${totalPesos.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
    })}`, 14, finalY + 10);
    doc.text(`Total USD: ${totalUSD.toLocaleString("es-UY", {
      style: "currency",
      currency: "USD",
    })}`, 14, finalY + 20);
    doc.setFont("helvetica", "normal");

    doc.save("resumen_gastos.pdf");
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
            <Link href="/gastos/nuevo" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">+ Nuevo Gasto</Button>
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
            placeholder="🏪 Proveedor..."
            value={proveedorFilter}
            onChange={(e) => setProveedorFilter(e.target.value)}
          />
        </div>

        {/* Tercera fila: Selects y limpiar filtros */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <Select value={formaPagoFilter} onValueChange={setFormaPagoFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="💳 Forma de Pago" />
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

          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="📂 Categoría" />
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

          <Select value={monedaFilter} onValueChange={setMonedaFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="💰 Moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las monedas</SelectItem>
              <SelectItem value="pesos">💵 Solo UYU</SelectItem>
              <SelectItem value="usd">💵 Solo USD</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón para limpiar filtros */}
          {(searchTerm || dateFrom || dateTo || matriculaFilter || proveedorFilter || 
            formaPagoFilter !== "todos" || categoriaFilter !== "todas" || monedaFilter !== "todos") && (
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
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredGastos.length)} de {filteredGastos.length} gastos
        </div>
      </div>

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
              {currentGastos.map((gasto) => (
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

      {filteredGastos.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron registros de gastos.</p>
        </div>
      )}
    </div>
  );
}