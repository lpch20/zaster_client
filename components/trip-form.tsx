"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

export function TripForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(
    initialData || {
      numero_viaje: "",
      numero_remito: "",
      fecha_viaje: "",
      remitente: "",
      lugar_carga: "",
      destinatario: "",
      lugar_descarga: "",
      camion_id: "",
      chofer_id: "",
      guias: "",
      detalle_carga: "",
      facturar_a: "",
      tipo_cambio: "",
      kms: "",
      tarifa: "",
      precio_flete: "",
      lavado: "",
      peaje: "",
      balanza: "",
      inspeccion: "",
      total_monto_uy: "",
      total_monto_uss: "",
      numero_factura: "",
      vencimiento: "",
      cobrado: false,
      referencia_cobro: "",
      estado: "activo",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // Here you would typically send the data to your backend
    toast({
      title: "Viaje guardado",
      description: "El viaje ha sido guardado exitosamente.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_viaje">Número de Viaje</Label>
          <Input
            id="numero_viaje"
            name="numero_viaje"
            value={formData.numero_viaje}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero_remito">Número de Remito</Label>
          <Input
            id="numero_remito"
            name="numero_remito"
            value={formData.numero_remito}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha_viaje">Fecha de Viaje</Label>
          <Input
            id="fecha_viaje"
            name="fecha_viaje"
            type="date"
            value={formData.fecha_viaje}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="remitente">Remitente</Label>
          <Input
            id="remitente"
            name="remitente"
            value={formData.remitente}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lugar_carga">Lugar de Carga</Label>
          <Input
            id="lugar_carga"
            name="lugar_carga"
            value={formData.lugar_carga}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinatario">Destinatario</Label>
          <Input
            id="destinatario"
            name="destinatario"
            value={formData.destinatario}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lugar_descarga">Lugar de Descarga</Label>
          <Input
            id="lugar_descarga"
            name="lugar_descarga"
            value={formData.lugar_descarga}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="camion_id">Camión</Label>
          <Select
            name="camion_id"
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, camion_id: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar camión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">CAM001</SelectItem>
              <SelectItem value="2">CAM002</SelectItem>
              <SelectItem value="3">CAM003</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chofer_id">Chofer</Label>
          <Select
            name="chofer_id"
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, chofer_id: value }))
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
          <Label htmlFor="facturar_a">Facturar a</Label>
          <Input
            id="facturar_a"
            name="facturar_a"
            value={formData.facturar_a}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo_cambio">Tipo de Cambio</Label>
          <Input
            id="tipo_cambio"
            name="tipo_cambio"
            value={formData.tipo_cambio}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lavado">Lavado</Label>
          <Input
            id="lavado"
            name="lavado"
            value={formData.lavado}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="peaje">Peaje</Label>
          <Input
            id="peaje"
            name="peaje"
            value={formData.peaje}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanza">Balanza</Label>
          <Input
            id="balanza"
            name="balanza"
            value={formData.balanza}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspeccion">Inspección</Label>
          <Input
            id="inspeccion"
            name="inspeccion"
            value={formData.inspeccion}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_monto_uy">Total Monto UY</Label>
          <Input
            id="total_monto_uy"
            name="total_monto_uy"
            value={formData.total_monto_uy}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_monto_uss">Total Monto USS</Label>
          <Input
            id="total_monto_uss"
            name="total_monto_uss"
            value={formData.total_monto_uss}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_factura">Número de Factura</Label>
          <Input
            id="numero_factura"
            name="numero_factura"
            value={formData.numero_factura}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vencimiento">Vencimiento</Label>
          <Input
            id="vencimiento"
            name="vencimiento"
            type="date"
            value={formData.vencimiento}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referencia_cobro">Referencia de Cobro</Label>
          <Input
            id="referencia_cobro"
            name="referencia_cobro"
            value={formData.referencia_cobro}
            onChange={handleChange}
          />
        </div>
{/* 
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            name="estado"
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, estado: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>
      <div className="space-y-2">
        <Label htmlFor="guias">Guías</Label>
        <Textarea
          id="guias"
          name="guias"
          value={formData.guias}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="detalle_carga">Detalle de Carga</Label>
        <Textarea
          id="detalle_carga"
          name="detalle_carga"
          value={formData.detalle_carga}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kms">Kilómetros</Label>
          <Input
            id="kms"
            name="kms"
            type="number"
            value={formData.kms}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tarifa">Tarifa</Label>
          <Input
            id="tarifa"
            name="tarifa"
            type="number"
            value={formData.tarifa}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precio_flete">Precio Flete</Label>
          <Input
            id="precio_flete"
            name="precio_flete"
            type="number"
            value={formData.precio_flete}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="estado"
          checked={formData.estado === "activo"}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              estado: checked ? "activo" : "inactivo",
            }))
          }
        />
        <Label htmlFor="estado">Viaje activo</Label>
      </div>
      <div className="flex items-center space-x-2">
          
          <Switch
            id="cobrado"
            checked={formData.cobrado}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, cobrado: checked }))
            }
          />
          <Label htmlFor="cobrado">Cobrado</Label>
        </div>
      <Button type="submit" className="w-full sm:w-auto">
        {initialData ? "Actualizar Viaje" : "Crear Viaje"}
      </Button>
    </form>
  );
}
