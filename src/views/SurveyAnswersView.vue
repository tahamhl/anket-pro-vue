<template>
  <div class="survey-answers-view">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Anket yanıtları yükleniyor...</p>
    </div>
    
    <div v-else-if="!survey" class="not-found">
      <h2>Anket Bulunamadı</h2>
      <p>Aradığınız anket mevcut değil veya kaldırılmış olabilir.</p>
      <router-link to="/my-surveys" class="btn btn-primary">Anketlerime Dön</router-link>
    </div>
    
    <div v-else-if="!isOwner" class="not-authorized">
      <h2>Yetkisiz Erişim</h2>
      <p>Bu anketin sonuçlarını görüntüleme yetkiniz bulunmamaktadır.</p>
      <router-link to="/" class="btn btn-primary">Ana Sayfaya Dön</router-link>
    </div>
    
    <div v-else-if="!hasResponses" class="no-responses">
      <div class="no-data-illustration"></div>
      <h2>Henüz Cevap Yok</h2>
      <p>Bu anket için henüz hiç yanıt alınmamış.</p>
      <div class="actions">
        <router-link :to="`/survey/${surveyId}`" class="btn btn-primary">Anketi Görüntüle</router-link>
        <button @click="copyLinkToClipboard" class="btn btn-outline">Anketi Paylaş</button>
      </div>
    </div>
    
    <div v-else class="survey-results">
      <div class="results-header">
        <div class="back-link">
          <router-link to="/my-surveys">
            ← Anketlerime Dön
          </router-link>
        </div>
        
        <h1 class="survey-title">{{ survey.title }} - Yanıtlar</h1>
        
        <div class="survey-meta">
          <div class="meta-item">
            <strong>Toplam Yanıt:</strong> {{ survey.responses }}
          </div>
          <div class="meta-item">
            <strong>Son Yanıt:</strong> {{ formatDate(getLastResponseDate()) }}
          </div>
        </div>
        
        <div class="meta-actions">
          <button @click="copyLinkToClipboard" class="btn btn-outline btn-sm">Anketi Paylaş</button>
          <router-link :to="`/survey/${surveyId}`" class="btn btn-sm">Anketi Görüntüle</router-link>
        </div>
      </div>
      
      <div class="tab-navigation">
        <button 
          @click="activeTab = 'summary'" 
          :class="['tab-button', { active: activeTab === 'summary' }]"
        >
          Özet
        </button>
        <button 
          @click="activeTab = 'individual'" 
          :class="['tab-button', { active: activeTab === 'individual' }]"
        >
          Bireysel Yanıtlar
        </button>
      </div>
      
      <!-- Özet Sekmesi -->
      <div v-if="activeTab === 'summary'" class="summary-tab">
        <div v-for="(question, qIndex) in survey.questions" :key="qIndex" class="question-summary">
          <h3 class="question-title">{{ qIndex + 1 }}. {{ question.text }}</h3>
          
          <!-- Radio ve Checkbox soruları için çubuk grafik -->
          <div v-if="question.type === 'radio' || question.type === 'checkbox'" class="chart-container">
            <div v-for="(option, oIndex) in question.options" :key="oIndex" class="chart-item">
              <div class="option-label">{{ option }}</div>
              <div class="chart-bar-container">
                <div 
                  class="chart-bar" 
                  :style="{ width: `${getOptionPercentage(qIndex, oIndex)}%` }"
                ></div>
                <span class="chart-value">{{ getOptionCount(qIndex, oIndex) }} ({{ getOptionPercentage(qIndex, oIndex) }}%)</span>
              </div>
            </div>
          </div>
          
          <!-- Metin yanıtları için liste -->
          <div v-else-if="question.type === 'text'" class="text-responses">
            <div v-if="getTextResponses(qIndex).length === 0" class="no-text-responses">
              Bu soru için henüz metin yanıtı bulunmamaktadır.
            </div>
            <div v-else class="text-response-list">
              <div v-for="(response, rIndex) in getTextResponses(qIndex)" :key="rIndex" class="text-response-item">
                <div class="response-content">{{ response }}</div>
                <div class="response-number">#{{ rIndex + 1 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bireysel Yanıtlar Sekmesi -->
      <div v-else-if="activeTab === 'individual'" class="individual-tab">
        <div class="responses-filter">
          <div class="filter-label">Yanıt Sıralaması:</div>
          <div class="filter-options">
            <button 
              @click="responsesOrder = 'newest'" 
              :class="['filter-button', { active: responsesOrder === 'newest' }]"
            >
              En Yeniden Eskiye
            </button>
            <button 
              @click="responsesOrder = 'oldest'" 
              :class="['filter-button', { active: responsesOrder === 'oldest' }]"
            >
              En Eskiden Yeniye
            </button>
          </div>
        </div>
        
        <div class="individual-responses-list">
          <div v-for="(response, rIndex) in sortedResponses" :key="rIndex" class="response-card">
            <div class="response-header">
              <div class="response-number">Yanıt #{{ rIndex + 1 }}</div>
              <div class="response-date">{{ formatDate(response.answeredAt) }}</div>
            </div>
            
            <div class="response-questions">
              <div v-for="(question, qIndex) in survey.questions" :key="qIndex" class="response-question">
                <div class="question-text">{{ qIndex + 1 }}. {{ question.text }}</div>
                
                <!-- Radio yanıtı -->
                <div v-if="question.type === 'radio'" class="response-answer">
                  {{ getRadioAnswer(response, qIndex) }}
                </div>
                
                <!-- Checkbox yanıtı -->
                <div v-else-if="question.type === 'checkbox'" class="response-answer checkbox-answer">
                  <div v-if="getCheckboxAnswers(response, qIndex).length === 0" class="no-answer">
                    Seçim yapılmadı
                  </div>
                  <ul v-else class="checkbox-list">
                    <li v-for="(answer, aIndex) in getCheckboxAnswers(response, qIndex)" :key="aIndex">
                      {{ answer }}
                    </li>
                  </ul>
                </div>
                
                <!-- Metin yanıtı -->
                <div v-else-if="question.type === 'text'" class="response-answer text-answer">
                  <div v-if="!response.answers[qIndex]" class="no-answer">
                    Yanıt verilmedi
                  </div>
                  <div v-else class="text-content">
                    {{ response.answers[qIndex] }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Başarı Mesajı -->
      <div v-if="successMessage" class="success-toast">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/surveyStore'

export default {
  name: 'SurveyAnswersView',
  setup() {
    const route = useRoute()
    const surveyStore = useSurveyStore()
    
    const surveyId = computed(() => route.params.id)
    const isLoading = ref(true)
    const activeTab = ref('summary')
    const responsesOrder = ref('newest')
    const successMessage = ref('')
    
    // Anketi getir
    const survey = computed(() => {
      return surveyStore.getSurveyById(surveyId.value)
    })
    
    // Kullanıcı anketin sahibi mi
    const isOwner = computed(() => {
      return survey.value?.isOwner || false
    })
    
    // Yanıt var mı
    const hasResponses = computed(() => {
      return survey.value?.responses > 0 && survey.value?.allResponses?.length > 0
    })
    
    // Yanıtları sırala
    const sortedResponses = computed(() => {
      if (!hasResponses.value) return []
      
      return [...survey.value.allResponses].sort((a, b) => {
        const dateA = new Date(a.answeredAt).getTime()
        const dateB = new Date(b.answeredAt).getTime()
        
        return responsesOrder.value === 'newest' ? dateB - dateA : dateA - dateB
      })
    })
    
    // Son yanıt tarihini getir
    const getLastResponseDate = () => {
      if (!hasResponses.value) return new Date()
      
      const dates = survey.value.allResponses.map(r => new Date(r.answeredAt).getTime())
      return new Date(Math.max(...dates))
    }
    
    // Belirli bir seçeneğin seçilme sayısını hesapla
    const getOptionCount = (questionIndex, optionIndex) => {
      if (!hasResponses.value) return 0
      
      let count = 0
      const question = survey.value.questions[questionIndex]
      
      if (question.type === 'radio') {
        // Radio butonlar için count
        count = survey.value.allResponses.filter(r => r.answers[questionIndex] === optionIndex).length
      } else if (question.type === 'checkbox') {
        // Checkbox'lar için count
        count = survey.value.allResponses.filter(r => {
          const answer = r.answers[questionIndex]
          return Array.isArray(answer) && answer.includes(optionIndex)
        }).length
      }
      
      return count
    }
    
    // Belirli bir seçeneğin seçilme yüzdesini hesapla
    const getOptionPercentage = (questionIndex, optionIndex) => {
      if (!hasResponses.value) return 0
      
      const count = getOptionCount(questionIndex, optionIndex)
      const total = survey.value.responses
      
      return Math.round((count / total) * 100)
    }
    
    // Metin yanıtlarını getir
    const getTextResponses = (questionIndex) => {
      if (!hasResponses.value) return []
      
      return survey.value.allResponses
        .map(r => r.answers[questionIndex])
        .filter(a => a && a.trim() !== '')
    }
    
    // Radio buton yanıtını getir
    const getRadioAnswer = (response, questionIndex) => {
      const answerIndex = response.answers[questionIndex]
      
      if (answerIndex === null || answerIndex === undefined) {
        return 'Yanıt verilmedi'
      }
      
      return survey.value.questions[questionIndex].options[answerIndex]
    }
    
    // Checkbox yanıtlarını getir
    const getCheckboxAnswers = (response, questionIndex) => {
      const answerIndexes = response.answers[questionIndex]
      
      if (!Array.isArray(answerIndexes) || answerIndexes.length === 0) {
        return []
      }
      
      return answerIndexes.map(index => survey.value.questions[questionIndex].options[index])
    }
    
    // Tarih formatı
    const formatDate = (dateObj) => {
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    }
    
    // Anketi paylaş
    const copyLinkToClipboard = () => {
      const surveyLink = `${window.location.origin}/survey/${surveyId.value}`
      navigator.clipboard.writeText(surveyLink)
        .then(() => {
          showSuccessMessage('Anket linki panoya kopyalandı')
        })
        .catch((err) => {
          console.error('Panoya kopyalama hatası:', err)
        })
    }
    
    // Başarı mesajını göster
    const showSuccessMessage = (message) => {
      successMessage.value = message
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
    
    // Demo yanıt verileri oluştur
    const createDemoResponses = () => {
      // Demo yanıtları oluştur
      if (survey.value && !survey.value.allResponses) {
        const responseCount = survey.value.responses || 0
        
        if (responseCount > 0) {
          const demoResponses = []
          
          // Son 30 gün içinde rastgele tarihler oluştur
          const now = new Date()
          const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
          
          for (let i = 0; i < responseCount; i++) {
            const randomDate = new Date(
              thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
            )
            
            // Rastgele yanıtlar oluştur
            const answers = survey.value.questions.map(q => {
              if (q.type === 'radio') {
                // Radio için rastgele seçim
                return Math.floor(Math.random() * q.options.length)
              } else if (q.type === 'checkbox') {
                // Checkbox için rastgele seçimler
                const selectedOptions = []
                const optionCount = Math.floor(Math.random() * q.options.length) + 1
                
                for (let j = 0; j < optionCount; j++) {
                  let option
                  do {
                    option = Math.floor(Math.random() * q.options.length)
                  } while (selectedOptions.includes(option))
                  
                  selectedOptions.push(option)
                }
                
                return selectedOptions.sort()
              } else {
                // Metin yanıtları için demoları oluştur
                const demoTexts = [
                  'Çok memnun kaldım, teşekkürler.',
                  'Hizmetleriniz iyileştirilebilir.',
                  'Müşteri hizmetleri harika!',
                  'Ürünlerin kalitesi yüksek ama fiyatlar biraz fazla.',
                  'Teslimat süresi kısaltılabilir.'
                ]
                
                return Math.random() > 0.3 
                  ? demoTexts[Math.floor(Math.random() * demoTexts.length)]
                  : ''
              }
            })
            
            demoResponses.push({
              id: `response-${i+1}`,
              answeredAt: randomDate.toISOString(),
              answers
            })
          }
          
          // Yanıtları tarihe göre sırala
          demoResponses.sort((a, b) => {
            return new Date(b.answeredAt) - new Date(a.answeredAt)
          })
          
          // Store'daki ankete yanıtları ekle
          survey.value.allResponses = demoResponses
        }
      }
    }
    
    // Sayfa yüklendiğinde
    onMounted(() => {
      // API isteği simülasyonu
      setTimeout(() => {
        isLoading.value = false
        
        if (survey.value) {
          createDemoResponses()
        }
      }, 800)
    })
    
    return {
      surveyId,
      survey,
      isLoading,
      activeTab,
      responsesOrder,
      isOwner,
      hasResponses,
      sortedResponses,
      successMessage,
      getLastResponseDate,
      getOptionCount,
      getOptionPercentage,
      getTextResponses,
      getRadioAnswer,
      getCheckboxAnswers,
      formatDate,
      copyLinkToClipboard
    }
  }
}
</script>

<style lang="scss" scoped>
.survey-answers-view {
  .loading-container, .not-found, .not-authorized, .no-responses {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #4a6bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .no-data-illustration {
      width: 160px;
      height: 160px;
      background-color: #f0f4ff;
      border-radius: 50%;
      margin-bottom: 30px;
      position: relative;
      
      &::before {
        content: '📊';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 60px;
      }
    }
    
    h2 {
      font-size: 1.8rem;
      margin-bottom: 15px;
      color: #333;
    }
    
    p {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 25px;
    }
    
    .actions {
      display: flex;
      gap: 15px;
    }
  }
  
  .survey-results {
    .results-header {
      margin-bottom: 30px;
      
      .back-link {
        margin-bottom: 20px;
        
        a {
          color: #666;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          
          &:hover {
            color: #4a6bff;
          }
        }
      }
      
      .survey-title {
        font-size: 1.8rem;
        margin-bottom: 15px;
        color: #333;
      }
      
      .survey-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
        
        .meta-item {
          color: #666;
          font-size: 0.95rem;
        }
      }
      
      .meta-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .tab-navigation {
      display: flex;
      margin-bottom: 25px;
      border-bottom: 1px solid #ddd;
      
      .tab-button {
        padding: 10px 20px;
        border: none;
        background: none;
        font-size: 1rem;
        font-weight: 500;
        color: #666;
        cursor: pointer;
        position: relative;
        transition: color 0.3s;
        
        &:hover {
          color: #4a6bff;
        }
        
        &.active {
          color: #4a6bff;
          
          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: #4a6bff;
          }
        }
      }
    }
    
    // Özet Sekmesi
    .summary-tab {
      .question-summary {
        background-color: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 25px;
        
        .question-title {
          font-size: 1.2rem;
          margin-bottom: 20px;
          color: #333;
        }
        
        .chart-container {
          .chart-item {
            margin-bottom: 15px;
            
            .option-label {
              margin-bottom: 5px;
              font-size: 0.95rem;
              color: #555;
            }
            
            .chart-bar-container {
              display: flex;
              align-items: center;
              height: 25px;
              background-color: #f5f5f5;
              border-radius: 4px;
              overflow: hidden;
              
              .chart-bar {
                height: 100%;
                background-color: #4a6bff;
                border-radius: 4px;
                min-width: 20px;
                transition: width 0.5s ease;
              }
              
              .chart-value {
                margin-left: 10px;
                font-size: 0.9rem;
                font-weight: 500;
                color: #333;
              }
            }
          }
        }
        
        .text-responses {
          .no-text-responses {
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
            color: #777;
            text-align: center;
            font-size: 0.95rem;
          }
          
          .text-response-list {
            .text-response-item {
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
              margin-bottom: 10px;
              position: relative;
              
              .response-content {
                color: #333;
                font-size: 0.95rem;
                line-height: 1.5;
              }
              
              .response-number {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 0.85rem;
                color: #999;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
    
    // Bireysel Yanıtlar Sekmesi
    .individual-tab {
      .responses-filter {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        
        .filter-label {
          margin-right: 15px;
          font-weight: 500;
          color: #555;
        }
        
        .filter-options {
          display: flex;
          gap: 10px;
          
          .filter-button {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            color: #666;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s;
            
            &:hover {
              border-color: #4a6bff;
              color: #4a6bff;
            }
            
            &.active {
              background-color: #4a6bff;
              color: white;
              border-color: #4a6bff;
            }
          }
        }
      }
      
      .individual-responses-list {
        .response-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          overflow: hidden;
          
          .response-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: #f5f7ff;
            
            .response-number {
              font-weight: 500;
              color: #4a6bff;
            }
            
            .response-date {
              font-size: 0.9rem;
              color: #666;
            }
          }
          
          .response-questions {
            padding: 20px;
            
            .response-question {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
              
              &:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
              }
              
              .question-text {
                font-weight: 500;
                margin-bottom: 10px;
                color: #333;
              }
              
              .response-answer {
                color: #555;
                
                &.checkbox-answer {
                  .checkbox-list {
                    margin: 0;
                    padding-left: 20px;
                    
                    li {
                      margin-bottom: 5px;
                    }
                  }
                }
                
                &.text-answer {
                  .text-content {
                    background-color: #f9f9f9;
                    padding: 12px;
                    border-radius: 5px;
                    font-size: 0.95rem;
                    line-height: 1.5;
                  }
                }
                
                .no-answer {
                  color: #999;
                  font-style: italic;
                }
              }
            }
          }
        }
      }
    }
    
    // Toast Mesajı
    .success-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 25px;
      background-color: #4caf50;
      color: white;
      border-radius: 5px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s, fadeOut 0.3s 2.7s;
      z-index: 1000;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  }
}
</style> 