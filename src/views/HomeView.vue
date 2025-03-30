<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Anketlerinizi kolayca oluşturun ve yönetin</h1>
        <p>Anket Pro ile profesyonel anketler oluşturmak hiç bu kadar kolay olmamıştı. Hemen başlayın!</p>
        <div class="hero-buttons">
          <router-link to="/create" class="btn btn-primary">Anket Oluştur</router-link>
          <a href="#features" class="btn btn-outline">Özellikler</a>
        </div>
      </div>
      <div class="hero-image">
        <!-- Gerçek uygulamada bir resim veya görsel olacak -->
        <div class="survey-illustration"></div>
      </div>
    </section>

    <section id="features" class="features-section">
      <h2 class="section-title">Neden Anket Pro?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Kolay Anket Oluşturma</h3>
          <p>Sürükle-bırak arayüzü ile saniyeler içinde profesyonel anketler oluşturun.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>Mobil Uyumlu</h3>
          <p>Tüm anketleriniz her cihazda mükemmel görünür ve çalışır.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <h3>Gerçek Zamanlı Sonuçlar</h3>
          <p>Cevapları anında görün ve detaylı analiz raporları alın.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Güvenli ve Özel</h3>
          <p>Verileriniz güvende, anket sonuçlarınız tamamen size özel.</p>
        </div>
      </div>
    </section>

    <section class="popular-surveys">
      <h2 class="section-title">Popüler Anketler</h2>
      <div v-if="popularSurveys.length === 0" class="no-surveys">
        <p>Henüz anket oluşturulmamış. İlk anketi oluşturan siz olun!</p>
        <router-link to="/create" class="btn btn-primary">Anket Oluştur</router-link>
      </div>
      <div v-else class="surveys-grid">
        <div v-for="survey in popularSurveys" :key="survey.id" class="survey-card">
          <h3>{{ survey.title }}</h3>
          <p class="survey-meta">{{ survey.responses }} katılımcı</p>
          <p class="survey-description">{{ survey.description }}</p>
          <router-link :to="`/survey/${survey.id}`" class="btn btn-outline">Ankete Katıl</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSurveyStore } from '@/stores/surveyStore'

export default {
  name: 'HomeView',
  setup() {
    const surveyStore = useSurveyStore()
    const isLoading = ref(false)
    
    // Normalde burada API'den veri getirme işlemi yapılırdı
    const fetchSurveys = () => {
      isLoading.value = true
      
      // API isteği simülasyonu - gerçek uygulamada burada API çağrısı olacak
      setTimeout(() => {
        isLoading.value = false
        
        // Test verileri ekliyoruz
        if (surveyStore.surveys.length === 0) {
          const demoSurveys = [
            {
              id: '1',
              title: 'Müşteri Memnuniyet Anketi',
              description: 'Hizmetlerimizden ne kadar memnun olduğunuzu ölçmek için kısa bir anket.',
              createdAt: new Date().toISOString(),
              isOwner: false,
              responses: 248
            },
            {
              id: '2',
              title: 'Ürün Kullanım Araştırması',
              description: 'Ürünümüzü nasıl kullandığınızı anlamak için hazırladığımız araştırma.',
              createdAt: new Date().toISOString(),
              isOwner: false,
              responses: 157
            }
          ]
          
          demoSurveys.forEach(survey => surveyStore.surveys.push(survey))
        }
      }, 800)
    }
    
    // Popüler anketleri en çok yanıt alanlara göre sıralıyoruz
    const popularSurveys = computed(() => {
      return [...surveyStore.surveys]
        .filter(survey => !survey.isOwner)
        .sort((a, b) => b.responses - a.responses)
        .slice(0, 4)
    })
    
    onMounted(() => {
      fetchSurveys()
    })
    
    return {
      isLoading,
      popularSurveys
    }
  }
}
</script>

<style lang="scss" scoped>
.home-view {
  .hero-section {
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 60px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }
    
    .hero-content {
      flex: 1;
      
      h1 {
        font-size: 2.5rem;
        margin-bottom: 20px;
        line-height: 1.2;
        color: #333;
      }
      
      p {
        font-size: 1.2rem;
        margin-bottom: 30px;
        color: #666;
      }
      
      .hero-buttons {
        display: flex;
        gap: 15px;
        
        @media (max-width: 768px) {
          justify-content: center;
        }
      }
    }
    
    .hero-image {
      flex: 1;
      display: flex;
      justify-content: center;
      
      .survey-illustration {
        width: 100%;
        height: 350px;
        background-color: #e0e7ff;
        border-radius: 10px;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          width: 60%;
          height: 60%;
          background-color: #c7d2fe;
          border-radius: 10px;
          top: 20%;
          left: 20%;
        }
        
        &::after {
          content: '';
          position: absolute;
          width: 30%;
          height: 30%;
          background-color: #a5b4fc;
          border-radius: 50%;
          top: 35%;
          left: 35%;
        }
      }
    }
  }
  
  .section-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 40px;
    color: #333;
    position: relative;
    
    &::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background-color: #4a6bff;
      margin: 15px auto 0;
      border-radius: 2px;
    }
  }
  
  .features-section {
    margin-bottom: 60px;
    padding: 40px 0;
    background-color: #f9faff;
    border-radius: 20px;
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      
      .feature-card {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        text-align: center;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }
        
        h3 {
          font-size: 1.4rem;
          margin-bottom: 15px;
          color: #333;
        }
        
        p {
          color: #666;
        }
      }
    }
  }
  
  .popular-surveys {
    margin-bottom: 60px;
    
    .no-surveys {
      text-align: center;
      padding: 40px;
      background-color: #f9faff;
      border-radius: 10px;
      
      p {
        margin-bottom: 20px;
        font-size: 1.1rem;
      }
    }
    
    .surveys-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      
      .survey-card {
        background-color: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        h3 {
          font-size: 1.3rem;
          margin-bottom: 10px;
          color: #333;
        }
        
        .survey-meta {
          color: #6c63ff;
          font-weight: 500;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .survey-description {
          color: #666;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }
      }
    }
  }
}
</style> 