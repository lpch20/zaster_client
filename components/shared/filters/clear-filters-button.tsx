"use client";

import { Button } from "@/components/ui/button";

interface ClearFiltersButtonProps {
  onClear: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function ClearFiltersButton({
  onClear,
  hasActiveFilters,
  className,
}: ClearFiltersButtonProps) {
  if (!hasActiveFilters) return null;

  return (
    <Button
      variant="outline"
      onClick={onClear}
      className={`whitespace-nowrap w-full sm:w-auto ${className || ""}`}
    >
      🗑️ Limpiar Filtros
    </Button>
  );
}

