"use client"

import { getChoferesById } from "@/api/RULE_getData"
import { DriverForm } from "@/components/choferes/driver-form"
import { useEffect, useState } from "react"

export default function EditarChoferPage({ params }: { params: { id: string } }) {
  const [choferData, setChoferData] = useState("")

  const choferDataFunction = async() =>{
    try {
     const result = await getChoferesById([params.id])
     console.log(result)
     setChoferData(result.result)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    choferDataFunction();
    console.log(params.id)
  },[])
  useEffect(()=>{
    console.log(choferData)
  },[choferData])
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Chofer</h1>
      <DriverForm initialData={choferData} />
    </div>
  )
}

