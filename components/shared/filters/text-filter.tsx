"use client";

import { Input } from "@/components/ui/input";

interface TextFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TextFilter({
  value,
  onChange,
  placeholder,
  className,
}: TextFilterProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}

