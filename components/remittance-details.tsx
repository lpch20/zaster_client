"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  getCamionesById,
  getChoferesById,
  getClients,
  getClientsById,
  getRemitoById,
} from "@/api/RULE_getData";
import { Loading } from "./spinner";

interface ClientsNames {
  destinatario: string;
  propietario: string;
}

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
  camion_id: string;
  propietario_name: string;
}

export function RemittanceDetails({ id }: { id: string }) {
  const [remittance, setRemittance] = useState<Remittance | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para obtener el nombre del chofer y de los clientes
  const [choferName, setChoferName] = useState("");
  const [camion, setCamion] = useState<any>({
    modelo: "",
    matricula: "",
    matricula_zorra: "",
  });
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

  // Obtener información del camión
  useEffect(() => {
    async function fetchCamion() {
      try {
        if (remittance) {
          const camionData = await getCamionesById(remittance.camion_id);
          console.log("camion", camionData);
          setCamion(camionData.result);
        }
      } catch (error) {
        console.error("Error al obtener el camión:", error);
      }
    }
    if (remittance) fetchCamion();
  }, [remittance]);

  // ✅ CORREGIR: Usar getClients y filtrar como en trip-details
  useEffect(() => {
    async function fetchClients() {
      try {
        if (remittance) {
          console.log("🔍 DEBUG remittance-details - Remittance data:", {
            destinatario_id: remittance.destinatario_id,
            propietario_id: remittance.propietario_id,
            tipos: {
              destinatario_id: typeof remittance.destinatario_id,
              propietario_id: typeof remittance.propietario_id,
            }
          });

          // ✅ FUNCIÓN HELPER PARA COMPARAR IDs DE FORMA ROBUSTA
          const compareIds = (id1: any, id2: any): boolean => {
            const str1 = String(id1).trim();
            const str2 = String(id2).trim();
            const stringMatch = str1 === str2;
            const num1 = Number(id1);
            const num2 = Number(id2);
            const numberMatch = !isNaN(num1) && !isNaN(num2) && num1 === num2;
            return stringMatch || numberMatch;
          };

          // ✅ CAMBIO: Obtener todos los clientes
          const response = await getClients();
          console.log("🔍 DEBUG remittance-details - Response clientes:", response);
          
          if (response && response.result) {
            // ✅ FILTRAR NULL Y SOFT_DELETE
            const clientsArray = response.result.filter((c: any) => c !== null && !c.soft_delete);
            console.log("🔍 DEBUG remittance-details - Clientes activos:", clientsArray);
            
            // ✅ USAR FUNCIÓN HELPER PARA COMPARAR IDs
            const destinatario = clientsArray.find(
              (client: any) => compareIds(client.id, remittance.destinatario_id)
            );
            const propietario = clientsArray.find(
              (client: any) => compareIds(client.id, remittance.propietario_id)
            );

            console.log("🔍 DEBUG remittance-details - Clientes encontrados:", {
              destinatario: destinatario?.nombre || "NO ENCONTRADO",
              propietario: propietario?.nombre || "NO ENCONTRADO"
            });
            
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

  if (loading) return <Loading />;
  if (!remittance) return <div>No se encontró información para el remito</div>;

  // ✅ Calcular total de gastos
  const totalGastos = Number(remittance.peaje || 0) + 
                     Number(remittance.lavado || 0) + 
                     Number(remittance.balanza || 0) + 
                     Number(remittance.inspeccion || 0);

  return (
    <div className="space-y-6">
      {/* ✅ Encabezado mejorado con badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">📋 Remito #{remittance.numero_remito}</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant={remittance.pernocte ? "default" : "secondary"}>
              {remittance.pernocte ? "🌙 Con Pernocte" : "☀️ Sin Pernocte"}
            </Badge>
            <Badge variant="outline">📦 Guía: {remittance.numero_guia}</Badge>
            {remittance.categoria && (
              <Badge variant="outline">🏷️ {remittance.categoria}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            🖨️ Imprimir
          </Button>
          <Link href={`/remitos/${id}/editar`}>
            <Button>✏️ Editar Remito</Button>
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
                <dt className="font-semibold text-gray-600">Número de Remito:</dt>
                <dd className="font-mono">{remittance.numero_remito}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Número de Guía:</dt>
                <dd className="font-mono">{remittance.numero_guia}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Fecha:</dt>
                <dd>
                  {remittance.fecha
                    ? new Date(remittance.fecha).toLocaleDateString("es-UY", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/D"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Categoría:</dt>
                <dd>
                  <Badge variant="outline">{remittance.categoria || "N/D"}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Cuadruplicado:</dt>
                <dd className="font-mono">{remittance.cuadruplicado || "N/D"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Transporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚛 Transporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Camión:</dt>
                <dd className="text-right font-mono">
                  {camion.modelo || "N/D"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Matrícula:</dt>
                <dd className="text-right font-mono">
                  {camion.matricula || "N/D"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Matrícula Zorra:</dt>
                <dd className="text-right font-mono">
                  {camion.matricula_zorra || "N/D"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Chofer:</dt>
                <dd className="text-right">{choferName || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Kilómetros:</dt>
                <dd className="text-right font-mono">{remittance.kilometros || "0"} km</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Carga y Destino */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦 Carga y Destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Lugar de Carga:</dt>
                <dd className="text-right">{remittance.lugar_carga || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Hora de Carga:</dt>
                <dd className="text-right font-mono">{remittance.hora_carga || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Cantidad:</dt>
                <dd className="text-right font-mono">{remittance.cantidad || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Hora de Destino:</dt>
                <dd className="text-right font-mono">{remittance.hora_destino || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Consignatario:</dt>
                <dd className="text-right">{remittance.consignatario || "N/D"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Destinatario:</dt>
                <dd className="text-right font-semibold text-blue-600">
                  {clientNames.destinatario}
                  {/* ✅ DEBUG temporal */}
                  <div className="text-xs text-gray-400 font-normal">
                    ID: {remittance.destinatario_id} ({typeof remittance.destinatario_id})
                  </div>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Propietario:</dt>
                <dd className="text-right font-semibold text-green-600">
                  {clientNames.propietario}
                  {/* ✅ DEBUG temporal */}
                  <div className="text-xs text-gray-400 font-normal">
                    ID: {remittance.propietario_id} ({typeof remittance.propietario_id})
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💳 Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Peaje:</dt>
                <dd className="text-right font-mono">
                  ${Number(remittance.peaje || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Lavado:</dt>
                <dd className="text-right font-mono">
                  ${Number(remittance.lavado || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Balanza:</dt>
                <dd className="text-right font-mono">
                  ${Number(remittance.balanza || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Inspección:</dt>
                <dd className="text-right font-mono">
                  ${Number(remittance.inspeccion || 0).toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="font-bold text-gray-800">Total Gastos:</dt>
                <dd className="text-right font-bold text-red-600">
                  ${totalGastos.toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Detalles Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Detalles Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Encargado:</dt>
                <dd className="text-right">{remittance.encargado || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Recibido Por:</dt>
                <dd className="text-right">{remittance.recibido_por || "N/D"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Pernocte:</dt>
                <dd className="text-right">
                  <Badge variant={remittance.pernocte ? "default" : "secondary"}>
                    {remittance.pernocte ? "Sí" : "No"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Acceso Agua:</dt>
                <dd className="text-right">
                  <Badge variant={remittance.acceso_agua ? "default" : "secondary"}>
                    {remittance.acceso_agua ? "Sí" : "No"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-gray-600">Acceso Sombra:</dt>
                <dd className="text-right">
                  <Badge variant={remittance.acceso_sombra ? "default" : "secondary"}>
                    {remittance.acceso_sombra ? "Sí" : "No"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Observaciones */}
      {remittance.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📄 Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{remittance.observaciones}</p>
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
        <Link href="/remitos">
          <Button variant="outline">← Volver a Remitos</Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            🖨️ Imprimir Detalles
          </Button>
          <Link href={`/remitos/${remittance.id}/editar`}>
            <Button>✏️ Editar Remito</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}