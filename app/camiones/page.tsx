import { TruckList } from "@/components/camiones/truck-list"

export default function CamionesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Camiones</h1>
      <TruckList />
    </div>
  )
}

