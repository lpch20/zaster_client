"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import Swal from "sweetalert2";
import { 
  createSubscription as createSubscriptionAPI,
  getUserSubscription as getUserSubscriptionAPI,
  cancelSubscription as cancelSubscriptionAPI
} from "@/api/RULE_subscription";

interface Subscription {
  id: number;
  status: string;
  plan_type: string;
  amount: number;
  currency: string;
  start_date: string;
  next_billing_date: string;
  activated_at: string;
  cancelled_at: string;
  created_at: string;
}

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  // ✅ OBTENER SUSCRIPCIÓN ACTUAL
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await getUserSubscriptionAPI();
      
      if (data.success && data.result) {
        setSubscription(data.result);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      Swal.fire("Error", "No se pudo cargar la información de suscripción", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREAR NUEVA SUSCRIPCIÓN
  const createSubscription = async (planType: 'monthly' | 'semiannual' | 'yearly' = 'monthly') => {
    try {
      setActionLoading(true);

      const data = await createSubscriptionAPI({
        plan_type: planType
      });
      
      if (data.success) {
        // Redirigir al init_point de MercadoPago (mejor usar same tab para que el back vuelva con el query param)
        window.location.href = data.result.payment_url;
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error("Error creating subscription:", err);
      Swal.fire("Error", err.message || "No se pudo crear la suscripción", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ CANCELAR SUSCRIPCIÓN
  const cancelSubscription = async (showConfirmation: boolean = true, silent: boolean = false) => {
    if (showConfirmation) {
      const result = await Swal.fire({
        title: "¿Cancelar suscripción?",
        text: "Esta acción cancelará tu suscripción. Podrás elegir otro plan después.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, mantener"
      });

      if (!result.isConfirmed) return;
    }

    try {
      if (!silent) {
        setActionLoading(true);
      }
      const data = await cancelSubscriptionAPI();
      
      if (data.success) {
        if (showConfirmation && !silent) {
          Swal.fire("¡Cancelada!", "Tu suscripción ha sido cancelada correctamente.", "success");
        }
        // Refrescar la suscripción para actualizar el estado
        if (!silent) {
          await fetchSubscription();
        }
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      if (!silent) {
        Swal.fire("Error", err.message || "No se pudo cancelar la suscripción", "error");
      }
      return false;
    } finally {
      if (!silent) {
        setActionLoading(false);
      }
    }
  };

  // ✅ OBTENER BADGE DE ESTADO
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, icon: CheckCircle, text: "Activa", color: "text-green-600" },
      pending: { variant: "secondary" as const, icon: Clock, text: "Pendiente", color: "text-yellow-600" },
      cancelled: { variant: "destructive" as const, icon: XCircle, text: "Cancelada", color: "text-red-600" },
      expired: { variant: "destructive" as const, icon: AlertTriangle, text: "Expirada", color: "text-red-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  // ✅ FORMATEAR FECHA
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // ✅ Manejar retorno desde MercadoPago (ej. ?subscription=success)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subscription");
    if (sub === "success") {
      Swal.fire({
        title: "Pago completado",
        text: "Tu suscripción fue activada correctamente. Actualizando estado...",
        icon: "success",
        timer: 2000,
      });
      // Refrescar la suscripción desde el backend
      fetchSubscription();
      // Limpiar el query param para evitar duplicados
      params.delete("subscription");
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando suscripción...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Gestión de Suscripción</h2>
      </div> */}

      {/* ✅ INFORMACIÓN DE LA SUSCRIPCIÓN */}
      {subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Mi Suscripción
              </CardTitle>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan y Precio */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold">
                    {subscription.plan_type === 'monthly' ? 'Mensual' : 
                     subscription.plan_type === 'semiannual' ? 'Semestral' : 'Anual'} - 
                    {subscription.currency} ${subscription.amount}
                  </p>
                </div>
              </div>

              {/* Próximo Cobro */}
              {subscription.status === 'active' && subscription.next_billing_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Próximo cobro</p>
                    <p className="font-semibold">{formatDate(subscription.next_billing_date)}</p>
                  </div>
                </div>
              )}

              {/* Fecha de Activación */}
              {subscription.activated_at && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Activada el</p>
                    <p className="font-semibold">{formatDate(subscription.activated_at)}</p>
                  </div>
                </div>
              )}

              {/* Fecha de Cancelación */}
              {subscription.cancelled_at && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cancelada el</p>
                    <p className="font-semibold">{formatDate(subscription.cancelled_at)}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              {subscription.status === 'active' && (
                <Button 
                  variant="destructive" 
                  onClick={(e) => {
                    e.preventDefault();
                    cancelSubscription(true);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Cancelando..." : "Cancelar Suscripción"}
                </Button>
              )}
              
              {subscription.status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      createSubscription(subscription.plan_type as 'monthly' | 'semiannual' | 'yearly');
                    }}
                    disabled={actionLoading}
                  >
                    Completar Pago Actual
                  </Button>
                </>
              )}

              {(subscription.status === 'cancelled' || subscription.status === 'expired') && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    createSubscription('monthly');
                  }}
                  disabled={actionLoading}
                  className="w-full sm:w-auto"
                >
                  {actionLoading ? "Creando..." : "Suscribirse Nuevamente"}
                </Button>
              )}

              <Button 
                variant="outline" 
                onClick={fetchSubscription}
                disabled={actionLoading}
              >
                Actualizar Estado
              </Button>
            </div>
            
            {/* Mostrar opciones de planes si está cancelada o expirada */}
            {(subscription.status === 'cancelled' || subscription.status === 'expired') && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Elige un plan para reactivar tu suscripción</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tu suscripción anterior fue cancelada. Selecciona un nuevo plan para continuar:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Plan Mensual */}
                    <Card className="border-2 hover:border-blue-500 transition-colors flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Mensual</CardTitle>
                        <div className="text-2xl font-bold text-blue-600">
                          $29.99 <span className="text-sm text-gray-600">/mes</span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            createSubscription('monthly');
                          }} 
                          disabled={actionLoading}
                          className="w-full"
                          variant="outline"
                        >
                          {actionLoading ? "Creando..." : "Elegir Mensual"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Plan Semestral */}
                    <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative flex flex-col">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-500">Ahorra 17%</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Semestral</CardTitle>
                        <div className="text-2xl font-bold text-blue-600">
                          $6.000 <span className="text-sm text-gray-600">/6 meses</span>
                        </div>
                        <p className="text-sm text-gray-500">$1.000/mes</p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            createSubscription('semiannual');
                          }} 
                          disabled={actionLoading}
                          className="w-full"
                        >
                          {actionLoading ? "Creando..." : "Elegir Semestral"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Plan Anual */}
                    <Card className="border-2 hover:border-blue-500 transition-colors relative flex flex-col">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-500">Ahorra 17%</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Anual</CardTitle>
                        <div className="text-2xl font-bold text-blue-600">
                          $12.000 <span className="text-sm text-gray-600">/año</span>
                        </div>
                        <p className="text-sm text-gray-500">$1.000/mes</p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            createSubscription('yearly');
                          }} 
                          disabled={actionLoading}
                          className="w-full"
                          variant="outline"
                        >
                          {actionLoading ? "Creando..." : "Elegir Anual"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
            
            {/* Mostrar opciones de planes si está pendiente */}
            {subscription.status === 'pending' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">¿Quieres cambiar de plan?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Puedes cancelar tu suscripción pendiente y elegir otro plan:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Plan Mensual */}
                    <Card className="border-2 hover:border-blue-500 transition-colors flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Mensual</CardTitle>
                        <div className="text-2xl font-bold text-blue-600">
                          $1.200 <span className="text-sm text-gray-600">/mes</span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <Button 
                          onClick={async (e) => {
                            e.preventDefault();
                            if (subscription.plan_type !== 'monthly') {
                              try {
                                setActionLoading(true);
                                // Cancelar sin confirmación y sin mostrar errores (silent mode)
                                await cancelSubscription(false, true);
                                // Pequeño delay para asegurar que la cancelación se procesó
                                await new Promise(resolve => setTimeout(resolve, 500));
                                // Crear nueva suscripción
                                await createSubscription('monthly');
                              } catch (error: any) {
                                console.error("Error cambiando de plan:", error);
                                Swal.fire("Error", error.message || "No se pudo cambiar de plan", "error");
                                setActionLoading(false);
                              }
                            }
                          }} 
                          disabled={actionLoading || subscription.plan_type === 'monthly'}
                          className="w-full"
                          variant={subscription.plan_type === 'monthly' ? "default" : "outline"}
                        >
                          {subscription.plan_type === 'monthly' ? "Plan Actual" : "Elegir Mensual"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Plan Semestral */}
                    <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative flex flex-col">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-500">Ahorra 17%</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Semestral</CardTitle>
                        <div className="text-2xl font-bold text-blue-600">
                          $6.000 <span className="text-sm text-gray-600">/6 meses</span>
                        </div>
                        <p className="text-sm text-gray-500">$1.000/mes</p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <Button 
                          onClick={async (e) => {
                            e.preventDefault();
                            if (subscription.plan_type !== 'semiannual') {
                              try {
                                setActionLoading(true);
                                // Cancelar sin confirmación y sin mostrar errores (silent mode)
                                await cancelSubscription(false, true);
                                // Pequeño delay para asegurar que la cancelación se procesó
                                await new Promise(resolve => setTimeout(resolve, 500));
                                // Crear nueva suscripción
                                await createSubscription('semiannual');
                              } catch (error: any) {
                                console.error("Error cambiando de plan:", error);
                                Swal.fire("Error", error.message || "No se pudo cambiar de plan", "error");
                                setActionLoading(false);
                              }
                            }
                          }} 
                          disabled={actionLoading || subscription.plan_type === 'semiannual'}
                          className="w-full"
                          variant={subscription.plan_type === 'semiannual' ? "default" : "outline"}
                        >
                          {subscription.plan_type === 'semiannual' ? "Plan Actual" : "Elegir Semestral"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Plan Anual */}
                    <Card className="border-2 hover:border-blue-500 transition-colors relative flex flex-col">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-500">Ahorra 17%</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">Plan Anual</CardTitle>
                        <div className="text-2xl font-bold text-blue-600">
                          $12.000 <span className="text-sm text-gray-600">/año</span>
                        </div>
                        <p className="text-sm text-gray-500">$1.000/mes</p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <Button 
                          onClick={async (e) => {
                            e.preventDefault();
                            if (subscription.plan_type !== 'yearly') {
                              try {
                                setActionLoading(true);
                                // Cancelar sin confirmación y sin mostrar errores (silent mode)
                                await cancelSubscription(false, true);
                                // Pequeño delay para asegurar que la cancelación se procesó
                                await new Promise(resolve => setTimeout(resolve, 500));
                                // Crear nueva suscripción
                                await createSubscription('yearly');
                              } catch (error: any) {
                                console.error("Error cambiando de plan:", error);
                                Swal.fire("Error", error.message || "No se pudo cambiar de plan", "error");
                                setActionLoading(false);
                              }
                            }
                          }} 
                          disabled={actionLoading || subscription.plan_type === 'yearly'}
                          className="w-full"
                          variant={subscription.plan_type === 'yearly' ? "default" : "outline"}
                        >
                          {subscription.plan_type === 'yearly' ? "Plan Actual" : "Elegir Anual"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ✅ NO HAY SUSCRIPCIÓN */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Suscripción Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes una suscripción activa</h3>
              <p className="text-gray-600 mb-6">
                Suscríbete para acceder a todas las funcionalidades premium de Zaster
              </p>

              {/* Características Premium */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">¿Qué incluye la suscripción?</h4>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Gestión ilimitada de viajes y remitos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Reportes avanzados y exportación PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Soporte prioritario
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Respaldo automático de datos
                  </li>
                </ul>
              </div>

              {/* ✅ PLANES DE SUSCRIPCIÓN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Plan Mensual */}
                <Card className="border-2 hover:border-blue-500 transition-colors flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Mensual</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">
                      $1.200 <span className="text-sm text-gray-600">/mes</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        createSubscription('monthly');
                      }} 
                      disabled={actionLoading}
                      className="w-full"
                      variant="outline"
                    >
                      {actionLoading ? "Creando..." : "Elegir Mensual"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Plan Semestral */}
                <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative flex flex-col">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500">Ahorra 17%</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Semestral</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">
                      $6.000 <span className="text-sm text-gray-600">/6 meses</span>
                    </div>
                    <p className="text-sm text-gray-500">$1.000/mes</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        createSubscription('semiannual');
                      }} 
                      disabled={actionLoading}
                      className="w-full"
                    >
                      {actionLoading ? "Creando..." : "Elegir Semestral"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Plan Anual */}
                <Card className="border-2 hover:border-blue-500 transition-colors relative flex flex-col">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500">Ahorra 17%</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Anual</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">
                      $12.000 <span className="text-sm text-gray-600">/año</span>
                    </div>
                    <p className="text-sm text-gray-500">$1.000/mes</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        createSubscription('yearly');
                      }} 
                      disabled={actionLoading}
                      className="w-full"
                      variant="outline"
                    >
                      {actionLoading ? "Creando..." : "Elegir Anual"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Pago seguro procesado por MercadoPago • Cancela cuando quieras
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
