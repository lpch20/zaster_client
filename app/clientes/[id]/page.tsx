import { ClientDetails } from "@/components/client-details"

export default function ClientePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detalles del Cliente</h1>
      <ClientDetails id={params.id} />
    </div>
  )
}

