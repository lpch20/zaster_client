"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TripFormTotalsProps {
  formData: any;
  precioFleteCalculado: number;
  totalMontoUY: number;
  totalMontoUSS: number;
  onFieldChange: (field: string, value: any) => void;
}

export function TripFormTotals({
  formData,
  precioFleteCalculado,
  totalMontoUY,
  totalMontoUSS,
  onFieldChange,
}: TripFormTotalsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="precio_flete">Precio Flete (KMs × Tarifa)</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="precio_flete"
            name="precio_flete"
            type="number"
            step="0.01"
            value={precioFleteCalculado.toFixed(2)}
            onChange={(e) => onFieldChange("precio_flete", e.target.value)}
            readOnly
            className="bg-gray-100 flex-1"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="iva_flete"
              checked={Boolean(formData.iva_flete)}
              onCheckedChange={(checked) => onFieldChange("iva_flete", checked)}
            />
            <Label htmlFor="iva_flete" className="text-sm">IVA</Label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="total_monto_uy">Total Monto UY</Label>
        <Input
          id="total_monto_uy"
          name="total_monto_uy"
          value={totalMontoUY.toFixed(2)}
          disabled={true}
          className="flex-1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="total_monto_uss">Total Monto USS</Label>
        <Input
          id="total_monto_uss"
          name="total_monto_uss"
          value={totalMontoUSS.toFixed(2)}
          disabled={true}
        />
      </div>
    </>
  );
}

