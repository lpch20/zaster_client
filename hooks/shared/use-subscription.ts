import { useState, useEffect } from 'react';
import { getUserSubscription } from '@/api/RULE_subscription';
import { useAuth } from '@/app/lib/auth';

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

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  hasActiveSubscription: boolean;
  isSubscriptionRequired: boolean;
  refetchSubscription: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await getUserSubscription();
      
      if (data.success && data.result) {
        setSubscription(data.result);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo buscar suscripción si el usuario está autenticado
    if (isAuthenticated) {
      fetchSubscription();
    } else {
      // Si no está autenticado, limpiar la suscripción
      setSubscription(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const hasActiveSubscription = subscription?.status === 'active';
  const isSubscriptionRequired = !hasActiveSubscription;

  return {
    subscription,
    loading,
    hasActiveSubscription,
    isSubscriptionRequired,
    refetchSubscription: fetchSubscription
  };
}
