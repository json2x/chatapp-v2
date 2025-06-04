<template>
  <section class="testimonials-section" id="testimonials" aria-labelledby="testimonials-title">
    <div class="container">
      <h2 id="testimonials-title" class="section-title">What Our Users Say</h2>
      <p class="section-subtitle">Trusted by thousands of users worldwide</p>
      
      <div class="testimonials-container">
        <div 
          v-for="(testimonial, index) in testimonials" 
          :key="index" 
          class="testimonial-card"
          itemscope 
          itemtype="https://schema.org/Review"
        >
          <div class="testimonial-rating">
            <span v-for="star in 5" :key="star" class="star">
              <i class="material-icons">{{ star <= testimonial.rating ? 'star' : 'star_border' }}</i>
            </span>
            <meta itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
            <meta itemprop="ratingValue" :content="String(testimonial.rating)">
            <meta itemprop="bestRating" content="5">
          </div>
          <p class="testimonial-text" itemprop="reviewBody">{{ testimonial.text }}</p>
          <div class="testimonial-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
            <img 
              :src="testimonial.avatar" 
              :alt="`${testimonial.name}'s avatar`" 
              class="author-avatar"
              loading="lazy"
              width="50"
              height="50"
            />
            <div class="author-info">
              <h3 class="author-name" itemprop="name">{{ testimonial.name }}</h3>
              <p class="author-title" itemprop="jobTitle">{{ testimonial.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const testimonials = ref([
  {
    name: "Sarah Johnson",
    title: "Marketing Director",
    text: "Mr Roboto Chat has transformed our team communication. The interface is intuitive and the features are exactly what we needed. Highly recommend!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "David Chen",
    title: "Software Engineer",
    text: "As a developer, I appreciate the attention to detail and performance. The API is well-documented and the service has been rock solid.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Emily Rodriguez",
    title: "Freelance Designer",
    text: "I use Mr Roboto Chat to communicate with clients. The file sharing and organization features have made my workflow so much smoother.",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  }
]);
</script>

<style scoped>
.testimonials-section {
  padding: 5rem 2rem;
  background-color: #f0f9ff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #1f2937;
}

.section-subtitle {
  font-size: 1.2rem;
  text-align: center;
  color: #4b5563;
  margin-bottom: 3rem;
}

.testimonials-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.testimonial-rating {
  margin-bottom: 1.5rem;
  display: flex;
}

.star {
  color: #f59e0b;
  margin-right: 2px;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b5563;
  flex-grow: 1;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.author-name {
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
}

.author-title {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .testimonials-section {
    padding: 4rem 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
  
  .testimonials-container {
    grid-template-columns: 1fr;
  }
}
</style>
