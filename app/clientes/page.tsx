import { ClientList } from "@/components/clientes/client-list"

export default function ClientesPage() {
  return (
    <div className="space-y-6 mt-12 lg:mt-0">
      <h1 className="text-3xl font-bold">Clientes</h1>
      <ClientList />
    </div>
  )
}

