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

// API
import { addRemito } from "@/api/RULE_insertData";
import {
  getCamiones,
  getChoferes,
  getClients,
  getRemitoNumber,
} from "@/api/RULE_getData";
import { updateRemito } from "@/api/RULE_updateData";
import { Loading } from "./spinner";
import { set } from "react-hook-form";

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string; // si es “old”, guardas la URL o el fileId de Drive
  file?: File; // si es “new”, un File seleccionado
}

export function RemittanceForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Catálogos
  const [choferes, setChoferes] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [clients, setClients] = useState([]);

  // Form principal
  const [formData, setFormData] = useState(
    initialData
      ? {
          ...initialData,
          propietario_name: String(initialData.propietario_name ?? ""),
          destinatario_id: String(initialData.destinatario_id ?? ""),
          chofer_id: String(initialData.chofer_id ?? ""),
          pernocte: String(initialData.pernocte ?? "false"),
          fecha: initialData.fecha
            ? new Date(initialData.fecha).toISOString().slice(0, 10)
            : "",
          // Formatear la fecha si existe
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
          hora_carga: "",
          cantidad: "",
          hora_destino: "",
          categoria: "",
          consignatario: "",
          estado_embarcadero: "",
          encierro_previo: "false",
          acceso_agua: "false",
          acceso_sombra: "false",
          mezcla_categoria: "false",
          duracion_carga: "",
          encargado: "",
          recibido_por: "",
          observaciones: "",
          numero_remito: "",
          destinatario_id: "",
          propietario_id: "",
          cuadruplicado: "",
          client_id: "",
          img_1: "",
          img_2: "",
          img_3: "",
          img_4: "",
          img_5: "",
          propietario_name: "",
        }
  );

  // Aquí guardamos TODAS las imágenes (viejas + nuevas)
  const [allImages, setAllImages] = useState<ImageData[]>([]);

  // ──────────────────────────────────────────────────────────────────
  // useEffect: cargar catálogos
  // ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchChoferes = async () => {
      try {
        setLoading(true);
        const result = await getChoferes();
        if (result?.result) {
          setChoferes(result.result);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching choferes:", error);
        setLoading(false);
      }
    };
    const fetchCamiones = async () => {
      try {
        setLoading(true);
        const result = await getCamiones();
        if (result?.result) {
          setCamiones(result.result);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching choferes:", error);
        setLoading(false);
      }
    };

    const fetchClients = async () => {
      try {
        setLoading(true);
        const result = await getClients();
        const activeClients = result.result.filter(
          (client) => client.soft_delete === false
        );
        if (result?.result) {
          setClients(activeClients);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    };

    fetchChoferes();
    fetchClients();
    fetchCamiones();
  }, []);

  // ──────────────────────────────────────────────────────────────────
  // useEffect: si no hay initialData => setear numero_remito nuevo
  // ──────────────────────────────────────────────────────────────────
  const fetchLastRemito = async () => {
    try {
      setLoading(true);
      const lastNumber = await getRemitoNumber();
      const nextNumber = !initialData
        ? Number(lastNumber.result.numero_remito) + 1
        : lastNumber.result.numero_remito;

      setFormData((prev: any) => ({
        ...prev,
        numero_remito: !initialData
          ? String(nextNumber)
          : initialData.numero_remito,
      }));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching last remito:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastRemito();
  }, [initialData]);

  // ──────────────────────────────────────────────────────────────────
  // useEffect: inicializar allImages con las “viejas” si hay initialData
  // ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      const tempList: ImageData[] = [];
      // Suponiendo que initialData.img_1..img_5 guardan un fileId o URL
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

  // ──────────────────────────────────────────────────────────────────
  // Manejadores de cambio en campos
  // ──────────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // ──────────────────────────────────────────────────────────────────
  // Manejo de imágenes
  // ──────────────────────────────────────────────────────────────────
  // 1) Selección de archivos nuevos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    // Creamos objetos { type: "new", file: File }
    const newItems = selectedFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      type: "new",
      file,
    }));

    // Combinamos
    const merged = [...allImages, ...newItems];

    // Validamos
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
    e.target.value = ""; // Opcional: limpia input
  };

  // 2) Eliminar cualquier imagen (vieja o nueva)
  const handleRemoveImage = (id: string) => {
    setAllImages((prev) => prev.filter((img) => img.id !== id));
  };

  // ──────────────────────────────────────────────────────────────────
  // SUBMIT
  // ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Creando Remito...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Construimos un FormData con los demás campos
      const fd = new FormData();

      // Ejemplo: meter campos en FormData
      for (const key in formData) {
        fd.append(key, formData[key]);
      }

      for (let [key, value] of fd.entries()) {
        console.log(key, value);
      }

      // 1) array de imágenes viejas (sus “URL” o “fileId”)
      const oldImages = allImages
        .filter((img) => img.type === "old")
        .map((img) => img.url); // supón que .url es tu DriveID o link
      fd.append("oldImages", JSON.stringify(oldImages));

      // 2) archivos nuevos
      const newImages = allImages.filter((img) => img.type === "new");
      newImages.forEach((img) => {
        if (img.file) {
          fd.append("archivos", img.file);
        }
      });

      // Llamar a la API
      let response;
      if (!initialData) {
        response = await addRemito(fd);
      } else {
        response = await updateRemito(fd);
        console.log(response);
      }

      Swal.close();

      console.log("API response:", response);
      if (response.result === true) {
        // Reiniciar o setear formData
        setFormData(initialData || {});
        setFormKey((prevKey) => prevKey + 1);
        Swal.fire("Éxito", "Remito guardado exitosamente", "success");
        router.push("/remitos");
      }
    } catch (error) {
      console.error("Error al guardar remito:", error); // Imprime el error completo para depuración

      let errorMessage = "Hubo un problema al guardar el remito.";

      // Verifica si el error es una cadena de texto (nuestro mensaje específico)
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        // Para otros errores que sí tengan la propiedad message
        errorMessage = error.message;
      }

      Swal.fire("Error", errorMessage, "error");
    
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // Render
  // ─────
  return (
    <>
      {loading ? (
        <div>
          <h4>Cargando....</h4>
          <Loading></Loading>
        </div>
      ) : (
        <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de Remito */}
            <div className="space-y-2">
              <Label htmlFor="numero_remito">Número de Remito</Label>
              <Input
                id="numero_remito"
                name="numero_remito"
                value={formData.numero_remito}
                onChange={handleChange}
              />
            </div>

            {/* Matrícula */}
            <div className="space-y-2">
              <Label htmlFor="camion_id">Matrícula / camión</Label>
              <Select
                name="camion_id"
                value={formData.camion_id}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, camion_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Camion" />
                </SelectTrigger>
                <SelectContent>
                  {camiones.map((camion: any) => (
                    <SelectItem key={camion.id} value={camion.id.toString()}>
                      {camion.modelo} {camion.matricula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* INSPECCIÓN */}
            <div className="space-y-2">
              <Label htmlFor="inspeccion">Inspección</Label>
              <Input
                id="inspeccion"
                name="inspeccion"
                value={formData.inspeccion}
                onChange={handleChange}
              />
            </div>

            {/* FECHA REMITO */}
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

            {/* CHOFER */}
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
                  <SelectValue placeholder="Seleccionar Chofer" />
                </SelectTrigger>
                <SelectContent>
                  {choferes.map((chofer: any) => (
                    <SelectItem key={chofer.id} value={chofer.id.toString()}>
                      {chofer.nombre} {chofer.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PEAJE */}
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

            {/* LAVADO */}
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

            {/* KILÓMETROS */}
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

            {/* BALANZA */}
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

            {/* PERNOCTE */}
            <div className="space-y-2">
              <Label htmlFor="pernocte">Pernocte</Label>
              <Select
                name="pernocte"
                value={formData.pernocte}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, pernocte: value }))
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

            {/* PROPIETARIO */}
            <div className="space-y-2">
              <Label htmlFor="propietario_name">Propietario</Label>
              <Input
                id="propietario_name"
                name="propietario_name"
                type="text"
                value={formData.propietario_name}
                onChange={handleChange}
              />
            </div>

            {/* NÚMERO DE GUÍA */}
            <div className="space-y-2">
              <Label htmlFor="numero_guia">Número de Guía</Label>
              <Input
                id="numero_guia"
                name="numero_guia"
                value={formData.numero_guia}
                onChange={handleChange}
              />
            </div>

            {/* LUGAR DE CARGA */}
            <div className="space-y-2">
              <Label htmlFor="lugar_carga">Lugar de Carga</Label>
              <Input
                id="lugar_carga"
                name="lugar_carga"
                value={formData.lugar_carga}
                onChange={handleChange}
              />
            </div>

            {/* HORA DE CARGA */}
            <div className="space-y-2">
              <Label htmlFor="hora_carga">Hora de Carga</Label>
              <Input
                id="hora_carga"
                name="hora_carga"
                type="time"
                value={formData.hora_carga}
                onChange={handleChange}
              />
            </div>

            {/* DESTINO */}
            <div className="space-y-2">
              <Label htmlFor="destinatario_id">Destino</Label>
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

            {/* HORA DE DESTINO */}
            <div className="space-y-2">
              <Label htmlFor="hora_destino">Hora de Destino</Label>
              <Input
                id="hora_destino"
                name="hora_destino"
                type="time"
                value={formData.hora_destino}
                onChange={handleChange}
              />
            </div>

            {/* CATEGORÍA */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              />
            </div>

            {/* CANTIDAD */}
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

            {/* CONSIGNATARIO */}
            <div className="space-y-2">
              <Label htmlFor="consignatario">Consignatario</Label>
              <Input
                id="consignatario"
                name="consignatario"
                value={formData.consignatario}
                onChange={handleChange}
              />
            </div>

            {/* CUADRUPLICADO */}
            <div className="space-y-2">
              <Label htmlFor="cuadruplicado">Cuadruplicado</Label>
              <Input
                id="cuadruplicado"
                name="cuadruplicado"
                value={formData.cuadruplicado}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuadruplicado">Encargado</Label>
              <Input
                id="encargado"
                name="encargado"
                value={formData.encargado}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuadruplicado">Recibido por:</Label>
              <Input
                id="recibido_por"
                name="recibido_por"
                value={formData.recibido_por}
                onChange={handleChange}
              />
            </div>

            {/* ───────────────────────────────────────────── */}
            {/* Mostrar imágenes existentes (solo en edición) */}
            <div className="space-y-2">
              <Label>Archivos (total {allImages.length}/5)</Label>
              <div className="flex gap-2 flex-wrap">
                {allImages.map((img) => {
                  let previewSrc = "";
                  let linkToOpen = "";

                  if (img.type === "old") {
                    // Asumes que en BD guardaste el fileId directo
                    // ej: "1khWF4zGHPosSV7fKuo5ClELZdbJE905t"

                    // Link para abrir Drive
                    linkToOpen = `https://drive.google.com/file/d/${img.url}/view?usp=sharing`;

                    // Link para mostrar la imagen en <img>
                    previewSrc = `https://www.googleapis.com/drive/v3/files/${img.url}?alt=media&key=AIzaSyCbrQgBir-rEUavb6X1Q-SUpuGvIlW7Re8`;
                  } else if (img.type === "new" && img.file) {
                    // Preview local para imagen nueva
                    previewSrc = URL.createObjectURL(img.file);
                    // Podrías dejar linkToOpen = "#" o vacío
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
                            e.currentTarget.src = "/pdf-icon.jpeg"; // Ícono en tu carpeta public
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

            {/* Input para cargar archivos */}
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones:</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
            />
          </div>
          {/* BOTÓN SUBMIT */}
          {initialData ? (
            <Button type="submit">Editar Remito</Button>
          ) : (
            <Button type="submit">Guardar Remito</Button>
          )}
        </form>
      )}
    </>
  );
}
