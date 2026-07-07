// export type SubscriptionStatus = 'active' | 'paused';
export type SubscriptionPlan = 'Free' | 'Pro';

export interface Organization {
  id: string;
  name: string;
  admin_id: string;
  created_at?: string;
  subscription_plan: SubscriptionPlan;
  // subscription_status: SubscriptionStatus;
  // revenue: number;
}

export interface CreateOrgDTO {
  name: string;
  admin_id: string;
  subscription_plan: SubscriptionPlan;
  // subscription_status: SubscriptionStatus;
  // revenue: number;
}
