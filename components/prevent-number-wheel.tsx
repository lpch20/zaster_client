"use client";
import { useEffect } from "react";

export default function PreventNumberWheel() {
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const active = document.activeElement as HTMLInputElement | null;
      if (active && active.tagName === "INPUT" && active.type === "number") {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    return () => document.removeEventListener("wheel", onWheel);
  }, []);

  return null;
}


