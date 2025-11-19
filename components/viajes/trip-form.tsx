"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { parseDateForInput } from "@/lib/utils";
import { addTrip } from "@/api/RULE_insertData";
import {
  getCamiones,
  getChoferes,
  getClients,
  getTrip,
  getRemitoNotUploadInTrip,
  getRemitoById,
} from "@/api/RULE_getData";
import { updateTrip } from "@/api/RULE_updateData";
import { Loading } from "@/components/shared/spinner";
import { TripFormClientSelector } from "./trip-form-client-selector";
import { TripFormExpenses } from "./trip-form-expenses";
import { TripFormFiles } from "./trip-form-files";
import { TripFormRemitoSelector } from "./trip-form-remito-selector";
import { TripFormBasicFields } from "./trip-form-basic-fields";
import { TripFormBilling } from "./trip-form-billing";
import { TripFormTotals } from "./trip-form-totals";
import { useTripCalculations } from "@/hooks/viajes/use-trip-calculations";

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string;
  file?: File;
}

interface Remito {
  id: number;
  numero_remito: string;
  propietario_name: string;
  chofer_id: number;
  numero_guia: string;
  lavado: number;
  peaje: number;
  balanza: number;
  kilometros: number;
  fecha: string;
  destinatario_id: number;
  lugar_carga: string;
  lugar_descarga: string;
  camion_id: number;
}

