"use client";

import type React from "react";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export function PaymentForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(
    initialData || {
      viaje_id: "",
      kms_viaje: "",
      minimo_kms_liquidar: 100, // default value
      limite_premio: "",
      kms_liquidar: "",
      precio_km: "",
      subtotal: "",
      viatico: "",
      pernocte: "",
      gastos: "",
      total_a_favor: "",
      liquidacion_pagada: false, // boolean
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // Here you would typically send the data to your backend
    toast({
      title: "Liquidación guardada",
      description: "La liquidación ha sido guardada exitosamente.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="viaje_id">Viaje</Label>
          <Select
            name="viaje_id"
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, viaje_id: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar viaje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Viaje #V001</SelectItem>
              <SelectItem value="2">Viaje #V002</SelectItem>
              <SelectItem value="3">Viaje #V003</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chofer_id">Chofer</Label>
          <Select
            name="chofer_id"
            onValueChange={(value) =>
              setFormData((prev:any) => ({ ...prev, chofer_id: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar chofer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Juan Pérez</SelectItem>
              <SelectItem value="2">María González</SelectItem>
              <SelectItem value="3">Carlos Rodríguez</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="kms_viaje">KMs Viaje</Label>
          <Input
            id="kms_viaje"
            name="kms_viaje"
            type="number"
            value={formData.kms_viaje}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimo_kms_liquidar">Minimo KMs a Liquidar</Label>
          <Input
            id="minimo_kms_liquidar"
            name="minimo_kms_liquidar"
            type="number"
            value={formData.minimo_kms_liquidar}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="limite_premio">Limite Premio</Label>
          <Input
            id="limite_premio"
            name="limite_premio"
            type="number"
            value={formData.limite_premio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kms_liquidar">KMs a Liquidar</Label>
          <Input
            id="kms_liquidar"
            name="kms_liquidar"
            type="number"
            value={formData.kms_liquidar}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precio_km">Precio por KM</Label>
          <Input
            id="precio_km"
            name="precio_km"
            type="number"
            value={formData.precio_km}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtotal">Subtotal</Label>
          <Input
            id="subtotal"
            name="subtotal"
            type="number"
            value={formData.subtotal}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="viatico">Viatico</Label>
          <Input
            id="viatico"
            name="viatico"
            type="number"
            value={formData.viatico}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pernocte">Pernocte</Label>
          <Input
            id="pernocte"
            name="pernocte"
            type="number"
            value={formData.pernocte}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gastos">Gastos</Label>
          <Input
            id="gastos"
            name="gastos"
            type="number"
            value={formData.gastos}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_a_favor">Total a Favor</Label>
          <Input
            id="total_a_favor"
            name="total_a_favor"
            type="number"
            value={formData.total_a_favor}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="liquidacion_pagada"
          name="liquidacion_pagada"
          checked={formData.liquidacion_pagada}
          onCheckedChange={(checked) =>
            setFormData((prev: any) => ({
              ...prev,
              liquidacion_pagada: checked,
            }))
          }
        />
        <Label htmlFor="liquidacion_pagada">Liquidación Pagada</Label>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        {initialData ? "Actualizar Liquidación" : "Crear Liquidación"}
      </Button>
    </form>
  );
}
