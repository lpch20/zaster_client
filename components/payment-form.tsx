"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getChoferes,
  getRemitoNotUploadInTrip,
  getRemitoById,
  getLiquidacionConfig,
} from "@/api/RULE_getData";
import { useRouter } from "next/navigation";
import { updateLiquidacion } from "@/api/RULE_updateData";
import { addLiquidacion } from "@/api/RULE_insertData";

export function PaymentForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { toast } = useToast();

  const [remitos, setRemitos] = useState<any[]>([]);
  const [totalChoferes, setTotalChoferes] = useState<any[]>([]);
  const [liquidacionConfig, setLiquidacionConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>(() => {
    return initialData
      ? {
          ...initialData,
          remito_id: initialData.remito_id?.toString() || "",
          chofer_id: initialData.chofer_id?.toString() || "",
        }
      : {
          remito_id: "",
          kms_viaje: "",
          minimo_kms_liquidar: 100,
          limite_premio: "",
          precio_km: "",
          pernocte: "",
          gastos: "",
          liquidacion_pagada: false,
          chofer_id: "",
        };
  });

  useEffect(() => {
    fetchRemitos();
    fetchChoferes();
    fetchConfig();
  }, []);

  const fetchRemitos = async () => {
    setLoading(true);
    try {
      const res = await getRemitoNotUploadInTrip();
      setRemitos(res.result);
    } finally {
      setLoading(false);
    }
  };

  const fetchChoferes = async () => {
    setLoading(true);
    try {
      const res = await getChoferes();
      setTotalChoferes(res.result);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await getLiquidacionConfig();
      setLiquidacionConfig(res.result?.[0] || {});
    } catch {
      setLiquidacionConfig({});
    }
  };

  const handleRemitoChange = async (value: string) => {
    setFormData((f: any) => ({ ...f, remito_id: value }));
    const sel = remitos.find((r) => r.id.toString() === value);
    if (!sel) return;

    const gastosCalc =
      Number(sel.lavado || 0) +
      Number(sel.peaje || 0) +
      Number(sel.balanza || 0) +
      Number(sel.sanidad || 0) +
      Number(sel.inspeccion || 0);

    setLoading(true);
    try {
      const info = await getRemitoById(sel.id);
      const pernocteVal = info.result?.pernocte
        ? liquidacionConfig?.pernocte || ""
        : "";

      setFormData((f: any) => ({
        ...f,
        kms_viaje: sel.kilometros || "",
        pernocte: pernocteVal,
        gastos: gastosCalc.toString(),
        chofer_id: sel.chofer_id?.toString() || "",
      }));
    } catch {
      setFormData((f: any) => ({
        ...f,
        kms_viaje: sel.kilometros || "",
        pernocte: "",
        gastos: gastosCalc.toString(),
        chofer_id: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((f: any) => ({
      ...f,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // **Validación de campos obligatorios**
    const requiredFields = [
      { key: "remito_id", label: "Remito" },
      { key: "chofer_id", label: "Chofer" },
      { key: "kms_viaje", label: "KMs Viaje" },
      { key: "minimo_kms_liquidar", label: "Mínimo KMs a Liquidar" },
      { key: "limite_premio", label: "Límite Premio" },
      { key: "precio_km", label: "Precio por KM" },
      { key: "pernocte", label: "Pernocte" },
    ];
    const missing = requiredFields
      .filter((f) => !formData[f.key]?.toString().trim())
      .map((f) => f.label);
    if (missing.length) {
      Swal.fire("Error", `Faltan: ${missing.join(", ")}`, "error");
      return;
    }

    // recalcular valores
    const kmsViaje = Number(formData.kms_viaje);
    const precioKm = Number(formData.precio_km);
    const minKms = Number(formData.minimo_kms_liquidar);
    const gastos = Number(formData.gastos);
    const pernocte = Number(formData.pernocte);

    const kms_liquidar = kmsViaje < minKms ? minKms : kmsViaje;
    const subtotal = kms_liquidar * precioKm;
    const total_a_favor = subtotal + gastos + pernocte;

    const payload = {
      ...formData,
      kms_liquidar,
      subtotal,
      total_a_favor,
    };

    Swal.fire({
      title: initialData ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      if (initialData) {
        const upd = await updateLiquidacion(payload);
        if (upd.result) Swal.fire("Éxito", "Liquidación actualizada", "success");
      } else {
        const ins = await addLiquidacion(payload);
        if (ins.result) Swal.fire("Éxito", "Liquidación creada", "success");
      }
      router.push("/liquidaciones");
    } catch {
      Swal.fire("Error", "Hubo un problema al guardar", "error");
    }
    toast({ title: "Guardado", description: "Liquidación procesada." });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="remito_id">Remito</Label>
          <Select
            name="remito_id"
            onValueChange={handleRemitoChange}
            value={formData.remito_id}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar remito">
                {
                  remitos.find((r) => r.id.toString() === formData.remito_id)
                    ?.numero_remito
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {remitos.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.numero_remito}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chofer_id">Chofer</Label>
          <Select
            name="chofer_id"
            onValueChange={(v) =>
              setFormData((f: any) => ({ ...f, chofer_id: v }))
            }
            value={formData.chofer_id}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar chofer">
                {
                  totalChoferes.find((c: any) => c.id.toString() === formData.chofer_id)
                    ?.nombre
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {totalChoferes.map((c: any) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kms_viaje">KMs Viaje</Label>
          <Input
            id="kms_viaje"
            name="kms_viaje"
            type="number"
            value={formData.kms_viaje}
            onChange={handleChange}
            readOnly
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimo_kms_liquidar">Mínimo KMs a Liquidar</Label>
          <Input
            id="minimo_kms_liquidar"
            name="minimo_kms_liquidar"
            type="number"
            value={formData.minimo_kms_liquidar}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="limite_premio">Límite Premio</Label>
          <Input
            id="limite_premio"
            name="limite_premio"
            type="number"
            value={formData.limite_premio}
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
            value={formData.precio_km}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtotal">Subtotal</Label>
          <Input
            id="subtotal"
            name="subtotal"
            type="number"
            value={
              Number(formData.kms_viaje) < Number(formData.minimo_kms_liquidar)
                ? Number(formData.minimo_kms_liquidar) * Number(formData.precio_km)
                : Number(formData.kms_viaje) * Number(formData.precio_km)
            }
            disabled
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pernocte">Pernocte</Label>
          <Input
            id="pernocte"
            name="pernocte"
            type="number"
            value={formData.pernocte}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gastos">Gastos</Label>
          <Input
            id="gastos"
            name="gastos"
            type="number"
            value={formData.gastos}
            readOnly
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_a_favor">Total a Favor</Label>
          <Input
            id="total_a_favor"
            name="total_a_favor"
            type="number"
            value={
              (Number(formData.kms_viaje) < Number(formData.minimo_kms_liquidar)
                ? Number(formData.minimo_kms_liquidar) * Number(formData.precio_km)
                : Number(formData.kms_viaje) * Number(formData.precio_km))
              + Number(formData.gastos)
              + Number(formData.pernocte)
            }
            disabled
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="liquidacion_pagada"
          name="liquidacion_pagada"
          checked={formData.liquidacion_pagada}
          onCheckedChange={(checked) =>
            setFormData((prev: any) => ({
              ...prev,
              liquidacion_pagada: checked,
            }))
          }
          required
        />
        <Label htmlFor="liquidacion_pagada">Liquidación Pagada</Label>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        {initialData ? "Actualizar Liquidación" : "Crear Liquidación"}
      </Button>
    </form>
  );
}
