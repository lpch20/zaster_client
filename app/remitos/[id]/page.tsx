import { RemittanceDetails } from "@/components/remitos/remittance-details"

export default function RemitoPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detalles del Remito</h1>
      <RemittanceDetails id={params.id} />
    </div>
  )
}

