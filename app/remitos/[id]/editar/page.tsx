// app/remitos/[id]/editar/page.tsx (Server Component por defecto)
import RemitoEditor from "../../../../components/remittance-editor";

export default function EditarRemitoPage({ params }: { params: { id: string } }) {
  // Renderiza un Client Component y le pasas el ID

  console.log(params.id);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Remito</h1>
      <RemitoEditor remitoId={params.id} />
    </div>
  );
}
