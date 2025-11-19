"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addClient } from "@/api/RULE_insertData";
import { getClients } from "@/api/RULE_getData";
import Swal from "sweetalert2";

interface TripFormClientSelectorProps {
  clients: any[];
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  onClientsReload: () => void;
  label?: string;
  placeholder?: string;
}

export function TripFormClientSelector({
  clients,
  selectedClientId,
  onClientChange,
  onClientsReload,
  label = "Destinatario",
  placeholder = "Seleccionar destinatario",
}: TripFormClientSelectorProps) {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [destinatarioOpen, setDestinatarioOpen] = useState(false);
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

  const selectedClientName = selectedClientId
    ? clients.find((client: any) => client.id.toString() === selectedClientId)?.nombre || placeholder
    : placeholder;

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

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
        
        const cli = await getClients();
        const filteredClients = (cli.result || []).filter((c: any) => !c.soft_delete);
        const sortedClients = filteredClients.sort((a: any, b: any) => {
          const nameA = (a.nombre || "").toLowerCase();
          const nameB = (b.nombre || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        onClientsReload();
        
        setTimeout(() => {
          let newClient = sortedClients.find((c: any) => {
            if (newClientData.nombre && c.nombre) {
              return c.nombre.trim().toLowerCase() === newClientData.nombre.trim().toLowerCase();
            } else if (newClientData.rut && c.rut) {
              return String(c.rut).trim() === String(newClientData.rut).trim();
            }
            return false;
          });
          
          if (!newClient && sortedClients.length > 0) {
            const sortedById = [...sortedClients].sort((a: any, b: any) => Number(b.id) - Number(a.id));
            newClient = sortedById[0];
          }
          
          if (newClient) {
            onClientChange(String(newClient.id));
            setDestinatarioOpen(false);
          }
        }, 100);
        
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="destinatario_id">{label}</Label>
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
      <Popover open={destinatarioOpen} onOpenChange={setDestinatarioOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={destinatarioOpen}
            className="w-full justify-between"
          >
            {selectedClientName}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={true}>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No se encontró ningún {label.toLowerCase()}.</CommandEmpty>
              <CommandGroup>
                {clients.map((client: any) => (
                  <CommandItem
                    key={client.id}
                    value={client.nombre || ""}
                    onSelect={() => {
                      onClientChange(client.id.toString());
                      setDestinatarioOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedClientId === client.id.toString()
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
  );
}

