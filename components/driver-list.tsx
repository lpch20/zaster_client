"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const sampleDrivers = [
  {
    id: 1,
    nombre: "Juan Pérez",
    cedula: "1234567-8",
  },
  {
    id: 2,
    nombre: "María González",
    cedula: "9876543-2",
  },
  // Add more sample drivers here
]

export function DriverList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDrivers = sampleDrivers.filter((driver) =>
    Object.values(driver).some(
      (value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar choferes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/choferes/nuevo">
          <Button>Nuevo Chofer</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDrivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.nombre}</TableCell>
              <TableCell>{driver.cedula}</TableCell>
              <TableCell>
                <Link href={`/choferes/${driver.id}`}>
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

