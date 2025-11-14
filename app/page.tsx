"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeFilter } from "@/components/date-range-filter";
import type { DateRange } from "react-day-picker";
import { 
  getTrip, 
  getClients, 
  getLiquidacion, 
  getGastos, 
  getCombustibles,
  getCountTrip,
  getCountRemito,
  getCountChoferes,
  getCountClients
} from "@/api/RULE_getData";
import { Loading } from "@/components/spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogoDataUrl } from "@/lib/pdfUtils";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Truck, 
  Users, 
  FileText,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Car
} from "lucide-react";
import { getCurrentDateTimeUruguay } from "@/lib/utils";

interface DashboardData {
  trips: any[];
  clients: any[];
  liquidaciones: any[];
  gastos: any[];
  combustibles: any[];
  counts: {
    trips: number;
    remitos: number;
    choferes: number;
    clients: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    trips: [],
    clients: [],
    liquidaciones: [],
    gastos: [],
    combustibles: [],
    counts: { trips: 0, remitos: 0, choferes: 0, clients: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>("todos");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedClient, setSelectedClient] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  // Cargar datos al inicializar
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        tripsResult,
        clientsResult,
        liquidacionesResult,
        gastosResult,
        combustiblesResult,
        countTrips,
        countRemitos,
        countChoferes,
        countClients
      ] = await Promise.all([
        getTrip(),
        getClients(),
        getLiquidacion(),
        getGastos(),
        getCombustibles(),
        getCountTrip(),
        getCountRemito(),
        getCountChoferes(),
        getCountClients()
      ]);

