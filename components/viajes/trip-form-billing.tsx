"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TripFormBillingProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function TripFormBilling({ formData, onFieldChange }: TripFormBillingProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <Switch
          id="facturado"
          checked={Boolean(formData.facturado)}
          onCheckedChange={(checked) => onFieldChange("facturado", checked)}
        />
        <Label htmlFor="facturado" className="text-sm sm:text-base">
          Viaje Facturado
        </Label>
      </div>

      {formData.facturado && (
        <div className="space-y-2">
          <Label htmlFor="numero_factura">Número de Factura *</Label>
          <Input
            id="numero_factura"
            name="numero_factura"
            value={formData.numero_factura}
            onChange={(e) => onFieldChange("numero_factura", e.target.value)}
            required
            placeholder="Ingrese el número de factura"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="vencimiento">Vencimiento</Label>
        <Input
          id="vencimiento"
          name="vencimiento"
          type="date"
          value={formData.vencimiento}
          onChange={(e) => onFieldChange("vencimiento", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="referencia_cobro">Referencia de Cobro</Label>
        <Input
          id="referencia_cobro"
          name="referencia_cobro"
          value={formData.referencia_cobro}
          onChange={(e) => onFieldChange("referencia_cobro", e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="cobrado"
          checked={formData.cobrado}
          onCheckedChange={(checked) => onFieldChange("cobrado", checked)}
        />
        <Label htmlFor="cobrado">Cobrado</Label>
      </div>
    </div>
  );
}

