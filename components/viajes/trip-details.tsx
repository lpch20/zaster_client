"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  getCamionesById,
  getChoferesById,
  getClients, // ✅ CAMBIO: usar getClients en lugar de getClientsById
  getTripById,
} from "@/api/RULE_getData";
import { Loading } from "@/components/shared/spinner";

interface ClientsNames {
  destinatario: string;
  remitente: string;
  facturar_a: string;
}

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
        console.error("Error al obtener el viaje:", error);
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

          setCamionName({
            camionModelo: data.modelo,
            camionMatricula: data.matricula,
          });
        }
      } catch (error) {
        console.error("Error al obtener el camión:", error);
      }
    }
    if (trip) fetchCamion();
  }, [trip]);

  // ✅ CORREGIR: Obtener todos los clientes y buscar por ID
  useEffect(() => {
    async function fetchClients() {
      try {
        if (trip) {
          console.log("🔍 DEBUG trip-details - Trip data:", {
            destinatario_id: trip.destinatario_id,
            facturar_a: trip.facturar_a,
            remitente_id: trip.remitente_id,
            tipos: {
              destinatario_id: typeof trip.destinatario_id,
              facturar_a: typeof trip.facturar_a,
              remitente_id: typeof trip.remitente_id
            }
          });

          // ✅ FUNCIÓN HELPER PARA COMPARAR IDs DE FORMA ROBUSTA
          const compareIds = (id1: any, id2: any): boolean => {
            // Convertir ambos a string y limpiar espacios
            const str1 = String(id1).trim();
            const str2 = String(id2).trim();
            
            // Comparar como strings
            const stringMatch = str1 === str2;
            
            // También comparar como números si ambos son convertibles
            const num1 = Number(id1);
            const num2 = Number(id2);
            const numberMatch = !isNaN(num1) && !isNaN(num2) && num1 === num2;
            
            return stringMatch || numberMatch;
          };

          // ✅ CAMBIO: Obtener todos los clientes
          const response = await getClients();
          console.log("🔍 DEBUG trip-details - Response clientes:", response);
          
          if (response && response.result) {
            // ✅ FILTRAR NULL Y SOFT_DELETE
            const clientsArray = response.result.filter((c: any) => c !== null && !c.soft_delete);
            console.log("🔍 DEBUG trip-details - Clientes activos:", clientsArray);
            console.log("🔍 DEBUG trip-details - IDs clientes:", clientsArray.map(c => ({
              id: c.id,
              nombre: c.nombre,
              tipo: typeof c.id
            })));
            
            // ✅ USAR FUNCIÓN HELPER PARA COMPARAR IDs
            const destinatario = clientsArray.find(
              (client: any) => compareIds(client.id, trip.destinatario_id)
            );
            const remitente = clientsArray.find(
              (client: any) => compareIds(client.id, trip.remitente_id)
            );
            const facturar_a = clientsArray.find(
              (client: any) => compareIds(client.id, trip.facturar_a)
            );

            console.log("🔍 DEBUG trip-details - Clientes encontrados:", {
              destinatario: destinatario?.nombre || "NO ENCONTRADO",
              remitente: remitente?.nombre || "NO ENCONTRADO", 
              facturar_a: facturar_a?.nombre || "NO ENCONTRADO"
            });
            
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
      {/* ✅ Encabezado mejorado con badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">🚛 Viaje #{trip.numero_viaje}</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant={trip.cobrado ? "default" : "secondary"}>
              {trip.cobrado ? "✅ Cobrado" : "❌ Pendiente"}
            </Badge>
            <Badge variant="outline">📄 Factura: {trip.numero_factura}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            🖨️ Imprimir
          </Button>
          <Link href={`/viajes/${id}/editar`}>
            <Button>✏️ Editar Viaje</Button>
          </Link>
        </div>
      </div>

      {/* ✅ Grid responsive mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Información Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Número de Viaje:</dt>
                <dd className="font-mono">{trip.numero_viaje}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Número de Remito:</dt>
                <dd className="font-mono">{trip.remito_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Fecha de Viaje:</dt>
                <dd>
                  {new Date(trip.fecha_viaje).toLocaleDateString("es-UY", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Estado:</dt>
                <dd>
                  <Badge variant={trip.cobrado ? "default" : "secondary"}>
                    {trip.cobrado ? "Cobrado" : "Pendiente"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Origen y Destino */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗺️ Origen y Destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Remitente:</dt>
                <dd className="text-right">{trip.remitente_name || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Lugar de Carga:</dt>
                <dd className="text-right">{trip.lugar_carga || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Destinatario:</dt>
                <dd className="text-right">
                  {client.destinatario}
                  {/* ✅ DEBUG temporal */}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Lugar de Descarga:</dt>
                <dd className="text-right">{trip.lugar_descarga || "N/D"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Carga y Transporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚛 Carga y Transporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Camión:</dt>
                <dd className="text-right font-mono">
                  {camionName.camionModelo} - {camionName.camionMatricula}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Chofer:</dt>
                <dd className="text-right">{choferName || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Kilómetros:</dt>
                <dd className="text-right font-mono">{trip.kms || "0"} km</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Guías:</dt>
                <dd className="text-right">{trip.guias || "N/D"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Facturación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Facturar A:</dt>
                <dd className="text-right font-semibold text-blue-600">
                  {client.facturar_a}
                  {/* ✅ DEBUG temporal */}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Número de Factura:</dt>
                <dd className="text-right font-mono">{trip.numero_factura || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Vencimiento:</dt>
                <dd className="text-right">
                  {trip.vencimiento
                    ? new Date(trip.vencimiento).toLocaleDateString("es-UY", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })
                    : "N/D"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Referencia de Cobro:</dt>
                <dd className="text-right">{trip.referencia_cobro || "N/D"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Valores Monetarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💵 Valores Monetarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Tipo de Cambio:</dt>
                <dd className="text-right font-mono">{trip.tipo_cambio || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Tarifa por km:</dt>
                <dd className="text-right font-mono">
                  ${Number(trip.tarifa || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Precio Flete:</dt>
                <dd className="text-right font-mono">
                  ${Number(trip.precio_flete || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="font-bold text-gray-800">Total UY:</dt>
                <dd className="text-right font-bold text-green-600 text-lg">
                  ${Number(trip.total_monto_uy || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Total USS:</dt>
                <dd className="text-right font-mono">
                  US$ {Number(trip.total_monto_uss || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Costos Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💳 Costos Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Lavado:</dt>
                <dd className="text-right font-mono">
                  ${Number(trip.lavado || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Peaje:</dt>
                <dd className="text-right font-mono">
                  ${Number(trip.peaje || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Balanza:</dt>
                <dd className="text-right font-mono">
                  ${Number(trip.balanza || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Inspección:</dt>
                <dd className="text-right font-mono">
                  ${Number(trip.inspeccion || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Sanidad:</dt>
                <dd className="text-right font-mono">
                  ${Number(trip.sanidad || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="font-bold text-gray-800">Total Gastos:</dt>
                <dd className="text-right font-bold text-red-600">
                  ${(
                    Number(trip.lavado || 0) +
                    Number(trip.peaje || 0) +
                    Number(trip.balanza || 0) +
                    Number(trip.inspeccion || 0) +
                    Number(trip.sanidad || 0)
                  ).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de Carga */}
      {trip.detalle_carga && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦 Detalle de Carga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{trip.detalle_carga}</p>
          </CardContent>
        </Card>
      )}

      {/* Sección de Imágenes mejorada */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📎 Archivos Adjuntos ({images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((fileId, index) => (
                <a
                  key={index}
                  href={`https://drive.google.com/file/d/${fileId}/view?usp=sharing`}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <img
                    src={`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=AIzaSyCbrQgBir-rEUavb6X1Q-SUpuGvIlW7Re8`}
                    alt={`Archivo ${index + 1}`}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = "/pdf-icon.jpeg";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                    Archivo {index + 1}
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de acción finales */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
        <Link href="/viajes">
          <Button variant="outline">← Volver a Viajes</Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            🖨️ Imprimir Detalles
          </Button>
          <Link href={`/viajes/${trip.id}/editar`}>
            <Button>✏️ Editar Viaje</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}