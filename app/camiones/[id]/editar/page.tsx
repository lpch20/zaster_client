"use client"

import { getCamionesById } from "@/api/RULE_getData"
import { TruckForm } from "@/components/camiones/truck-form"
import { useEffect, useState } from "react"

export default function EditarCamionPage({ params }: { params: { id: string } }) {
  const [camionData, setcamionData] = useState("")

  const camionDataFunction = async() =>{
    try {
     const result = await getCamionesById([params.id])
     console.log(result)
     setcamionData(result.result)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    camionDataFunction();
  },[])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Camión</h1>
      <TruckForm initialData={camionData} />
    </div>
  )
}

