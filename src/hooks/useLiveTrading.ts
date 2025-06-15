
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';

export interface LiveOrder {
  id: string;
  user_id: string;
  exchange: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  quantity: number;
  price?: number;
  stop_price?: number;
  exchange_order_id?: string;
  status: 'PENDING' | 'SUBMITTED' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'FAILED';
  filled_quantity: number;
  average_fill_price?: number;
  strategy_id?: string;
  created_at: string;
  updated_at: string;
  filled_at?: string;
}

export const useLiveTrading = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchOrders();

    // Subscribe to real-time order updates
    const channel = supabase
      .channel('live-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Order update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [...prev, payload.new as LiveOrder]);
            toast({
              title: "New Order Created",
              description: `${payload.new.side} order for ${payload.new.symbol} has been created.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? payload.new as LiveOrder : order
            ));
            
            const updatedOrder = payload.new as LiveOrder;
            if (updatedOrder.status === 'FILLED') {
              toast({
                title: "Order Filled",
                description: `${updatedOrder.side} order for ${updatedOrder.symbol} has been filled at ${updatedOrder.average_fill_price}`,
              });
            } else if (updatedOrder.status === 'FAILED') {
              toast({
                title: "Order Failed",
                description: `${updatedOrder.side} order for ${updatedOrder.symbol} has failed.`,
                variant: "destructive"
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('live_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const createOrder = async (orderData: Omit<LiveOrder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'filled_quantity' | 'status'>) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_orders')
        .insert({
          ...orderData,
          user_id: user.id,
          filled_quantity: 0,
          status: 'PENDING'
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate order execution after creation
      setTimeout(() => {
        executeOrder(data.id);
      }, 2000);

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const executeOrder = async (orderId: string) => {
    try {
      // Simulate order execution with random success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate
      const simulatedPrice = Math.random() * 1000 + 45000; // Random BTC price

      const updateData: any = {
        status: isSuccess ? 'FILLED' : 'FAILED',
        updated_at: new Date().toISOString(),
      };

      if (isSuccess) {
        updateData.filled_quantity = orders.find(o => o.id === orderId)?.quantity || 0;
        updateData.average_fill_price = simulatedPrice;
        updateData.filled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('live_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error executing order:', error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('live_orders')
        .update({ 
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    orders,
    loading,
    createOrder,
    cancelOrder,
    fetchOrders
  };
};
