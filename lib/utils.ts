import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ FUNCIONES PARA FECHAS DE URUGUAY - CORREGIDAS PARA ZONA HORARIA
export function formatDateUruguay(dateString: string | Date): string {
  if (!dateString) return "N/D";
  
  try {
    // Si es una fecha en formato ISO string (desde la DB), convertir correctamente
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    
    // Crear fecha en zona horaria de Uruguay
    const uruguayDate = new Date(date.toLocaleString("en-US", { 
      timeZone: "America/Montevideo" 
    }));
    
    return uruguayDate.toLocaleDateString("es-UY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "Error fecha";
  }
}

export function formatDateTimeUruguay(dateString: string | Date): string {
  if (!dateString) return "N/D";
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    
    const uruguayDate = new Date(date.toLocaleString("en-US", { 
      timeZone: "America/Montevideo" 
    }));
    
    return uruguayDate.toLocaleString("es-UY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("Error formateando fecha y hora:", error);
    return "Error fecha";
  }
}

export function getCurrentDateUruguay(): string {
  return new Date().toLocaleDateString("es-UY", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export function getCurrentDateTimeUruguay(): string {
  return new Date().toLocaleString("es-UY", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

// ✅ NUEVA: Función para convertir fecha UTC a zona horaria de Uruguay
export function convertUTCToUruguayTime(utcDateString: string | Date): Date {
  if (!utcDateString) return new Date();
  
  try {
    const utcDate = new Date(utcDateString);
    
    if (isNaN(utcDate.getTime())) {
      return new Date();
    }
    
    // Obtener la diferencia horaria entre UTC y Uruguay
    const uruguayOffset = -3 * 60; // Uruguay está en UTC-3
    const utcOffset = utcDate.getTimezoneOffset();
    
    // Crear nueva fecha ajustada
    const uruguayDate = new Date(utcDate.getTime() + (utcOffset - uruguayOffset) * 60000);
    
    return uruguayDate;
  } catch (error) {
    console.error("Error convirtiendo UTC a hora de Uruguay:", error);
    return new Date();
  }
}

// ✅ NUEVA: Función para formatear fecha desde UTC correctamente
export function formatDateFromUTC(dateString: string | Date): string {
  if (!dateString) return "N/D";
  
  try {
    // Convertir desde UTC a zona horaria de Uruguay
    const uruguayDate = convertUTCToUruguayTime(dateString);
    
    return uruguayDate.toLocaleDateString("es-UY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  } catch (error) {
    console.error("Error formateando fecha desde UTC:", error);
    return "Error fecha";
  }
}

export function parseDateForInput(dateString: string | Date): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return "";
    }
    
    // Convertir a zona horaria de Uruguay
    const uruguayDate = convertUTCToUruguayTime(date);
    
    return uruguayDate.toISOString().slice(0, 10);
  } catch (error) {
    console.error("Error parseando fecha para input:", error);
    return "";
  }
}

// ✅ NUEVA: Función simple y efectiva para corregir zona horaria
export function fixUruguayTimezone(dateString: string | Date): string {
  if (!dateString) return "N/D";
  
  try {
    // Crear fecha desde el string
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    
    // ✅ EXPLICACIÓN DEL PROBLEMA Y SOLUCIÓN:
    // El problema es que las fechas vienen de la DB en USA (UTC) pero se interpretan 
    // como si fueran de la zona horaria local del navegador del usuario.
    // Uruguay está en UTC-3, por lo que cuando una fecha viene como "2024-01-15 00:00:00 UTC"
    // se interpreta como "2024-01-15 00:00:00" en la zona local, pero debería ser
    // "2024-01-15 03:00:00" en Uruguay.
    // 
    // SOLUCIÓN: Agregar 3 horas (3 * 60 * 60 * 1000 milisegundos) para compensar
    // la diferencia entre UTC y la zona horaria de Uruguay.
    const uruguayDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    
    return uruguayDate.toLocaleDateString("es-UY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  } catch (error) {
    console.error("Error corrigiendo zona horaria:", error);
    return "Error fecha";
  }
}

// ✅ NUEVA: Función para normalizar fecha a medianoche en Uruguay (para comparaciones)
// Convierte cualquier fecha a medianoche en Uruguay (03:00 UTC del mismo día)
// IMPORTANTE: Si viene como string ISO, extrae directamente año/mes/día del string
// Si viene como Date (del calendario), usa métodos locales para extraer año/mes/día
export function normalizeDateToUruguay(date: Date | string): Date {
  if (!date) return new Date();
  
  try {
    let year: number, month: number, day: number;
    
    if (typeof date === 'string') {
      // ✅ Si viene como string, intentar extraer directamente del formato ISO
      // Ejemplo: "2024-01-09T00:00:00Z" o "2024-01-09"
      const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10) - 1; // Mes es 0-indexado
        day = parseInt(isoMatch[3], 10);
      } else {
        // Si no es formato ISO, crear Date y usar métodos locales
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return new Date();
        year = dateObj.getFullYear();
        month = dateObj.getMonth();
        day = dateObj.getDate();
      }
    } else {
      // ✅ Si viene como Date (del calendario), usar métodos LOCALES
      // Esto asegura que si seleccionas "9 de enero", se interprete como 9 de enero
      if (isNaN(date.getTime())) return new Date();
      year = date.getFullYear();
      month = date.getMonth();
      day = date.getDate();
    }
    
    // ✅ Crear fecha a medianoche en Uruguay (UTC-3) = 03:00 UTC del mismo día
    // Esto normaliza todas las fechas a la misma zona horaria para comparación
    return new Date(Date.UTC(year, month, day, 3, 0, 0));
  } catch (error) {
    console.error("Error normalizando fecha a Uruguay:", error);
    return new Date();
  }
}

// ✅ NUEVA: Función para fecha y hora con corrección de zona horaria
export function fixUruguayDateTime(dateString: string | Date): string {
  if (!dateString) return "N/D";
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    
    // Ajustar +3 horas para compensar UTC-3 de Uruguay
    const uruguayDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    
    return uruguayDate.toLocaleString("es-UY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("Error corrigiendo fecha y hora:", error);
    return "Error fecha";
  }
}

// ✅ NUEVA: Función de configuración para zona horaria
export function getUruguayTimezoneOffset(): number {
  // Uruguay está en UTC-3 (3 horas menos que UTC)
  // En milisegundos: 3 * 60 * 60 * 1000 = 10,800,000 ms
  return 3 * 60 * 60 * 1000;
}

// ✅ NUEVA: Función genérica para corregir zona horaria
export function fixTimezone(dateString: string | Date, hoursOffset: number = 3): string {
  if (!dateString) return "N/D";
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    
    // Ajustar por el offset de horas especificado
    const correctedDate = new Date(date.getTime() + (hoursOffset * 60 * 60 * 1000));
    
    return correctedDate.toLocaleDateString("es-UY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  } catch (error) {
    console.error("Error corrigiendo zona horaria:", error);
    return "Error fecha";
  }
}
