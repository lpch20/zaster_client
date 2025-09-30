"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getCamiones } from "@/api/RULE_getData";
import { addMantenimiento } from "@/api/RULE_insertData";

export default function MaintenanceForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [camiones, setCamiones] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ fecha: "", camion_id: "", kms: "", lugar: "", descripcion: "" });

  useEffect(() => {
    (async () => {
      const c = await getCamiones();
      setCamiones(c.result || c || []);
    })();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir la fecha local del input a ISO UTC antes de enviar
      const payload = {
        ...form,
        fecha: form.fecha ? new Date(form.fecha).toISOString() : null,
      };

      await addMantenimiento(payload);
      // Redirigir a la lista principal de mantenimientos
      router.push("/mantenimientos");
    } catch (err) {
      console.error(err);
      alert("Error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Fecha</Label>
        <Input type="datetime-local" name="fecha" value={form.fecha} onChange={handleChange} required />
      </div>
      <div>
        <Label>Camión</Label>
        <select name="camion_id" value={form.camion_id} onChange={handleChange} className="w-full p-2">
          <option value="">Seleccionar</option>
          {camiones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre ? `${c.nombre} (${c.matricula || c.patente || ''})` : (c.modelo ? `${c.modelo} ${c.matricula || ''}` : c.patente || c.id)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>KMs</Label>
        <Input type="number" name="kms" value={form.kms} onChange={handleChange} />
      </div>
      <div>
        <Label>Lugar</Label>
        <Input name="lugar" value={form.lugar} onChange={handleChange} />
      </div>
      <div>
        <Label>Descripción</Label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full p-2" />
      </div>
      <Button type="submit">Guardar</Button>
    </form>
  );
}


