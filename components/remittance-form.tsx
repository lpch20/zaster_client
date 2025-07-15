"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { addRemito } from "@/api/RULE_insertData";
import {
  getCamiones,
  getChoferes,
  getClients,
  getRemitoNumber,
} from "@/api/RULE_getData";
import { updateRemito } from "@/api/RULE_updateData";
import { Loading } from "./spinner";

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string;
  file?: File;
}

export function RemittanceForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [choferes, setChoferes] = useState<any[]>([]);
  const [camiones, setCamiones] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [allImages, setAllImages] = useState<ImageData[]>([]);

  const [formData, setFormData] = useState<any>(
    initialData
      ? {
          ...initialData,
          camion_id: String(initialData.camion_id ?? ""),
          inspeccion: initialData.inspeccion ?? "",
          fecha: initialData.fecha
            ? new Date(initialData.fecha).toISOString().slice(0, 10)
            : "",
          chofer_id: String(initialData.chofer_id ?? ""),
          peaje: initialData.peaje ?? "",
          lavado: initialData.lavado ?? "",
          kilometros: initialData.kilometros ?? "",
          balanza: initialData.balanza ?? "",
          pernocte: String(initialData.pernocte ?? "false"),
          numero_guia: initialData.numero_guia ?? "",
          lugar_carga: initialData.lugar_carga ?? "",
          cantidad: initialData.cantidad ?? "",
          categoria: initialData.categoria ?? "",
          estado_embarcadero: initialData.estado_embarcadero ?? "",
          encierro_previo: String(initialData.encierro_previo ?? "false"),
          acceso_agua: String(initialData.acceso_agua ?? "false"),
          acceso_sombra: String(initialData.acceso_sombra ?? "false"),
          mezcla_categoria: String(initialData.mezcla_categoria ?? "false"),
          duracion_carga: initialData.duracion_carga ?? "",
          observaciones: initialData.observaciones ?? "",
          numero_remito: initialData.numero_remito ?? "",
          destinatario_id: String(initialData.destinatario_id ?? ""),
          propietario_id: String(initialData.propietario_id ?? ""),
        }
      : {
          camion_id: "",
          inspeccion: "",
          fecha: "",
          chofer_id: "",
          peaje: "",
          lavado: "",
          kilometros: "",
          balanza: "",
          pernocte: "false",
          numero_guia: "",
          lugar_carga: "",
          cantidad: "",
          categoria: "",
          estado_embarcadero: "",
          encierro_previo: "false",
          acceso_agua: "false",
          acceso_sombra: "false",
          mezcla_categoria: "false",
          duracion_carga: "",
          observaciones: "",
          numero_remito: "",
          destinatario_id: "",
          propietario_id: "",
        }
  );

  // cargar catálogos
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [cho, cam, cli] = await Promise.all([
        getChoferes(),
        getCamiones(),
        getClients(),
      ]);
      setChoferes(cho.result || []);
      setCamiones(cam.result || []);
      setClients((cli.result || []).filter((c: any) => !c.soft_delete));
      setLoading(false);
    };
    fetch();
  }, []);

  // número de remito
  useEffect(() => {
    const fetchLast = async () => {
      setLoading(true);
      const last = await getRemitoNumber();
      const next = initialData
        ? last.result.numero_remito
        : String(Number(last.result.numero_remito) + 1);
      setFormData((f: any) => ({ ...f, numero_remito: next }));
      setLoading(false);
    };
    fetchLast();
  }, [initialData]);

  // imágenes viejas
  useEffect(() => {
    if (initialData) {
      const temp: ImageData[] = [];
      [1, 2, 3, 4, 5].forEach((n) => {
        const key = `img_${n}` as keyof typeof initialData;
        if (initialData[key]) {
          temp.push({ id: `old${n}`, type: "old", url: initialData[key] });
        }
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
    setAllImages((p) => [...p, ...items]);
    e.target.value = "";
  };
  const handleRemoveImage = (id: string) =>
    setAllImages((p) => p.filter((i) => i.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: initialData ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v as any));
    fd.append(
      "oldImages",
      JSON.stringify(allImages.filter((i) => i.type === "old").map((i) => i.url))
    );
    allImages
      .filter((i) => i.type === "new" && i.file)
      .forEach((i) => fd.append("archivos", i.file!));

    const resp = initialData ? await updateRemito(fd) : await addRemito(fd);
    Swal.close();
    if (resp.result) {
      Swal.fire("Éxito", "Remito guardado", "success");
      setFormKey((k) => k + 1);
      router.push("/remitos");
    } else {
      Swal.fire("Error", "No se pudo guardar el remito", "error");
    }
  };

  if (loading) return <div><Loading /></div>;

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_remito">Número de Remito</Label>
          <Input
            id="numero_remito"
            name="numero_remito"
            value={formData.numero_remito}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="camion_id">Camión</Label>
          <Select
            name="camion_id"
            value={formData.camion_id}
            onValueChange={(v) =>
              setFormData((f: any) => ({ ...f, camion_id: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Camión" />
            </SelectTrigger>
            <SelectContent>
              {camiones.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.modelo} {c.matricula}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label htmlFor="fecha">Fecha Remito</Label>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chofer_id">Chofer</Label>
          <Select
            name="chofer_id"
            value={formData.chofer_id}
            onValueChange={(v) =>
              setFormData((f: any) => ({ ...f, chofer_id: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Chofer" />
            </SelectTrigger>
            <SelectContent>
              {choferes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre} {c.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="peaje">Peaje</Label>
          <Input
            id="peaje"
            name="peaje"
            type="number"
            value={formData.peaje}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lavado">Lavado</Label>
          <Input
            id="lavado"
            name="lavado"
            type="number"
            value={formData.lavado}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kilometros">Kilómetros</Label>
          <Input
            id="kilometros"
            name="kilometros"
            type="number"
            value={formData.kilometros}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanza">Balanza</Label>
          <Input
            id="balanza"
            name="balanza"
            type="number"
            value={formData.balanza}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pernocte">Pernocte</Label>
          <Select
            name="pernocte"
            value={formData.pernocte}
            onValueChange={(v) =>
              setFormData((f: any) => ({ ...f, pernocte: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_guia">Número de Guía</Label>
          <Input
            id="numero_guia"
            name="numero_guia"
            value={formData.numero_guia}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lugar_carga">Lugar de Carga</Label>
          <Input
            id="lugar_carga"
            name="lugar_carga"
            value={formData.lugar_carga}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="number"
            value={formData.cantidad}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Input
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado_embarcadero">Estado Embarcadero</Label>
          <Input
            id="estado_embarcadero"
            name="estado_embarcadero"
            value={formData.estado_embarcadero}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Archivos (total {allImages.length}/5)</Label>
          <div className="flex flex-wrap gap-2">
            {allImages.map((img) => {
              let src = "";
              let link = "";
              if (img.type === "old") {
                link = `https://drive.google.com/file/d/${img.url}/view?usp=sharing`;
                src = `https://www.googleapis.com/drive/v3/files/${img.url}?alt=media&key=API_KEY`;
              } else {
                src = URL.createObjectURL(img.file!);
                link = "#";
              }
              return (
                <div key={img.id} className="relative">
                  <a href={link} target="_blank" rel="noreferrer">
                    <img
                      src={src}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => (e.currentTarget.src = "/pdf-icon.jpeg")}
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
          <Input type="file" multiple onChange={handleFileChange} />
        </div>
      </div>

      <Button type="submit">
        {initialData ? "Editar Remito" : "Guardar Remito"}
      </Button>
    </form>
  );
}
