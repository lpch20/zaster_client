import { useState } from "react";

export function useSearchFilter() {
  const [searchTerm, setSearchTerm] = useState("");

  const matchesSearch = <T extends Record<string, any>>(item: T): boolean => {
    if (!searchTerm) return true;
    
    return Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    searchTerm,
    setSearchTerm,
    matchesSearch,
  };
}

