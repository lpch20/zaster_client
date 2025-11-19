"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { addRemito, addClient } from "@/api/RULE_insertData";
import {
  getCamiones,
  getChoferes,
  getClients,
  getRemitoNumber,
} from "@/api/RULE_getData";
import { updateRemito } from "@/api/RULE_updateData";
import { Loading } from "@/components/shared/spinner";

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string;
  file?: File;
}

export function RemittanceForm({ initialData }: { initialData?: any }) {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [choferes, setChoferes] = useState<any[]>([]);
  const [camiones, setCamiones] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [allImages, setAllImages] = useState<ImageData[]>([]);
  
  // ✅ Estados para el diálogo de crear cliente
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nombre: "",
    direccion: "",
    localidad: "",
    telefono: "",
    mail: "",
    rut: "",
    dicose: "",
    paraje: "",
    otros: "",
  });

  // ✅ Estados para el combobox de destinatario
  const [destinatarioOpen, setDestinatarioOpen] = useState(false);

  const [formData, setFormData] = useState<any>(
    initialData
      ? {
          ...initialData,
          camion_id: String(initialData.camion_id ?? ""),
          inspeccion: initialData.inspeccion ?? "",
          fecha: initialData.fecha
            ? (() => {
                try {
                  const date = new Date(initialData.fecha);
                  if (isNaN(date.getTime())) {
                    return "";
                  }
                  return date.toISOString().slice(0, 10);
                } catch (error) {
                  return "";
                }
              })()
            : "",
          chofer_id: String(initialData.chofer_id ?? ""),
          peaje: initialData.peaje ?? "",
          lavado: initialData.lavado ?? "",
          kilometros: initialData.kilometros ?? "",
          balanza: initialData.balanza ?? "",
          pernocte: String(initialData.pernocte ?? "false"),
          numero_guia: initialData.numero_guia ?? "",
          lugar_carga: initialData.lugar_carga ?? "",
          cantidad: initialData.cantidad ?? "",
          categoria: initialData.categoria ?? "",
          estado_embarcadero: initialData.estado_embarcadero ?? "",
          encierro_previo: String(initialData.encierro_previo ?? "false"),
          acceso_agua: String(initialData.acceso_agua ?? "false"),
          acceso_sombra: String(initialData.acceso_sombra ?? "false"),
          mezcla_categoria: String(initialData.mezcla_categoria ?? "false"),
          duracion_carga: initialData.duracion_carga ?? "",
          observaciones: initialData.observaciones ?? "",
          numero_remito: initialData.numero_remito ?? "",
          destinatario_id: String(initialData.destinatario_id ?? ""),
          propietario_name: initialData.propietario_name ?? "", // Campo correcto para el backend
          lugar_descarga: initialData.lugar_descarga ?? "",
          premio: initialData.premio ?? "", // ✅ NUEVO: Campo premio
        }
      : {
          camion_id: "",
          inspeccion: "",
          fecha: "",
          chofer_id: "",
          peaje: "",
          lavado: "",
          kilometros: "",
          balanza: "",
          pernocte: "false",
          numero_guia: "",
          lugar_carga: "",
          cantidad: "",
          categoria: "",
          estado_embarcadero: "",
          encierro_previo: "false",
          acceso_agua: "false",
          acceso_sombra: "false",
          mezcla_categoria: "false",
          duracion_carga: "",
          observaciones: "",
          numero_remito: "",
          destinatario_id: "",
          propietario_name: "", // Cambiado de propietario_id a propietario
          lugar_descarga: "",
          premio: "", // ✅ NUEVO: Campo premio
        }
  );

  const validateRequiredFields = () => {
    const requiredFields = [
      { field: "numero_remito", label: "Número de Remito" },
      { field: "camion_id", label: "Matrícula (Camión)" },
      { field: "fecha", label: "Fecha" },
      { field: "chofer_id", label: "Chofer" },
      { field: "kilometros", label: "Kilómetros" },
      { field: "pernocte", label: "Pernocte" },
      { field: "propietario_name", label: "Propietario" }, // Campo correcto
      { field: "lugar_carga", label: "Lugar de Carga" },
      { field: "destinatario_id", label: "Destino" },
      { field: "cantidad", label: "Cantidad" },
      { field: "categoria", label: "Categoría" },
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(({ label }) => label).join(", ");
      Swal.fire({
        title: "Campos Obligatorios",
        text: `Los siguientes campos son obligatorios: ${missingLabels}`,
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return false;
    }
    return true;
  };

  // cargar catálogos
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [cho, cam, cli] = await Promise.all([
        getChoferes(),
        getCamiones(),
        getClients(),
      ]);
      setChoferes(cho.result || []);
      setCamiones(cam.result || []);
      // ✅ ORDENAR CLIENTES ALFABÉTICAMENTE POR NOMBRE
      const filteredClients = (cli.result || []).filter((c: any) => !c.soft_delete);
      const sortedClients = filteredClients.sort((a: any, b: any) => {
        const nameA = (a.nombre || "").toLowerCase();
        const nameB = (b.nombre || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setClients(sortedClients);
      setLoading(false);
    };
    fetch();
  }, []);

  // número de remito
  useEffect(() => {
    const fetchLast = async () => {
      setLoading(true);
      const last = await getRemitoNumber();
      const next = initialData
        ? initialData.numero_remito
        : String(Number(last.result.numero_remito) + 1);
      setFormData((f: any) => ({ ...f, numero_remito: next }));
      setLoading(false);
    };
    fetchLast();
  }, [initialData]);

  // imágenes viejas
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((f: any) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const items = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      type: "new",
      file,
    }));
    if (allImages.length + items.length > 5) {
      Swal.fire("Error", "Máximo 5 archivos permitidos", "error");
      return;
    }
    setAllImages((p) => [...p, ...items]);
    e.target.value = "";
  };
  
  const handleRemoveImage = (id: string) =>
    setAllImages((p) => p.filter((i) => i.id !== id));

  // ✅ FUNCIÓN PARA CREAR NUEVO CLIENTE DESDE EL FORMULARIO
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ NO VALIDAR CAMPOS OBLIGATORIOS - Todos los campos son opcionales

    Swal.fire({
      title: "Creando cliente...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const result = await addClient(newClientData);
      Swal.close();
      
      if (result.result === true) {
        Swal.fire("Éxito", "Cliente creado exitosamente", "success");
        
        // Recargar la lista de clientes
        const cli = await getClients();
        const filteredClients = (cli.result || []).filter((c: any) => !c.soft_delete);
        const sortedClients = filteredClients.sort((a: any, b: any) => {
          const nameA = (a.nombre || "").toLowerCase();
          const nameB = (b.nombre || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setClients(sortedClients);
        
        // ✅ Seleccionar el nuevo cliente en el formulario
        // Usar setTimeout para asegurar que el estado se actualice después de que se actualice la lista
        setTimeout(() => {
          // Buscar por nombre o por RUT si el nombre no está disponible
          let newClient = sortedClients.find((c: any) => {
            if (newClientData.nombre && c.nombre) {
              return c.nombre.trim().toLowerCase() === newClientData.nombre.trim().toLowerCase();
            } else if (newClientData.rut && c.rut) {
              return String(c.rut).trim() === String(newClientData.rut).trim();
            }
            return false;
          });
          
          // ✅ Si no se encuentra por nombre o RUT, tomar el último cliente (el más reciente)
          if (!newClient && sortedClients.length > 0) {
            // Ordenar por ID descendente para obtener el más reciente
            const sortedById = [...sortedClients].sort((a: any, b: any) => Number(b.id) - Number(a.id));
            newClient = sortedById[0];
            console.log("🔍 DEBUG remittance-form - Cliente no encontrado por nombre/RUT, usando el más reciente:", newClient);
          }
          
          if (newClient) {
            console.log("✅ DEBUG remittance-form - Cliente seleccionado:", {
              id: newClient.id,
              nombre: newClient.nombre,
              destinatario_id_antes: formData.destinatario_id
            });
            setFormData((prev: any) => {
              const updated = { ...prev, destinatario_id: String(newClient.id) };
              console.log("✅ DEBUG remittance-form - destinatario_id después:", updated.destinatario_id);
              return updated;
            });
            // ✅ Cerrar el popover del combobox si estaba abierto
            setDestinatarioOpen(false);
          } else {
            console.warn("⚠️ DEBUG remittance-form - No se pudo encontrar el cliente recién creado");
          }
        }, 100);
        
        // Limpiar el formulario y cerrar el diálogo
        setNewClientData({
          nombre: "",
          direccion: "",
          localidad: "",
          telefono: "",
          mail: "",
          rut: "",
          dicose: "",
          paraje: "",
          otros: "",
        });
        setIsClientDialogOpen(false);
      } else {
        Swal.fire("Error", "No se pudo crear el cliente", "error");
      }
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Hubo un problema al crear el cliente", "error");
      console.error("Error al crear cliente:", error);
    }
  };

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClientData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Variable derivada para el nombre del destinatario seleccionado
  const selectedDestinatarioName = formData.destinatario_id
    ? clients.find((client: any) => client.id.toString() === formData.destinatario_id)?.nombre || "Seleccionar destinatario"
    : "Seleccionar destinatario";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios antes de continuar
    if (!validateRequiredFields()) {
      return;
    }
  
    Swal.fire({
      title: initialData ? "Actualizando..." : "Creando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v as any));
    fd.append(
      "oldImages",
      JSON.stringify(allImages.filter((i) => i.type === "old").map((i) => i.url))
    );
    allImages
      .filter((i) => i.type === "new" && i.file)
      .forEach((i) => fd.append("archivos", i.file!));
  
    const resp = initialData ? await updateRemito(fd) : await addRemito(fd);
    Swal.close();
    if (resp.result) {
      Swal.fire("Éxito", "Remito guardado", "success");
      setFormKey((k) => k + 1);
      router.push("/remitos");
    } else {
      Swal.fire("Error", "No se pudo guardar el remito", "error");
    }
  };

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_remito">Número de Remito *</Label>
          <Input
            id="numero_remito"
            name="numero_remito"
            value={formData.numero_remito}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="camion_id">Camión *</Label>
          <Select
            name="camion_id"
            value={formData.camion_id}
            onValueChange={(v) =>
              setFormData((f: any) => ({ ...f, camion_id: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Camión" />
            </SelectTrigger>
            <SelectContent>
              {camiones.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.modelo} {c.matricula}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha *</Label>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chofer_id">Chofer *</Label>
          <Select
            name="chofer_id"
            value={formData.chofer_id}
            onValueChange={(v) =>
              setFormData((f: any) => ({ ...f, chofer_id: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Chofer" />
            </SelectTrigger>
            <SelectContent>
              {choferes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre} {c.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kilometros">Kilómetros *</Label>
          <Input
            id="kilometros"
            name="kilometros"
            type="number"
            value={formData.kilometros}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pernocte">Pernocte *</Label>
          <Select
            name="pernocte"
            value={formData.pernocte}
            onValueChange={(v) =>
              setFormData((f: any) => ({ ...f, pernocte: v }))
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

        {/* Campo de Propietario cambiado a Input libre */}
        <div className="space-y-2">
          <Label htmlFor="propietario_name">Propietario *</Label>
          <Input
            id="propietario_name"
            name="propietario_name"
            value={formData.propietario_name}
            onChange={handleChange}
            placeholder="Nombre del propietario"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lugar_carga">Lugar de Carga *</Label>
          <Input
            id="lugar_carga"
            name="lugar_carga"
            value={formData.lugar_carga}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lugar_descarga">Lugar de Descarga</Label>
          <Input
            id="lugar_descarga"
            name="lugar_descarga"
            value={formData.lugar_descarga}
            onChange={handleChange}
            placeholder="Lugar de descarga"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
          <Label htmlFor="destinatario_id">Destino *</Label>
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="text-xs">
                  + Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                  <DialogDescription>
                    Complete los datos del nuevo cliente. Todos los campos son opcionales.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_client_nombre">Nombre</Label>
                      <Input
                        id="new_client_nombre"
                        name="nombre"
                        value={newClientData.nombre}
                        onChange={handleNewClientChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_client_rut">RUT</Label>
                      <Input
                        id="new_client_rut"
                        name="rut"
                        value={newClientData.rut}
                        onChange={handleNewClientChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_client_direccion">Dirección</Label>
                      <Input
                        id="new_client_direccion"
                        name="direccion"
                        value={newClientData.direccion}
                        onChange={handleNewClientChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_client_localidad">Localidad</Label>
                      <Input
                        id="new_client_localidad"
                        name="localidad"
                        value={newClientData.localidad}
                        onChange={handleNewClientChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_client_telefono">Teléfono</Label>
                      <Input
                        id="new_client_telefono"
                        name="telefono"
                        value={newClientData.telefono}
                        onChange={handleNewClientChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_client_mail">Email</Label>
                      <Input
                        id="new_client_mail"
                        name="mail"
                        type="email"
                        value={newClientData.mail}
                        onChange={handleNewClientChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_client_dicose">DICOSE</Label>
                      <Input
                        id="new_client_dicose"
                        name="dicose"
                        value={newClientData.dicose}
                        onChange={handleNewClientChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_client_paraje">Paraje</Label>
                      <Input
                        id="new_client_paraje"
                        name="paraje"
                        value={newClientData.paraje}
                        onChange={handleNewClientChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_client_otros">Otros</Label>
                    <Input
                      id="new_client_otros"
                      name="otros"
                      value={newClientData.otros}
                      onChange={handleNewClientChange}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsClientDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Cliente</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {/* ✅ COMBobox para Destinatario con autocompletado */}
          <Popover open={destinatarioOpen} onOpenChange={setDestinatarioOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={destinatarioOpen}
                className="w-full justify-between"
              >
                {selectedDestinatarioName}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Buscar destinatario..."
                />
                <CommandList>
                  <CommandEmpty>No se encontró ningún destinatario.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client: any) => (
                      <CommandItem
                        key={client.id}
                        value={client.nombre || ""}
                        onSelect={() => {
                          setFormData((prev: any) => ({
                            ...prev,
                            destinatario_id: client.id.toString(),
                          }));
                          setDestinatarioOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.destinatario_id === client.id.toString()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {client.nombre}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad *</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="number"
            value={formData.cantidad}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría *</Label>
          <Input
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
          />
        </div>

        {/* ✅ NUEVO: Campo premio */}
        <div className="space-y-2">
          <Label htmlFor="premio">Premio</Label>
          <Input
            id="premio"
            name="premio"
            type="number"
            value={formData.premio}
            onChange={handleChange}
            placeholder="Monto del premio (opcional)"
          />
        </div>

        {/* Campos opcionales */}
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
          <Label htmlFor="numero_guia">Número de Guía</Label>
          <Input
            id="numero_guia"
            name="numero_guia"
            value={formData.numero_guia}
            onChange={handleChange}
          />
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="estado_embarcadero">Estado Embarcadero</Label>
          <Input
            id="estado_embarcadero"
            name="estado_embarcadero"
            value={formData.estado_embarcadero}
            onChange={handleChange}
          />
        </div> */}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="min-h-[80px] sm:min-h-[100px]"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Archivos (total {allImages.length}/5)</Label>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {allImages.map((img) => {
              let src = "";
              let link = "";
              if (img.type === "old") {
                link = `https://drive.google.com/file/d/${img.url}/view?usp=sharing`;
                src = `https://www.googleapis.com/drive/v3/files/${img.url}?alt=media&key=API_KEY`;
              } else {
                src = URL.createObjectURL(img.file!);
                link = "#";
              }
              return (
                <div key={img.id} className="relative">
                  <a href={link} target="_blank" rel="noreferrer">
                    <img
                      src={src}
                      alt="Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                      onError={(e) => (e.currentTarget.src = "/pdf-icon.jpeg")}
                    />
                  </a>
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs"
                    onClick={() => handleRemoveImage(img.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <Input type="file" multiple onChange={handleFileChange} className="w-full" />
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        {initialData ? "Editar Remito" : "Guardar Remito"}
      </Button>
    </form>
  );
}