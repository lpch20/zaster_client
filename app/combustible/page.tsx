import CombustiblesPage from "@/components/combustible-list"
import { TripList } from "@/components/trip-list"

export default function ViajePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Combustible</h1>
      <CombustiblesPage />
    </div>
  )
}

