import { TripDetails } from "@/components/viajes/trip-details"

export default function GastosPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detalles de Gastos</h1>
      <TripDetails id={params.id} />
    </div>
  )
}

