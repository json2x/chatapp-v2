<template>
  <section class="pricing-section" id="pricing">
    <h2 class="section-title">{{ appTitle }} Pricing Plans</h2>
    <p class="section-subtitle">Choose the plan that works for you</p>
    
    <div class="pricing-cards">
      <div class="pricing-card" v-for="(plan, index) in pricingPlans" :key="index">
        <div class="card-header">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="currency">$</span>
            <span class="amount">{{ plan.price }}</span>
          </div>
          <p class="plan-billing">{{ plan.billing }}</p>
        </div>
        <div class="card-body">
          <ul class="features-list">
            <li v-for="(feature, fIndex) in plan.features" :key="fIndex">
              <span class="check-icon">✓</span> {{ feature }}
            </li>
          </ul>
        </div>
        <div class="card-footer">
          <button class="select-plan-btn" :class="{ 'popular': plan.popular }">
            {{ plan.popular ? 'Best Value' : 'Select Plan' }}
          </button>
        </div>
        <div v-if="plan.popular" class="popular-badge">Popular</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/app-store';

const appStore = useAppStore();
const appTitle = computed(() => appStore.title);

const pricingPlans = ref([
  {
    name: 'Starter',
    price: '9.99',
    billing: 'per month',
    features: [
      '100 chat messages',
      'Basic AI models',
      'Standard response time',
      '7-day history'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: '24.99',
    billing: 'per month',
    features: [
      '500 chat messages',
      'Advanced AI models',
      'Priority response time',
      '30-day history',
      'Custom instructions'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '49.99',
    billing: 'per month',
    features: [
      'Unlimited chat messages',
      'All AI models',
      'Instant response time',
      'Unlimited history',
      'Custom instructions',
      'API access'
    ],
    popular: false
  }
]);
</script>

<style scoped>
.pricing-section {
  padding: 6rem 2rem;
  background-color: #ffffff;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.section-subtitle {
  font-size: 1.25rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 4rem;
}

.pricing-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.card-header {
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.plan-price {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.currency {
  font-size: 1.5rem;
  margin-top: 0.5rem;
  margin-right: 0.25rem;
}

.plan-billing {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.9rem;
}

.card-body {
  flex-grow: 1;
  margin-bottom: 2rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.features-list li {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.check-icon {
  color: #1976D2;
  font-weight: bold;
  margin-right: 0.75rem;
}

.card-footer {
  margin-top: auto;
}

.select-plan-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 50px;
  border: none;
  background-color: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-plan-btn:hover {
  background-color: #e5e7eb;
}

.select-plan-btn.popular {
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  color: white;
  box-shadow: 0 4px 14px rgba(25, 118, 210, 0.4);
}

.select-plan-btn.popular:hover {
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.6);
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.4);
}

@media (max-width: 768px) {
  .pricing-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .pricing-card {
    width: 100%;
    max-width: 350px;
    margin-bottom: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
}
</style>
