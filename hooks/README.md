# Hooks - Zaster Frontend

## 📁 Estructura de Hooks

Los hooks están organizados por dominio y compartidos:

```
hooks/
├── shared/              # ✅ Hooks compartidos/reutilizables
│   ├── use-subscription.ts    # Manejo de suscripciones
│   ├── use-mobile.tsx         # Detección de dispositivos móviles
│   ├── use-toast.ts           # Sistema de notificaciones toast
│   ├── use-pagination.ts      # Manejo de paginación
│   ├── use-date-filter.ts     # Filtrado por fechas
│   ├── use-search-filter.ts   # Búsqueda genérica
│   └── index.ts               # Exportaciones centralizadas
│
└── viajes/              # ✅ Hooks específicos de viajes
    ├── use-trip-calculations.ts
    └── index.ts
```

## 🎣 Hooks Disponibles

### Hooks Compartidos (`shared/`)

#### `useSubscription`
Maneja el estado de suscripción del usuario.

```typescript
const { subscription, loading, hasActiveSubscription, refetchSubscription } = useSubscription();
```

#### `useIsMobile`
Detecta si el dispositivo es móvil.

```typescript
const isMobile = useIsMobile();
```

#### `useToast`
Sistema de notificaciones toast.

```typescript
const { toast } = useToast();
toast({ title: "Éxito", description: "Operación completada" });
```

#### `usePagination`
Maneja la paginación de listas.

```typescript
const { currentPage, totalPages, setCurrentPage, paginatedItems } = usePagination({
  itemsPerPage: 15,
  totalItems: 100,
  dependencies: [searchTerm]
});
```

#### `useDateFilter`
Filtrado por rango de fechas con normalización de zona horaria.

```typescript
const { dateRange, setDateRange, matchesDateRange } = useDateFilter();
```

#### `useSearchFilter`
Búsqueda genérica en objetos.

```typescript
const { searchTerm, setSearchTerm, matchesSearch } = useSearchFilter();
```

### Hooks Específicos de Dominio

#### `useTripCalculations` (viajes)
Calcula todos los totales y montos de un viaje.

```typescript
const { precioFleteCalculado, totalMontoUY, totalMontoUSS } = useTripCalculations(formData);
```

## 📦 Importaciones

### Importar desde shared
```typescript
// Opción 1: Importar directamente
import { useSubscription } from "@/hooks/shared/use-subscription";

// Opción 2: Importar desde el índice (recomendado)
import { useSubscription, useToast, usePagination } from "@/hooks/shared";
```

### Importar hooks específicos
```typescript
import { useTripCalculations } from "@/hooks/viajes";
```

## 🚀 Agregar Nuevos Hooks

### Hook Compartido
1. Crear el archivo en `hooks/shared/`
2. Agregar la exportación en `hooks/shared/index.ts`

### Hook Específico de Dominio
1. Crear la carpeta del dominio si no existe: `hooks/[dominio]/`
2. Crear el archivo del hook
3. Agregar la exportación en `hooks/[dominio]/index.ts`

## 📝 Convenciones

- **Nombres**: Usar `use` como prefijo (ej: `useSubscription`)
- **Ubicación**: Hooks compartidos en `shared/`, hooks específicos en su dominio
- **Exportaciones**: Crear `index.ts` en cada carpeta para exportaciones centralizadas
- **Tipos**: Definir interfaces/types en el mismo archivo o en un archivo `types.ts` separado

