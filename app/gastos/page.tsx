import CombustiblesPage from "@/components/combustible-list"
import GastosList from "@/components/gastos-list"
import { TripList } from "@/components/trip-list"

export default function GastoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gastos</h1>
      <GastosList />
    </div>
  )
}

