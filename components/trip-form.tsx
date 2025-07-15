"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  getCamiones,
  getChoferes,
  getClients,
  getRemitoById,
  getRemitoNotUploadInTrip,
  getTrip,
} from "@/api/RULE_getData";
import { addTrip } from "@/api/RULE_insertData";
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
  lugar_carga?: string;
  propietario_name?: string;
  chofer_id?: string;
  numero_guia?: string;
  peaje?: string;
  lavado?: string;
  balanza?: string;
  inspeccion?: string;
  kilometros?: string;
  fecha?: string;
  destinatario_id?: number;
  lugar_descarga?: string;
  camion_id?: string;
}

export function TripForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const router = useRouter();

  const [totalRemitos, setTotalRemitos] = useState<Remito[]>([]);
  const [totalChoferes, setTotalChoferes] = useState<any[]>([]);
  const [camiones, setCamiones] = useState<any[]>([]);
  const [clients, setTotalClients] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allImages, setAllImages] = useState<ImageData[]>([]);

  const [formData, setFormData] = useState<any>(
    initialData
      ? {
          ...initialData,
          remito_id: initialData.remito_id ? String(initialData.remito_id) : "",
          destinatario_id: initialData.destinatario_id
            ? String(initialData.destinatario_id)
            : "",
          facturar_a: initialData.facturar_a
            ? String(initialData.facturar_a)
            : "",
          camion_id: initialData.camion_id ? String(initialData.camion_id) : "",
          fecha_viaje: initialData.fecha_viaje
            ? initialData.fecha_viaje.slice(0, 10)
            : "",
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
          detalle_carga: initialData.detalle_carga ?? "",
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

  const getRemitosNotTripTable = async () => {
    try {
      setLoading(true);
      const result = await getRemitoNotUploadInTrip();
      let remitosList = result.result as Remito[];
      if (initialData?.remito_id) {
        const idStr = String(initialData.remito_id);
        if (!remitosList.some((r) => String(r.id) === idStr)) {
          const spec = await getRemitoById(initialData.remito_id);
          if (spec?.result) remitosList.push(spec.result);
        }
      }
      setTotalRemitos(remitosList);
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

  const getClient = async () => {
    try {
      setLoading(true);
      const res = await getClients();
      setTotalClients(res.result.filter((c: any) => !c.soft_delete));
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

  // Cálculo de totales con IVA por ítem
  const parcialKms = Number(formData.kms) * Number(formData.tarifa);
  const lavadoMonto =
    Number(formData.lavado) * (formData.iva_lavado ? 1.22 : 1);
  const peajeMonto = Number(formData.peaje) * (formData.iva_peaje ? 1.22 : 1);
  const balanzaMonto =
    Number(formData.balanza) * (formData.iva_balanza ? 1.22 : 1);
  const sanidadMonto =
    Number(formData.sanidad) * (formData.iva_sanidad ? 1.22 : 1);
  const inspeccionMonto = Number(formData.inspeccion);
  const precioFleteMonto = Number(formData.precio_flete);

  // … tus otros cálculos …
  const totalFlete = parcialKms;

  const totalMontoUY =
    parcialKms +
    lavadoMonto +
    peajeMonto +
    balanzaMonto +
    sanidadMonto +
    inspeccionMonto +
    precioFleteMonto;

  const totalMontoUSS =
    Number(formData.tipo_cambio) > 0
      ? totalMontoUY / Number(formData.tipo_cambio)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = [
      { key: "remito_id", label: "Número de Remito" },
      { key: "fecha_viaje", label: "Fecha de Viaje" },
      { key: "remitente_name", label: "Remitente" },
      { key: "lugar_carga", label: "Lugar de Carga" },
      { key: "destinatario_id", label: "Destinatario" },
      { key: "lugar_descarga", label: "Lugar de Descarga" },
      { key: "camion_id", label: "Camión" },
      { key: "chofer_id", label: "Chofer" },
      { key: "tarifa", label: "Tarifa" },
      { key: "kms", label: "Kms" },
      { key: "vencimiento", label: "Vencimiento" },
    ];
    const missing = required
      .filter((f) => !formData[f.key]?.toString().trim())
      .map((f) => f.label);
    if (missing.length) {
      Swal.fire("Error", `Faltan: ${missing.join(", ")}`, "error");
      return;
    }

    try {
      Swal.fire({
        title: initialData ? "Actualizando..." : "Creando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const updated = {
        ...formData,
        total_monto_uy: String(Math.round(totalMontoUY)),
        total_monto_uss: String(Math.round(totalMontoUSS)),
        total_flete: String(totalFlete),
      };
      const fd = new FormData();
      Object.entries(updated).forEach(([k, v]) => fd.append(k, v as any));
      fd.append(
        "oldImages",
        JSON.stringify(
          allImages.filter((i) => i.type === "old").map((i) => i.url)
        )
      );
      allImages
        .filter((i) => i.type === "new" && i.file)
        .forEach((i) => fd.append("archivos", i.file!));

      const resp = initialData ? await updateTrip(fd) : await addTrip(fd);
      Swal.close();
      if (resp.result) {
        Swal.fire("Éxito", "Viaje guardado", "success");
        router.push("/viajes");
      }
    } catch {
      Swal.close();
      Swal.fire("Error", "No se pudo guardar el viaje", "error");
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
                  // Buscamos el remito seleccionado en el arreglo totalRemitos
                  const remitoSeleccionado = totalRemitos.find(
                    (rm: any) => rm.id.toString() === value
                  );
                  setFormData((prev: any) => ({
                    ...prev,
                    remito_id: value,
                    // Si el remito se encontró, actualizamos los campos comunes
                    lugar_carga: remitoSeleccionado
                      ? remitoSeleccionado.lugar_carga
                      : prev.lugar_carga,
                    remitente_name: remitoSeleccionado
                      ? remitoSeleccionado.propietario_name
                      : prev.remitente_name,
                    chofer_id: remitoSeleccionado
                      ? remitoSeleccionado.chofer_id
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
                      : "", // Formatear la fecha si existe
                    // Para destino, se asume que el remito tiene 'destinatario_id' y 'lugar_descarga'
                    destinatario_id: remitoSeleccionado
                      ? String(remitoSeleccionado.destinatario_id)
                      : prev.destinatario_id,
                    lugar_descarga: remitoSeleccionado
                      ? remitoSeleccionado.lugar_descarga
                      : prev.lugar_descarga,
                    camion_id: remitoSeleccionado
                      ? remitoSeleccionado.camion_id
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
                        {" "}
                        {/* Asegurar que sea string */}
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
                      {chofer.nombre} {chofer.apellido}
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
                required
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
                value={formData.tipo_cambio}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="h-px border-0 bg-gray-800" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lavado">Lavado</Label>
              <Input
                id="lavado"
                name="lavado"
                value={formData.lavado}
                onChange={handleChange}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="iva_lavado"
                  checked={formData.iva_lavado}
                  onCheckedChange={(c) =>
                    setFormData((f: any) => ({ ...f, iva_lavado: c }))
                  }
                />
                <Label htmlFor="iva_lavado">IVA?</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="peaje">Peaje</Label>
              <Input
                id="peaje"
                name="peaje"
                value={formData.peaje}
                onChange={handleChange}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="iva_peaje"
                  checked={formData.iva_peaje}
                  onCheckedChange={(c) =>
                    setFormData((f: any) => ({ ...f, iva_peaje: c }))
                  }
                />
                <Label htmlFor="iva_peaje">IVA?</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balanza">Balanza</Label>
              <Input
                id="balanza"
                name="balanza"
                value={formData.balanza}
                onChange={handleChange}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="iva_balanza"
                  checked={formData.iva_balanza}
                  onCheckedChange={(c) =>
                    setFormData((f: any) => ({ ...f, iva_balanza: c }))
                  }
                />
                <Label htmlFor="iva_balanza">IVA?</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sanidad">Sanidad</Label>
              <Input
                id="sanidad"
                name="sanidad"
                value={formData.sanidad}
                onChange={handleChange}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="iva_sanidad"
                  checked={formData.iva_sanidad}
                  onCheckedChange={(c) =>
                    setFormData((f: any) => ({ ...f, iva_sanidad: c }))
                  }
                />
                <Label htmlFor="iva_sanidad">IVA?</Label>
              </div>
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
              <Label htmlFor="kms">Kms</Label>
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
              <Label htmlFor="iv">IVA</Label>
              <Input
                id="iva"
                name="iva"
                type="number"
                value={22}
                onChange={handleChange}
                required
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_flete">Total Monto Flete</Label>
              <Input
                id="total_flete"
                name="total_flete"
                value={Math.round(totalFlete)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_monto_uy">Total Monto UY</Label>
              <Input
                id="total_monto_uy"
                name="total_monto_uy"
                value={Math.round(totalMontoUY)}
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_monto_uss">Total Monto USS</Label>
              <Input
                id="total_monto_uss"
                name="total_monto_uss"
                value={Math.round(totalMontoUSS)}
                disabled={true}
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
              <Label>Archivos (total {allImages.length}/5)</Label>
              <div className="flex flex-wrap gap-2">
                {allImages.map((img) => {
                  let previewSrc = "";
                  let linkToOpen = "";

                  if (img.type === "old") {
                    // Se asume que img.url es el fileId
                    linkToOpen = `https://drive.google.com/file/d/${img.url}/view?usp=sharing`;
                    previewSrc = `https://www.googleapis.com/drive/v3/files/${img.url}?alt=media&key=AIzaSyCbrQgBir-rEUavb6X1Q-SUpuGvIlW7Re8`;
                  } else if (img.type === "new" && img.file) {
                    previewSrc = URL.createObjectURL(img.file);
                    linkToOpen = "#";
                  }

                  return (
                    <div key={img.id} className="relative">
                      <a href={linkToOpen} target="_blank" rel="noreferrer">
                        <img
                          src={previewSrc}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/pdf-icon.jpeg";
                          }}
                        />
                      </a>
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                        onClick={() => handleRemoveImage(img.id)}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="detalle_carga">Detalle de Carga</Label>
            <Textarea
              id="detalle_carga"
              name="detalle_carga"
              value={formData.detalle_carga}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            {initialData ? "Actualizar Viaje" : "Crear Viaje"}
          </Button>
        </form>
      )}
    </>
  );
}
