// app/combustible/nuevo/page.tsx
import { CombustibleForm } from "@/components/combustible-form"

export default function NuevoCombustiblePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Registro de Combustible</h1>
      <CombustibleForm />
    </div>
  )
}