import { TruckDetails } from "@/components/camiones/truck-details"

export default function CamionPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detalles del Camión</h1>
      <TruckDetails id={params.id} />
    </div>
  )
}

