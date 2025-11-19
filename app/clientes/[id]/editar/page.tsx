"use client"

import { getClientsById } from "@/api/RULE_getData"
import { ClientForm } from "@/components/clientes/client-form"
import { useEffect, useState } from "react"


export default function EditarClientePage({ params }: { params: { id: string } }) {
  const [clientData, setClientData] = useState("")



  const clientDataFunction = async() =>{
    try {
     const result = await getClientsById([params.id])
     console.log(result)
     setClientData(result.result[0])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    clientDataFunction();
    console.log(params.id)
  },[])
  useEffect(()=>{
    console.log(clientData)
  },[clientData])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Cliente</h1>
      <ClientForm initialData={clientData} />
    </div>
  )
}

