"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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

interface ClientComboboxFilterProps {
  clients: any[];
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  placeholder?: string;
  label?: string;
  compareIds?: (id1: any, id2: any) => boolean;
}

export function ClientComboboxFilter({
  clients,
  selectedClientId,
  onClientChange,
  placeholder = "Seleccionar cliente...",
  label,
  compareIds = (id1, id2) => String(id1).trim() === String(id2).trim(),
}: ClientComboboxFilterProps) {
  const [open, setOpen] = React.useState(false);

  const selectedClient = clients.find((c: any) => compareIds(c.id, selectedClientId));
  const displayText = selectedClient?.nombre || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput placeholder={`Buscar ${label?.toLowerCase() || "cliente"}...`} />
          <CommandList>
            <CommandEmpty>No se encontró ningún {label?.toLowerCase() || "cliente"}.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="todos"
                onSelect={() => {
                  onClientChange("todos");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedClientId === "todos" ? "opacity-100" : "opacity-0"
                  )}
                />
                Todos los {label?.toLowerCase() || "clientes"}
              </CommandItem>
              {clients
                .filter(
                  (client, index, self) =>
                    index === self.findIndex((c) => compareIds(c.id, client.id))
                )
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((client: any) => (
                  <CommandItem
                    key={client.id}
                    value={client.nombre}
                    onSelect={() => {
                      onClientChange(client.id.toString() === selectedClientId ? "todos" : client.id.toString());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        compareIds(selectedClientId, client.id) ? "opacity-100" : "opacity-0"
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
  );
}

