"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFacturasUnicas } from "@/api/RULE_getData";
import { updateReferenciaCobroByFactura } from "@/api/RULE_updateData";
import Swal from "sweetalert2";

interface ReferenciaCobroModalProps {
  onSuccess?: () => void;
}

export function ReferenciaCobroModal({ onSuccess }: ReferenciaCobroModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facturas, setFacturas] = useState<string[]>([]);
  const [selectedFactura, setSelectedFactura] = useState("");
  const [referenciaCobro, setReferenciaCobro] = useState("");

  // Cargar facturas únicas al abrir el modal
  useEffect(() => {
    if (open) {
      loadFacturas();
    }
  }, [open]);

  const loadFacturas = async () => {
    try {
      setLoading(true);
      const response = await getFacturasUnicas();
      setFacturas(response.result || []);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      Swal.fire("Error", "No se pudieron cargar las facturas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFactura || !referenciaCobro.trim()) {
      Swal.fire("Error", "Por favor completa todos los campos", "error");
      return;
    }

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
  };

  const handleClose = () => {
    setSelectedFactura("");
    setReferenciaCobro("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto text-blue-600 border-blue-600 hover:bg-blue-50">
            📝 Editar Referencia de Cobro
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>📝 Editar Referencia de Cobro en Lote</DialogTitle>
          <DialogDescription>
            Asigna la misma referencia de cobro a todos los viajes que tengan el mismo número de factura.
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
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>⚠️ Atención:</strong> Esta acción actualizará la referencia de cobro 
                en <strong>TODOS</strong> los viajes que tengan la factura <strong>{selectedFactura}</strong>.
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
              disabled={loading || !selectedFactura || !referenciaCobro.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? "Actualizando..." : "✅ Actualizar en Lote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
