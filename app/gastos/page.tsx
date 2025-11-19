// app/gastos/page.tsx (actualizada)
import GastosList from "@/components/gastos/gastos-list"

export default function GastosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gastos</h1>
      <GastosList />
    </div>
  )
}