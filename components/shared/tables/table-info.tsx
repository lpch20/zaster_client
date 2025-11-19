"use client";

interface TableInfoProps {
  startIndex: number;
  endIndex: number;
  totalItems: number;
  filteredTotal?: number;
  hasActiveFilters?: boolean;
  additionalInfo?: React.ReactNode;
}

export function TableInfo({
  startIndex,
  endIndex,
  totalItems,
  filteredTotal,
  hasActiveFilters,
  additionalInfo,
}: TableInfoProps) {
  return (
    <div className="text-sm text-gray-600">
      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
      {hasActiveFilters && filteredTotal && (
        <span className="text-blue-600">
          {" "}
          (filtrados de {filteredTotal} total)
        </span>
      )}
      {additionalInfo && <div className="mt-1">{additionalInfo}</div>}
    </div>
  );
}

