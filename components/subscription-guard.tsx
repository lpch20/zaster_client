"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from "lucide-react";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

// Rutas que NO requieren suscripción activa
const PUBLIC_ROUTES = [
  '/login',
  '/configuracion', // Permitir configuración para poder suscribirse
];

// Rutas que SÍ requieren suscripción activa
const PROTECTED_ROUTES = [
  '/', // Dashboard principal
  '/dashboard',
  '/viajes',
  '/remitos',
  '/liquidaciones',
  '/choferes',
  '/camiones',
  '/clientes',
  '/gastos',
  '/combustible',
  '/cubiertas'
];

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { subscription, loading, hasActiveSubscription } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando suscripción...</p>
        </div>
      </div>
    );
  }

  // Verificar si la ruta actual requiere suscripción
  const isProtectedRoute = PROTECTED_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/'; // Solo la ruta exacta "/"
    }
    return pathname.startsWith(route);
  });
  
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route)
  );


  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Si es una ruta protegida y no tiene suscripción activa, bloquear
  if (isProtectedRoute && !hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          
          {/* Icono de bloqueo */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Suscripción Requerida
            </h1>
            <p className="mt-2 text-gray-600">
              Necesitas una suscripción activa para acceder a esta funcionalidad
            </p>
          </div>

          {/* Estado actual de suscripción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Estado de Suscripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-3">
                  {subscription.status === 'pending' && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Tu suscripción está <strong>pendiente de pago</strong>. 
                        Completa el proceso de pago para activar tu cuenta.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {subscription.status === 'cancelled' && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Tu suscripción fue <strong>cancelada</strong>. 
                        Necesitas una nueva suscripción para continuar.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {subscription.status === 'expired' && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Tu suscripción ha <strong>expirado</strong>. 
                        Renueva tu suscripción para continuar usando la plataforma.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">
                      Plan: <span className="font-medium">{subscription.plan_type === 'monthly' ? 'Mensual' : 'Anual'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Precio: <span className="font-medium">{subscription.currency} ${subscription.amount}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Estado: <span className={`font-medium ${
                        subscription.status === 'active' ? 'text-green-600' : 
                        subscription.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {subscription.status === 'active' ? 'Activa' :
                         subscription.status === 'pending' ? 'Pendiente' :
                         subscription.status === 'cancelled' ? 'Cancelada' : 'Expirada'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>No tienes ninguna suscripción.</strong> 
                    Para usar Zaster necesitas suscribirte a nuestro plan mensual.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Características del plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Qué incluye la suscripción?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Gestión completa de viajes y remitos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Liquidaciones automáticas de choferes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Reportes y exportación PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Gestión de gastos y combustible</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Soporte técnico prioritario</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/configuracion')}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {subscription ? 'Gestionar Suscripción' : 'Suscribirse Ahora'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Volver al Dashboard
            </Button>
          </div>

          {/* Precio */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              $29.99 <span className="text-sm text-gray-600">/mes</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cancela cuando quieras • Pago seguro con MercadoPago
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene suscripción activa o no es una ruta protegida, mostrar contenido
  return <>{children}</>;
}
