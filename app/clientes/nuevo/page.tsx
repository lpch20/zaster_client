import { ClientForm } from "@/components/client-form"

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
      <ClientForm />
    </div>
  )
}

