"use client";

import { useState } from "react";

export default function LogoWithFallback() {
  const [imgOk, setImgOk] = useState(true);

  if (!imgOk) {
    return <h1 className="text-2xl font-bold text-blue-600">CRM</h1>;
  }

  return (
    <img
      src="/logo.jpg"
      alt="Zaster CRM"
      className="w-full h-full object-contain"
      onError={() => setImgOk(false)}
    />
  );
}


