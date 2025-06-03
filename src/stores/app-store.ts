import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AppState, Feature, PricingPlan } from 'src/types/appStore';

export const useAppStore = defineStore('app', () => {
  // App general information
  const title = ref<string>('MrRoboto');
  const description = ref<string>('AI conversations that understand you');
  const version = ref<string>('1.0.0');
  const copyrightYear = ref<number>(new Date().getFullYear());
  const titleSplitIndex = ref<number>(-6); // Controls how many characters to highlight at the end of the title

  // Features list
  const features = ref<Feature[]>([
    {
      id: 'feature-1',
      title: 'Smart Conversations',
      description: 'Our AI understands context and provides meaningful responses to your queries.',
      icon: '💬',
      isPopular: true
    },
    {
      id: 'feature-2',
      title: 'Math Rendering',
      description: 'Beautiful rendering of mathematical formulas and equations with LaTeX support.',
      icon: '🧮'
    },
    {
      id: 'feature-3',
      title: 'Code Highlighting',
      description: 'Share and view code snippets with syntax highlighting for multiple languages.',
      icon: '💻'
    },
    {
      id: 'feature-4',
      title: 'Chemical Formulas',
      description: 'Render complex chemical formulas and reactions with mhchem support.',
      icon: '🧪',
      isNew: true
    },
    {
      id: 'feature-5',
      title: 'Conversation History',
      description: 'Access your past conversations anytime, with full search capabilities.',
      icon: '📚'
    },
    {
      id: 'feature-6',
      title: 'Multi-platform Support',
      description: `Use ${title.value} on any device with our responsive web interface.`,
      icon: '📱'
    }
  ]);

  // Pricing plans
  const pricingPlans = ref<PricingPlan[]>([
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      billingPeriod: 'monthly',
      features: [
        'Up to 20 messages per day',
        'Basic math rendering',
        'Code highlighting for 5 languages',
        '7-day conversation history'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      currency: 'USD',
      billingPeriod: 'monthly',
      features: [
        'Unlimited messages',
        'Advanced math rendering',
        'Code highlighting for all languages',
        '30-day conversation history',
        'Priority support'
      ],
      isPopular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.99,
      currency: 'USD',
      billingPeriod: 'yearly',
      originalPrice: 119.88,
      discount: 16,
      features: [
        'All Pro features',
        'Unlimited conversation history',
        'Custom AI training',
        'API access',
        '24/7 dedicated support',
        'Early access to new features'
      ]
    }
  ]);

  // Getters
  const getAppInfo = (): AppState => {
    return {
      title: title.value,
      description: description.value,
      features: features.value,
      pricingPlans: pricingPlans.value,
      version: version.value,
      copyrightYear: copyrightYear.value
    };
  };

  // Actions
  const updateAppTitle = (newTitle: string) => {
    title.value = newTitle;
  };

  const updateAppDescription = (newDescription: string) => {
    description.value = newDescription;
  };

  const addFeature = (feature: Feature) => {
    features.value.push(feature);
  };

  const removeFeature = (featureId: string) => {
    const index = features.value.findIndex(f => f.id === featureId);
    if (index !== -1) {
      features.value.splice(index, 1);
    }
  };

  const updateFeature = (featureId: string, updatedFeature: Partial<Feature>) => {
    const index = features.value.findIndex(f => f.id === featureId);
    if (index !== -1) {
      const currentFeature = features.value[index];
      // Only proceed if we found a valid feature
      if (currentFeature) {
        // Ensure all required properties are preserved
        const updated: Feature = {
          ...currentFeature,
          ...updatedFeature,
          // Explicitly ensure required properties are present
          id: updatedFeature.id ?? currentFeature.id,
          title: updatedFeature.title ?? currentFeature.title,
          description: updatedFeature.description ?? currentFeature.description
        };
        features.value[index] = updated;
      }
    }
  };

  const addPricingPlan = (plan: PricingPlan) => {
    pricingPlans.value.push(plan);
  };

  const removePricingPlan = (planId: string) => {
    const index = pricingPlans.value.findIndex(p => p.id === planId);
    if (index !== -1) {
      pricingPlans.value.splice(index, 1);
    }
  };

  const updatePricingPlan = (planId: string, updatedPlan: Partial<PricingPlan>) => {
    const index = pricingPlans.value.findIndex(p => p.id === planId);
    if (index !== -1) {
      const currentPlan = pricingPlans.value[index];
      // Only proceed if we found a valid plan
      if (currentPlan) {
        // Ensure all required properties are preserved
        const updated: PricingPlan = {
          ...currentPlan,
          ...updatedPlan,
          // Explicitly ensure required properties are present
          id: updatedPlan.id ?? currentPlan.id,
          name: updatedPlan.name ?? currentPlan.name,
          price: updatedPlan.price ?? currentPlan.price,
          currency: updatedPlan.currency ?? currentPlan.currency,
          billingPeriod: updatedPlan.billingPeriod ?? currentPlan.billingPeriod,
          features: updatedPlan.features ?? currentPlan.features
        };
        pricingPlans.value[index] = updated;
      }
    }
  };

  return {
    // State
    title,
    description,
    features,
    pricingPlans,
    version,
    copyrightYear,
    titleSplitIndex,
    
    // Getters
    getAppInfo,
    
    // Actions
    updateAppTitle,
    updateAppDescription,
    addFeature,
    removeFeature,
    updateFeature,
    addPricingPlan,
    removePricingPlan,
    updatePricingPlan
  };
});
