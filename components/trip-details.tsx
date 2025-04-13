"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  getCamionesById,
  getChoferesById,
  getClientsById,
  getTripById,
} from "@/api/RULE_getData"; // Asegúrate de tener esta función implementada
import { Loading } from "./spinner";

export function TripDetails({ id }: { id: string }) {
  const [trip, setTrip] = useState<any>(null);
  const [client, setClient] = useState<ClientsNames>({
    destinatario: "",
    remitente: "",
    facturar_a: "",
  });
  const [loading, setLoading] = useState(true);
  const [choferName, setChoferName] = useState("");
  const [camionName, setCamionName] = useState({
    camionModelo: "",
    camionMatricula: "",
  });

  // Array de imágenes basado en img_1..img_5
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const data = await getTripById(id);
        setTrip(data.result);
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
    if (id) fetchTrip();
  }, [id]);

  useEffect(() => {
    async function fetchChofer() {
      try {
        if (trip) {
          const choferData = await getChoferesById(trip.chofer_id);
          setChoferName(choferData.result.nombre);
        }
      } catch (error) {
        console.error("Error al obtener el chofer:", error);
      }
    }
    if (trip) fetchChofer();
  }, [trip]);

  useEffect(() => {
    async function fetchCamion() {
      try {
        if (trip) {
          const camionData = await getCamionesById(trip.camion_id);
          const data = camionData.result;

          console.log(data);

          setCamionName({
            camionModelo: data.modelo,
            camionMatricula: data.matricula,
          });
        }
      } catch (error) {
        console.error("Error al obtener el chofer:", error);
      }
    }
    if (trip) fetchCamion();
  }, [trip]);

  useEffect(() => {
    async function fetchClients() {
      try {
        if (trip) {
          const ids = [
            trip.destinatario_id,
            trip.remitente_id,
            trip.facturar_a,
          ];
          const response = await getClientsById(ids);
          console.log("response", response);
          if (response && response.result) {
            const clientsArray = response.result;
            const destinatario = clientsArray.find(
              (client: any) => client.id == trip.destinatario_id
            );
            const remitente = clientsArray.find(
              (client: any) => client.id == trip.remitente_id
            );
            const facturar_a = clientsArray.find(
              (client: any) => client.id == trip.facturar_a
            );
            setClient({
              destinatario: destinatario ? destinatario.nombre : "N/D",
              remitente: remitente ? remitente.nombre : "N/D",
              facturar_a: facturar_a ? facturar_a.nombre : "N/D",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      }
    }
    if (trip) fetchClients();
  }, [trip]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loading />;
  if (!trip) return <div>No se encontró información para el viaje</div>;

  return (
    <div className="space-y-6">
      {/* Encabezado con acciones */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Viaje #{trip.numero_viaje}</h2>
        <div className="space-x-2">
          <Button onClick={handlePrint} variant="outline">
            Imprimir Viaje
          </Button>
          <Link href={`/viajes/${id}/editar`}>
            <Button>Editar Viaje</Button>
          </Link>
        </div>
      </div>

      {/* Sección de Información General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Número de Viaje:</dt>
                <dd>{trip.numero_viaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Número de Remito:</dt>
                <dd>{trip.remito_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Fecha de Viaje:</dt>
                <dd>
                  {new Date(trip.fecha_viaje).toLocaleDateString("es-UY", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Sección de Origen y Destino */}
        <Card>
          <CardHeader>
            <CardTitle>Origen y Destino</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Remitente:</dt>
                <dd>{trip.remitente_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Lugar de Carga:</dt>
                <dd>{trip.lugar_carga}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Destinatario:</dt>
                <dd>{trip.destinatario_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Lugar de Descarga:</dt>
                <dd>{trip.lugar_descarga}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Sección de Carga y Transporte */}
        <Card>
          <CardHeader>
            <CardTitle>Carga y Transporte</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Camión:</dt>
                <dd>
                  {camionName.camionModelo + " " + camionName.camionMatricula}{" "}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Chofer:</dt>
                <dd>{choferName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Guías:</dt>
                <dd>{trip.guias}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Detalle de Carga:</dt>
                <dd>{trip.detalle_carga}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Sección de Facturación */}
        <Card>
          <CardHeader>
            <CardTitle>Facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Facturar A:</dt>
                <dd>{client.facturar_a}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Número de Factura:</dt>
                <dd>{trip.numero_factura}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Vencimiento:</dt>
                <dd>
                  {trip.vencimiento &&
                    new Date(trip.vencimiento).toLocaleDateString("es-UY", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Cobrado:</dt>
                <dd>{trip.cobrado ? "Sí" : "No"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Referencia de Cobro:</dt>
                <dd>{trip.referencia_cobro}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Sección de Valores Monetarios */}
        <Card>
          <CardHeader>
            <CardTitle>Valores Monetarios</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Tipo de Cambio:</dt>
                <dd>{trip.tipo_cambio}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Kilómetros:</dt>
                <dd>{trip.kms}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Tarifa:</dt>
                <dd>
                  {Number(trip.tarifa).toLocaleString("es-UY", {
                    style: "currency",
                    currency: "UYU",
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Precio Flete:</dt>
                <dd>
                  {Number(trip.precio_flete).toLocaleString("es-UY", {
                    style: "currency",
                    currency: "UYU",
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Total Monto UY:</dt>
                <dd>
                  {Number(trip.total_monto_uy).toLocaleString("es-UY", {
                    style: "currency",
                    currency: "UYU",
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Total Monto USS:</dt>
                <dd>
                  {Number(trip.total_monto_uss).toLocaleString("es-UY", {
                    style: "currency",
                    currency: "UYU",
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Sección de Costos Adicionales y Sanidad */}
        <Card>
          <CardHeader>
            <CardTitle>Costos Adicionales y Sanidad</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-semibold">Lavado:</dt>
                <dd>{trip.lavado}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Peaje:</dt>
                <dd>{trip.peaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Balanza:</dt>
                <dd>{trip.balanza}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Inspección:</dt>
                <dd>{trip.inspeccion}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Sanidad:</dt>
                <dd>{trip.sanidad}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Imágenes */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archivos</CardTitle>
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
        <Link href={`/viajes/${trip.id}/editar`}>
          <Button>Editar Viaje</Button>
        </Link>
      </div>
    </div>
  );
}
