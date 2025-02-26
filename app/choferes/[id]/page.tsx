import { DriverDetails } from "@/components/driver-details"

export default function ChoferPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detalles del Chofer</h1>
      <DriverDetails id={params.id} />
    </div>
  )
}

