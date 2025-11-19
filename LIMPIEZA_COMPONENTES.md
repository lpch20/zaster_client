# 🗑️ Guía para Limpiar Componentes Duplicados

## ⚠️ IMPORTANTE

**NO elimines estos archivos hasta verificar que todo funciona correctamente.**

## 📋 Archivos Duplicados que Pueden Eliminarse

Los siguientes archivos están **duplicados** en la raíz de `components/` porque ya están organizados en sus carpetas correspondientes:

### Viajes (ya en `components/viajes/`)
```bash
rm components/trip-list.tsx
rm components/trip-form.tsx
rm components/trip-details.tsx
rm components/trip-editor.tsx
```

### Remitos (ya en `components/remitos/`)
```bash
rm components/remittance-list.tsx
rm components/remittance-form.tsx
rm components/remittance-details.tsx
rm components/remittance-editor.tsx
```

### Liquidaciones (ya en `components/liquidaciones/`)
```bash
rm components/payment-list.tsx
rm components/payment-form.tsx
rm components/payment-details.tsx
```

### Clientes (ya en `components/clientes/`)
```bash
rm components/client-list.tsx
rm components/client-form.tsx
rm components/client-details.tsx
```

### Camiones (ya en `components/camiones/`)
```bash
rm components/truck-list.tsx
rm components/truck-form.tsx
rm components/truck-details.tsx
```

### Choferes (ya en `components/choferes/`)
```bash
rm components/driver-list.tsx
rm components/driver-form.tsx
rm components/driver-details.tsx
```

## ✅ Verificación Antes de Eliminar

1. ✅ Ejecuta `npm run build` y verifica que compile sin errores
2. ✅ Prueba todas las funcionalidades principales
3. ✅ Verifica que no haya imports rotos

## 📝 Comando para Eliminar Todos los Duplicados

Una vez verificado, puedes ejecutar:

```bash
cd components
rm trip-list.tsx trip-form.tsx trip-details.tsx trip-editor.tsx
rm remittance-list.tsx remittance-form.tsx remittance-details.tsx remittance-editor.tsx
rm payment-list.tsx payment-form.tsx payment-details.tsx
rm client-list.tsx client-form.tsx client-details.tsx
rm truck-list.tsx truck-form.tsx truck-details.tsx
rm driver-list.tsx driver-form.tsx driver-details.tsx
```

## 🎯 Estado Actual

- ✅ Todos los componentes organizados en carpetas
- ✅ Todos los imports actualizados
- ✅ Build compilando correctamente
- ⏳ Archivos duplicados listos para eliminar (después de verificación)

