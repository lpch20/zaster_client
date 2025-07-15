// app/viajes/[id]/editar/page.tsx
import TripEditor from "@/components/trip-editor";

export default async function EditarCombustible({ params }: { params: { id: string } }) {
  // Aquí se obtiene la data real desde el backend

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Combustible</h1>
      <TripEditor tripId={params.id} />
    </div>
  );
}
