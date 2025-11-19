"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TripFormExpensesProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function TripFormExpenses({ formData, onFieldChange }: TripFormExpensesProps) {
  const ExpenseField = ({
    id,
    label,
    value,
    ivaField,
    ivaValue,
  }: {
    id: string;
    label: string;
    value: string | number;
    ivaField: string;
    ivaValue: boolean;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          id={id}
          name={id}
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onFieldChange(id, e.target.value)}
          className="flex-1"
        />
        <div className="flex items-center space-x-2">
          <Switch
            id={ivaField}
            checked={ivaValue}
            onCheckedChange={(checked) => onFieldChange(ivaField, checked)}
          />
          <Label htmlFor={ivaField} className="text-sm">IVA</Label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ExpenseField
        id="lavado"
        label="Lavado"
        value={formData.lavado}
        ivaField="iva_lavado"
        ivaValue={formData.iva_lavado}
      />
      <ExpenseField
        id="peaje"
        label="Peaje"
        value={formData.peaje}
        ivaField="iva_peaje"
        ivaValue={formData.iva_peaje}
      />
      <ExpenseField
        id="balanza"
        label="Balanza"
        value={formData.balanza}
        ivaField="iva_balanza"
        ivaValue={formData.iva_balanza}
      />
      <ExpenseField
        id="sanidad"
        label="Sanidad"
        value={formData.sanidad}
        ivaField="iva_sanidad"
        ivaValue={formData.iva_sanidad}
      />
      <div className="space-y-2">
        <Label htmlFor="inspeccion">Inspección</Label>
        <Input
          id="inspeccion"
          name="inspeccion"
          type="number"
          step="0.01"
          value={formData.inspeccion}
          onChange={(e) => onFieldChange("inspeccion", e.target.value)}
        />
      </div>
    </>
  );
}

