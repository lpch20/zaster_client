"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFacturasUnicas, getTrip } from "@/api/RULE_getData";
import { updateReferenciaCobroByFactura } from "@/api/RULE_updateData";
import Swal from "sweetalert2";

interface ReferenciaCobroModalProps {
  onSuccess?: () => void;
}

export function ReferenciaCobroModal({ onSuccess }: ReferenciaCobroModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facturas, setFacturas] = useState<string[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedFactura, setSelectedFactura] = useState("");
  const [referenciaCobro, setReferenciaCobro] = useState("");
  const [selectedTrips, setSelectedTrips] = useState<number[]>([]);

  // Cargar facturas únicas y viajes al abrir el modal
  useEffect(() => {
    if (open) {
      loadFacturas();
      loadTrips();
    }
  }, [open]);

  const loadFacturas = async () => {
    try {
      const response = await getFacturasUnicas();
      setFacturas(response.result || []);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      Swal.fire("Error", "No se pudieron cargar las facturas", "error");
    }
  };

  const loadTrips = async () => {
    try {
      const response = await getTrip();
      if (response && response.result) {
        setTrips(response.result);
      }
    } catch (error) {
      console.error("Error al cargar viajes:", error);
    }
  };

  // Filtrar viajes por factura seleccionada
  const filteredTrips = selectedFactura 
    ? trips.filter(trip => trip.numero_factura === selectedFactura)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTrips.length === 0) {
      Swal.fire("Info", "Debes seleccionar al menos un viaje", "info");
      return;
    }

    if (!selectedFactura || !referenciaCobro.trim()) {
      Swal.fire("Error", "Por favor completa todos los campos", "error");
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas asignar la referencia de cobro "${referenciaCobro}" a ${selectedTrips.length} viajes con factura ${selectedFactura}?`
    );

    if (confirmed) {
      try {
        setLoading(true);
        
        const result = await updateReferenciaCobroByFactura(selectedFactura, referenciaCobro.trim());
        
        Swal.fire({
          title: "¡Éxito!",
          text: `Referencia de cobro actualizada para ${result.result.viajesActualizados} viajes con factura ${selectedFactura}`,
          icon: "success",
          confirmButtonText: "Perfecto"
        });

        // Limpiar formulario y cerrar modal
        setSelectedFactura("");
        setReferenciaCobro("");
        setSelectedTrips([]);
        setOpen(false);
        
        // Notificar al componente padre
        if (onSuccess) {
          onSuccess();
        }
        
      } catch (error) {
        console.error("Error al actualizar referencia:", error);
        Swal.fire("Error", "No se pudo actualizar la referencia de cobro", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setSelectedFactura("");
    setReferenciaCobro("");
    setSelectedTrips([]);
    setOpen(false);
  };

  const toggleTripSelection = (tripId: number) => {
    if (selectedTrips.includes(tripId)) {
      setSelectedTrips(selectedTrips.filter(id => id !== tripId));
    } else {
      setSelectedTrips([...selectedTrips, tripId]);
    }
  };

  const selectAllFilteredTrips = () => {
    setSelectedTrips(filteredTrips.map(trip => trip.id));
  };

  const clearSelection = () => {
    setSelectedTrips([]);
  };

  // Actualizar viajes seleccionados cuando cambia la factura
  useEffect(() => {
    setSelectedTrips([]);
  }, [selectedFactura]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto text-green-600 border-green-600 hover:bg-green-50">
          📝 Editar Referencia de Cobro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Editar Referencia de Cobro en Lote</DialogTitle>
          <DialogDescription>
            Asigna la misma referencia de cobro a varios viajes seleccionados con la misma factura.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="factura">Número de Factura *</Label>
            <Select
              value={selectedFactura}
              onValueChange={setSelectedFactura}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una factura" />
              </SelectTrigger>
              <SelectContent>
                {facturas.map((factura) => (
                  <SelectItem key={factura} value={factura}>
                    {factura}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {facturas.length === 0 && !loading && (
              <p className="text-sm text-gray-500">
                No hay facturas disponibles para editar
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia">Referencia de Cobro *</Label>
            <Input
              id="referencia"
              placeholder="Ej: Transferencia del 15/03, Cheque #123, etc."
              value={referenciaCobro}
              onChange={(e) => setReferenciaCobro(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {selectedFactura && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Viajes con Factura {selectedFactura} ({selectedTrips.length} de {filteredTrips.length})</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllFilteredTrips}
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
                {filteredTrips.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay viajes con esta factura
                  </p>
                ) : (
                  filteredTrips.map((trip) => (
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
                            {trip.referencia_cobro ? `Ref: ${trip.referencia_cobro}` : "Sin referencia"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {trip.fecha_viaje ? new Date(trip.fecha_viaje).toLocaleDateString() : "Sin fecha"}
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedFactura && selectedTrips.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>⚠️ Atención:</strong> Esta acción actualizará la referencia de cobro 
                en <strong>{selectedTrips.length}</strong> viajes seleccionados con la factura <strong>{selectedFactura}</strong>.
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedTrips.length === 0 || !selectedFactura || !referenciaCobro.trim()}
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
