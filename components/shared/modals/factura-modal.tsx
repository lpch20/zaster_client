"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateFacturaByFactura } from "@/api/RULE_updateData";
import Swal from "sweetalert2";
import { DateRangeFilter } from "./date-range-filter"; // Mismo directorio, está bien
import type { DateRange } from "react-day-picker";
import { fixUruguayTimezone } from "@/lib/utils";

interface FacturaModalProps {
  onSuccess?: () => void;
  trips: any[];
  selectedTrips: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

export function FacturaModal({ onSuccess, trips, selectedTrips, onSelectionChange }: FacturaModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // ✅ Filtrar viajes por fecha
  const filteredTripsByDate = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return trips;
    }
    
    return trips.filter((trip) => {
      if (!trip.fecha_viaje) return false;
      const tripDate = new Date(trip.fecha_viaje);
      return tripDate >= dateRange.from! && tripDate <= dateRange.to!;
    });
  }, [trips, dateRange]);

  // ✅ Seleccionar todos los viajes filtrados por fecha
  const selectAllFilteredTrips = () => {
    const filteredIds = filteredTripsByDate.map(trip => trip.id);
    onSelectionChange(filteredIds);
  };

  // ✅ Limpiar selección
  const clearSelection = () => {
    onSelectionChange([]);
  };

  // ✅ Limpiar filtros de fecha
  const clearDateFilter = () => {
    setDateRange(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔍 handleSubmit ejecutado");
    console.log("🔍 selectedTrips:", selectedTrips);
    console.log("🔍 numeroFactura:", numeroFactura);
    
    if (selectedTrips.length === 0) {
      Swal.fire("Info", "Debes seleccionar al menos un viaje", "info");
      return;
    }

    if (!numeroFactura.trim()) {
      Swal.fire("Error", "Debes ingresar un número de factura", "error");
      return;
    }

    // ✅ Usar confirm nativo para probar
    const confirmed = window.confirm(`¿Deseas asignar el número de factura "${numeroFactura}" a ${selectedTrips.length} viajes?`);
    
    console.log("🔍 ConfirmResult:", confirmed);

    if (confirmed) {
      try {
        setLoading(true);
        console.log("🔍 Iniciando actualización de facturas...");
        
        // Actualizar cada viaje seleccionado
        for (const tripId of selectedTrips) {
          console.log(`🔍 Actualizando viaje ID: ${tripId} con factura: ${numeroFactura}`);
          const result = await updateFacturaByFactura(tripId, numeroFactura.trim());
          console.log(`🔍 Resultado para viaje ${tripId}:`, result);
        }

        console.log("🔍 Todas las actualizaciones completadas");
        alert(`✅ Éxito: Número de factura "${numeroFactura}" asignado a ${selectedTrips.length} viajes`);
        
        // Limpiar selección y filtros
        onSelectionChange([]);
        setNumeroFactura("");
        setDateRange(undefined);
        setOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("❌ Error al actualizar facturas:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`❌ Error: Hubo un problema al actualizar los viajes: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("🔍 Usuario canceló la operación");
    }
  };

  const handleClose = () => {
    setNumeroFactura("");
    setDateRange(undefined);
    setOpen(false);
  };

  const toggleTripSelection = (tripId: number) => {
    if (selectedTrips.includes(tripId)) {
      onSelectionChange(selectedTrips.filter(id => id !== tripId));
    } else {
      onSelectionChange([...selectedTrips, tripId]);
    }
  };

  const selectAllTrips = () => {
    onSelectionChange(trips.map(trip => trip.id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto text-purple-600 border-purple-600 hover:bg-purple-50">
          📄 Editar Número de Factura
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">📄 Editar Número de Factura en Lote</DialogTitle>
          <DialogDescription className="text-sm">
            Asigna el mismo número de factura a varios viajes. Puedes filtrar por fecha o seleccionar manualmente.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numeroFactura">Número de Factura</Label>
            <Input
              id="numeroFactura"
              placeholder="Ingresa el número de factura..."
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* ✅ NUEVO: Filtro de fecha */}
          <div className="space-y-3">
            <Label>Filtrar por Fecha (Opcional)</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:w-auto">
                <DateRangeFilter
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
              {dateRange && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearDateFilter}
                  className="text-xs w-full sm:w-auto"
                >
                  🗑️ Limpiar Fecha
                </Button>
              )}
            </div>
            
            {/* ✅ INFO del filtro de fecha */}
            {dateRange?.from && dateRange?.to && (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
                📅 Mostrando viajes del {fixUruguayTimezone(dateRange.from)} al {fixUruguayTimezone(dateRange.to)}
                <br />
                <span className="font-medium">
                  {filteredTripsByDate.length} viajes encontrados de {trips.length} total
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <Label className="text-sm">Viajes Seleccionados ({selectedTrips.length} de {filteredTripsByDate.length})</Label>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {/* ✅ Botón para seleccionar todos los filtrados por fecha */}
                {dateRange?.from && dateRange?.to && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllFilteredTrips}
                    className="text-xs text-blue-600 border-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                  >
                    📅 Seleccionar por Fecha
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllTrips}
                  className="text-xs w-full sm:w-auto"
                >
                  Seleccionar Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="text-xs w-full sm:w-auto"
                >
                  Limpiar
                </Button>
              </div>
            </div>
            
            <div className="max-h-40 sm:max-h-60 overflow-y-auto border rounded-md p-2 sm:p-3 space-y-2">
              {filteredTripsByDate.length === 0 ? (
                <div className="text-center text-gray-500 py-4 text-sm">
                  {dateRange?.from && dateRange?.to 
                    ? "No hay viajes en el rango de fechas seleccionado"
                    : "No hay viajes disponibles"
                  }
                </div>
              ) : (
                filteredTripsByDate.map((trip) => (
                  <div key={trip.id} className="flex items-start space-x-2 sm:space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={`trip-${trip.id}`}
                      checked={selectedTrips.includes(trip.id)}
                      onCheckedChange={() => toggleTripSelection(trip.id)}
                      className="mt-1"
                    />
                    <Label htmlFor={`trip-${trip.id}`} className="flex-1 cursor-pointer text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium">Viaje #{trip.numero_viaje}</span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {trip.numero_factura ? `Factura: ${trip.numero_factura}` : "Sin factura"}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {trip.fecha_viaje ? fixUruguayTimezone(trip.fecha_viaje) : "Sin fecha"}
                      </div>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="w-full sm:w-auto order-2 sm:order-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedTrips.length === 0 || !numeroFactura.trim()} 
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? "Actualizando..." : `✅ Actualizar ${selectedTrips.length} viajes`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
