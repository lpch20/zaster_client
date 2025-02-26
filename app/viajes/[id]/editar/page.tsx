import { TripForm } from "@/components/trip-form"

// This would typically come from an API call
const sampleTrip = {
  id: 1,
  numero_viaje: "V001",
  numero_remito: "R001",
  fecha_viaje: "2023-05-15",
  remitente: "Empresa A",
  lugar_carga: "Puerto de Montevideo",
  destinatario: "Empresa B",
  lugar_descarga: "Tacuarembó",
  camion_id: "1",
  chofer_id: "1",
  guias: "G001, G002",
  detalle_carga: "50 cajas de mercadería",
  kms: 400,
  tarifa: 50,
  precio_flete: 20000,
  total_monto_uy: 20000,
  estado: "activo",
}

export default function EditarViajePage({ params }: { params: { id: string } }) {
  // Here you would fetch the trip data based on the ID
  const tripData = sampleTrip

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Viaje</h1>
      <TripForm initialData={tripData} />
    </div>
  )
}

