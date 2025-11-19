// app/combustible/[id]/editar/page.tsx
"use client"

import { getCombustibleById } from "@/api/RULE_getData"
import { CombustibleForm } from "@/components/combustible/combustible-form"
import { useEffect, useState } from "react"

export default function EditarCombustiblePage({ params }: { params: { id: string } }) {
  const [combustibleData, setCombustibleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const combustibleDataFunction = async() => {
    try {
      setLoading(true)
      const result = await getCombustibleById(params.id)
      console.log("Datos de combustible obtenidos:", result)
      setCombustibleData(result)
    } catch (error) {
      console.error("Error al obtener datos del combustible:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    combustibleDataFunction();
    console.log("ID del combustible:", params.id)
  }, [params.id])

  useEffect(() => {
    console.log("Estado combustibleData actualizado:", combustibleData)
  }, [combustibleData])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Editar Combustible</h1>
        <p>Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Combustible</h1>
      <CombustibleForm initialData={combustibleData} />
    </div>
  )
}