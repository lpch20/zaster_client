import { TripDetails } from "@/components/viajes/trip-details"

export default function CombustiblePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detalles del Gasto del combustible</h1>
      <TripDetails id={params.id} />
    </div>
  )
}

