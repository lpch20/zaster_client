import CombustiblesList from "@/components/combustible/combustible-list"

export default function CombustiblePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Combustible</h1>
      <CombustiblesList />
    </div>
  )
}