import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ FUNCIONES PARA FECHAS DE URUGUAY
export function formatDateUruguay(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-UY", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export function formatDateTimeUruguay(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-UY", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
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

export function parseDateForInput(dateString: string | Date): string {
  const date = new Date(dateString);
  // Ajustar a zona horaria de Uruguay
  const uruguayDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Montevideo" }));
  return uruguayDate.toISOString().slice(0, 10);
}
