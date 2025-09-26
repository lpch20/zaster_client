"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { updateLiquidacionConfig } from "@/api/RULE_updateData";
import Swal from "sweetalert2";
import { Loading } from "../../components/spinner";
import React from "react";
import { getLiquidacionConfig } from "@/api/RULE_getData";
import { SubscriptionManager } from "../../components/subscription-manager";
import { createSubscription as createSubscriptionAPI } from "@/api/RULE_subscription";
import { Separator } from "@/components/ui/separator";

function Page({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [liquidacionConfig, setLiquidacionConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: "",
    limite_premio: "",
    pernocte: "",
    precio_km: "",
  });

  const getConfigLiquiData = async () => {
    try {
      const result = await getLiquidacionConfig();
      if (result && result.result && result.result.length > 0) {
        setLiquidacionConfig(result.result[0]);
      } else {
        setLiquidacionConfig({});
        console.warn("No liquidacion config data found.");
      }
    } catch (error) {
      console.error("Error fetching liquidacion config:", error);
      setLiquidacionConfig({});
    }
  };

  useEffect(() => {
    getConfigLiquiData();
  }, []);

  useEffect(() => {
    if (liquidacionConfig) {
      setFormData({
        id: liquidacionConfig.id || "",
        limite_premio: liquidacionConfig.limite_premio || "",
        pernocte: liquidacionConfig.pernocte || "",
        precio_km: liquidacionConfig.precio_km || "",
      });
    }
  }, [liquidacionConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: "Guardando configuración...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const resultUpdate = await updateLiquidacionConfig(formData);
      Swal.close();
      if (resultUpdate.result === true) {
        Swal.fire("Éxito", "Configuración guardada exitosamente", "success");
        router.push("/")
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "Hubo un problema al guardar la configuración.",
        "error"
      );
    }
    console.log("Form Data submitted:", formData);
    toast({
      title: "Configuración guardada",
      description: "La configuración ha sido guardada exitosamente.",
    });
  };

  if (liquidacionConfig === null) {
    return (
      <div>
        <Loading /> Cargando configuración...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configuración</h1>
      
      {/* ✅ SECCIÓN DE SUSCRIPCIONES */}
      <div className="flex items-center gap-3">
        <SubscriptionManager />
        {/* Botón rápido para suscribirse (si el usuario quiere ir directo) */}
        <div className="ml-auto">
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={async () => {
              try {
                const res = await createSubscriptionAPI({ plan_type: "monthly" });
                if (res?.success && res.result?.payment_url) {
                  // Redirigir al init_point
                  window.location.href = res.result.payment_url;
                } else {
                  throw new Error(res?.message || "No se pudo iniciar la suscripción");
                }
              } catch (err: any) {
                console.error("Error creando suscripción (botón rápido):", err);
                Swal.fire("Error", err.message || "No se pudo crear la suscripción", "error");
              }
            }}
          >
            Suscribirme ahora
          </button>
        </div>
      </div>
      
      <Separator />
      
      {/* ✅ SECCIÓN DE CONFIGURACIÓN DE LIQUIDACIONES */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Configuración de Liquidaciones</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <Label htmlFor="precio_km">Precio / km</Label>
              <Input
                id="precio_km"
                name="precio_km"
                type="number"
                value={formData.precio_km}
                onChange={handleChange}
                required
              />
            </div> */}
            
            <div className="space-y-2">
              <Label htmlFor="limite_premio">Límite de premio</Label>
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
          </div>
          <Button type="submit">Actualizar Datos</Button>
        </form>
      </div>
    </div>
  );
}

export default Page;
