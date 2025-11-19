import { RemittanceList } from "@/components/remitos/remittance-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RemitosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Remitos</h1>
      </div>
      <RemittanceList />
    </div>
  )
}

