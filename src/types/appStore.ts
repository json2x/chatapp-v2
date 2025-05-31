export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isPopular?: boolean;
  discount?: number;
  originalPrice?: number;
}

export interface AppState {
  title: string;
  description: string;
  features: Feature[];
  pricingPlans: PricingPlan[];
  version: string;
  copyrightYear: number;
}
