"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Loading } from "./spinner";
import { postGasto, putGasto } from "@/api/RULE_getData";

interface GastoData {
  id?: number; // solo para edición
  fecha: string;
  matricula: string;
  categoria: string;
  proveedor: string;
  monto_pesos: number;
  monto_usd: number;
  forma_pago: string;
  descripcion: string;
}

export function GastosForm({ initialData }: { initialData?: GastoData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /* ───── LISTAS ─────────────────────────────────────────────────── */
  const categorias = [
    "Mantenimiento",
    "Repuestos",
    "Neumáticos",
    "Seguros",
    "Peajes",
    "Lavado",
    "Documentación",
    "Multas",
    "Otros",
  ];
  const formasPago = [
    "EFECTIVO",
    "TRANSFERENCIA",
    "CREDITO",
    "TARJETA_DEBITO",
    "TARJETA_CREDITO",
  ];

  /* ───── STATE PRINCIPAL (números limpios) ─────────────────────── */
  const [formData, setFormData] = useState<GastoData>(() =>
    initialData
      ? initialData
      : {
          fecha: "",
          matricula: "",
          categoria: "",
          proveedor: "",
          monto_pesos: 0,
          monto_usd: 0,
          forma_pago: "",
          descripcion: "",
        }
  );

  /* ───── STATE “BORRADOR” PARA LOS INPUTS MONETARIOS ───────────── */
  const [draftMoney, setDraftMoney] = useState({
    monto_pesos:
      initialData && initialData.monto_pesos
        ? formatOneDecimal(initialData.monto_pesos)
        : "",
    monto_usd:
      initialData && initialData.monto_usd
        ? formatOneDecimal(initialData.monto_usd)
        : "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setDraftMoney({
        monto_pesos: formatOneDecimal(initialData.monto_pesos),
        monto_usd: formatOneDecimal(initialData.monto_usd),
      });
    }
  }, [initialData]);

  /* ───── HELPERS ───────────────────────────────────────────────── */
  function formatOneDecimal(n: number | string): string {
    if (n === 0 || n === "" || n === undefined || n === null) return "";
    const num =
      typeof n === "number" ? n : parseFloat(String(n).replace(",", "."));
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("es-UY", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      useGrouping: false,
    }).format(num); // ej.: 1000,4
  }
  const moneyRegex = /^\d*(?:[.,]\d*)?$/;

  /* ───── GENERALES (texto, select, fecha) ──────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleSelectChange = (name: keyof GastoData, value: string) =>
    setFormData((p) => ({ ...p, [name]: value }));

  /* ───── MONETARIOS: onChange & onBlur ─────────────────────────── */
  const handleMoneyDraft =
    (name: "monto_pesos" | "monto_usd") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const txt = e.target.value;
      if (txt === "" || moneyRegex.test(txt)) {
        setDraftMoney((d) => ({ ...d, [name]: txt }));
      }
    };

  const commitMoney =
    (name: "monto_pesos" | "monto_usd") =>
    () => {
      const raw = draftMoney[name];
      const num =
        raw === "" ? 0 : parseFloat(raw.replace(/\./g, "").replace(",", "."));
      setFormData((p) => ({ ...p, [name]: isNaN(num) ? 0 : num }));
      setDraftMoney((d) => ({
        ...d,
        [name]: raw === "" ? "" : formatOneDecimal(num),
      }));
    };

  /* ───── SUBMIT ────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación mínima
    if (
      !formData.fecha ||
      !formData.matricula ||
      !formData.categoria ||
      !formData.proveedor
    ) {
      Swal.fire("Error", "Complete los campos obligatorios", "error");
      return;
    }
    if (formData.monto_pesos <= 0 && formData.monto_usd <= 0) {
      Swal.fire("Error", "Debe ingresar al menos un monto", "error");
      return;
    }

    try {
      setLoading(true);
      if (initialData?.id) {
        await putGasto(initialData.id, formData);
      } else {
        await postGasto(formData);
      }
      Swal.fire("Éxito", "Guardado correctamente", "success");
      router.push("/gastos");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error al guardar", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ───── RENDER ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loading /> Cargando...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* ─── PRIMER GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha */}
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

        {/* Matrícula */}
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

        {/* Categoría */}
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Select
            value={formData.categoria}
            onValueChange={(v) => handleSelectChange("categoria", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Proveedor */}
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

        {/* Monto Pesos */}
        <div className="space-y-2">
          <Label htmlFor="monto_pesos">Monto $ (Pesos)</Label>
          <Input
            id="monto_pesos"
            name="monto_pesos"
            type="text"
            placeholder="0"
            value={draftMoney.monto_pesos}
            onChange={handleMoneyDraft("monto_pesos")}
            onBlur={commitMoney("monto_pesos")}
          />
        </div>

        {/* Monto USD */}
        <div className="space-y-2">
          <Label htmlFor="monto_usd">Monto USD</Label>
          <Input
            id="monto_usd"
            name="monto_usd"
            type="text"
            placeholder="0"
            value={draftMoney.monto_usd}
            onChange={handleMoneyDraft("monto_usd")}
            onBlur={commitMoney("monto_usd")}
          />
        </div>

        {/* Forma de pago */}
        <div className="space-y-2">
          <Label htmlFor="forma_pago">Forma de Pago</Label>
          <Select
            value={formData.forma_pago}
            onValueChange={(v) => handleSelectChange("forma_pago", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar forma de pago" />
            </SelectTrigger>
            <SelectContent>
              {formasPago.map((fp) => (
                <SelectItem key={fp} value={fp}>
                  {fp.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          value={formData.descripcion}
          onChange={handleChange}
        />
      </div>

      {/* Botón */}
      <Button type="submit">
        {initialData ? "Actualizar" : "Guardar"}
      </Button>
    </form>
  );
}