      setData({
        trips: tripsResult?.result || [],
        clients: clientsResult?.result?.filter((c: any) => c !== null && !c.soft_delete) || [],
        liquidaciones: liquidacionesResult?.result || [],
        gastos: gastosResult?.result || [],
        combustibles: combustiblesResult?.result || [],
        counts: {
          trips: countTrips?.result || 0,
          remitos: countRemitos?.result || 0,
          choferes: countChoferes?.result || 0,
          clients: countClients?.result || 0
        }
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN HELPER PARA COMPARAR IDs
  const compareIds = (id1: any, id2: any): boolean => {
    const str1 = String(id1).trim();
    const str2 = String(id2).trim();
    const stringMatch = str1 === str2;
    const num1 = Number(id1);
    const num2 = Number(id2);
    const numberMatch = !isNaN(num1) && !isNaN(num2) && num1 === num2;
    return stringMatch || numberMatch;
  };

  // ✅ FILTRAR DATOS SEGÚN FILTROS APLICADOS
  const getFilteredTrips = () => {
    return data.trips.filter((trip) => {
      const tripDate = new Date(trip.fecha_viaje);
      
      // Filtro por rango de fechas
      if (dateRange?.from && dateRange?.to) {
        if (tripDate < dateRange.from || tripDate > dateRange.to) return false;
      }
      
      // Filtro por mes específico
      if (selectedMonth && selectedMonth !== "todos") {
        const tripMonth = tripDate.getMonth() + 1;
        if (tripMonth !== parseInt(selectedMonth)) return false;
      }
      
      // Filtro por año
      if (selectedYear) {
        const tripYear = tripDate.getFullYear();
        if (tripYear !== parseInt(selectedYear)) return false;
      }
      
      // Filtro por cliente
      if (selectedClient !== "todos") {
        const clientMatch = compareIds(trip.facturar_a, selectedClient) || compareIds(trip.destinatario_id, selectedClient);
        if (!clientMatch) return false;
      }
      
      // Filtro por estado de cobrado
      if (selectedStatus !== "todos") {
        if (selectedStatus === "cobrado" && !trip.cobrado) return false;
        if (selectedStatus === "pendiente" && trip.cobrado) return false;
      }
      
      return true;
    });
  };

  const filteredTrips = getFilteredTrips();

  // ✅ CALCULAR MÉTRICAS DEL BALANCE
  const calculateMetrics = () => {
    const trips = filteredTrips;
    
    // Ingresos de viajes
    const totalIngresos = trips.reduce((sum, trip) => sum + (Number(trip.total_monto_uy) || 0), 0);
    const tripsCobrados = trips.filter(trip => trip.cobrado);
    const ingresosCobrados = tripsCobrados.reduce((sum, trip) => sum + (Number(trip.total_monto_uy) || 0), 0);
    const ingresosPendientes = totalIngresos - ingresosCobrados;
    
    // ✅ Gastos operativos (de viajes) - campos reales de tu BD
    const gastosOperativos = trips.reduce((sum, trip) => {
      return sum + (Number(trip.lavado) || 0) + (Number(trip.peaje) || 0) + 
             (Number(trip.balanza) || 0) + (Number(trip.inspeccion) || 0) + (Number(trip.sanidad) || 0);
    }, 0);
    
    // ✅ Liquidaciones de choferes - sumar total_a_favor
    const totalLiquidaciones = data.liquidaciones.reduce((sum, liq) => {
      const valor = Number(liq.total_a_favor) || 0;
      return sum + valor;
    }, 0);
    
    // ✅ Gastos generales - usando monto_pesos y monto_usd de gastos
    const gastosGenerales = data.gastos.reduce((sum, gasto) => {
      const montoPesos = Number(gasto.monto_pesos) || 0;
      const montoUsd = Number(gasto.monto_usd) || 0;
      return sum + montoPesos + montoUsd;
    }, 0);
    
    // ✅ Combustible - usando campo total o calculando litros * precio
    const gastosCombustible = data.combustibles.reduce((sum, comb) => {
      const total = Number(comb.total) || 0;
      // Si no hay total, calcular litros * precio
      const calculado = total > 0 ? total : (Number(comb.litros) || 0) * (Number(comb.precio) || 0);
      return sum + calculado;
    }, 0);
    
    // ✅ Balance total - SUMAR: GASTOS + COMBUSTIBLE + LIQUIDACIONES CHOFER
    // NOTA: gastosOperativos son gastos de viajes (lavado, peaje, etc.) que ya están incluidos en los viajes
    // El total de gastos debe ser: Gastos Generales + Combustible + Liquidaciones Chofer
    const totalGastos = gastosGenerales + gastosCombustible + totalLiquidaciones;
    
    // ✅ DEBUG: Log para verificar los cálculos
    console.log("🔍 DEBUG Balance - Cálculo de gastos:", {
      gastosGenerales,
      gastosCombustible,
      totalLiquidaciones,
      gastosOperativos,
      totalGastos,
      sumaManual: gastosGenerales + gastosCombustible + totalLiquidaciones
    });
    const utilidadBruta = totalIngresos - gastosOperativos;
    const utilidadNeta = totalIngresos - totalGastos;
    const margenUtilidad = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;
    
    return {
      totalIngresos,
      ingresosCobrados,
      ingresosPendientes,
      gastosOperativos,
      totalLiquidaciones,
      gastosGenerales,
      gastosCombustible,
      totalGastos,
      utilidadBruta,
      utilidadNeta,
      margenUtilidad,
      totalViajes: trips.length,
      viajesCobrados: tripsCobrados.length,
      viajesPendientes: trips.length - tripsCobrados.length
    };
  };

  const metrics = calculateMetrics();

  // ✅ GENERAR PDF DEL BALANCE (SIN CARACTERES ESPECIALES)
  const generateBalancePDF = async () => {
    const doc = new jsPDF({ 
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ✅ HEADER CON COLORES CORPORATIVOS (dibujar primero para que no tape el logo)
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 40, 'F');
    try {
      const logo = await getLogoDataUrl();
      const margin = 14;
      if (logo) doc.addImage(logo.dataUrl, logo.mime.includes('png') ? 'PNG' : 'JPEG', margin, 6, 40, 16);
      const title = "Balance Empresarial";
      doc.setFontSize(14);
      const textWidth = doc.getTextWidth(title);
      doc.text(title, pageWidth - margin - textWidth, 28);
    } catch (e) {
      console.error('No se pudo cargar logo para PDF Balance', e);
    }
    
    // Título principal
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ZASTER CRM", 20, 18);
    
    // Subtítulo
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Balance Empresarial", 20, 28);
    
    // Fecha de generación
    doc.setFontSize(10);
    const fechaGeneracion = getCurrentDateTimeUruguay();
    doc.text("Generado: " + fechaGeneracion, pageWidth - 20, 18, { align: "right" });
    
    let yPos = 55;
    
    // ✅ INFORMACIÓN DE FILTROS
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FILTROS APLICADOS", 20, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Crear array de filtros aplicados (sin emojis)
    const filtrosAplicados = [];
    
    if (dateRange?.from && dateRange?.to) {
          const fromDate = new Date(dateRange.from).toLocaleDateString("es-UY", { timeZone: "America/Montevideo" });
    const toDate = new Date(dateRange.to).toLocaleDateString("es-UY", { timeZone: "America/Montevideo" });
      filtrosAplicados.push(["Rango de fechas:", fromDate + " - " + toDate]);
    }
    
    if (selectedMonth && selectedMonth !== "todos") {
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      filtrosAplicados.push(["Mes:", monthNames[parseInt(selectedMonth) - 1] + " " + selectedYear]);
    } else {
      filtrosAplicados.push(["Año:", selectedYear]);
    }
    
    if (selectedClient !== "todos") {
      const client = data.clients.find(c => compareIds(c.id, selectedClient));
      filtrosAplicados.push(["Cliente:", client?.nombre || "N/D"]);
    } else {
      filtrosAplicados.push(["Cliente:", "Todos los clientes"]);
    }
    
    const estadoTexto = selectedStatus === "todos" ? "Todos" : selectedStatus === "cobrado" ? "Cobrado" : "Pendiente";
    filtrosAplicados.push(["Estado:", estadoTexto]);
    filtrosAplicados.push(["Total viajes:", metrics.totalViajes + " viajes analizados"]);
    
    // Tabla de filtros
    autoTable(doc, {
      startY: yPos,
      head: [["Filtro", "Valor"]],
      body: filtrosAplicados,
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        halign: "left"
      },
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 120 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 20;
    
    // ✅ RESUMEN EJECUTIVO
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("RESUMEN EJECUTIVO", 20, yPos);
    yPos += 5;
    
    // Línea decorativa
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(2);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;
    
    const summaryData = [
      ["Total Ingresos", "$" + metrics.totalIngresos.toLocaleString("es-UY", { minimumFractionDigits: 2 }), "Facturacion total del periodo"],
      ["Ingresos Cobrados", "$" + metrics.ingresosCobrados.toLocaleString("es-UY", { minimumFractionDigits: 2 }), ((metrics.ingresosCobrados / metrics.totalIngresos) * 100).toFixed(1) + "% del total"],
      ["Ingresos Pendientes", "$" + metrics.ingresosPendientes.toLocaleString("es-UY", { minimumFractionDigits: 2 }), metrics.viajesPendientes + " viajes pendientes"],
      ["Total Gastos", "$" + metrics.totalGastos.toLocaleString("es-UY", { minimumFractionDigits: 2 }), "Todos los gastos del periodo"],
      ["Utilidad Neta", "$" + metrics.utilidadNeta.toLocaleString("es-UY", { minimumFractionDigits: 2 }), "Margen: " + metrics.margenUtilidad.toFixed(1) + "%"]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [["Concepto", "Monto", "Detalle"]],
      body: summaryData,
      styles: { 
        fontSize: 10, 
        cellPadding: 5,
        halign: "left"
      },
      headStyles: { 
        fillColor: [34, 197, 94], 
        textColor: 255,
        fontSize: 11,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { halign: "right", fontStyle: "bold", cellWidth: 40 },
        2: { fontSize: 9, textColor: [100, 100, 100], cellWidth: 80 }
      },
      alternateRowStyles: { fillColor: [249, 249, 249] },
      margin: { left: 20, right: 20 }
    });
    
    // ✅ GUARDAR CON NOMBRE DESCRIPTIVO
    const fileName = "balance-zastre-" + selectedYear + (selectedMonth !== "todos" ? "-" + selectedMonth.padStart(2, '0') : "") + "-" + new Date().toISOString().slice(0, 10) + ".pdf";
    doc.save(fileName);
  };

  // ✅ LIMPIAR FILTROS
  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedMonth("todos");
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedClient("todos");
    setSelectedStatus("todos");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
        <p className="ml-4 text-lg">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ✅ ENCABEZADO DEL DASHBOARD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">📊 Balance</h1>
          <p className="text-gray-600 mt-2">
            Resumen completo del estado financiero de la empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateBalancePDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" onClick={loadDashboardData} className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* ✅ FILTROS AVANZADOS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Filtro por mes */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="📅 Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los meses</SelectItem>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const monthName = new Date(2024, i, 1).toLocaleDateString("es-UY", { 
          month: "long",
          timeZone: "America/Montevideo" 
        });
                  return (
                    <SelectItem key={month} value={month.toString()}>
                      {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Filtro por año */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="📅 Año" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Filtro por cliente */}
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="👤 Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los clientes</SelectItem>
                {data.clients
                  .filter((client, index, self) => 
                    index === self.findIndex(c => compareIds(c.id, client.id))
                  )
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Filtro por estado */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="💳 Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="cobrado">✅ Cobrado</SelectItem>
                <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por rango de fechas */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>

            {/* Botón limpiar filtros */}
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              🗑️ Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Ingresos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💰 Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.totalIngresos.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalViajes} viajes en total
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Cobrados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">✅ Cobrados</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${metrics.ingresosCobrados.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.viajesCobrados} viajes cobrados
            </p>
          </CardContent>
        </Card>

        {/* Total Gastos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💳 Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${metrics.totalGastos.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos operativos + generales
            </p>
          </CardContent>
        </Card>

        {/* Utilidad Neta */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📈 Utilidad Neta</CardTitle>
            <BarChart3 className={`h-4 w-4 ${metrics.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.utilidadNeta.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {metrics.margenUtilidad.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ RESUMEN EJECUTIVO COMPACTO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">💪 Fortalezas</h4>
              <ul className="text-sm space-y-1">
                <li>• {metrics.viajesCobrados} viajes cobrados</li>
                <li>• Margen: {metrics.margenUtilidad.toFixed(1)}%</li>
                <li>• {data.counts.clients} clientes activos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">⚠️ Atención</h4>
              <ul className="text-sm space-y-1">
                <li>• ${metrics.ingresosPendientes.toLocaleString("es-UY")} pendientes</li>
                <li>• {metrics.viajesPendientes} viajes sin cobrar</li>
                <li>• Gastos: ${metrics.totalGastos.toLocaleString("es-UY")}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🎯 Oportunidades</h4>
              <ul className="text-sm space-y-1">
                <li>• Optimizar combustible</li>
                <li>• Mejorar cobranza</li>
                <li>• Expandir clientes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ ALERTAS IMPORTANTES */}
      {(metrics.viajesPendientes > 0 || metrics.margenUtilidad < 10) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚨 Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.viajesPendientes > 0 && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">
                      {metrics.viajesPendientes} viajes pendientes de cobro
                    </p>
                    <p className="text-xs text-orange-600">
                      Monto: ${metrics.ingresosPendientes.toLocaleString("es-UY")}
                    </p>
                  </div>
                </div>
              )}

              {metrics.margenUtilidad < 10 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Margen de utilidad bajo: {metrics.margenUtilidad.toFixed(1)}%
                    </p>
                    <p className="text-xs text-red-600">
                      Revisar estructura de costos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ FOOTER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
        <div className="text-sm text-gray-500">
          Última actualización: {getCurrentDateTimeUruguay()}
        </div>
      </div>
    </div>
  );
}