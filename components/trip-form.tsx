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
  getRemito,
  getTrip,
} from "@/api/RULE_getData";
import { addTrip } from "@/api/RULE_insertData";
import { updateTrip } from "@/api/RULE_updateData";
import { Loading } from "./spinner";

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string; // Si es "old", guarda el fileId (o URL) de Drive
  file?: File; // Si es "new", guarda el File seleccionado
}

interface Remito {
  id: number;
  remito_id: number; // o string, según corresponda
  numero_remito: string;
  // otras propiedades...
}

export function TripForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const router = useRouter();
  const [totalRemitos, setTotalRemitos] = useState<Remito[]>([]);
  const [totalChoferes, setTotalChoferes] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [clients, setTotalClients] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado del formulario. Si initialData viene, se usa para inicializar.
  const [formData, setFormData] = useState(
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
          camion_id: initialData.camion_id ? String(initialData.camion_id)
          : "",
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
          sanidad: "",
          balanza: "",
          inspeccion: "",
          total_monto_uy: "",
          total_monto_uss: "",
          numero_factura: "",
          vencimiento: "",
          cobrado: false,
          referencia_cobro: "",
          estado: "activo",
          iva_status: "",
        }
  );
  useEffect(() => {
    console.log(
      "Clientes disponibles:",
      clients.map((c) => c.id.toString())
    );
  }, [clients]);

  // Para asegurarnos de que los datos se actualicen cuando initialData cambie (en edición)
  useEffect(() => {
    if (initialData) {
      // Si initialData viene envuelto en result, desempácalo
      const data = initialData.result ? initialData.result : initialData;
      setFormData({
        ...data,
        // Estableces los campos que necesitas con la transformación adecuada
        remito_id: initialData.remito_id ? String(initialData.remito_id) : "",
        destinatario_id: initialData.destinatario_id
          ? String(initialData.destinatario_id)
          : "",
        facturar_a: initialData.facturar_a
          ? String(initialData.facturar_a)
          : "",
        fecha_viaje: data.fecha_viaje ? data.fecha_viaje.slice(0, 10) : "",
        camion_id: initialData.camion_id ? String(initialData.camion_id)
        : "",
      });
    }
    console.log("formData actualizado:", formData);
  }, [initialData]);

  // Estado para manejar TODOS los archivos (viejos y nuevos)
  const [allImages, setAllImages] = useState<ImageData[]>([]);

  // Funciones para cargar catálogos
  const getTotalremitos = async () => {
    try {
      setLoading(true);
      const result = await getRemito();
      setTotalRemitos(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getTotalChoferes = async () => {
    try {
      setLoading(true);
      const result = await getChoferes();
      setTotalChoferes(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getTripFunction = async () => {
    try {
      setLoading(true);
      const result = await getTrip();
      setTrips(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getClient = async () => {
    try {
      setLoading(true);
      const result = await getClients();
      const activeClients = result.result.filter(
        (client) => client.soft_delete === false
      );
      setTotalClients(activeClients);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getTotalCamiones = async () => {
    try {
      setLoading(true);
      const result = await getCamiones();
      setCamiones(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  // Cálculo de totales
  const parcialResult =
    Number(formData.kms) * Number(formData.tarifa) +
    (Number(formData.lavado) +
      Number(formData.peaje) +
      Number(formData.sanidad) +
      Number(formData.balanza) +
      Number(formData.inspeccion) +
      Number(formData.precio_flete));

  const totalMontoUY = formData.iva_status
    ? parcialResult * 1.22
    : parcialResult;
  const totalMontoUSS =
    Number(formData.tipo_cambio) > 0
      ? totalMontoUY / Number(formData.tipo_cambio)
      : 0;

  useEffect(() => {
    getTotalremitos();
    getTotalChoferes();
    getTripFunction();
    getClient();
    getTotalCamiones();
  }, []);

  useEffect(() => {
    if (trips.length > 0) {
      const max = trips.reduce((acc, t) => {
        const num = Number(t.numero_viaje);
        return num > acc ? num : acc;
      }, 0);
      const next = (max + 1).toString().padStart(3, "0");
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          numero_viaje: initialData.numero_viaje,
        }));
      } else {
        setFormData((prev) => ({ ...prev, numero_viaje: next }));
      }
    } else {
      setFormData((prev) => ({ ...prev, numero_viaje: "001" }));
    }
  }, [trips]);

  // Si hay datos iniciales (para actualizar), cargamos las imágenes viejas
  useEffect(() => {
    if (initialData) {
      const tempList: ImageData[] = [];
      if (initialData.img_1) {
        tempList.push({ id: "old1", type: "old", url: initialData.img_1 });
      }
      if (initialData.img_2) {
        tempList.push({ id: "old2", type: "old", url: initialData.img_2 });
      }
      if (initialData.img_3) {
        tempList.push({ id: "old3", type: "old", url: initialData.img_3 });
      }
      if (initialData.img_4) {
        tempList.push({ id: "old4", type: "old", url: initialData.img_4 });
      }
      if (initialData.img_5) {
        tempList.push({ id: "old5", type: "old", url: initialData.img_5 });
      }
      setAllImages(tempList);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Manejo de selección de archivos (nuevos)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newItems = selectedFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      type: "new",
      file,
    }));
    const merged = [...allImages, ...newItems];
    if (merged.length > 5) {
      Swal.fire({
        title: "Error",
        text: "Máximo 5 archivos permitidos",
        icon: "error",
        confirmButtonText: "OK",
      });
      e.target.value = "";
      return;
    }
    setAllImages(merged);
    e.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setAllImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Creando Viaje...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const updatedFormData = {
        ...formData,
        total_monto_uy: Math.round(totalMontoUY).toString(),
        total_monto_uss: Math.round(totalMontoUSS).toString(),
      };

      const fd = new FormData();
      for (const key in updatedFormData) {
        fd.append(key, updatedFormData[key]);
      }

      const oldImages = allImages
        .filter((img) => img.type === "old")
        .map((img) => img.url);
      fd.append("oldImages", JSON.stringify(oldImages));

      const newImages = allImages.filter((img) => img.type === "new");
      newImages.forEach((img) => {
        if (img.file) {
          fd.append("archivos", img.file);
        }
      });

      for (let [key, value] of fd.entries()) {
        console.log(key, value);
      }

      let response;
      if (!initialData) {
        response = await addTrip(fd);
      } else {
        response = await updateTrip(fd);
      }

      Swal.close();

      console.log("API response:", response);
      if (response.result === true) {
        setFormData(initialData || {});
        Swal.fire("Éxito", "Viaje guardado exitosamente", "success");
        router.push("/viajes");
      }
    } catch (error: any) {
      Swal.close();
      console.error("Error al guardar viaje:", error);
      Swal.fire("Error", "Hubo un problema al guardar el viaje.", "error");
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
                    inspeccion: remitoSeleccionado
                      ? remitoSeleccionado.inspeccion
                      : prev.inspeccion,
                    fecha_viaje: remitoSeleccionado
                      ? new Date(remitoSeleccionado.fecha).toLocaleDateString(
                          "en-CA"
                        )
                      : "", // Formatear la fecha si existe
                    // Para destino, se asume que el remito tiene 'destinatario_id' y 'lugar_descarga'
                    destinatario_id: remitoSeleccionado
                      ? String(remitoSeleccionado.destinatario_id)
                      : prev.destinatario_id,
                    lugar_descarga: remitoSeleccionado
                      ? remitoSeleccionado.lugar_descarga
                      : prev.lugar_descarga,
                      camion_id: remitoSeleccionado? remitoSeleccionado.camion_id 
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
                      <SelectItem key={rm.id} value={rm.id.toString()}>
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
              <Label htmlFor="sanidad">Sanidad</Label>
              <Input
                id="sanidad"
                name="sanidad"
                value={formData.sanidad}
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
          <div className="flex items-center space-x-2">
            <Switch
              id="iva_status"
              checked={formData.iva_status}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, iva_status: checked }))
              }
            />
            <Label htmlFor="iva_status">Agergar IVA?</Label>
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
