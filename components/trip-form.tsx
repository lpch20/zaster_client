"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { addTrip } from "@/api/RULE_insertData";
import {
  getCamiones,
  getChoferes,
  getClients,
  getTrip,
  getRemitoNotUploadInTrip, // ✅ USAR SOLO ESTA FUNCIÓN
  getRemitoById,
} from "@/api/RULE_getData";
import { updateTrip } from "@/api/RULE_updateData";
import { Loading } from "./spinner";

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string;
  file?: File;
}

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
  lugar_descarga: string; // ✅ AGREGAR LUGAR_DESCARGA
  camion_id: number;
}

export function TripForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [totalChoferes, setTotalChoferes] = useState<any[]>([]);
  const [camiones, setCamiones] = useState<any[]>([]);
  const [clients, setTotalClients] = useState<any[]>([]);
  const [allImages, setAllImages] = useState<ImageData[]>([]);
  const [totalRemitos, setTotalRemitos] = useState<Remito[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>(
    initialData
      ? {
          ...initialData,
          numero_viaje: initialData.numero_viaje ?? "",
          remito_id: String(initialData.remito_id ?? ""),
          fecha_viaje: initialData.fecha_viaje
            ? new Date(initialData.fecha_viaje).toISOString().slice(0, 10)
            : "",
          remitente_name: initialData.remitente_name ?? "",
          lugar_carga: initialData.lugar_carga ?? "",
          destinatario_id: String(initialData.destinatario_id ?? ""),
          lugar_descarga: initialData.lugar_descarga ?? "",
          camion_id: String(initialData.camion_id ?? ""),
          chofer_id: String(initialData.chofer_id ?? ""),
          guias: initialData.guias ?? "",
          detalle_carga: initialData.detalle_carga ?? "",
          facturar_a: String(initialData.facturar_a ?? ""),
          lavado: initialData.lavado ?? "",
          peaje: initialData.peaje ?? "",
          balanza: initialData.balanza ?? "",
          sanidad: initialData.sanidad ?? "",
          inspeccion: initialData.inspeccion ?? "",
          precio_flete: initialData.precio_flete ?? "",
          iva_lavado: initialData.iva_lavado ?? false,
          iva_peaje: initialData.iva_peaje ?? false,
          iva_balanza: initialData.iva_balanza ?? false,
          iva_sanidad: initialData.iva_sanidad ?? false,
          tipo_cambio: initialData.tipo_cambio ?? "",
          kms: initialData.kms ?? "",
          tarifa: initialData.tarifa ?? "",
          numero_factura: initialData.numero_factura ?? "",
          vencimiento: initialData.vencimiento ?? "",
          referencia_cobro: initialData.referencia_cobro ?? "",
          cobrado: initialData.cobrado ?? false,
          estado: initialData.estado ?? "activo",
        }
      : {
          numero_viaje: "",
          remito_id: "",
          fecha_viaje: "",
          remitente_name: "",
          lugar_carga: "",
          destinatario_id: "",
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
          sanidad: 0,
          inspeccion: "",
          numero_factura: "",
          vencimiento: "",
          referencia_cobro: "",
          cobrado: false,
          estado: "activo",
          iva_lavado: false,
          iva_peaje: false,
          iva_balanza: false,
          iva_sanidad: false,
        }
  );

  // Carga de catálogos
  useEffect(() => {
    getTotalChoferes();
    getTripFunction();
    getClient();
    getTotalCamiones();
    getRemitosNotTripTable();
  }, []);

  const validateRequiredFieldsTrip = () => {
    const requiredFields = [
      { field: "numero_viaje", label: "Número de Viaje" },
      { field: "remito_id", label: "Número Remito" },
      { field: "fecha_viaje", label: "Fecha" },
      { field: "remitente_name", label: "Remitente/Destinatario" },
      { field: "lugar_carga", label: "Lugar de Carga" },
      { field: "lugar_descarga", label: "Lugar de Descarga" },
      { field: "camion_id", label: "Camión" },
      { field: "chofer_id", label: "Chofer" },
      { field: "facturar_a", label: "Facturar a" },
      { field: "kms", label: "Kilómetros" },
      { field: "tarifa", label: "Tarifa" },
      { field: "numero_factura", label: "Número de Factura" },
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(({ label }) => label).join(", ");
      Swal.fire({
        title: "Campos Obligatorios",
        text: `Los siguientes campos son obligatorios para el viaje: ${missingLabels}`,
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return false;
    }
    return true;
  };

  // ✅ CAMBIO PRINCIPAL: Usar solo remitos NO asignados a viajes
  const getRemitosNotTripTable = async () => {
    try {
      setLoading(true);
      
      // ✅ USAR SOLO REMITOS NO ASIGNADOS
      const result = await getRemitoNotUploadInTrip();
      console.log("🔍 DEBUG trip-form - Response remitos no asignados:", result);
      
      let remitosList = result.result as Remito[];
      
      // ✅ FILTRAR ELEMENTOS NULL EN REMITOS TAMBIÉN
      const filteredRemitos = remitosList.filter((remito: any) => remito !== null);
      
      // ✅ CASO ESPECIAL: Si estamos editando, agregar el remito actual aunque esté asignado
      if (initialData?.remito_id) {
        const idStr = String(initialData.remito_id);
        if (!filteredRemitos.some((r) => String(r.id) === idStr)) {
          const spec = await getRemitoById(initialData.remito_id);
          if (spec?.result) filteredRemitos.push(spec.result);
        }
      }
      
      setTotalRemitos(filteredRemitos);
      console.log("🔍 DEBUG trip-form - Remitos no asignados cargados:", filteredRemitos);
      console.log("🔍 DEBUG trip-form - Total remitos disponibles:", filteredRemitos.length);
    } finally {
      setLoading(false);
    }
  };

  const getTotalChoferes = async () => {
    try {
      setLoading(true);
      const res = await getChoferes();
      setTotalChoferes(res.result);
    } finally {
      setLoading(false);
    }
  };

  const getTripFunction = async () => {
    try {
      setLoading(true);
      const res = await getTrip();
      setTrips(res.result);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX PRINCIPAL: Filtrar NULL y soft_delete
  const getClient = async () => {
    try {
      setLoading(true);
      const res = await getClients();
      
      // ✅ FILTRAR TANTO NULL COMO SOFT_DELETE
      const filteredClients = res.result.filter((c: any) => c !== null && !c.soft_delete);
      setTotalClients(filteredClients);
      
      console.log("🔍 DEBUG trip-form - Clientes cargados:", filteredClients);
      console.log("🔍 DEBUG trip-form - Total clientes:", filteredClients.length);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCamiones = async () => {
    try {
      setLoading(true);
      const res = await getCamiones();
      setCamiones(res.result);
    } finally {
      setLoading(false);
    }
  };

  // Generar número de viaje
  useEffect(() => {
    if (trips.length) {
      const max = Math.max(...trips.map((t) => Number(t.numero_viaje)));
      const next = String(max + 1).padStart(3, "0");
      setFormData((f: any) => ({
        ...f,
        numero_viaje: initialData ? initialData.numero_viaje : next,
      }));
    } else {
      setFormData((f: any) => ({ ...f, numero_viaje: "001" }));
    }
  }, [trips]);

  // Imagenes viejas
  useEffect(() => {
    if (initialData) {
      const temp: ImageData[] = [];
      [1, 2, 3, 4, 5].forEach((n) => {
        const key = `img_${n}` as keyof typeof initialData;
        if (initialData[key])
          temp.push({ id: `old${n}`, type: "old", url: initialData[key] });
      });
      setAllImages(temp);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((f: any) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const items = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      type: "new",
      file,
    }));
    if (allImages.length + items.length > 5) {
      Swal.fire("Error", "Máximo 5 archivos permitidos", "error");
      return;
    }
    setAllImages((prev) => [...prev, ...items]);
    e.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setAllImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Cálculo de totales con decimales
  const parcialKms = Number(formData.kms) * Number(formData.tarifa);
  const lavadoMonto = Number(formData.lavado) * (formData.iva_lavado ? 1.22 : 1);
  const peajeMonto = Number(formData.peaje) * (formData.iva_peaje ? 1.22 : 1);
  const balanzaMonto = Number(formData.balanza) * (formData.iva_balanza ? 1.22 : 1);
  const sanidadMonto = Number(formData.sanidad) * (formData.iva_sanidad ? 1.22 : 1);
  const inspeccionMonto = Number(formData.inspeccion);
  const precioFleteMonto = Number(formData.precio_flete);

  const totalFlete = parcialKms;

  const totalMontoUY =
    parcialKms +
    lavadoMonto +
    peajeMonto +
    balanzaMonto +
    sanidadMonto +
    inspeccionMonto +
    precioFleteMonto;

  const totalMontoUSS = Number(formData.tipo_cambio) > 0 ? totalMontoUY / Number(formData.tipo_cambio) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequiredFieldsTrip()) {
      return;
    }

    Swal.fire({
      title: initialData ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const finalData = {
        ...formData,
        total_monto_uy: parseFloat(totalMontoUY.toFixed(2)),
        total_monto_uss: parseFloat(totalMontoUSS.toFixed(2)),
        total_flete: parseFloat(totalFlete.toFixed(2))
      };

      const fd = new FormData();
      Object.entries(finalData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          fd.append(k, v.toString());
        }
      });

      // Manejar archivos si los hay
      allImages
        .filter((i) => i.type === "new" && i.file)
        .forEach((i) => fd.append("archivos", i.file!));

      const resp = initialData ? await updateTrip(fd) : await addTrip(fd);
      Swal.close();
      if (resp.result) {
        Swal.fire("Éxito", "Viaje guardado", "success");
        router.push("/viajes");
      }
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "No se pudo guardar el viaje", "error");
      console.error("Error al guardar viaje:", error);
    }
  };

  return (
    <>
      {loading ? (
        <div>
          Cargando....
          <Loading />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos del viaje */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_viaje">Número de Viaje</Label>
              <Input
                id="numero_viaje"
                name="numero_viaje"
                value={formData.numero_viaje}
                onChange={handleChange}
                required
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remito_id">Número de Remito</Label>
              <Select
                name="remito_id"
                value={formData.remito_id}
                onValueChange={(value) => {
                  const remitoSeleccionado = totalRemitos.find(
                    (rm: any) => rm.id.toString() === value
                  );
                  setFormData((prev: any) => ({
                    ...prev,
                    remito_id: value,
                    lugar_carga: remitoSeleccionado
                      ? remitoSeleccionado.lugar_carga
                      : prev.lugar_carga,
                    remitente_name: remitoSeleccionado
                      ? remitoSeleccionado.propietario_name
                      : prev.remitente_name,
                    chofer_id: remitoSeleccionado
                      ? String(remitoSeleccionado.chofer_id)
                      : prev.chofer_id,
                    guias: remitoSeleccionado
                      ? remitoSeleccionado.numero_guia
                      : prev.guias,
                    lavado: remitoSeleccionado
                      ? remitoSeleccionado.lavado
                      : prev.lavado,
                    peaje: remitoSeleccionado
                      ? remitoSeleccionado.peaje
                      : prev.peaje,
                    balanza: remitoSeleccionado
                      ? remitoSeleccionado.balanza
                      : prev.balanza,
                    kms: remitoSeleccionado
                      ? remitoSeleccionado.kilometros
                      : prev.kms,
                    fecha_viaje: remitoSeleccionado
                      ? new Date(remitoSeleccionado.fecha)
                          .toISOString()
                          .slice(0, 10)
                      : "",
                    destinatario_id: remitoSeleccionado
                      ? String(remitoSeleccionado.destinatario_id)
                      : prev.destinatario_id,
                    // ✅ USAR EL LUGAR_DESCARGA DEL REMITO
                    lugar_descarga: remitoSeleccionado
                      ? remitoSeleccionado.lugar_descarga
                      : prev.lugar_descarga,
                    camion_id: remitoSeleccionado
                      ? String(remitoSeleccionado.camion_id)
                      : prev.camion_id,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar remito" />
                </SelectTrigger>
                <SelectContent>
                  {[...totalRemitos]
                    .sort(
                      (a, b) =>
                        Number(b.numero_remito) - Number(a.numero_remito)
                    )
                    .map((rm: any) => (
                      <SelectItem key={rm.id} value={String(rm.id)}>
                        {rm.numero_remito}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="remitente_name">Remitente</Label>
              <Input
                id="remitente_name"
                name="remitente_name"
                type="text"
                value={formData.remitente_name}
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
              <Label htmlFor="destinatario_id">Destinatario</Label>
              <Select
                name="destinatario_id"
                value={formData.destinatario_id}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    destinatario_id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar destinatario" />
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
                value={formData.camion_id}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, camion_id: value }))
                }
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
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, chofer_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar chofer" />
                </SelectTrigger>
                <SelectContent>
                  {totalChoferes.map((chofer: any) => (
                    <SelectItem key={chofer.id} value={chofer.id.toString()}>
                      {chofer.nombre }
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
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facturar_a">Facturar a</Label>
              <Select
                name="facturar_a"
                value={formData.facturar_a}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, facturar_a: value }))
                }
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
                onChange={handleChange}
              />
            </div>
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
                step="0.01"
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
                step="0.01"
                value={formData.precio_flete}
                onChange={handleChange}
              />
            </div>
            {/* Gastos */}
            <div className="space-y-2">
              <Label htmlFor="lavado">Lavado</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="lavado"
                  name="lavado"
                  type="number"
                  step="0.01"
                  value={formData.lavado}
                  onChange={handleChange}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="iva_lavado"
                    checked={formData.iva_lavado}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, iva_lavado: checked }))
                    }
                  />
                  <Label htmlFor="iva_lavado" className="text-sm">IVA</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="peaje">Peaje</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="peaje"
                  name="peaje"
                  type="number"
                  step="0.01"
                  value={formData.peaje}
                  onChange={handleChange}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="iva_peaje"
                    checked={formData.iva_peaje}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, iva_peaje: checked }))
                    }
                  />
                  <Label htmlFor="iva_peaje" className="text-sm">IVA</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balanza">Balanza</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="balanza"
                  name="balanza"
                  type="number"
                  step="0.01"
                  value={formData.balanza}
                  onChange={handleChange}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="iva_balanza"
                    checked={formData.iva_balanza}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, iva_balanza: checked }))
                    }
                  />
                  <Label htmlFor="iva_balanza" className="text-sm">IVA</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sanidad">Sanidad</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="sanidad"
                  name="sanidad"
                  type="number"
                  step="0.01"
                  value={formData.sanidad}
                  onChange={handleChange}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="iva_sanidad"
                    checked={formData.iva_sanidad}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, iva_sanidad: checked }))
                    }
                  />
                  <Label htmlFor="iva_sanidad" className="text-sm">IVA</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspeccion">Inspección</Label>
              <Input
                id="inspeccion"
                name="inspeccion"
                type="number"
                step="0.01"
                value={formData.inspeccion}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_flete">Total Monto Flete</Label>
              <Input
                id="total_flete"
                name="total_flete"
                value={totalFlete.toFixed(2)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_monto_uy">Total Monto UY</Label>
              <Input
                id="total_monto_uy"
                name="total_monto_uy"
                value={totalMontoUY.toFixed(2)}
                disabled={true}
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
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero_factura">Número de Factura</Label>
              <Input
                id="numero_factura"
                name="numero_factura"
                value={formData.numero_factura}
                onChange={handleChange}
                required
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
            <div className="space-y-2">
              <Label htmlFor="detalle_carga">Detalle de Carga</Label>
              <Textarea
                id="detalle_carga"
                name="detalle_carga"
                value={formData.detalle_carga}
                onChange={handleChange}
              />
            </div>
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

          {/* Área de archivos */}
          <div className="space-y-2">
            <Label htmlFor="archivos">Subir archivos (máximo 5)</Label>
            <Input
              id="archivos"
              name="archivos"
              type="file"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {/* Vista previa de archivos */}
          {allImages.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos seleccionados ({allImages.length}/5)</Label>
              <div className="flex flex-wrap gap-2">
                {allImages.map((img) => {
                  let src = "";
                  let link = "";
                  if (img.type === "old") {
                    link = `https://drive.google.com/file/d/${img.url}/view?usp=sharing`;
                    src = `https://www.googleapis.com/drive/v3/files/${img.url}?alt=media&key=AIzaSyCbrQgBir-rEUavb6X1Q-SUpuGvIlW7Re8`;
                  } else {
                    src = URL.createObjectURL(img.file!);
                  }

                  return (
                    <div key={img.id} className="relative">
                      <img
                        src={src}
                        alt="Vista previa"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                      {img.type === "old" && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1 rounded"
                        >
                          Ver
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear"} Viaje
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/viajes")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </>
  );
}