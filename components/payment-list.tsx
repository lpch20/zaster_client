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

const samplePayments = [
  {
    id: 1,
    chofer: "Juan Pérez",
    viaje: "V001",
    fecha: "2024-02-15",
    total: 2500,
    pagado: true,
  },
  {
    id: 2,
    chofer: "María González",
    viaje: "V002",
    fecha: "2024-02-16",
    total: 3000,
    pagado: false,
  },
]

export function PaymentList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [payments, setPayments] = useState(samplePayments)

  const filteredPayments = payments.filter((payment) => {
    // Filtro por término de búsqueda
    const matchesSearch = Object.values(payment).some(
      (value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Filtro por rango de fechas
    const paymentDate = new Date(payment.fecha)
    const matchesDateRange =
      dateRange?.from && dateRange?.to ? paymentDate >= dateRange.from && paymentDate <= dateRange.to : true

    return matchesSearch && matchesDateRange
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar liquidaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
        <div className="flex justify-end">
          <Link href="/liquidaciones/nueva">
            <Button className="w-full sm:w-auto">Nueva Liquidación</Button>
          </Link>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chofer</TableHead>
              <TableHead className="hidden sm:table-cell">Viaje</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.chofer}</TableCell>
                <TableCell className="hidden sm:table-cell">{payment.viaje}</TableCell>
                <TableCell className="hidden md:table-cell">{payment.fecha}</TableCell>
                <TableCell>{payment.total.toLocaleString("es-UY", { style: "currency", currency: "UYU" })}</TableCell>
                <TableCell>
                  <Badge variant={payment.pagado ? "success" : "destructive"}>
                    {payment.pagado ? "Pagado" : "Pendiente"}
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
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id.toString())}>
                        Copiar ID de la liquidación
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/liquidaciones/${payment.id}`}>Ver detalles</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/liquidaciones/${payment.id}/editar`}>Modificar</Link>
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

