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
  const createSubscription = async () => {
    try {
      setActionLoading(true);

      const data = await createSubscriptionAPI({
        plan_type: "monthly"
      });
      
      if (data.success) {
        // Redirigir a MercadoPago para completar el pago
        window.open(data.result.payment_url, "_blank");
        
        Swal.fire({
          title: "¡Suscripción creada!",
          text: "Te hemos redirigido a MercadoPago para completar el pago. Una vez completado, tu suscripción se activará automáticamente.",
          icon: "success"
        });

        // Actualizar datos después de un delay
        setTimeout(() => {
          fetchSubscription();
          // Recargar la página para que el guard se actualice
          window.location.reload();
        }, 5000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      Swal.fire("Error", error.message || "No se pudo crear la suscripción", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ CANCELAR SUSCRIPCIÓN
  const cancelSubscription = async () => {
    const result = await Swal.fire({
      title: "¿Cancelar suscripción?",
      text: "Esta acción cancelará tu suscripción mensual. Podrás seguir usando el servicio hasta el final del período actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener"
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(true);
      const data = await cancelSubscriptionAPI();
      
      if (data.success) {
        Swal.fire("¡Cancelada!", "Tu suscripción ha sido cancelada correctamente.", "success");
        fetchSubscription();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      Swal.fire("Error", error.message || "No se pudo cancelar la suscripción", "error");
    } finally {
      setActionLoading(false);
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
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Gestión de Suscripción</h2>
      </div>

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
                    {subscription.plan_type === 'monthly' ? 'Mensual' : 'Anual'} - 
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
                  onClick={cancelSubscription}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Cancelando..." : "Cancelar Suscripción"}
                </Button>
              )}
              
              {subscription.status === 'pending' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Tu suscripción está pendiente de pago. 
                    <Button variant="link" className="p-0 h-auto ml-1" onClick={createSubscription}>
                      Completar pago <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                variant="outline" 
                onClick={fetchSubscription}
                disabled={actionLoading}
              >
                Actualizar Estado
              </Button>
            </div>
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

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  $29.99 <span className="text-lg text-gray-600">/mes</span>
                </div>
                <Button 
                  onClick={createSubscription} 
                  disabled={actionLoading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {actionLoading ? "Creando..." : "Suscribirse Ahora"}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Pago seguro procesado por MercadoPago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
