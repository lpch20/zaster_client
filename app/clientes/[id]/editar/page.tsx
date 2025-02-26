import { ClientForm } from "@/components/client-form"

// This would typically come from an API call
const sampleClient = {
  id: 1,
  nombre: "Empresa A",
  direccion: "Calle 123, Ciudad X",
  localidad: "Ciudad X",
  telefono: "1234567890",
  mail: "contacto@empresaa.com",
  rut: "123456789",
  dicose: "D12345",
  paraje: "Zona Industrial",
  otros: "Cliente preferencial",
  estado: "activo",
}

export default function EditarClientePage({ params }: { params: { id: string } }) {
  // Here you would fetch the client data based on the ID
  const clientData = sampleClient

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Cliente</h1>
      <ClientForm initialData={clientData} />
    </div>
  )
}

