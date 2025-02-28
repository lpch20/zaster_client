"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { DateRangeFilter } from "./date-range-filter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sampleTrips = [
  {
    id: 1,
    numero_viaje: "V001",
    fecha_viaje: "2024-02-15",
    remitente: "Empresa A",
    destinatario: "Empresa B",
    camion: "CAM001",
    chofer: "Juan Pérez",
    total_monto_uy: 5000,
    estado: "activo",
  },
  {
    id: 2,
    numero_viaje: "V002",
    fecha_viaje: "2024-02-16",
    remitente: "Empresa C",
    destinatario: "Empresa D",
    camion: "CAM002",
    chofer: "María González",
    total_monto_uy: 6500,
    estado: "inactivo",
  },
]

export function TripList({ limit }: { limit?: number }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [trips, setTrips] = useState(sampleTrips)

  const filteredTrips = trips
    .filter((trip) => {
      // Filtro por término de búsqueda
      const matchesSearch = Object.values(trip).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      // Filtro por rango de fechas
      const tripDate = new Date(trip.fecha_viaje)
      const matchesDateRange =
        dateRange?.from && dateRange?.to ? tripDate >= dateRange.from && tripDate <= dateRange.to : true

      return matchesSearch && matchesDateRange
    })
    .slice(0, limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar viajes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
        <div className="flex justify-end">
          <Link href="/viajes/nuevo">
            <Button className="w-full sm:w-auto">Nuevo Viaje</Button>
          </Link>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead className="hidden md:table-cell">Remitente</TableHead>
              <TableHead className="hidden md:table-cell">Destinatario</TableHead>
              <TableHead className="hidden lg:table-cell">Camión</TableHead>
              <TableHead className="hidden lg:table-cell">Chofer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>{trip.numero_viaje}</TableCell>
                <TableCell className="hidden sm:table-cell">{trip.fecha_viaje}</TableCell>
                <TableCell className="hidden md:table-cell">{trip.remitente}</TableCell>
                <TableCell className="hidden md:table-cell">{trip.destinatario}</TableCell>
                <TableCell className="hidden lg:table-cell">{trip.camion}</TableCell>
                <TableCell className="hidden lg:table-cell">{trip.chofer}</TableCell>
                <TableCell>
                  {trip.total_monto_uy.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}
                </TableCell>
                <TableCell>
                  <Badge variant={trip.estado === "activo" ? "success" : "destructive"}>
                    {trip.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(trip.id.toString())}>
                        Copiar ID del viaje
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/viajes/${trip.id}`}>Ver detalles</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/viajes/${trip.id}/editar`}>Modificar</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

