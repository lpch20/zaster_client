import { DriverForm } from "@/components/driver-form"

// This would typically come from an API call
const sampleDriver = {
  id: 1,
  nombre: "Juan Pérez",
  cedula: "1234567-8",
}

export default function EditarChoferPage({ params }: { params: { id: string } }) {
  // Here you would fetch the driver data based on the ID
  const driverData = sampleDriver

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Chofer</h1>
      <DriverForm initialData={driverData} />
    </div>
  )
}