export function TripForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [totalChoferes, setTotalChoferes] = useState<any[]>([]);
  const [camiones, setCamiones] = useState<any[]>([]);
  const [clients, setTotalClients] = useState<any[]>([]);
  const [allImages, setAllImages] = useState<ImageData[]>([]);
  const [totalRemitos, setTotalRemitos] = useState<Remito[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const toBoolean = (value: any): boolean => {
    if (value === true || value === 1 || value === "1") return true;
    if (value === false || value === 0 || value === "0" || value === null || value === undefined) return false;
    return Boolean(value);
  };

  const [formData, setFormData] = useState<any>(
    initialData
      ? {
          ...initialData,
          numero_viaje: initialData.numero_viaje ?? "",
          remito_id: String(initialData.remito_id ?? ""),
          fecha_viaje: initialData.fecha_viaje
            ? parseDateForInput(initialData.fecha_viaje)
            : "",
          remitente_name: initialData.remitente_name ?? "",
          lugar_carga: initialData.lugar_carga ?? "",
          destinatario_id: String(initialData.destinatario_id ?? ""),
          lugar_descarga: initialData.lugar_descarga ?? "",
          camion_id: String(initialData.camion_id ?? ""),
          chofer_id: String(initialData.chofer_id ?? ""),
          guias: initialData.guias ?? "",
          detalle_carga: initialData.detalle_carga ?? "",
          facturar_a: String(initialData.facturar_a ?? ""),
          lavado: initialData.lavado ?? "",
          peaje: initialData.peaje ?? "",
          balanza: initialData.balanza ?? "",
          sanidad: initialData.sanidad ?? "",
          inspeccion: initialData.inspeccion ?? "",
          precio_flete: initialData.precio_flete ?? "",
          iva_lavado: toBoolean(initialData.iva_lavado),
          iva_peaje: toBoolean(initialData.iva_peaje),
          iva_balanza: toBoolean(initialData.iva_balanza),
          iva_sanidad: toBoolean(initialData.iva_sanidad),
          iva_porcentaje: initialData.iva_porcentaje ?? "",
          iva_flete: toBoolean(initialData.iva_flete),
          facturado: toBoolean(initialData.facturado),
        }
      : {
          numero_viaje: "",
          remito_id: "",
          fecha_viaje: "",
          remitente_name: "",
          lugar_carga: "",
          destinatario_id: "",
          lugar_descarga: "",
          camion_id: "",
          chofer_id: "",
          guias: "",
          detalle_carga: "",
          facturar_a: "",
          tipo_cambio: "",
          kms: "",
          tarifa: "",
          precio_flete: "",
          lavado: "",
          peaje: "",
          balanza: "",
          sanidad: 0,
          inspeccion: "",
          numero_factura: "",
          vencimiento: "",
          referencia_cobro: "",
          cobrado: false,
          estado: "activo",
          iva_lavado: false,
          iva_peaje: false,
          iva_balanza: false,
          iva_sanidad: false,
          iva_porcentaje: "",
          iva_flete: false,
          facturado: false,
        }
  );

  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({
        ...prev,
        ...initialData,
        numero_viaje: initialData.numero_viaje ?? prev.numero_viaje ?? "",
        remito_id: String(initialData.remito_id ?? prev.remito_id ?? ""),
        fecha_viaje: initialData.fecha_viaje
          ? parseDateForInput(initialData.fecha_viaje)
          : prev.fecha_viaje ?? "",
        remitente_name: initialData.remitente_name ?? prev.remitente_name ?? "",
        lugar_carga: initialData.lugar_carga ?? prev.lugar_carga ?? "",
        destinatario_id: String(initialData.destinatario_id ?? prev.destinatario_id ?? ""),
        lugar_descarga: initialData.lugar_descarga ?? prev.lugar_descarga ?? "",
        camion_id: String(initialData.camion_id ?? prev.camion_id ?? ""),
        chofer_id: String(initialData.chofer_id ?? prev.chofer_id ?? ""),
        guias: initialData.guias ?? prev.guias ?? "",
        detalle_carga: initialData.detalle_carga ?? prev.detalle_carga ?? "",
        facturar_a: String(initialData.facturar_a ?? prev.facturar_a ?? ""),
        lavado: initialData.lavado ?? prev.lavado ?? "",
        peaje: initialData.peaje ?? prev.peaje ?? "",
        balanza: initialData.balanza ?? prev.balanza ?? "",
        sanidad: initialData.sanidad ?? prev.sanidad ?? "",
        inspeccion: initialData.inspeccion ?? prev.inspeccion ?? "",
        precio_flete: initialData.precio_flete ?? prev.precio_flete ?? "",
        iva_lavado: toBoolean(initialData.iva_lavado),
        iva_peaje: toBoolean(initialData.iva_peaje),
        iva_balanza: toBoolean(initialData.iva_balanza),
        iva_sanidad: toBoolean(initialData.iva_sanidad),
        iva_porcentaje: initialData.iva_porcentaje ?? prev.iva_porcentaje ?? "",
        iva_flete: toBoolean(initialData.iva_flete),
        facturado: toBoolean(initialData.facturado),
      }));
    }
  }, [initialData]);

  useEffect(() => {
    getTotalChoferes();
    getTripFunction();
    getClient();
    getTotalCamiones();
    getRemitosNotTripTable();
  }, []);

  const validateRequiredFieldsTrip = () => {
    const requiredFields = [
      { field: "numero_viaje", label: "Número de Viaje" },
      { field: "remito_id", label: "Número Remito" },
      { field: "fecha_viaje", label: "Fecha" },
      { field: "remitente_name", label: "Remitente/Destinatario" },
      { field: "lugar_carga", label: "Lugar de Carga" },
      { field: "lugar_descarga", label: "Lugar de Descarga" },
      { field: "camion_id", label: "Camión" },
      { field: "chofer_id", label: "Chofer" },
      { field: "facturar_a", label: "Facturar a" },
      { field: "kms", label: "Kilómetros" },
      { field: "tarifa", label: "Tarifa" },
      ...(formData.facturado ? [{ field: "numero_factura", label: "Número de Factura" }] : []),
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(({ label }) => label).join(", ");
      Swal.fire({
        title: "Campos Obligatorios",
        text: `Los siguientes campos son obligatorios para el viaje: ${missingLabels}`,
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return false;
    }
    return true;
  };

  const getRemitosNotTripTable = async () => {
    try {
      setLoading(true);
      const result = await getRemitoNotUploadInTrip();
      
      let remitosList: Remito[] = [];
      
      if (result && result.result) {
        remitosList = Array.isArray(result.result) ? result.result : [];
      } else if (Array.isArray(result)) {
        remitosList = result;
      } else if (result && Array.isArray(result.data)) {
        remitosList = result.data;
      }
      
      const filteredRemitos = remitosList.filter((remito: any) => {
        return remito !== null && remito !== undefined && remito.id !== null && remito.id !== undefined;
      });
      
      if (initialData?.remito_id) {
        const idStr = String(initialData.remito_id);
        if (!filteredRemitos.some((r) => String(r.id) === idStr)) {
          try {
            const spec = await getRemitoById(initialData.remito_id);
            if (spec?.result) filteredRemitos.push(spec.result);
          } catch (error) {
            console.error("Error al obtener remito por ID:", error);
          }
        }
      }
      
      setTotalRemitos(filteredRemitos);
    } catch (error) {
      console.error("Error al cargar remitos no asignados:", error);
      setTotalRemitos([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalChoferes = async () => {
    try {
      setLoading(true);
      const res = await getChoferes();
      setTotalChoferes(res.result);
    } finally {
      setLoading(false);
    }
  };

  const getTripFunction = async () => {
    try {
      setLoading(true);
      const res = await getTrip();
      setTrips(res.result);
    } finally {
      setLoading(false);
    }
  };

  const getClient = async () => {
    try {
      setLoading(true);
      const res = await getClients();
      const filteredClients = res.result.filter((c: any) => c !== null && !c.soft_delete);
      const sortedClients = filteredClients.sort((a: any, b: any) => {
        const nameA = (a.nombre || "").toLowerCase();
        const nameB = (b.nombre || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setTotalClients(sortedClients);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCamiones = async () => {
    try {
      setLoading(true);
      const res = await getCamiones();
      setCamiones(res.result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trips.length) {
      const max = Math.max(...trips.map((t) => Number(t.numero_viaje)));
      const next = String(max + 1).padStart(3, "0");
      setFormData((f: any) => ({
        ...f,
        numero_viaje: initialData ? initialData.numero_viaje : next,
      }));
    } else {
      setFormData((f: any) => ({ ...f, numero_viaje: "001" }));
    }
  }, [trips]);

  useEffect(() => {
    if (initialData) {
      const temp: ImageData[] = [];
      [1, 2, 3, 4, 5].forEach((n) => {
        const key = `img_${n}` as keyof typeof initialData;
        if (initialData[key])
          temp.push({ id: `old${n}`, type: "old", url: initialData[key] });
      });
      setAllImages(temp);
    }
  }, [initialData]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((f: any) => ({ ...f, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const items: ImageData[] = files.map((file, i) => ({
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

  const handleRemitoChange = (remito: Remito | null, remitoId: string) => {
    if (!remito) {
      handleFieldChange("remito_id", remitoId);
      return;
    }

    let destinatarioIdFromRemito: string | null = null;
    if (remito.destinatario_id !== null && remito.destinatario_id !== undefined) {
      destinatarioIdFromRemito = String(remito.destinatario_id);
    }

    setFormData((prev: any) => ({
      ...prev,
      remito_id: remitoId,
      lugar_carga: remito.lugar_carga || prev.lugar_carga,
      remitente_name: remito.propietario_name && remito.propietario_name.trim() !== ""
        ? remito.propietario_name
        : "Propietario no especificado",
      chofer_id: String(remito.chofer_id) || prev.chofer_id,
      guias: remito.numero_guia || prev.guias,
      lavado: remito.lavado || prev.lavado,
      peaje: remito.peaje || prev.peaje,
      balanza: remito.balanza || prev.balanza,
      kms: remito.kilometros || prev.kms,
      fecha_viaje: remito.fecha ? parseDateForInput(remito.fecha) : "",
      destinatario_id: destinatarioIdFromRemito || prev.destinatario_id,
      lugar_descarga: remito.lugar_descarga || prev.lugar_descarga,
      camion_id: String(remito.camion_id) || prev.camion_id,
    }));
  };

  const { precioFleteCalculado, totalMontoUY, totalMontoUSS } = useTripCalculations(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequiredFieldsTrip()) {
      return;
    }

    Swal.fire({
      title: initialData ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const finalData = {
        ...formData,
        total_monto_uy: parseFloat(totalMontoUY.toFixed(2)),
        total_monto_uss: parseFloat(totalMontoUSS.toFixed(2)),
        total_flete: parseFloat(precioFleteCalculado.toFixed(2))
      };

      const fd = new FormData();
      Object.entries(finalData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          fd.append(k, v.toString());
        }
      });

      allImages
        .filter((i) => i.type === "new" && i.file)
        .forEach((i) => fd.append("archivos", i.file!));

      const resp = initialData ? await updateTrip(fd) : await addTrip(fd);
      Swal.close();
      if (resp.result) {
        Swal.fire("Éxito", "Viaje guardado", "success");
        router.push("/viajes");
      }
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "No se pudo guardar el viaje", "error");
      console.error("Error al guardar viaje:", error);
    }
  };

  return (
    <>
      {loading ? (
        <div>
          Cargando....
          <Loading />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <TripFormRemitoSelector
              remitos={totalRemitos}
              selectedRemitoId={formData.remito_id}
              onRemitoChange={handleRemitoChange}
            />
            <TripFormBasicFields
              formData={formData}
              onFieldChange={handleFieldChange}
              camiones={camiones}
              choferes={totalChoferes}
              clients={clients}
            />
            <TripFormClientSelector
              clients={clients}
              selectedClientId={formData.destinatario_id}
              onClientChange={(id) => handleFieldChange("destinatario_id", id)}
              onClientsReload={getClient}
            />
            <TripFormExpenses
              formData={formData}
              onFieldChange={handleFieldChange}
            />
            <TripFormTotals
              formData={formData}
              precioFleteCalculado={precioFleteCalculado}
              totalMontoUY={totalMontoUY}
              totalMontoUSS={totalMontoUSS}
              onFieldChange={handleFieldChange}
            />
          </div>

          <TripFormBilling
            formData={formData}
            onFieldChange={handleFieldChange}
          />

          <TripFormFiles
            allImages={allImages}
            onFileChange={handleFileChange}
            onRemoveImage={handleRemoveImage}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear"} Viaje
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/viajes")}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

