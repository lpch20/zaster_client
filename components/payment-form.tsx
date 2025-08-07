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
import { Switch } from "@/components/ui/switch";
import {
  getChoferes,
  getRemito, // ✅ CAMBIO: Agregar getRemito
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
    const data = initialData
      ? {
          ...initialData,
          // ✅ Si no hay viaje_id, permitir seleccionar remito libremente
          remito_id: initialData.remito_id?.toString() || initialData.remito_id_form?.toString() || initialData.viaje_remito_id?.toString() || "",
          chofer_id: initialData.chofer_id?.toString() || "",
          limite_premio_activo: initialData.limite_premio_activo ?? (initialData.limite_premio > 0),
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
          limite_premio_activo: false,
        };
    
    console.log("🔍 DEBUG - InitialData completo:", initialData);
    console.log("🔍 DEBUG - Remito ID final:", data.remito_id);
    console.log("🔍 DEBUG - Viaje ID:", data.viaje_id);
    return data;
  });

  useEffect(() => {
    fetchRemitos();
    fetchChoferes();
    fetchConfig();
  }, []);

        // ✅ Cargar configuración cuando se edita una liquidación existente
      useEffect(() => {
        if (initialData && liquidacionConfig) {
          setFormData((prev: any) => ({
            ...prev,
            limite_premio: prev.limite_premio || liquidacionConfig.limite_premio || "",
            // ✅ NO cargar pernocte de configuración, se toma del remito
            precio_km: prev.precio_km || liquidacionConfig.precio_km || "",
          }));
        }
      }, [initialData, liquidacionConfig]);

  // ✅ Debug: Verificar cuando se cargan los remitos
  useEffect(() => {
    console.log("🔍 DEBUG - Remitos cargados:", remitos.length);
    console.log("🔍 DEBUG - FormData actual:", formData);
    console.log("🔍 DEBUG - Remito_id en formData:", formData.remito_id);
  }, [remitos, formData]);

  // ✅ FIX: Usar getRemito para mostrar TODOS los remitos
  const fetchRemitos = async () => {
    setLoading(true);
    try {
      // ✅ CAMBIO: Usar getRemito en lugar de getRemitoNotUploadInTrip
      const res = await getRemito(); // Muestra TODOS los remitos
      
      // ✅ FILTRAR ELEMENTOS NULL
      const filteredRemitos = res.result.filter((remito: any) => remito !== null);
      setRemitos(filteredRemitos);
      
      console.log("🔍 DEBUG payment-form - Remitos cargados:", filteredRemitos);
      console.log("🔍 DEBUG payment-form - Total remitos:", filteredRemitos.length);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Filtrar choferes null también
  const fetchChoferes = async () => {
    setLoading(true);
    try {
      const res = await getChoferes();
      
      // ✅ FILTRAR ELEMENTOS NULL
      const filteredChoferes = res.result.filter((chofer: any) => chofer !== null);
      setTotalChoferes(filteredChoferes);
      
      console.log("🔍 DEBUG payment-form - Choferes cargados:", filteredChoferes);
      console.log("🔍 DEBUG payment-form - Total choferes:", filteredChoferes.length);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await getLiquidacionConfig();
      const config = res.result?.[0] || {};
      setLiquidacionConfig(config);
      
      // ✅ Actualizar formData con valores de configuración
      setFormData((prev: any) => ({
        ...prev,
        limite_premio: config.limite_premio || "",
        pernocte: config.pernocte || "",
        precio_km: config.precio_km || "",
      }));
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
      
      // ✅ TOMAR EL PERNOCTE DEL REMITO
      const pernocteVal = info.result?.pernocte 
        ? liquidacionConfig?.pernocte || "" // Si el remito tiene pernocte, usar el valor de configuración
        : ""; // Si no tiene pernocte, no aplicar

      console.log("🔍 DEBUG - Remito pernocte:", info.result?.pernocte);
      console.log("🔍 DEBUG - Config pernocte:", liquidacionConfig?.pernocte);
      console.log("🔍 DEBUG - Pernocte final:", pernocteVal);

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
      { key: "precio_km", label: "Precio por KM" },
    ];
    
    // ✅ Validar límite premio solo si está activo y tiene valor
    if (formData.limite_premio_activo && !formData.limite_premio && !liquidacionConfig?.limite_premio) {
      requiredFields.push({ key: "limite_premio", label: "Límite Premio" });
    }
    const missing = requiredFields
      .filter((f) => {
        if (f.key === "limite_premio") {
          // Para límite premio, verificar si hay valor en configuración o formData
          return !(formData[f.key]?.toString().trim() || liquidacionConfig?.limite_premio);
        }
        return !formData[f.key]?.toString().trim();
      })
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
    
    // ✅ Aplicar switch del límite premio usando valores de configuración
    const limitePremio = formData.limite_premio_activo ? Number(liquidacionConfig?.limite_premio || formData.limite_premio) : 0;

    const kms_liquidar = kmsViaje < minKms ? minKms : kmsViaje;
    const subtotal = kms_liquidar * precioKm;
    const total_a_favor = subtotal + gastos + pernocte + limitePremio;

    const payload = {
      ...formData,
      kms_liquidar,
      subtotal,
      total_a_favor,
      // ✅ Asegurar que los valores numéricos no sean strings vacíos
      limite_premio: formData.limite_premio_activo ? Number(liquidacionConfig?.limite_premio || formData.limite_premio) || 0 : 0,
      pernocte: Number(formData.pernocte) || 0, // ✅ USAR SOLO EL PERNOCTE DEL FORMULARIO (que viene del remito)
      precio_km: Number(formData.precio_km) || 0,
      gastos: Number(formData.gastos) || 0,
      kms_viaje: Number(formData.kms_viaje) || 0,
      minimo_kms_liquidar: Number(formData.minimo_kms_liquidar) || 0,
    };

    Swal.fire({
      title: initialData ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      if (initialData) {
        const upd = await updateLiquidacion(payload);
        if (upd.message) {
          Swal.fire("Éxito", "Liquidación actualizada", "success").then(() => {
            router.push("/liquidaciones");
          });
        } else {
          Swal.fire("Error", "No se pudo actualizar la liquidación", "error");
        }
      } else {
        const ins = await addLiquidacion(payload);
        if (ins.message) {
          Swal.fire("Éxito", "Liquidación creada", "success").then(() => {
            router.push("/liquidaciones");
          });
        } else {
          Swal.fire("Error", "No se pudo crear la liquidación", "error");
        }
      }
      toast({ title: "Guardado", description: "Liquidación procesada." });
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al guardar", "error");
      console.error("Error al guardar liquidación:", error);
    }
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
                              {(() => {
                const foundRemito = remitos.find((r) => r.id.toString() === formData.remito_id);
                console.log("🔍 DEBUG - Buscando remito ID:", formData.remito_id);
                console.log("🔍 DEBUG - Remito encontrado:", foundRemito?.numero_remito);
                return foundRemito?.numero_remito || "No encontrado";
              })()}
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
          <Label htmlFor="limite_premio">Límite Premio (Configuración)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="limite_premio"
              name="limite_premio"
              type="number"
              value={formData.limite_premio || liquidacionConfig?.limite_premio || ""}
              readOnly
              disabled={!formData.limite_premio_activo}
              className="bg-gray-100 flex-1"
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="limite_premio_activo"
                checked={formData.limite_premio_activo}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev: any) => ({ ...prev, limite_premio_activo: checked }))
                }
              />
              <Label htmlFor="limite_premio_activo" className="text-sm">Aplicar</Label>
            </div>
          </div>
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
          <Label htmlFor="pernocte">Pernocte (Del Remito)</Label>
          <Input
            id="pernocte"
            name="pernocte"
            type="number"
            value={formData.pernocte || ""}
            readOnly
            className="bg-gray-100"
            placeholder="Se llena automáticamente al seleccionar remito"
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
              + Number(formData.pernocte || 0)
              + (formData.limite_premio_activo ? Number(liquidacionConfig?.limite_premio || formData.limite_premio) : 0)
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
        />
        <Label htmlFor="liquidacion_pagada">Liquidación Pagada</Label>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        {initialData ? "Actualizar Liquidación" : "Crear Liquidación"}
      </Button>
    </form>
  );
}