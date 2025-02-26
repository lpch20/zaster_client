import { PaymentForm } from "@/components/payment-form"

// This would typically come from an API call
const samplePayment = {
  id: 1,
  chofer_id: "1",
  viaje_id: "1",
  fecha: "2023-05-15",
  monto_bruto: 3000,
  descuentos: 500,
  monto_neto: 2500,
  metodo_pago: "transferencia",
  observaciones: "Pago por viaje a Tacuarembó",
  pagado: true,
}

export default function EditarLiquidacionPage({ params }: { params: { id: string } }) {
  // Here you would fetch the payment data based on the ID
  const paymentData = samplePayment

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Liquidación</h1>
      <PaymentForm initialData={paymentData} />
    </div>
  )
}

