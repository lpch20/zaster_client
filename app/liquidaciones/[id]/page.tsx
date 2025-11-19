import { PaymentDetails } from "@/components/liquidaciones/payment-details"

export default function LiquidacionPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detalles de la Liquidación</h1>
      <PaymentDetails id={params.id} />
    </div>
  )
}

