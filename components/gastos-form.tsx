"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import { postGasto, putGasto } from "@/api/RULE_getData";



interface Gasto {
  id?: number;
  fecha: string;
  matricula: string;
  categoria: string;
  proveedor: string;
  monto: string;
  montoUsd: string;
  formaPago: string;
  descripcion: string;
}

export function GastosForm({ initialData }: { initialData?: Gasto }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Gasto>(() =>
    initialData
      ? { ...initialData }
      : {
          fecha: "",
          matricula: "",
          categoria: "",
          proveedor: "",
          monto: "",
          montoUsd: "",
          formaPago: "",
          descripcion: "",
        }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validación rápida
    const missing = [
      { key: "fecha", label: "Fecha" },
      { key: "matricula", label: "Matrícula" },
      { key: "categoria", label: "Categoría" },
      { key: "proveedor", label: "Proveedor" },
      { key: "monto", label: "Monto $" },
      { key: "formaPago", label: "Forma de pago" },
    ]
      .filter((f) => !(formData as any)[f.key]?.toString().trim())
      .map((f) => f.label);

    if (missing.length) {
      Swal.fire("Error", `Faltan campos: ${missing.join(", ")}`, "error");
      return;
    }

    Swal.fire({
      title: initialData ? "Actualizando gasto..." : "Creando gasto...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      let resp;
      if (initialData && initialData.id) {
        resp = await putGasto({ ...formData, id: initialData.id });
      } else {
        resp = await postGasto(formData);
      }
      Swal.close();

      if (resp.result) {
        Swal.fire("Éxito", "Registro guardado exitosamente", "success");
        router.push("/gastos");
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
      description: "El gasto ha sido guardado correctamente.",
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
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
              />
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
              <Label htmlFor="monto">Monto $</Label>
              <Input
                id="monto"
                name="monto"
                type="number"
                step="0.01"
                value={formData.monto}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montoUsd">Monto USD</Label>
              <Input
                id="montoUsd"
                name="montoUsd"
                type="number"
                step="0.01"
                value={formData.montoUsd}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formaPago">Forma de pago</Label>
              <Input
                id="formaPago"
                name="formaPago"
                value={formData.formaPago}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>
          </div>
          <Button type="submit">
            {initialData ? "Actualizar Gasto" : "Crear Gasto"}
          </Button>
        </form>
      )}
    </>
  );
}
