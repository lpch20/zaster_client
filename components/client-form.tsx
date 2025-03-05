"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { updateClient } from "@/api/RULE_updateData";
import Swal from "sweetalert2";
import { addClient } from "@/api/RULE_insertData";
import { Loading } from "./spinner";

export function ClientForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() => {
    // Initialize formData using a function
    console.log("Initializing formData with:", initialData);

    return (
      initialData || {
        // Use initialData if available, otherwise default
        id: "",
        nombre: "",
        direccion: "",
        localidad: "",
        telefono: "",
        mail: "",
        rut: "",
        dicose: "",
        paraje: "",
        otros: "",
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
        nombre: "",
        direccion: "",
        localidad: "",
        telefono: "",
        mail: "",
        rut: "",
        dicose: "",
        paraje: "",
        otros: "",
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
      title: "Creando cliente...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      if (initialData) {
        const resultUpdate = await updateClient(formData);
        Swal.close();
        if (resultUpdate.result === true) {
          Swal.fire("Éxito", "Cliente guardado exitosamente", "success");
        }
      } else {
        const resultInsert = await addClient(formData);
        if (resultInsert.result === true) {
          Swal.fire("Éxito", "Cliente guardado exitosamente", "success");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al guardar el cliente.", "error");
    }
    e.preventDefault();
    console.log(formData);
    // Here you would typically send the data to your backend
    toast({
      title: "Cliente guardado",
      description: "El cliente ha sido guardado exitosamente.",
    });
  };

  return (
    <>
      {loading ? (
        <div>
          Cargando...<Loading></Loading>
        </div>
      ) : (
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
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad</Label>
              <Input
                id="localidad"
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail">Email</Label>
              <Input
                id="mail"
                name="mail"
                type="email"
                value={formData.mail}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dicose">DICOSE</Label>
              <Input
                id="dicose"
                name="dicose"
                value={formData.dicose}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paraje">Paraje</Label>
              <Input
                id="paraje"
                name="paraje"
                value={formData.paraje}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="otros">Otros</Label>
            <Input
              id="otros"
              name="otros"
              value={formData.otros}
              onChange={handleChange}
            />
          </div>
          <Button type="submit">
            {initialData ? "Actualizar Cliente" : "Crear Cliente"}
          </Button>
        </form>
      )}
    </>
  );
}
