"use client";

import React, { useEffect, useState } from "react";
import { getCombustibleById, getCombustibles } from "@/api/RULE_getData";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateUruguay } from "@/lib/utils";

export default function CombustibleDetail({ id }: { id: string }) {
  const [item, setItem] = useState<any>(null);
  const [todosCombustibles, setTodosCombustibles] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [resItem, resTodos] = await Promise.all([
          getCombustibleById(id),
          getCombustibles()
        ]);
        setItem(resItem.result || resItem);
        setTodosCombustibles(resTodos || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  // ✅ FUNCIÓN PARA CALCULAR AUTONOMÍA: (KMs anterior - KMs actual) / Litros
  // El "registro anterior" es el registro más antiguo ANTES del actual (ordenado por fecha ascendente)
  const calcularAutonomia = (combustible: any, todosCombustibles: any[]): number | null => {
    const kmsActual = Number(combustible.kms) || 0;
    const litros = Number(combustible.litros) || 0;
    
    if (litros <= 0) return null;
    if (!kmsActual) return null; // Si no hay KMs actuales, no se puede calcular
    
    // ✅ Buscar el registro anterior de la misma matrícula (ordenado por fecha ascendente)
    // El registro anterior es el más antiguo ANTES del actual
    const combustiblesMismaMatricula = todosCombustibles
      .filter(c => c.matricula === combustible.matricula)
      .sort((a, b) => {
        const fechaA = new Date(a.fecha).getTime();
        const fechaB = new Date(b.fecha).getTime();
        // Orden ascendente (más antiguo primero)
        return fechaA - fechaB;
      });
    
    // ✅ Encontrar el índice del registro actual
    const indiceActual = combustiblesMismaMatricula.findIndex(c => c.id === combustible.id);
    
    // ✅ Si hay un registro anterior (índice > 0, es decir, hay un registro más antiguo)
    if (indiceActual > 0) {
      const registroAnterior = combustiblesMismaMatricula[indiceActual - 1];
      const kmsAnterior = Number(registroAnterior.kms) || 0;
      
      if (kmsAnterior > 0) {
        // ✅ Fórmula: (KMs anterior - KMs actual) / Litros
        // Si los KMs aumentan con el tiempo (normal), kmsAnterior < kmsActual, entonces la diferencia será negativa
        // Usamos valor absoluto para obtener la distancia recorrida
        const diferenciaKms = kmsAnterior - kmsActual;
        const diferenciaAbsoluta = Math.abs(diferenciaKms);
        return diferenciaAbsoluta / litros;
      }
    }
    
    return null; // No hay registro anterior o no se puede calcular
  };

  if (!item) return <div>Cargando...</div>;

  const kms = Number(item.kms || 0);
  const litros = Number(item.litros || 0);
  const autonomiaCalculada = calcularAutonomia(item, todosCombustibles);
  const autonomia = autonomiaCalculada !== null ? autonomiaCalculada.toFixed(2) : "-";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div>Fecha: {formatDateUruguay(item.fecha)}</div>
          <div>Matrícula: {item.matricula}</div>
          <div>Lugar: {item.lugar}</div>
          <div>KMs: {kms || "-"}</div>
          <div>Litros: {litros}</div>
          <div>Precio: {item.precio}</div>
          <div>Total: {item.total}</div>
          <div>Autonomía (km/l): {autonomia}</div>
        </CardContent>
      </Card>
    </div>
  );
}


