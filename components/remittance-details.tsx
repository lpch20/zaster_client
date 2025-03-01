"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  getChoferesById,
  getClients,
  getClientsById,
  getRemitoById,
} from "@/api/RULE_getData";
import { strict } from "assert";

interface Remittance {
  id: string;
  matricula: string;
  inspeccion: string;
  fecha: string;
  chofer_id: string;
  peaje: string;
  lavado: string;
  kilometros: string;
  balanza: string;
  pernocte: boolean;
  numero_guia: string;
  lugar_carga: string;
  hora_carga: string;
  cantidad: string;
  hora_destino: string;
  categoria: string;
  consignatario: string;
  estado_embarcadero: string;
  encierro_previo: boolean;
  acceso_agua: boolean;
  acceso_sombra: boolean;
  mezcla_categoria: boolean;
  duracion_carga: string | null;
  encargado: string;
  recibido_por: string;
  observaciones: string;
  numero_remito: string;
  destinatario_id: number;
  propietario_id: number;
  cuadruplicado: string;
  client_id: number | null;
  img_1: string | null;
  img_2: string | null;
  img_3: string | null;
  img_4: string | null;
  img_5: string | null;
}

export function RemittanceDetails({ id }: { id: string }) {
  const [remittance, setRemittance] = useState<Remittance | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para obtener el nombre del chofer y de los clientes
  const [choferName, setChoferName] = useState("");
  const [clientNames, setClientNames] = useState<ClientsNames>({
    destinatario: "",
    propietario: "",
  });

  // Array de imágenes basado en img_1..img_5
  const [images, setImages] = useState<string[]>([]);

  // Obtención del remito por id
  useEffect(() => {
    async function fetchRemittance() {
      try {
        const data = await getRemitoById(id);
        setRemittance(data.result);
        // Extraer fileIds de imágenes (filtrar nulos)
        const imgs = [
          data.result.img_1,
          data.result.img_2,
          data.result.img_3,
          data.result.img_4,
          data.result.img_5,
        ].filter((fileId: string | null) => fileId);
        setImages(imgs);
      } catch (error) {
        console.error("Error al obtener el remito:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRemittance();
  }, [id]);

  // Obtener nombre del chofer
  useEffect(() => {
    async function fetchChofer() {
      try {
        if (remittance) {
          const choferData = await getChoferesById(remittance.chofer_id);
          setChoferName(choferData.result.nombre);
        }
      } catch (error) {
        console.error("Error al obtener el chofer:", error);
      }
    }
    if (remittance) fetchChofer();
  }, [remittance]);

  // Obtener nombres de destinatario y propietario
  useEffect(() => {
    async function fetchClients() {
      try {
        if (remittance) {
          const ids = [remittance.destinatario_id, remittance.propietario_id];
          const response = await getClientsById(ids);
          console.log("response", response);
          if (response && response.result) {
            const clientsArray = response.result;
            const destinatario = clientsArray.find(
              (client: any) => client.id == remittance.destinatario_id
            );
            const propietario = clientsArray.find(
              (client: any) => client.id == remittance.propietario_id
            );
            setClientNames({
              destinatario: destinatario ? destinatario.nombre : "N/D",
              propietario: propietario ? propietario.nombre : "N/D",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      }
    }
    if (remittance) fetchClients();
  }, [remittance]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div>Cargando...</div>;
  if (!remittance) return <div>No se encontró información para el remito</div>;

  return (
    <div className="space-y-6">
      {/* Encabezado con acciones */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Remito #{remittance.numero_remito}
        </h2>
        <div className="space-x-2">
          <Button onClick={handlePrint} variant="outline">Imprimir Remito</Button>
          <Link href={`/remitos/${id}/editar`}>
            <Button>Editar Remito</Button>
          </Link>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Matrícula:</dt>
                <dd>{remittance.matricula}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Inspección:</dt>
                <dd>{remittance.inspeccion}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Fecha:</dt>
                <dd>
                  {new Date(remittance.fecha).toLocaleDateString("es-UY")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Chofer:</dt>
                <dd>{choferName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Peaje:</dt>
                <dd>{remittance.peaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Lavado:</dt>
                <dd>{remittance.lavado}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Kilómetros:</dt>
                <dd>{remittance.kilometros}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Balanza:</dt>
                <dd>{remittance.balanza}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Pernocte:</dt>
                <dd>{remittance.pernocte ? "Sí" : "No"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Número de Guía:</dt>
                <dd>{remittance.numero_guia}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Lugar de Carga:</dt>
                <dd>{remittance.lugar_carga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Hora de Carga:</dt>
                <dd>{remittance.hora_carga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Cantidad:</dt>
                <dd>{remittance.cantidad}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Hora de Destino:</dt>
                <dd>{remittance.hora_destino}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Categoría:</dt>
                <dd>{remittance.categoria}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Consignatario:</dt>
                <dd>{remittance.consignatario}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Detalles de Carga */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Encargado:</dt>
                <dd>{remittance.encargado}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Recibido Por:</dt>
                <dd>{remittance.recibido_por}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Observaciones:</dt>
                <dd>{remittance.observaciones}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Número de Remito:</dt>
                <dd>{remittance.numero_remito}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Destinatario</dt>
                <dd>{clientNames.destinatario}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Propietario</dt>
                <dd>{clientNames.propietario}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Cuadruplicado:</dt>
                <dd>{remittance.cuadruplicado}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Imágenes */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Achivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {images.map((fileId, index) => (
                <a
                  href={`https://drive.google.com/file/d/${fileId}/view?usp=sharing`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    key={index}
                    src={`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=AIzaSyCbrQgBir-rEUavb6X1Q-SUpuGvIlW7Re8`}
                    alt={`Imagen ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/pdf-icon.jpeg"; // Ícono en tu carpeta public
                    }}
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Link href={`/remitos/${remittance.id}/editar`}>
          <Button>Editar Remito</Button>
        </Link>
      </div>
    </div>
  );
}
