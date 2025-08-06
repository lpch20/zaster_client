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
import { Loading } from "./spinner";

interface CubiertaData {
  id?: number;
  fecha: string;
  camion_id?: string;
  matricula: string;
  numero_cubierta: string;
  km_puesta: number;
  km_sacada?: number;
  ubicacion: string;
  marca: string;
  tipo: string;
  comentario?: string;
}

export function CubiertasForm({ initialData }: { initialData?: CubiertaData }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [camiones, setCamiones] = useState<any[]>([]);

  const [formData, setFormData] = useState<CubiertaData>(
    initialData
      ? {
          ...initialData,
          fecha: initialData.fecha
            ? (() => {
                try {
                  const date = new Date(initialData.fecha);
                  if (isNaN(date.getTime())) {
                    return "";
                  }
                  return date.toISOString().slice(0, 10);
                } catch (error) {
                  return "";
                }
              })()
            : "",
          camion_id: initialData.camion_id ?? "",
          matricula: initialData.matricula ?? "",
          numero_cubierta: initialData.numero_cubierta ?? "",
          km_puesta: initialData.km_puesta ?? 0,
          km_sacada: initialData.km_sacada ?? 0,
          ubicacion: initialData.ubicacion ?? "",
          marca: initialData.marca ?? "",
          tipo: initialData.tipo ?? "",
          comentario: initialData.comentario ?? "",
        }
      : {
          fecha: "",
          camion_id: "",
          matricula: "",
          numero_cubierta: "",
          km_puesta: 0,
          km_sacada: 0,
          ubicacion: "",
          marca: "",
          tipo: "",
          comentario: "",
        }
  );

  // Establecer camion_id cuando se edita una cubierta existente
  useEffect(() => {
    if (initialData && initialData.matricula && camiones.length > 0) {
      const camionEncontrado = camiones.find(c => c.matricula === initialData.matricula);
      if (camionEncontrado) {
        setFormData(prev => ({
          ...prev,
          camion_id: String(camionEncontrado.id)
        }));
      }
    }
  }, [initialData, camiones]);

  useEffect(() => {
    const fetchCamiones = async () => {
      try {
        const { getCamiones } = await import('@/api/RULE_getData');
        const result = await getCamiones();
        setCamiones(result.result || []);
      } catch (error) {
        console.error('Error fetching camiones:', error);
      }
    };
    fetchCamiones();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((f: any) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.camion_id || !formData.numero_cubierta) {
      toast({ 
        title: "Error", 
        description: "Los campos fecha, camión y número de cubierta son obligatorios" 
      });
      return;
    }

    Swal.fire({
      title: initialData ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      if (initialData) {
        // Actualizar cubierta existente
        const { updateCubierta } = await import('@/api/RULE_updateData');
        const result = await updateCubierta(formData);
        if (result.result) {
          Swal.fire("Éxito", "Cubierta actualizada", "success");
          router.push("/cubiertas");
        } else {
          Swal.fire("Error", "No se pudo actualizar la cubierta", "error");
        }
      } else {
        // Crear nueva cubierta
        const { addCubierta } = await import('@/api/RULE_insertData');
        const result = await addCubierta(formData);
        if (result.result) {
          Swal.fire("Éxito", "Cubierta creada", "success");
          router.push("/cubiertas");
        } else {
          Swal.fire("Error", "No se pudo crear la cubierta", "error");
        }
      }
      Swal.close();
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Error de conexión", "error");
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="camion_id">Camión *</Label>
          <Select
            value={formData.camion_id || ""}
            onValueChange={(value) => {
              const camionSeleccionado = camiones.find(c => c.id == value);
              setFormData(prev => ({ 
                ...prev, 
                camion_id: value,
                matricula: camionSeleccionado?.matricula || ""
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Camión" />
            </SelectTrigger>
            <SelectContent>
              {camiones.map((camion) => (
                <SelectItem key={camion.id} value={String(camion.id)}>
                  {camion.matricula} - {camion.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.matricula && (
            <p className="text-sm text-gray-500">
              Matrícula: <strong>{formData.matricula}</strong>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_cubierta">Número de Cubierta *</Label>
          <Input
            id="numero_cubierta"
            name="numero_cubierta"
            value={formData.numero_cubierta}
            onChange={handleChange}
            required
            placeholder="Ej: 12345"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="km_puesta">KM Puesta *</Label>
          <Input
            id="km_puesta"
            name="km_puesta"
            type="number"
            value={formData.km_puesta}
            onChange={handleChange}
            required
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="km_sacada">KM Sacada</Label>
          <Input
            id="km_sacada"
            name="km_sacada"
            type="number"
            value={formData.km_sacada}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ubicacion">Ubicación *</Label>
          <Select
            value={formData.ubicacion}
            onValueChange={(value) => setFormData(prev => ({ ...prev, ubicacion: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAMION">CAMION</SelectItem>
              <SelectItem value="ZORRA">ZORRA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            required
            placeholder="Ej: Michelin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo *</Label>
          <Input
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            placeholder="Ej: Radial"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="comentario">Comentario</Label>
          <Textarea
            id="comentario"
            name="comentario"
            value={formData.comentario}
            onChange={handleChange}
            placeholder="Comentarios adicionales..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {initialData ? "Actualizar" : "Crear"} Cubierta
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/cubiertas")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
} 