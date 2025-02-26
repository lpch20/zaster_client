import { Activity } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "Viaje completado",
    description: "Viaje #V001 completado exitosamente",
    timestamp: "Hace 2 horas",
  },
  {
    id: 2,
    type: "Nuevo cliente",
    description: "Cliente 'Empresa XYZ' agregado al sistema",
    timestamp: "Hace 4 horas",
  },
  {
    id: 3,
    type: "Liquidación procesada",
    description: "Liquidación del chofer Juan Pérez procesada",
    timestamp: "Hace 1 día",
  },
  {
    id: 4,
    type: "Mantenimiento de camión",
    description: "Camión CAM001 programado para mantenimiento",
    timestamp: "Hace 2 días",
  },
]

export function RecentActivityFeed() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{activity.type}</p>
            <p className="text-sm text-gray-500">{activity.description}</p>
            <p className="text-xs text-gray-400">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

