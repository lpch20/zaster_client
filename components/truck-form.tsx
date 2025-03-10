"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Swal from "sweetalert2";
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { addCamion } from "@/api/RULE_insertData"
import { updateCamion } from "@/api/RULE_updateData"

export function TruckForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(() => {
    // Initialize formData using a function
    console.log("Initializing formData with:", initialData);

    return (
      initialData || {
        // Use initialData if available, otherwise default
        id: "",
        identificador: "",
        matricula: "",
        modelo: "",
        matricula_zorra: "",
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
        // Reset to default values if initialData becomes null or undefined
        id: "",
        identificador: "",
        matricula: "",
        modelo: "",
        matricula_zorra: "",
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
      title: "Creando camion...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      if (initialData) {
        const resultUpdate = await updateCamion(formData);
        Swal.close();
        if (resultUpdate.result === true) {
          Swal.fire("Éxito", "camion guardado exitosamente", "success");
        }
      } else {
        const resultInsert = await addCamion(formData);
        if (resultInsert.result === true) {
          Swal.fire("Éxito", "camion guardado exitosamente", "success");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al guardar el camion.", "error");
    }
    e.preventDefault();
    console.log(formData);
    // Here you would typically send the data to your backend
    toast({
      title: "Camion guardado",
      description: "El camion ha sido guardado exitosamente.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="identificador">Identificador</Label>
          <Input
            id="identificador"
            name="identificador"
            value={formData.identificador}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input id="matricula" name="matricula" value={formData.matricula} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="matricula_zorra">Matrícula Zorra</Label>
          <Input
            id="matricula_zorra"
            name="matricula_zorra"
            value={formData.matricula_zorra}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <Button type="submit">Guardar Camión</Button>
    </form>
  )
}

