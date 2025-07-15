"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import { addCombustible } from "@/api/RULE_insertData";
import { updateCombustible } from "@/api/RULE_updateData";

interface Combustible {
  id?: number;
  fecha: string;
  matricula: string;
  lugar: string;
  litros: string;
  precio: string;
  total: string;
}

export function CombustibleForm({ initialData }: { initialData?: Combustible }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Combustible>(() =>
    initialData
      ? { ...initialData }
      : {
          fecha: "",
          matricula: "",
          lugar: "",
          litros: "",
          precio: "",
          total: "",
        }
  );

  // Recalcula total cada vez que cambian litros o precio
  useEffect(() => {
    const l = parseFloat(formData.litros) || 0;
    const p = parseFloat(formData.precio) || 0;
    setFormData((f) => ({ ...f, total: (p).toFixed(2) }));
  }, [formData.litros, formData.precio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validación rápida
    const missing = [
      { key: "fecha", label: "Fecha" },
      { key: "matricula", label: "Matrícula" },
      { key: "lugar", label: "Lugar" },
      { key: "litros", label: "Litros" },
      { key: "precio", label: "Precio" },
    ]
      .filter((f) => !(formData as any)[f.key]?.toString().trim())
      .map((f) => f.label);

    if (missing.length) {
      Swal.fire("Error", `Faltan campos: ${missing.join(", ")}`, "error");
      return;
    }

    Swal.fire({
      title: initialData ? "Actualizando combustible..." : "Creando combustible...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      let resp;
      if (initialData && initialData.id) {
        resp = await updateCombustible({ ...formData, id: initialData.id });
      } else {
        resp = await addCombustible(formData);
      }
      Swal.close();

      if (resp.result) {
        Swal.fire("Éxito", "Registro guardado exitosamente", "success");
        router.push("/combustibles");
      } else {
        throw new Error("API devolvió éxito=false");
      }
    } catch (err) {
      Swal.close();
      console.error(err);
      Swal.fire("Error", "Hubo un problema al guardar.", "error");
    }

    toast({
      title: "Registro guardado",
      description: "El combustible ha sido guardado correctamente.",
    });
  };

  return (
    <>
      {loading ? (
        <div>
          <Loading /> Cargando...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                type="number"
                step="0.01"
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
                type="number"
                step="0.01"
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
              />
            </div>
          </div>
          <Button type="submit">
            {initialData ? "Actualizar Combustible" : "Crear Combustible"}
          </Button>
        </form>
      )}
    </>
  );
}
