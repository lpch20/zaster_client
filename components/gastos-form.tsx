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

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string;
  file?: File;
}

interface GastoData {
  id?: number;
  fecha: string;
  matricula: string;
  categoria: string;
  proveedor: string;
  monto_pesos: number;
  monto_usd: number;
  forma_pago: string;
  descripcion: string;
  img_1?: string;
  img_2?: string;
  img_3?: string;
  img_4?: string;
  img_5?: string;
}

export function GastosForm({ initialData }: { initialData?: GastoData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /* ───── ESTADO PARA ARCHIVOS ──────────────────────────────────── */
  const [allImages, setAllImages] = useState<ImageData[]>([]);

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
    }).format(num);
  }
  const moneyRegex = /^\d*(?:[.,]\d*)?$/;

  /* ───── STATE PRINCIPAL ─────────────────────────────────────── */
  const [formData, setFormData] = useState<GastoData>({
    fecha: "",
    matricula: "",
    categoria: "",
    proveedor: "",
    monto_pesos: 0,
    monto_usd: 0,
    forma_pago: "",
    descripcion: "",
  });

  /* ───── STATE "BORRADOR" PARA LOS INPUTS MONETARIOS ───────────── */
  const [draftMoney, setDraftMoney] = useState({
    monto_pesos: "",
    monto_usd: "",
  });

  /* ───── CARGAR DATOS INICIALES ─────────────────────────────────── */
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        monto_pesos: Number(initialData.monto_pesos) || 0,
        monto_usd: Number(initialData.monto_usd) || 0,
      });

      setDraftMoney({
        monto_pesos: formatOneDecimal(initialData.monto_pesos),
        monto_usd: formatOneDecimal(initialData.monto_usd),
      });
    }
  }, [initialData]);

  /* ───── CARGAR IMÁGENES EXISTENTES ────────────────────────────── */
  useEffect(() => {
    if (initialData) {
      const temp: ImageData[] = [];
      [1, 2, 3, 4, 5].forEach((n) => {
        const key = `img_${n}` as keyof typeof initialData;
        if (initialData[key]) {
          temp.push({ id: `old${n}`, type: "old", url: initialData[key] });
        }
      });
      setAllImages(temp);
    }
  }, [initialData]);

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

  const commitMoney = (name: "monto_pesos" | "monto_usd") => () => {
    const raw = draftMoney[name];
    const num =
      raw === "" ? 0 : parseFloat(raw.replace(/\./g, "").replace(",", "."));
    setFormData((p) => ({ ...p, [name]: isNaN(num) ? 0 : num }));
    setDraftMoney((d) => ({
      ...d,
      [name]: raw === "" ? "" : formatOneDecimal(num),
    }));
  };

  /* ───── MANEJO DE ARCHIVOS ────────────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const items = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      type: "new" as const,
      file,
    }));

    if (allImages.length + items.length > 5) {
      Swal.fire("Error", "Máximo 5 archivos permitidos", "error");
      return;
    }

    setAllImages((prev) => [...prev, ...items]);
    e.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setAllImages((prev) => prev.filter((img) => img.id !== id));
  };

  /* ───── SUBMIT ────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validación mínima (sin archivos obligatorios)
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

    Swal.fire({
      title: initialData?.id ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      setLoading(true);

      // ✅ Determinar si hay archivos nuevos o viejos
      const hasNewFiles = allImages.some(img => img.type === "new" && img.file);
      const hasOldFiles = allImages.some(img => img.type === "old");

      // ✅ Si hay archivos, usar FormData con fetch directo
      if (hasNewFiles || hasOldFiles) {
        const fd = new FormData();
        
        // Agregar datos del formulario (sin ID)
        Object.entries(formData).forEach(([k, v]) => {
          if (k !== 'id' && v !== null && v !== undefined) {
            fd.append(k, v.toString());
          }
        });

        // Manejar imágenes viejas (para edición)
        if (initialData?.id && hasOldFiles) {
          const oldImages = allImages
            .filter((i) => i.type === "old")
            .map((i) => i.url);
          fd.append("oldImages", JSON.stringify(oldImages));
        }

        // Agregar archivos nuevos
        allImages
          .filter((i) => i.type === "new" && i.file)
          .forEach((i) => fd.append("archivos", i.file!));

        // ✅ Envío directo con fetch (evita problemas de Axios con FormData)
        const token = localStorage.getItem("token");
        const API_BASE_URL = "http://localhost:8000/api";
        
        const url = initialData?.id 
          ? `${API_BASE_URL}/changeGastos/${initialData.id}`
          : `${API_BASE_URL}/postGastos`;
        
        const response = await fetch(url, {
          method: initialData?.id ? "PUT" : "POST",
          headers: {
            "Authorization": token,
          },
          body: fd
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();
      } else {
        // ✅ Si NO hay archivos, usar API normal de Axios
        const dataToSend = { ...formData };
        if (dataToSend.id) delete dataToSend.id;

        if (initialData?.id) {
          await putGasto(initialData.id, dataToSend);
        } else {
          await postGasto(dataToSend);
        }
      }

      Swal.close();
      Swal.fire("Éxito", "Guardado correctamente", "success");
      router.push("/gastos");
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.close();
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
          <Label htmlFor="fecha">Fecha *</Label>
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
          <Label htmlFor="matricula">Matrícula *</Label>
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
          <Label htmlFor="categoria">Categoría *</Label>
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
          <Label htmlFor="proveedor">Proveedor *</Label>
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
          <Label htmlFor="forma_pago">Forma de Pago *</Label>
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

      {/* ✅ SECCIÓN DE ARCHIVOS */}
      <div className="space-y-4">
        {/* Input para subir archivos */}
        <div className="space-y-2">
          <Label htmlFor="archivos">Subir archivos (opcional - máximo 5)</Label>
          <Input
            id="archivos"
            name="archivos"
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        {/* Vista previa de archivos */}
        {allImages.length > 0 && (
          <div className="space-y-2">
            <Label>Archivos seleccionados ({allImages.length}/5)</Label>
            <div className="flex flex-wrap gap-2">
              {allImages.map((img) => {
                let src = "";
                let link = "";

                if (img.type === "old") {
                  link = img.url;
                  src = img.url
                } else {
                  src = URL.createObjectURL(img.file!);
                  link = "#";
                }

                return (
                  <div key={img.id} className="relative">
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        img.type === "new" ? "pointer-events-none" : ""
                      }
                    >
                      <img
                        src={src}
                        alt="Vista previa"
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = "/pdf-icon.jpeg";
                        }}
                      />
                    </a>

                    {/* Botón para eliminar */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>

                    {/* Enlace para ver archivos viejos */}
                    {img.type === "old" && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1 rounded hover:bg-blue-600"
                      >
                        Ver
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : initialData?.id
            ? "Actualizar"
            : "Guardar"}{" "}
          Gasto
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/gastos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}