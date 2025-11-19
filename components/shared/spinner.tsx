// components/ui/loading.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Loading({ className, ...props }: LoadingProps) {
  return (
    <div className={cn("animate-spin rounded-full h-6 w-6 border-b-2 border-primary", className)} {...props} />
  );
}