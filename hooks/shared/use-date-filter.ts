import { useState } from "react";
import type { DateRange } from "react-day-picker";

export function useDateFilter() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const normalizeDateToUruguay = (date: Date | string): Date => {
    let year: number, month: number, day: number;
    
    if (typeof date === 'string') {
      const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10) - 1;
        day = parseInt(isoMatch[3], 10);
      } else {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return new Date();
        year = dateObj.getFullYear();
        month = dateObj.getMonth();
        day = dateObj.getDate();
      }
    } else {
      if (isNaN(date.getTime())) return new Date();
      year = date.getFullYear();
      month = date.getMonth();
      day = date.getDate();
    }
    
    return new Date(Date.UTC(year, month, day, 3, 0, 0));
  };

  const matchesDateRange = (itemDate: Date | string): boolean => {
    if (!dateRange?.from) return true;

    const normalizedItemDate = normalizeDateToUruguay(itemDate);
    const fromDateNormalized = normalizeDateToUruguay(dateRange.from);
    
    if (!dateRange.to) {
      return normalizedItemDate >= fromDateNormalized;
    }

    const toDate = normalizeDateToUruguay(dateRange.to);
    const toYear = toDate.getUTCFullYear();
    const toMonth = toDate.getUTCMonth();
    const toDay = toDate.getUTCDate();
    const toDateNormalized = new Date(Date.UTC(toYear, toMonth, toDay + 1, 2, 59, 59));

    return normalizedItemDate >= fromDateNormalized && normalizedItemDate <= toDateNormalized;
  };

  return {
    dateRange,
    setDateRange,
    matchesDateRange,
    normalizeDateToUruguay,
  };
}

