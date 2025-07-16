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

interface CombustibleData {
  fecha: string;
  matricula: string;
  lugar: string;
  litros: string;
  precio: string;
  total: string;
}

export function CombustibleForm({ initialData }: { initialData?: CombustibleData }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<CombustibleData>(() => {
    return initialData || {
      fecha: "",
      matricula: "",
      lugar: "",
      litros: "",
      precio: "",
      total: "",
    };
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        litros: initialData.litros?.toString() || "",
        precio: initialData.precio?.toString() || "",
        total: initialData.total?.toString() || "",
      });
    }
  }, [initialData]);

  // Cálculo simple
  useEffect(() => {
    const litros = Number(formData.litros) || 0;
    const precio = Number(formData.precio) || 0;
    
    if (litros > 0 && precio > 0) {
      const total = litros * precio;
      setFormData((prev) => ({ ...prev, total: String(total) }));
    } else {
      setFormData((prev) => ({ ...prev, total: '' }));
    }
  }, [formData.litros, formData.precio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'litros' || name === 'precio') {
      // Solo permitir números enteros y decimales válidos
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.matricula || !formData.lugar || 
        !formData.litros || !formData.precio) {
      Swal.fire("Error", "Complete todos los campos", "error");
      return;
    }

    const litros = Number(formData.litros);
    const precio = Number(formData.precio);
    
    if (isNaN(litros) || litros <= 0) {
      Swal.fire("Error", "Litros debe ser mayor a 0", "error");
      return;
    }
    
    if (isNaN(precio) || precio <= 0) {
      Swal.fire("Error", "Precio debe ser mayor a 0", "error");
      return;
    }
    
    Swal.fire({
      title: initialData ? "Actualizando..." : "Guardando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const dataToSend = {
        fecha: formData.fecha,
        matricula: formData.matricula,
        lugar: formData.lugar,
        litros: Number(formData.litros),
        precio: Number(formData.precio),
        total: Number(formData.total),
      };

      if (initialData) {
        await putCombustible((initialData as any).id, dataToSend);
      } else {
        await postCombustible(dataToSend);
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
              <Label htmlFor="fecha">Fecha</Label>
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
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="litros">Litros</Label>
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
              <Label htmlFor="precio">Precio</Label>
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
          
          <Button type="submit">
            {initialData ? "Actualizar" : "Guardar"}
          </Button>
        </form>
      )}
    </>
  );
}