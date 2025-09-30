"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getMantenimientos } from "@/api/RULE_getData";
import dayjs from "dayjs";

export default function MaintenanceList() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [camionFilter, setCamionFilter] = useState("todos");
  const [lugarFilter, setLugarFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getMantenimientos();
        setItems(res || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const filtered = items.filter((it) => {
    const matchesCamion = camionFilter === "todos" || String(it.camion_id) === String(camionFilter);
    const matchesLugar = lugarFilter === "" || (it.lugar || "").toLowerCase().includes(lugarFilter.toLowerCase());
    const matchesSearch = search === "" || (it.descripcion || "").toLowerCase().includes(search.toLowerCase());
    return matchesCamion && matchesLugar && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Buscar descripción..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Input placeholder="Lugar" value={lugarFilter} onChange={(e) => setLugarFilter(e.target.value)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Camión</TableHead>
            <TableHead>KMs</TableHead>
            <TableHead>Lugar</TableHead>
            <TableHead>Descripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{dayjs(m.fecha).format("DD/MM/YYYY")}</TableCell>
              <TableCell>{m.camion_id}</TableCell>
              <TableCell>{m.kms}</TableCell>
              <TableCell>{m.lugar}</TableCell>
              <TableCell>{m.descripcion}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


