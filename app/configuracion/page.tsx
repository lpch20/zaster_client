"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { Switch } from "@/components/ui/switch";
import { updateClient, updateLiquidacionConfig } from "@/api/RULE_updateData";
import Swal from "sweetalert2";
import { addClient } from "@/api/RULE_insertData";
import { Loading } from "../../components/spinner";
import React from "react";
import { getLiquidacionConfig } from "@/api/RULE_getData";

function Page({ initialData }: { initialData?: any }) {
  // Correct component name to Page, as per React conventions and file name
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [liquidacionConfig, setLiquidacionConfig] = useState<any>(null); // Initialize as null to indicate loading state
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
        // Check if result and result.result are valid and not empty
        setLiquidacionConfig(result.result[0]); // Assuming you want the first config item
      } else {
        setLiquidacionConfig({}); // Set to empty object if no config found, or handle error as needed
        console.warn("No liquidacion config data found.");
      }
    } catch (error) {
      console.error("Error fetching liquidacion config:", error);
      setLiquidacionConfig({}); // Set to empty object on error, or handle error as needed
    }
  };

  useEffect(() => {
    getConfigLiquiData();
  }, []); // Fetch config data only once on component mount

  useEffect(() => {
    // Update formData when liquidacionConfig is loaded
    if (liquidacionConfig) {
      setFormData({
        id: liquidacionConfig.id,
        limite_premio: liquidacionConfig.limite_premio || "", // Use fetched values, default to empty string if undefined
        pernocte: liquidacionConfig.pernocte || "",
        precio_km: liquidacionConfig.precio_km || "",
      });
    }
  }, [liquidacionConfig]); // Run this effect whenever liquidacionConfig changes

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
      const resultUpdate = await updateLiquidacionConfig(formData); // This might not be the correct API call
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
    e.preventDefault();
    console.log("Form Data submitted:", formData);
    toast({
      title: "Configuración guardada",
      description: "La configuración ha sido guardada exitosamente.",
    });
  };

  if (liquidacionConfig === null) {
    // Display loading state while fetching config
    return (
      <div>
        <Loading /> Cargando configuración...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold pb-4">Configuración</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="limite_premio">Limite de premio</Label>
            <Input
              id="limite_premio"
              name="limite_premio"
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
              value={formData.pernocte}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precio_km">Precio / km</Label>
            <Input
              id="precio_km"
              name="precio_km"
              value={formData.precio_km}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <Button type="submit">{"Actualizar Datos"}</Button>
      </form>
    </div>
  );
}

export default Page; // Export the component with the correct name Page
