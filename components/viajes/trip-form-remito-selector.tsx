"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseDateForInput } from "@/lib/utils";

interface Remito {
  id: number;
  numero_remito: string;
  propietario_name: string;
  chofer_id: number;
  numero_guia: string;
  lavado: number;
  peaje: number;
  balanza: number;
  kilometros: number;
  fecha: string;
  destinatario_id: number;
  lugar_carga: string;
  lugar_descarga: string;
  camion_id: number;
}

interface TripFormRemitoSelectorProps {
  remitos: Remito[];
  selectedRemitoId: string;
  onRemitoChange: (remito: Remito | null, remitoId: string) => void;
}

export function TripFormRemitoSelector({
  remitos,
  selectedRemitoId,
  onRemitoChange,
}: TripFormRemitoSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="remito_id">Número de Remito</Label>
      <Select
        name="remito_id"
        value={selectedRemitoId}
        onValueChange={(value) => {
          const remitoSeleccionado = remitos.find(
            (rm: any) => rm.id.toString() === value
          );
          onRemitoChange(remitoSeleccionado || null, value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar remito" />
        </SelectTrigger>
        <SelectContent>
          {remitos.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-gray-500">
              No hay remitos disponibles
            </div>
          ) : (
            [...remitos]
              .sort(
                (a, b) =>
                  Number(b.numero_remito) - Number(a.numero_remito)
              )
              .map((rm: any) => (
                <SelectItem key={rm.id} value={String(rm.id)}>
                  {rm.numero_remito}
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

