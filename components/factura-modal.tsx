"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateFacturaByFactura } from "@/api/RULE_updateData";
import Swal from "sweetalert2";

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
        
        // Limpiar selección
        onSelectionChange([]);
        setNumeroFactura("");
        setOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("❌ Error al actualizar facturas:", error);
        alert(`❌ Error: Hubo un problema al actualizar los viajes: ${error.message || error}`);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("🔍 Usuario canceló la operación");
    }
  };

  const handleClose = () => {
    setNumeroFactura("");
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

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto text-purple-600 border-purple-600 hover:bg-purple-50">
          📄 Editar Número de Factura
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📄 Editar Número de Factura en Lote</DialogTitle>
          <DialogDescription>
            Asigna el mismo número de factura a varios viajes seleccionados.
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
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Viajes Seleccionados ({selectedTrips.length} de {trips.length})</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllTrips}
                  className="text-xs"
                >
                  Seleccionar Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="text-xs"
                >
                  Limpiar
                </Button>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
              {trips.map((trip) => (
                <div key={trip.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={`trip-${trip.id}`}
                    checked={selectedTrips.includes(trip.id)}
                    onCheckedChange={() => toggleTripSelection(trip.id)}
                  />
                  <Label htmlFor={`trip-${trip.id}`} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Viaje #{trip.numero_viaje}</span>
                      <span className="text-sm text-gray-500">
                        {trip.numero_factura ? `Factura: ${trip.numero_factura}` : "Sin factura"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {trip.fecha_viaje ? new Date(trip.fecha_viaje).toLocaleDateString() : "Sin fecha"}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedTrips.length === 0 || !numeroFactura.trim()} 
              className="w-full sm:w-auto"
            >
              {loading ? "Actualizando..." : `✅ Actualizar ${selectedTrips.length} viajes`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
