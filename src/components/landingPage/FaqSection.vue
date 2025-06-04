<template>
  <section class="faq-section" id="faq" aria-labelledby="faq-title">
    <div class="container">
      <h2 id="faq-title" class="section-title">Frequently Asked Questions</h2>
      <p class="section-subtitle">Find answers to common questions about Mr Roboto Chat</p>
      
      <div class="faq-container">
        <div 
          v-for="(item, index) in faqItems" 
          :key="index" 
          class="faq-item"
          itemscope 
          itemprop="mainEntity" 
          itemtype="https://schema.org/Question"
        >
          <div 
            class="faq-question" 
            :class="{ 'active': activeIndex === index }"
            @click="toggleFaq(index)"
            itemprop="name"
          >
            <h3>{{ item.question }}</h3>
            <span class="toggle-icon">
              <i class="material-icons">{{ activeIndex === index ? 'remove' : 'add' }}</i>
            </span>
          </div>
          <div 
            class="faq-answer" 
            :class="{ 'active': activeIndex === index }"
            itemscope 
            itemprop="acceptedAnswer" 
            itemtype="https://schema.org/Answer"
          >
            <div itemprop="text" v-html="item.answer"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeIndex = ref(-1);

const toggleFaq = (index: number) => {
  if (activeIndex.value === index) {
    activeIndex.value = -1;
  } else {
    activeIndex.value = index;
  }
};

const faqItems = ref([
  {
    question: "What is Mr Roboto Chat?",
    answer: "Mr Roboto Chat is a modern, secure messaging platform that allows real-time communication with advanced features like end-to-end encryption, file sharing, and more."
  },
  {
    question: "Is Mr Roboto Chat free to use?",
    answer: "Yes, Mr Roboto Chat offers a free tier with essential features. We also offer premium plans with additional capabilities for users who need more advanced functionality."
  },
  {
    question: "How secure is Mr Roboto Chat?",
    answer: "Security is our top priority. Mr Roboto Chat uses end-to-end encryption to ensure your messages can only be read by you and your intended recipients. We never store your messages on our servers in an unencrypted format."
  },
  {
    question: "Can I use Mr Roboto Chat on multiple devices?",
    answer: "Absolutely! Mr Roboto Chat is available on web, iOS, and Android platforms. Your conversations sync seamlessly across all your devices."
  },
  {
    question: "How do I get started with Mr Roboto Chat?",
    answer: "Getting started is easy! Simply click the 'Sign Up' button, create an account with your email, and you'll be chatting in seconds. No phone number or personal information required."
  }
]);
</script>

<style scoped>
.faq-section {
  padding: 5rem 2rem;
  background-color: #f9fafb;
}

.container {
  max-width: 800px;
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
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.faq-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: white;
  transition: all 0.3s ease;
}

.faq-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.faq-question {
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.faq-question h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.faq-question.active {
  background-color: #f0f9ff;
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976D2;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding: 0 1.25rem;
  color: #4b5563;
  line-height: 1.6;
}

.faq-answer.active {
  max-height: 500px;
  padding: 0 1.25rem 1.25rem;
}

@media (max-width: 768px) {
  .faq-section {
    padding: 4rem 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
  
  .faq-question h3 {
    font-size: 1rem;
  }
}
</style>
