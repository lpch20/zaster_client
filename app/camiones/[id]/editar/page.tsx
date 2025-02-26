import { TruckForm } from "@/components/truck-form"

// This would typically come from an API call
const sampleTruck = {
  id: 1,
  identificador: "CAM001",
  matricula: "ABC123",
  modelo: "Volvo FH16",
  matricula_zorra: "XYZ789",
}

export default function EditarCamionPage({ params }: { params: { id: string } }) {
  // Here you would fetch the truck data based on the ID
  const truckData = sampleTruck

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Camión</h1>
      <TruckForm initialData={truckData} />
    </div>
  )
}

