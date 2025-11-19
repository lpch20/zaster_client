import { PaymentList } from "@/components/liquidaciones/payment-list"

export default function LiquidacionesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Liquidaciones de Choferes</h1>
      <PaymentList />
    </div>
  )
}

