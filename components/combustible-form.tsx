"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import { postCombustible, putCombustible } from "@/api/RULE_getData";

// Función auxiliar para formatear fechas
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  console.log("Formatting date:", dateString);
  
  // Si la fecha viene como "2024-01-15" ya está en el formato correcto
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    console.log("Date already in correct format:", dateString);
    return dateString;
  }
  
  // Si viene como "2024-01-15T00:00:00.000Z" o similar, extraer solo la fecha
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.log("Invalid date:", dateString);
    return "";
  }
  
  const formatted = date.toISOString().split('T')[0];
  console.log("Date formatted from", dateString, "to", formatted);
  return formatted;
};

interface CombustibleData {
  id?: string;
  fecha: string;
  matricula: string;
  lugar: string;
  litros: string;
  precio: string;
  total: string;
  img_1?: string;
  img_2?: string;
  img_3?: string;
  img_4?: string;
  img_5?: string;
}

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string;
  file?: File;
}

export function CombustibleForm({ initialData }: { initialData?: CombustibleData }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [allImages, setAllImages] = useState<ImageData[]>([]);

  const [formData, setFormData] = useState<CombustibleData>(() => {
    console.log("Initializing formData with:", initialData);
    const initialFormData = initialData ? {
      ...initialData,
      fecha: formatDateForInput(initialData.fecha) || "",
      litros: initialData.litros?.toString() || "",
      precio: initialData.precio?.toString() || "",
      total: initialData.total?.toString() || "",
    } : {
      fecha: "",
      matricula: "",
      lugar: "",
      litros: "",
      precio: "",
      total: "",
    };
    console.log("Initial form data set to:", initialFormData);
    return initialFormData;
  });

  useEffect(() => {
    console.log("CombustibleForm: useEffect - initialData prop updated:", initialData);
    if (initialData) {
      const newFormData = {
        ...initialData,
        fecha: formatDateForInput(initialData.fecha) || "",
        litros: initialData.litros?.toString() || "",
        precio: initialData.precio?.toString() || "",
        total: initialData.total?.toString() || "",
      };
      console.log("Setting new form data:", newFormData);
      setFormData(newFormData);
    } else {
      console.log("CombustibleForm: useEffect - initialData is null/undefined, resetting form to defaults.");
      setFormData({
        fecha: "",
        matricula: "",
        lugar: "",
        litros: "",
        precio: "",
        total: "",
      });
    }
  }, [initialData]);

  // Cargar imágenes existentes
  useEffect(() => {
    console.log("Loading existing images for:", initialData);
    if (initialData) {
      const temp: ImageData[] = [];
      [1, 2, 3, 4, 5].forEach((n) => {
        const key = `img_${n}` as keyof typeof initialData;
        if (initialData[key]) {
          temp.push({ id: `old${n}`, type: "old", url: initialData[key] });
        }
      });
      console.log("Setting images:", temp);
      setAllImages(temp);
    } else {
      console.log("No initialData, clearing images");
      setAllImages([]);
    }
  }, [initialData]);

  // Cálculo automático del total - Solo si no estamos cargando datos iniciales
  useEffect(() => {
    // Solo calcular si no es inicialización con datos existentes
    if (!initialData || (formData.litros && formData.precio)) {
      const litros = Number(formData.litros) || 0;
      const precio = Number(formData.precio) || 0;
      
      if (litros > 0 && precio > 0) {
        const total = litros * precio;
        setFormData((prev) => ({ ...prev, total: String(total) }));
      } else if (!initialData) {
        // Solo limpiar el total si no estamos cargando datos iniciales
        setFormData((prev) => ({ ...prev, total: '' }));
      }
    }
  }, [formData.litros, formData.precio, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    
    if (name === 'litros' || name === 'precio') {
      // Solo permitir números enteros y decimales válidos
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const items = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      type: "new" as const,
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

  const validateRequiredFields = () => {
    if (!formData.fecha || !formData.matricula || !formData.lugar || 
        !formData.litros || !formData.precio) {
      Swal.fire("Error", "Complete todos los campos obligatorios", "error");
      return false;
    }

    const litros = Number(formData.litros);
    const precio = Number(formData.precio);
    
    if (isNaN(litros) || litros <= 0) {
      Swal.fire("Error", "Litros debe ser mayor a 0", "error");
      return false;
    }
    
    if (isNaN(precio) || precio <= 0) {
      Swal.fire("Error", "Precio debe ser mayor a 0", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRequiredFields()) {
      return;
    }
    
    Swal.fire({
      title: initialData ? "Actualizando..." : "Guardando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const fd = new FormData();
      
      // Agregar datos del formulario
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== 'id' && v !== null && v !== undefined) {
          fd.append(k, v.toString());
        }
      });

      // Agregar imágenes viejas
      fd.append(
        "oldImages",
        JSON.stringify(allImages.filter((i) => i.type === "old").map((i) => i.url))
      );

      // Agregar archivos nuevos
      allImages
        .filter((i) => i.type === "new" && i.file)
        .forEach((i) => fd.append("archivos", i.file!));

      let response;
      if (initialData) {
        response = await putCombustible(initialData.id!, fd);
      } else {
        response = await postCombustible(fd);
      }
      
      Swal.close();
      Swal.fire("Éxito", "Guardado correctamente", "success");
      router.push("/combustible");
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Error al guardar", "error");
      console.error(error);
    }
  };

  // Debug del estado actual
  useEffect(() => {
    console.log("Current formData state:", formData);
  }, [formData]);

  return (
    <>
      {loading ? (
        <div>
          <Loading /> Cargando...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
              {/* Debug info para la fecha */}
              {/* <p className="text-xs text-gray-500">
                Debug - Fecha actual: {formData.fecha}
              </p> */}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula *</Label>
              <Input
                id="matricula"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar *</Label>
              <Input
                id="lugar"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="litros">Litros *</Label>
              <Input
                id="litros"
                name="litros"
                type="text"
                value={formData.litros}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="precio">Precio *</Label>
              <Input
                id="precio"
                name="precio"
                type="text"
                value={formData.precio}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total">Total</Label>
              <Input
                id="total"
                name="total"
                value={formData.total}
                disabled
                className="bg-gray-100"
              />
            </div>
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
          
          <div className="flex gap-4">
            <Button type="submit">
              {initialData ? "Actualizar" : "Guardar"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push("/combustible")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </>
  );
}