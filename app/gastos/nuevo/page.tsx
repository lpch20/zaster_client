import { CombustibleForm } from "@/components/combustible-form"
import { GastosForm } from "@/components/gastos-form"

export default function NuevoGastoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevos Datos de Gasto</h1>
      <GastosForm />
    </div>
  )
}

