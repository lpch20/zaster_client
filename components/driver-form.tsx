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

export function DriverForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(() => {
    // Initialize formData using a function
    console.log("Initializing formData with:", initialData);

    return (
      initialData || {
        id: "",
        nombre: "",
        cedula: "",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: "Creando chofer...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      if (initialData) {
        const resultUpdate = await updateChofer(formData);
        Swal.close();
        if (resultUpdate.result === true) {
          Swal.fire("Éxito", "chofer guardado exitosamente", "success");
        }
      } else {
        const resultInsert = await addChofer(formData);
        if (resultInsert.result === true) {
          Swal.fire("Éxito", "chofer guardado exitosamente", "success");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al guardar el chofer.", "error");
    }
    e.preventDefault();
    console.log(formData);
    // Here you would typically send the data to your backend
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
      </div>
      <Button type="submit">Guardar Chofer</Button>
    </form>
  );
}
