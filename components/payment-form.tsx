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
  getTrip,
  getRemitoById,
  getLiquidacionConfig,
  getTripNotUploadInLiquidation,
} from "@/api/RULE_getData";
import { useRouter } from 'next/navigation';
import { updateLiquidacion } from "@/api/RULE_updateData";
import { addLiquidacion } from "@/api/RULE_insertData";

export function PaymentForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [trips, setTrips] = useState([]);
  const [totalChoferes, setTotalChoferes] = useState([]);
  const [liquidacionConfig, setLiquidacionConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Inicializamos formData como objeto (ya sea con initialData o con defaults)
  const [formData, setFormData] = useState(() => {
    return (
      initialData ? {
        ...initialData,
        viaje_id: initialData.viaje_id ? initialData.viaje_id.toString() : "",
        chofer_id: initialData.chofer_id ? initialData.chofer_id.toString() : "",
      } : {
        viaje_id: "",
        kms_viaje: "",
        minimo_kms_liquidar: 100,
        limite_premio: "",
        kms_liquidar: "",
        precio_km: "",
        subtotal: "",
        pernocte: "",
        gastos: "",
        total_a_favor: "",
        liquidacion_pagada: false,
        chofer_id: ""
      }
    );
  });

  // Actualizamos formData cuando initialData cambie (y normalizamos algunos valores)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...initialData,
        viaje_id: initialData.viaje_id ? initialData.viaje_id.toString() : "",
        chofer_id: initialData.chofer_id ? initialData.chofer_id.toString() : "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // const getTripFunction = async () => {
  //   try {
  //     setLoading(true);
  //     const result = await getTrip();
  //     setTrips(result.result);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //     setLoading(false);
  //   }
  // };

  const getTripFunction = async () => {
    try {
      setLoading(true);
      const result = await getTripNotUploadInLiquidation();
      setTrips(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getTotalChoferes = async () => {
    try {
      setLoading(true);
      const result = await getChoferes();
      setTotalChoferes(result.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calcular los valores
    const kmsViaje = Number(formData.kms_viaje);
    const precioKm = Number(formData.precio_km);
    const minimoKms = Number(formData.minimo_kms_liquidar);
    const gastos = Number(formData.gastos);
    const pernocte = Number(formData.pernocte);

    const kms_liquidar = kmsViaje < 100 ? minimoKms : kmsViaje;
    const subtotal = kmsViaje < 100 ? minimoKms * precioKm : kmsViaje * precioKm;
    const total_a_favor = subtotal + gastos + pernocte;

    const dataToSend = {
      ...formData,
      kms_liquidar,
      subtotal,
      total_a_favor,
    };

    Swal.fire({
      title: "Creando liquidación...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      if (initialData) {
        const resultUpdate = await updateLiquidacion(dataToSend);
        Swal.close();
        if (resultUpdate.result === true) {
          Swal.fire("Éxito", "Liquidación guardada exitosamente", "success");
          router.push("/liquidaciones")
        }
      } else {
        const resultInsert = await addLiquidacion(dataToSend);
        Swal.close();
        if (resultInsert.result === true) {
          Swal.fire("Éxito", "Liquidación guardada exitosamente", "success");
          router.push("/liquidaciones")
        }
      }
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Hubo un problema al guardar la liquidación.", "error");
    }
    toast({
      title: "Liquidación guardada",
      description: "La liquidación ha sido guardada exitosamente.",
    });
  };

  const getConfigLiquiData = async () => {
    try {
      const result = await getLiquidacionConfig();
      if (result && result.result && result.result.length > 0) {
        setLiquidacionConfig(result.result[0]);
      } else {
        setLiquidacionConfig({});
      }
    } catch (error) {
      console.error("Error fetching liquidacion config:", error);
      setLiquidacionConfig({});
    }
  };

  useEffect(() => {
    getTripFunction();
    getTotalChoferes();
  }, []);

  useEffect(() => {
    getConfigLiquiData();
  }, []);

  useEffect(() => {
    if (liquidacionConfig) {
      // Puedes ajustar este cálculo según la lógica deseada.
      const pernocteValue = formData.pernocte || liquidacionConfig.pernocte || "";
      setFormData((prev: any) => ({
        ...prev,
        limite_premio: liquidacionConfig.limite_premio || "",
        pernocte: pernocteValue,
        precio_km: liquidacionConfig.precio_km || "",
      }));
    }
  }, [liquidacionConfig]);

  const handleViajeChange = async (value: string) => {
    setFormData((prev: any) => ({ ...prev, viaje_id: value }));
    const selectedTrip = trips.find((trip: any) => trip.id.toString() === value);

    if (selectedTrip) {
      const gastosCalculados =
        Number(selectedTrip.lavado || 0) +
        Number(selectedTrip.peaje || 0) +
        Number(selectedTrip.balanza || 0) +
        Number(selectedTrip.sanidad || 0) +
        Number(selectedTrip.inspeccion || 0);

      setLoading(true);

      try {
        const data = await getRemitoById(selectedTrip.remito_id);
        // Si la respuesta trae pernocte, lo usamos
        const pernocteValue = data.result?.pernocte === true ? liquidacionConfig?.pernocte || "" : "";
        setFormData((prev: any) => ({
          ...prev,
          viaje_id: value,
          kms_viaje: selectedTrip.kms || "",
          pernocte: pernocteValue,
          gastos: gastosCalculados.toString(),
          chofer_id: selectedTrip.chofer_id.toString(),
        }));
      } catch (error) {
        setFormData((prev: any) => ({
          ...prev,
          viaje_id: value,
          kms_viaje: selectedTrip.kms || "",
          pernocte: "",
          gastos: gastosCalculados.toString(),
          chofer_id: "",
        }));
      } finally {
        setLoading(false);
      }
    } else {
      setFormData((prev: any) => ({
        ...prev,
        viaje_id: value,
        kms_viaje: "",
        pernocte: "",
        gastos: "",
        chofer_id: "",
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="viaje_id">Viaje</Label>
          <Select name="viaje_id" onValueChange={handleViajeChange} value={formData.viaje_id}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar viaje">
                {trips.find((trip: any) => trip.id.toString() === formData.viaje_id)?.numero_viaje}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip: any) => (
                <SelectItem key={trip.id} value={trip.id.toString()}>
                  {trip.numero_viaje}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chofer_id">Chofer</Label>
          <Select
            name="chofer_id"
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, chofer_id: value }))
            }
            value={formData.chofer_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar chofer">
                {totalChoferes.find((chofer: any) => chofer.id.toString() === formData.chofer_id)?.nombre}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {totalChoferes.map((chofer: any) => (
                <SelectItem key={chofer.id} value={chofer.id.toString()}>
                  {chofer.nombre}
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
            required
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimo_kms_liquidar">Minimo KMs a Liquidar</Label>
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
          <Label htmlFor="limite_premio">Limite Premio</Label>
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
          <Label htmlFor="kms_liquidar">KMs a Liquidar</Label>
          <Input
            id="kms_liquidar"
            name="kms_liquidar"
            type="number"
            value={formData.kms_viaje} // Si usas un cálculo, asegúrate de que corresponda
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
              Number(formData.kms_viaje) < 100
                ? Number(formData.minimo_kms_liquidar) * Number(formData.precio_km)
                : Number(formData.kms_viaje) * Number(formData.precio_km)
            }
            required
            disabled
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
            onChange={handleChange}
            required
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_a_favor">Total a Favor</Label>
          <Input
            id="total_a_favor"
            name="total_a_favor"
            type="number"
            value={
              Number(formData.kms_viaje) < 100
                ? Number(formData.minimo_kms_liquidar) * Number(formData.precio_km) +
                  Number(formData.gastos) +
                  Number(formData.pernocte) + Number(formData.limite_premio)
                : Number(formData.kms_viaje) * Number(formData.precio_km) +
                  Number(formData.gastos) +
                  Number(formData.pernocte) + Number(formData.limite_premio)
            }
            required
            disabled
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
