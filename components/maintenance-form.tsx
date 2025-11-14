"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getCamiones } from "@/api/RULE_getData";
import { addMantenimiento } from "@/api/RULE_insertData";
import { updateMantenimiento } from "@/api/RULE_updateData";
import Swal from "sweetalert2";
import { parseDateForInput, convertUTCToUruguayTime } from "@/lib/utils";

export default function MaintenanceForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [camiones, setCamiones] = useState<any[]>([]);
  const [form, setForm] = useState<{[key:string]: any}>({ fecha: "", camion_id: "", kms: "", lugar: "", descripcion: "" });

  useEffect(() => {
    (async () => {
      const c = await getCamiones();
      setCamiones(c.result || c || []);
    })();
  }, []);

  // Si vienen datos iniciales (editar), cargar en el formulario
  useEffect(() => {
    if (!initialData) return;
    try {
      // ✅ Formatear fecha a date (YYYY-MM-DD) en zona Uruguay
      let fechaVal = "";
      if (initialData.fecha) {
        const uruguayDate = convertUTCToUruguayTime(initialData.fecha);
        if (!isNaN(uruguayDate.getTime())) {
          const pad = (n: number) => String(n).padStart(2, "0");
          fechaVal = `${uruguayDate.getFullYear()}-${pad(uruguayDate.getMonth() + 1)}-${pad(uruguayDate.getDate())}`;
        }
      }

      setForm((prev: any) => ({
        ...prev,
        fecha: fechaVal,
        camion_id: initialData.camion_id?.toString() || initialData.camion_id || "",
        kms: initialData.kms?.toString() || "",
        lugar: initialData.lugar || "",
        descripcion: initialData.descripcion || "",
      }));
    } catch (e) {
      console.error('Error al cargar initialData en MaintenanceForm', e);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // ✅ Interpretar el valor del input como fecha en Uruguay y convertir a UTC ISO (sin hora)
      let fechaISO = null;
      if (form.fecha) {
        // form.fecha tiene formato "YYYY-MM-DD"
        const dateParts = String(form.fecha).split("-").map((v) => Number(v));
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        // ✅ Crear fecha a medianoche en Uruguay (UTC-3), luego convertir a UTC
        // Uruguay is UTC-3 -> medianoche en Uruguay = 03:00 UTC del mismo día
        const utcDate = new Date(Date.UTC(year, month - 1, day, 3, 0, 0));
        fechaISO = utcDate.toISOString();
      }

      const payload = {
        ...form,
        fecha: fechaISO,
      };

      if (initialData && initialData.id) {
        // Update existing
        await updateMantenimiento(Number(initialData.id), payload);
        Swal.fire("Éxito", "Mantenimiento actualizado", "success");
      } else {
        // Create new
        await addMantenimiento(payload);
        Swal.fire("Éxito", "Mantenimiento creado", "success");
      }

      // Redirigir a la lista principal de mantenimientos
      router.push("/mantenimientos");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Hubo un problema al guardar", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Fecha</Label>
        <Input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
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


