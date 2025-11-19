"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Download, Eye } from "lucide-react";
import { Loading } from "@/components/shared/spinner";
import { getMantenimientos, getCamiones } from "@/api/RULE_getData";
import { deleteMantenimientoById } from "@/api/RULE_deleteDate";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

export default function MaintenanceList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [lugarFilter, setLugarFilter] = useState("");
  const [camionFilter, setCamionFilter] = useState("todos");
  // ✅ Mapa para almacenar información de camiones (id -> matrícula)
  const [camionesMap, setCamionesMap] = useState<Map<number | string, string>>(new Map());

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const res = await getMantenimientos();
      setItems(res || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar mantenimientos.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Cargar opciones de camiones únicos
  const camionesUnicos: Array<number | string> = Array.from(new Set(items.map((i: any) => i.camion_id).filter(Boolean)));

  const [camionesList, setCamionesList] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCamiones();
        const camionesData = res.result || [];
        setCamionesList(camionesData);
        
        // ✅ Crear mapa de camiones (id -> matrícula) para acceso rápido
        // ✅ Guardar tanto como number como string para evitar problemas de tipo
        const map = new Map<number | string, string>();
        camionesData.forEach((c: any) => {
          const matricula = c.matricula || c.patente || `ID ${c.id}`;
          // ✅ Guardar con ambos tipos (number y string) para asegurar coincidencia
          map.set(c.id, matricula);
          map.set(String(c.id), matricula);
          map.set(Number(c.id), matricula);
        });
        console.log("🔍 DEBUG - Mapa de camiones creado:", Array.from(map.entries()));
        setCamionesMap(map);
      } catch (e) {
        console.error('Error cargando camiones:', e);
      }
    })();
  }, []);

  const applyFilters = async () => {
    try {
      setLoading(true);
      const res = await getMantenimientos({ camion_id: camionFilter === 'todos' ? undefined : camionFilter, lugar: lugarFilter, fromDate: dateFrom || undefined, toDate: dateTo || undefined });
      setItems(res || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Fallo al aplicar filtros", "error");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar mantenimiento
  const deleteHandler = async (id: number | string) => {
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
        await deleteMantenimientoById(String(id));
        Swal.fire("Eliminado", "El mantenimiento ha sido eliminado.", "success");
        await applyFilters();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo eliminar el mantenimiento.", "error");
      }
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'l' });
    
    // ✅ Título del PDF
    doc.setFontSize(16);
    doc.text('Resumen de Mantenimientos', 14, 15);
    
    // ✅ Agregar filtros aplicados si los hay
    let startY = 25;
    if (dateFrom && dateTo) {
      doc.setFontSize(12);
      doc.text(`Fecha: ${dateFrom} - ${dateTo}`, 14, startY);
      startY += 10;
    }
    if (camionFilter !== "todos") {
      const camionNombre = camionesList.find((c: any) => String(c.id) === String(camionFilter))?.nombre || camionFilter;
      doc.setFontSize(12);
      doc.text(`Camión: ${camionNombre}`, 14, startY);
      startY += 10;
    }
    if (lugarFilter) {
      doc.setFontSize(12);
      doc.text(`Lugar: ${lugarFilter}`, 14, startY);
      startY += 10;
    }
    
    // ✅ Cabeceras de la tabla
    const headers = ['Fecha', 'Camión', 'KMs', 'Lugar', 'Descripción'];
    
    // ✅ Usar matrícula en lugar de ID y aplicar filtros
    const filteredForPDF = filtered.length > 0 ? filtered : items;
    const rows = filteredForPDF.map(i => {
      // ✅ Obtener matrícula del camión - intentar con diferentes tipos
      let matricula = camionesMap.get(i.camion_id);
      if (!matricula) {
        matricula = camionesMap.get(String(i.camion_id));
      }
      if (!matricula) {
        matricula = camionesMap.get(Number(i.camion_id));
      }
      if (!matricula) {
        // ✅ Si no se encuentra, buscar en la lista de camiones directamente
        const camion = camionesList.find((c: any) => 
          String(c.id) === String(i.camion_id) || 
          Number(c.id) === Number(i.camion_id)
        );
        matricula = camion?.matricula || camion?.patente || `ID ${i.camion_id}`;
      }
      return [
        dayjs(i.fecha).format('DD/MM/YYYY'),
        matricula,
        i.kms || '-',
        i.lugar || '-',
        i.descripcion || ''
      ];
    });
    
    // ✅ Aplicar estilos consistentes con otros PDFs
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startY > 25 ? startY : 30,
      styles: { halign: 'center', fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { top: 20 }
    });
    
    // ✅ Agregar total de registros
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Registros: ${filteredForPDF.length}`, 14, finalY);
    doc.setFont('helvetica', 'normal');
    
    doc.save('resumen_mantenimientos.pdf');
  };

  const filtered = items.filter((it) => {
    const matchesCamion = camionFilter === "todos" || String(it.camion_id) === String(camionFilter);
    const matchesLugar = lugarFilter === "" || (it.lugar || "").toLowerCase().includes(lugarFilter.toLowerCase());
    const matchesSearch = search === "" || (it.descripcion || "").toLowerCase().includes(search.toLowerCase());

    // Fecha comparación sin plugins: usar start/end del día
    let matchesFrom = true;
    let matchesTo = true;
    try {
      const fechaItem = it.fecha ? new Date(it.fecha) : null;
      if (fechaItem) {
        if (dateFrom) {
          const from = new Date(dateFrom + 'T00:00:00');
          matchesFrom = fechaItem >= from;
        }
        if (dateTo) {
          const to = new Date(dateTo + 'T23:59:59');
          matchesTo = fechaItem <= to;
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    return matchesCamion && matchesLugar && matchesSearch && matchesFrom && matchesTo;
  });

  return (
    <div className="space-y-4">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-end items-end">
          <div className="flex items-center gap-2">
            <Button onClick={downloadPDF} variant="outline">📄 Descargar PDF</Button>
            <Link href="/mantenimientos/nuevo"><Button>+ Nuevo Mantenimiento</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
          <Input placeholder="📅 Fecha desde..." type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input placeholder="📅 Fecha hasta..." type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Input placeholder="🚛 Lugar..." value={lugarFilter} onChange={(e) => setLugarFilter(e.target.value)} />
          <Select value={camionFilter} onValueChange={setCamionFilter}>
            <SelectTrigger><SelectValue placeholder="Camión"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {camionesList.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nombre || c.modelo || c.matricula || `ID ${c.id}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <Input placeholder="🔍 Buscar descripción..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={applyFilters}>Filtrar</Button>
            <Button variant="outline" onClick={() => { setSearch(''); setLugarFilter(''); setDateFrom(''); setDateTo(''); setCamionFilter('todos'); fetchMantenimientos(); }}>🗑️ Limpiar Filtros</Button>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Camión</TableHead>
                <TableHead>KMs</TableHead>
                <TableHead>Lugar</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                // ✅ Obtener matrícula del camión - intentar con diferentes tipos
                let matricula = camionesMap.get(m.camion_id);
                if (!matricula) {
                  matricula = camionesMap.get(String(m.camion_id));
                }
                if (!matricula) {
                  matricula = camionesMap.get(Number(m.camion_id));
                }
                if (!matricula) {
                  // ✅ Si no se encuentra, buscar en la lista de camiones directamente
                  const camion = camionesList.find((c: any) => 
                    String(c.id) === String(m.camion_id) || 
                    Number(c.id) === Number(m.camion_id)
                  );
                  matricula = camion?.matricula || camion?.patente || `ID ${m.camion_id}`;
                }
                return (
                <TableRow key={m.id}>
                  <TableCell>{dayjs(m.fecha).format("DD/MM/YYYY")}</TableCell>
                  <TableCell>{matricula}</TableCell>
                  <TableCell>{m.kms}</TableCell>
                  <TableCell>{m.lugar}</TableCell>
                  <TableCell className="max-w-xs truncate" title={m.descripcion}>{m.descripcion}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/mantenimientos/${m.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/mantenimientos/${m.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteHandler(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


