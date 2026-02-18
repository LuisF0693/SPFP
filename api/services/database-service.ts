/**
 * Database Service
 * Handles all Supabase database operations for Stripe integration
 */

import { supabaseAdmin } from '../supabase';
import { StripeSession, StripeSubscriptionDB, UserAccess } from '../types';
import { withErrorRecovery } from '../../src/services/errorRecovery';

/**
 * Save checkout session to database
 */
export async function saveCheckoutSession(
  userId: string,
  sessionId: string,
  priceId: string,
  amount: number,
  currency: string,
  planType: 'parcelado' | 'mensal'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('stripe_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        price_id: priceId,
        status: 'open',
        amount,
        currency,
        plan_type: planType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving checkout session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveCheckoutSession:', error);
    return false;
  }
}

/**
 * Update checkout session status
 */
export async function updateCheckoutSessionStatus(
  sessionId: string,
  status: 'open' | 'expired' | 'complete'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('stripe_sessions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error updating checkout session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateCheckoutSessionStatus:', error);
    return false;
  }
}

/**
 * Get checkout session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<StripeSession | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('stripe_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching checkout session:', error);
      return null;
    }

    return data as StripeSession;
  } catch (error) {
    console.error('Error in getCheckoutSession:', error);
    return null;
  }
}

/**
 * Save subscription to database
 */
export async function saveSubscription(
  userId: string,
  subscriptionId: string,
  customerId: string,
  priceId: string,
  status: 'active' | 'past_due' | 'cancelled'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('stripe_subscriptions')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        customer_id: customerId,
        price_id: priceId,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveSubscription:', error);
    return false;
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: 'active' | 'past_due' | 'cancelled'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('stripe_subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
    return false;
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<StripeSubscriptionDB | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('stripe_subscriptions')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data as StripeSubscriptionDB;
  } catch (error) {
    console.error('Error in getSubscription:', error);
    return null;
  }
}

/**
 * Grant user access
 */
export async function grantUserAccess(
  userId: string,
  plan: number,
  planType: 'parcelado' | 'mensal'
): Promise<boolean> {
  try {
    // Check if user already has access
    const existing = await getUserAccess(userId);

    if (existing) {
      // Update existing access
      const { error } = await supabaseAdmin
        .from('user_access')
        .update({
          plan,
          plan_type: planType,
          is_active: true,
          access_granted_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user access:', error);
        return false;
      }
    } else {
      // Create new access record
      const { error } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: userId,
          plan,
          plan_type: planType,
          is_active: true,
          access_granted_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating user access:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in grantUserAccess:', error);
    return false;
  }
}

/**
 * Get user access
 */
export async function getUserAccess(userId: string): Promise<UserAccess | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_access')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching user access:', error);
      return null;
    }

    return data as UserAccess;
  } catch (error) {
    console.error('Error in getUserAccess:', error);
    return null;
  }
}

/**
 * Revoke user access
 */
export async function revokeUserAccess(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('user_access')
      .update({
        is_active: false,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error revoking user access:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in revokeUserAccess:', error);
    return false;
  }
}

/**
 * Get user's active subscription
 */
export async function getUserActiveSubscription(userId: string): Promise<StripeSubscriptionDB | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return data as StripeSubscriptionDB;
  } catch (error) {
    console.error('Error in getUserActiveSubscription:', error);
    return null;
  }
}

/**
 * Extract plan amount from price ID
 */
export function getPlanAmountFromPriceId(priceId: string): number {
  const priceMap: Record<string, number> = {
    'price_1T1yllIZBkfjgy2X30qaXxQo': 9900, // R$99 parcelado
    'price_1T1ym7IZBkfjgy2XXytc5SOt': 9900, // R$99 mensal
    'price_1T1ymOIZBkfjgy2XPWFYJSGi': 34900, // R$349 parcelado
    'price_1T1ymeIZBkfjgy2XtLyCqyBE': 34900, // R$349 mensal
  };

  return priceMap[priceId] || 0;
}

/**
 * Extract plan type from price ID
 */
export function getPlanTypeFromPriceId(priceId: string): 'parcelado' | 'mensal' {
  const parceladoPrices = [
    'price_1T1yllIZBkfjgy2X30qaXxQo', // R$99 parcelado
    'price_1T1ymOIZBkfjgy2XPWFYJSGi', // R$349 parcelado
  ];

  return parceladoPrices.includes(priceId) ? 'parcelado' : 'mensal';
}

export default {
  saveCheckoutSession,
  updateCheckoutSessionStatus,
  getCheckoutSession,
  saveSubscription,
  updateSubscriptionStatus,
  getSubscription,
  grantUserAccess,
  getUserAccess,
  revokeUserAccess,
  getUserActiveSubscription,
  getPlanAmountFromPriceId,
  getPlanTypeFromPriceId,
};
