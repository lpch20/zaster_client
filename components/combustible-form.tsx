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
  litros: number;
  precio: number;
  total: number;
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
      litros: 0,
      precio: 0,
      total: 0,
    };
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Calcular total automáticamente cuando cambian litros o precio
  useEffect(() => {
    const total = formData.litros * formData.precio;
    setFormData(prev => ({ ...prev, total }));
  }, [formData.litros, formData.precio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'litros' || name === 'precio' || name === 'total' 
      ? parseFloat(value) || 0 
      : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    Swal.fire({
      title: initialData ? "Actualizando combustible..." : "Creando registro de combustible...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (initialData) {
        // Actualizar combustible existente
        await putCombustible((initialData as any).id, formData);
        Swal.close();
        Swal.fire("Éxito", "Combustible actualizado exitosamente", "success");
      } else {
        // Crear nuevo combustible
        await postCombustible(formData);
        Swal.close();
        Swal.fire("Éxito", "Combustible registrado exitosamente", "success");
      }
      router.push("/combustible");
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Hubo un problema al guardar el combustible.", "error");
      console.error("Error:", error);
    }
  };

  return (
    <>
      {loading ? (
        <div>
          Cargando...<Loading />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="ABC-1234"
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
                placeholder="Estación de servicio"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="litros">Litros</Label>
              <Input
                id="litros"
                name="litros"
                type="number"
                step="0.01"
                min="0"
                value={formData.litros}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="precio">Precio por Litro</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total">Total (Litros × Precio)</Label>
              <Input
                id="total"
                name="total"
                type="number"
                step="0.01"
                value={formData.total}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            {initialData ? "Actualizar Combustible" : "Registrar Combustible"}
          </Button>
        </form>
      )}
    </>
  );
}