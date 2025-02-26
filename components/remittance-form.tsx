"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
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
import { useToast } from "@/components/ui/use-toast";
import { addRemito } from "@/api/RULE_insertData";
import { getChoferes } from "@/api/RULE_getData";

export function RemittanceForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(0);
  const [formData, setFormData] = useState(
    initialData || {
      numero_remito: "",
      fecha: "",
      propietario_id: "",
      viaje_id: "",
      remitente: "",
      destinatario: "",
      lugar_carga: "",
      lugar_descarga: "",
      detalle_carga: "",
      peso: "",
      volumen: "",
      observaciones: "",
      total: "",
      matricula: "",
      inspeccion: "",
      fecha_inspeccion: "",
      chofer_id: "",
      peaje: "",
      lavado: "",
      kilometros: "",
      balanza: "",
      pernocte: "false",
      propietario: "",
      numero_guia: "",
      hora_carga: "",
      cantidad: "",
      destino_id: "",
      hora_destino: "",
      categoria: "",
      consignatario: "",
      estado_embarcadero: "BUENO",
      encierro_previo: "false",
      acceso_agua: "false",
      acceso_sombra: "false",
      mezcla_categoria: "false",
      duracion_carga: "",
      encargado: "",
      recibido_por: "",
      cuadruplicado: "",
    }
  );
  const [choferes, setChoferes] = useState([]);

  useEffect(() => {
    const fetchChoferes = async () => {
      try {
        const result = await getChoferes();
        if (result && result.result) {
          setChoferes(result.result);
        }
      } catch (error) {
        console.error("Error fetching choferes:", error);
      }
    };

    fetchChoferes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response: any = await addRemito(formData);
      console.log(response);

      if (response.result == true) {
        setFormData(initialData || {});
        setFormKey((prevKey) => prevKey + 1);
        Swal.fire({
          title: "Éxito",
          text: "El remito ha sido guardado exitosamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (error: any) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al guardar el remito.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Existing Fields */}
        <div className="space-y-2">
          <Label htmlFor="numero_remito">Número de Remito</Label>
          <Input
            id="numero_remito"
            name="numero_remito"
            value={formData.numero_remito}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input
            id="matricula"
            name="matricula"
            value={formData.matricula}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inspeccion">Inspección</Label>
          <Input
            id="inspeccion"
            name="inspeccion"
            value={formData.inspeccion}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha Remito</Label>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chofer_id">Chofer</Label>
            <Select
            name="chofer_id"
            value={formData.chofer_id}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, chofer_id: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Chofer" />
            </SelectTrigger>
            <SelectContent>
              {choferes.map((chofer) => (
                <SelectItem key={chofer.id} value={chofer.id.toString()}>
                  {chofer.nombre} {chofer.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="peaje">Peaje</Label>
          <Input
            id="peaje"
            name="peaje"
            type="number"
            value={formData.peaje}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lavado">Lavado</Label>
          <Input
            id="lavado"
            name="lavado"
            type="number"
            value={formData.lavado}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kilometros">Kilómetros</Label>
          <Input
            id="kilometros"
            name="kilometros"
            type="number"
            value={formData.kilometros}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balanza">Balanza</Label>
          <Input
            id="balanza"
            name="balanza"
            type="number"
            value={formData.balanza}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pernocte">Pernocte</Label>
          <Select
            name="pernocte"
            value={formData.pernocte}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, pernocte: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="propietario_id">Propietario</Label>
          <Select
            name="propietario_id"
            value={formData.propietario_id}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, propietario_id: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Empresa A</SelectItem>
              <SelectItem value="2">Empresa B</SelectItem>
              <SelectItem value="3">Empresa C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero_guia">Número de Guía</Label>
          <Input
            id="numero_guia"
            name="numero_guia"
            value={formData.numero_guia}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lugar_carga">Lugar de Carga</Label>
          <Input
            id="lugar_carga"
            name="lugar_carga"
            value={formData.lugar_carga}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_carga">Hora de Carga</Label>
          <Input
            id="hora_carga"
            name="hora_carga"
            type="time"
            value={formData.hora_carga}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destino">Destino</Label>
          <Select
            name="destino_id"
            value={formData.destino_id}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, destino_id: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Empresa A</SelectItem>
              <SelectItem value="2">Empresa B</SelectItem>
              <SelectItem value="3">Empresa C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_destino">Hora de Destino</Label>
          <Input
            id="hora_destino"
            name="hora_destino"
            type="time"
            value={formData.hora_destino}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Input
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="number"
            value={formData.cantidad}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="consignatario">Consignatario</Label>
          <Input
            id="consignatario"
            name="consignatario"
            value={formData.consignatario}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuadruplicado">Cuadruplicado</Label>
          <Input
            id="cuadruplicado"
            name="cuadruplicado"
            value={formData.cuadruplicado}
            onChange={handleChange}
          />
        </div>

        <div className="w-full lg:pt-10 lg:pb-4 pt-8">
          <h3 className="font-semibold text-2xl">Condiciones de la Carga</h3>
        </div>
        <br className="hidden lg:block" />
        <div className="space-y-2">
          <Label htmlFor="estado_embarcadero">Estado Embarcadero</Label>
          <Select
            name="estado_embarcadero"
            value={formData.estado_embarcadero}
            onValueChange={(value) =>
              setFormData((prev: any) => ({
                ...prev,
                estado_embarcadero: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUENO">BUENO</SelectItem>
              <SelectItem value="REGULAR">REGULAR</SelectItem>
              <SelectItem value="MALO">MALO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="encierro_previo">Encierro Previo</Label>
          <Select
            name="encierro_previo"
            value={formData.encierro_previo}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, encierro_previo: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="acceso_agua">Acceso Agua</Label>
          <Select
            name="acceso_agua"
            value={formData.acceso_agua}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, acceso_agua: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="acceso_sombra">Acceso Sombra</Label>
          <Select
            name="acceso_sombra"
            value={formData.acceso_sombra}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, acceso_sombra: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mezcla_categoria">Mezcla Categoría y Lotes</Label>
          <Select
            name="mezcla_categoria"
            value={formData.mezcla_categoria}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, mezcla_categoria: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duracion_carga">Duración de Carga (minutos)</Label>
          <Input
            id="duracion_carga"
            name="duracion_carga"
            type="number"
            value={formData.duracion_carga}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="encargado">Encargado</Label>
          <Input
            id="encargado"
            name="encargado"
            value={formData.encargado}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recibido_por">Recibido Por</Label>
          <Input
            id="recibido_por"
            name="recibido_por"
            value={formData.recibido_por}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
        />
      </div>
      <Button type="submit">Guardar Remito</Button>
    </form>
  );
}
