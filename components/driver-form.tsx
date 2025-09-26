"use client";

import type React from "react";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { updateChofer } from "@/api/RULE_updateData";
import { addChofer } from "@/api/RULE_insertData";
import { useRouter } from 'next/navigation';

export function DriverForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState(() => {
    // Initialize formData using a function
    console.log("Initializing formData with:", initialData);

    return (
      initialData || {
        id: "",
        nombre: "",
        cedula: "",
        precio_km: "",
      }
    );
  });

  useEffect(() => {
    console.log(
      "ClientForm: useEffect - initialData prop updated:",
      initialData
    );
    if (initialData) {
      setFormData(initialData);
    } else {
      console.log(
        "ClientForm: useEffect - initialData is null/undefined, resetting form to defaults."
      );
      setFormData({
        id: "",
        nombre: "",
        cedula: "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: "Guardando chofer...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Normalizar payload: asegurarnos que precio_km llegue como número o undefined
    const payload: any = {
      ...formData,
      precio_km:
        formData.precio_km !== undefined && formData.precio_km !== ""
          ? Number(formData.precio_km)
          : 0,
    };

    try {
      if (initialData) {
        const resultUpdate = await updateChofer(payload);
        Swal.close();
        if (resultUpdate.result === true) {
          Swal.fire("Éxito", "Chofer actualizado", "success").then(() => router.push("/choferes"));
        } else {
          Swal.fire("Error", "No se pudo actualizar el chofer", "error");
        }
      } else {
        const resultInsert = await addChofer(payload);
        Swal.close();
        if (resultInsert.result === true) {
          Swal.fire("Éxito", "Chofer creado", "success").then(() => router.push("/choferes"));
        } else {
          Swal.fire("Error", "No se pudo crear el chofer", "error");
        }
      }
    } catch (error) {
      Swal.close();
      console.error("Error guardando chofer:", error);
      Swal.fire("Error", "Hubo un problema al guardar el chofer.", "error");
    }

    console.log("Payload chofer:", payload);
    toast({
      title: "Chofer guardado",
      description: "El chofer ha sido guardado exitosamente.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cedula">Cédula</Label>
          <Input
            id="cedula"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precio_km">Precio por KM</Label>
          <Input
            id="precio_km"
            name="precio_km"
            type="number"
            step="0.01"
            value={formData.precio_km ?? ""}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
      </div>
      <Button type="submit">Guardar Chofer</Button>
    </form>
  );
}
