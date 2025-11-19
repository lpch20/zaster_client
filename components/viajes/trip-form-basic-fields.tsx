"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TripFormBasicFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  camiones: any[];
  choferes: any[];
  clients: any[];
}

export function TripFormBasicFields({
  formData,
  onFieldChange,
  camiones,
  choferes,
  clients,
}: TripFormBasicFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="numero_viaje">Número de Viaje</Label>
        <Input
          id="numero_viaje"
          name="numero_viaje"
          value={formData.numero_viaje}
          onChange={(e) => onFieldChange("numero_viaje", e.target.value)}
          required
          disabled={true}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fecha_viaje">Fecha de Viaje</Label>
        <Input
          id="fecha_viaje"
          name="fecha_viaje"
          type="date"
          value={formData.fecha_viaje}
          onChange={(e) => onFieldChange("fecha_viaje", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="remitente_name">Remitente</Label>
        <Input
          id="remitente_name"
          name="remitente_name"
          type="text"
          value={formData.remitente_name}
          onChange={(e) => onFieldChange("remitente_name", e.target.value)}
          required
          placeholder="Se llenará automáticamente al seleccionar un remito"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lugar_carga">Lugar de Carga</Label>
        <Input
          id="lugar_carga"
          name="lugar_carga"
          value={formData.lugar_carga}
          onChange={(e) => onFieldChange("lugar_carga", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lugar_descarga">Lugar de Descarga</Label>
        <Input
          id="lugar_descarga"
          name="lugar_descarga"
          value={formData.lugar_descarga}
          onChange={(e) => onFieldChange("lugar_descarga", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="camion_id">Camión</Label>
        <Select
          name="camion_id"
          value={formData.camion_id}
          onValueChange={(value) => onFieldChange("camion_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar camion" />
          </SelectTrigger>
          <SelectContent>
            {camiones.map((camion: any) => (
              <SelectItem key={camion.id} value={camion.id.toString()}>
                {camion.modelo + " " + camion.matricula}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="chofer_id">Chofer</Label>
        <Select
          name="chofer_id"
          value={formData.chofer_id}
          onValueChange={(value) => onFieldChange("chofer_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar chofer" />
          </SelectTrigger>
          <SelectContent>
            {choferes.map((chofer: any) => (
              <SelectItem key={chofer.id} value={chofer.id.toString()}>
                {chofer.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="guias">Guías</Label>
        <Input
          id="guias"
          name="guias"
          value={formData.guias}
          onChange={(e) => onFieldChange("guias", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="facturar_a">Facturar a</Label>
        <Select
          name="facturar_a"
          value={formData.facturar_a}
          onValueChange={(value) => onFieldChange("facturar_a", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client: any) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipo_cambio">Tipo de Cambio</Label>
        <Input
          id="tipo_cambio"
          name="tipo_cambio"
          type="number"
          step="0.01"
          value={formData.tipo_cambio}
          onChange={(e) => onFieldChange("tipo_cambio", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kms">Kilómetros</Label>
        <Input
          id="kms"
          name="kms"
          type="number"
          value={formData.kms}
          onChange={(e) => onFieldChange("kms", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tarifa">Tarifa</Label>
        <Input
          id="tarifa"
          name="tarifa"
          type="number"
          step="0.01"
          value={formData.tarifa}
          onChange={(e) => onFieldChange("tarifa", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="detalle_carga">Detalle de Carga</Label>
        <Textarea
          id="detalle_carga"
          name="detalle_carga"
          value={formData.detalle_carga}
          onChange={(e) => onFieldChange("detalle_carga", e.target.value)}
        />
      </div>
    </>
  );
}

