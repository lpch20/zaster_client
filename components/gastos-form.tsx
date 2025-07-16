"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import { postGasto, putGasto } from "@/api/RULE_getData";

interface GastoData {
  fecha: string;
  matricula: string;
  categoria: string;
  proveedor: string;
  monto_pesos: number;
  monto_usd: number;
  forma_pago: string;
  descripcion: string;
}

export function GastosForm({ initialData }: { initialData?: GastoData }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ CATEGORÍAS SIN COMBUSTIBLE
  const categorias = [
    "Mantenimiento",
    "Repuestos",
    "Neumáticos",
    "Seguros",
    "Peajes",
    "Lavado",
    "Documentación",
    "Multas",
    "Otros"
  ];

  // ✅ FORMAS DE PAGO CORREGIDAS
  const formasPago = [
    "EFECTIVO",
    "TRANSFERENCIA",
    "CREDITO",
    "TARJETA_DEBITO",
    "TARJETA_CREDITO"
  ];

  const [formData, setFormData] = useState<GastoData>(() => {
    return initialData || {
      fecha: "",
      matricula: "",
      categoria: "",
      proveedor: "",
      monto_pesos: 0,
      monto_usd: 0,
      forma_pago: "",
      descripcion: "",
    };
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'monto_pesos' || name === 'monto_usd') {
      // Permitir string vacío o números válidos
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) || 0 }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.fecha || !formData.matricula || !formData.categoria || !formData.proveedor) {
      Swal.fire("Error", "Complete los campos obligatorios", "error");
      return;
    }

    if (formData.monto_pesos <= 0 && formData.monto_usd <= 0) {
      Swal.fire("Error", "Debe ingresar al menos un monto", "error");
      return;
    }
    
    Swal.fire({
      title: initialData ? "Actualizando..." : "Guardando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      if (initialData) {
        await putGasto((initialData as any).id, formData);
      } else {
        await postGasto(formData);
      }
      
      Swal.close();
      Swal.fire("Éxito", "Guardado correctamente", "success");
      router.push("/gastos");
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
              <Label htmlFor="categoria">Categoría</Label>
              <Select 
                name="categoria"
                value={formData.categoria}
                onValueChange={(value) => handleSelectChange("categoria", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monto_pesos">Monto $ (Pesos)</Label>
              <Input
                id="monto_pesos"
                name="monto_pesos"
                type="text"
                value={formData.monto_pesos === 0 ? '' : formData.monto_pesos}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monto_usd">Monto USD</Label>
              <Input
                id="monto_usd"
                name="monto_usd"
                type="text"
                value={formData.monto_usd === 0 ? '' : formData.monto_usd}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="forma_pago">Forma de Pago</Label>
              <Select 
                name="forma_pago"
                value={formData.forma_pago}
                onValueChange={(value) => handleSelectChange("forma_pago", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar forma de pago" />
                </SelectTrigger>
                <SelectContent>
                  {formasPago.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <Button type="submit">
            {initialData ? "Actualizar" : "Guardar"}
          </Button>
        </form>
      )}
    </>
  );
}