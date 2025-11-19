export function useTripCalculations(formData: any) {
  const kms = Number(formData.kms) || 0;
  const tarifa = Number(formData.tarifa) || 0;
  const ivaPorcentaje = Number(formData.iva_porcentaje) || 0;
  
  // Precio flete = KMs × Tarifa (sin IVA)
  const precioFleteCalculado = kms * tarifa;
  
  // IVA del flete (si aplica con switch específico)
  const precioFleteConIva = precioFleteCalculado * (formData.iva_flete ? 1.22 : 1);
  
  // IVA del flete (si aplica por porcentaje general)
  const ivaFlete = precioFleteCalculado * (ivaPorcentaje / 100);
  
  // Cálculo de gastos con IVA
  const lavadoMonto = Number(formData.lavado) * (formData.iva_lavado ? 1.22 : 1);
  const peajeMonto = Number(formData.peaje) * (formData.iva_peaje ? 1.22 : 1);
  const balanzaMonto = Number(formData.balanza) * (formData.iva_balanza ? 1.22 : 1);
  const sanidadMonto = Number(formData.sanidad) * (formData.iva_sanidad ? 1.22 : 1);
  const inspeccionMonto = Number(formData.inspeccion);

  // Subtotal = Precio Flete (con IVA si aplica switch) + Gastos
  const subtotal = precioFleteConIva + lavadoMonto + peajeMonto + balanzaMonto + sanidadMonto + inspeccionMonto;
  
  // Total Monto UY = Subtotal + IVA (si aplica)
  const totalMontoUY = formData.iva_porcentaje ? subtotal * (1 + ivaPorcentaje / 100) : subtotal;

  const totalMontoUSS = Number(formData.tipo_cambio) > 0 ? totalMontoUY / Number(formData.tipo_cambio) : 0;

  return {
    precioFleteCalculado,
    precioFleteConIva,
    ivaFlete,
    lavadoMonto,
    peajeMonto,
    balanzaMonto,
    sanidadMonto,
    inspeccionMonto,
    subtotal,
    totalMontoUY,
    totalMontoUSS,
  };
}

