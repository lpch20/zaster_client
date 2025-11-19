# Estructura de Componentes - Zaster Frontend

## 📁 Organización por Dominios

El frontend está organizado por dominios/features para mejorar la mantenibilidad y escalabilidad:

```
components/
├── viajes/              # Componentes relacionados con viajes
│   ├── trip-form.tsx
│   ├── trip-form-basic-fields.tsx
│   ├── trip-form-billing.tsx
│   ├── trip-form-client-selector.tsx
│   ├── trip-form-expenses.tsx
│   ├── trip-form-files.tsx
│   ├── trip-form-remito-selector.tsx
│   ├── trip-form-totals.tsx
│   └── index.ts
├── remitos/            # Componentes relacionados con remitos
├── liquidaciones/      # Componentes relacionados con liquidaciones
├── clientes/           # Componentes relacionados con clientes
└── shared/             # Componentes compartidos reutilizables
    ├── filters/        # Componentes de filtros
    │   ├── search-input.tsx
    │   └── clear-filters-button.tsx
    ├── tables/         # Componentes de tablas
    │   ├── table-pagination.tsx
    │   └── table-info.tsx
    └── forms/          # Componentes de formularios genéricos
```

## 🎣 Hooks Personalizados

Los hooks están organizados de manera similar:

```
hooks/
├── viajes/             # Hooks específicos de viajes
│   └── use-trip-calculations.ts
├── remitos/            # Hooks específicos de remitos
├── liquidaciones/      # Hooks específicos de liquidaciones
└── shared/             # Hooks compartidos
    ├── use-pagination.ts
    ├── use-date-filter.ts
    └── use-search-filter.ts
```

## 🔄 Componentes Refactorizados

### TripForm (viajes/trip-form.tsx)
El componente `TripForm` original de 1436 líneas ha sido dividido en:

- **TripFormBasicFields**: Campos básicos del viaje (número, fecha, lugares, etc.)
- **TripFormRemitoSelector**: Selector de remito con lógica de carga automática
- **TripFormClientSelector**: Selector de cliente con opción de crear nuevo
- **TripFormExpenses**: Campos de gastos (lavado, peaje, balanza, etc.) con switches de IVA
- **TripFormBilling**: Campos de facturación y cobro
- **TripFormTotals**: Campos de totales calculados
- **TripFormFiles**: Gestión de archivos/imágenes

### Hooks Creados

- **useTripCalculations**: Calcula todos los totales y montos del viaje
- **usePagination**: Maneja la paginación de tablas
- **useDateFilter**: Filtrado por rango de fechas con normalización de zona horaria
- **useSearchFilter**: Búsqueda genérica en objetos

## 📦 Componentes Compartidos

### Filtros
- **SearchInput**: Input de búsqueda genérico
- **ClearFiltersButton**: Botón para limpiar filtros activos

### Tablas
- **TablePagination**: Componente de paginación reutilizable
- **TableInfo**: Información de resultados y paginación

## 🚀 Beneficios de la Nueva Estructura

1. **Mantenibilidad**: Componentes más pequeños y enfocados en una sola responsabilidad
2. **Reutilización**: Componentes compartidos pueden usarse en múltiples lugares
3. **Testabilidad**: Componentes más pequeños son más fáciles de testear
4. **Escalabilidad**: Fácil agregar nuevos dominios siguiendo el mismo patrón
5. **Legibilidad**: Código más fácil de entender y navegar

## 📝 Próximos Pasos

- [ ] Refactorizar `trip-list.tsx` en subcomponentes
- [ ] Refactorizar `remittance-list.tsx` en subcomponentes
- [ ] Refactorizar `payment-list.tsx` en subcomponentes
- [ ] Mover componentes de clientes a `components/clientes/`
- [ ] Mover componentes de remitos a `components/remitos/`
- [ ] Mover componentes de liquidaciones a `components/liquidaciones/`
- [ ] Crear más hooks compartidos para lógica común

