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

  const categorias = [
    "Mantenimiento",
    "Combustible",
    "Repuestos",
    "Neumáticos",
    "Seguros",
    "Peajes",
    "Lavado",
    "Documentación",
    "Multas",
    "Otros"
  ];

  const formasPago = [
    "Efectivo",
    "Transferencia",
    "Cheque",
    "Tarjeta de Crédito",
    "Tarjeta de Débito"
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
    const processedValue = name === 'monto_pesos' || name === 'monto_usd' 
      ? parseFloat(value) || 0 
      : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    Swal.fire({
      title: initialData ? "Actualizando gasto..." : "Creando registro de gasto...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (initialData) {
        // Actualizar gasto existente
        const result = await putGasto((initialData as any).id, formData);
        Swal.close();
        Swal.fire("Éxito", "Gasto actualizado exitosamente", "success");
      } else {
        // Crear nuevo gasto
        const result = await postGasto(formData);
        Swal.close();
        Swal.fire("Éxito", "Gasto registrado exitosamente", "success");
      }
      router.push("/gastos");
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Hubo un problema al guardar el gasto.", "error");
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
                placeholder="Nombre del proveedor"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monto_pesos">Monto $ (Pesos)</Label>
              <Input
                id="monto_pesos"
                name="monto_pesos"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto_pesos}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monto_usd">Monto USD</Label>
              <Input
                id="monto_usd"
                name="monto_usd"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto_usd}
                onChange={handleChange}
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
                      {forma}
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
              placeholder="Descripción del gasto"
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full">
            {initialData ? "Actualizar Gasto" : "Registrar Gasto"}
          </Button>
        </form>
      )}
    </>
  );
}