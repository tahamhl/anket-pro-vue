<template>
  <div class="survey-detail-view">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Anket yükleniyor...</p>
    </div>
    
    <div v-else-if="!survey" class="not-found">
      <h2>Anket Bulunamadı</h2>
      <p>Aradığınız anket mevcut değil veya kaldırılmış olabilir.</p>
      <router-link to="/" class="btn btn-primary">Ana Sayfaya Dön</router-link>
    </div>
    
    <div v-else>
      <div class="survey-header">
        <div class="back-link">
          <router-link to="/">
            ← Ana Sayfaya Dön
          </router-link>
        </div>
        
        <h1 class="survey-title">{{ survey.title }}</h1>
        
        <div v-if="survey.description" class="survey-description">
          {{ survey.description }}
        </div>
        
        <div class="survey-meta">
          <span class="survey-responses">{{ survey.responses }} kişi katıldı</span>
          <span class="survey-date">Oluşturulma: {{ formatDate(survey.createdAt) }}</span>
        </div>
      </div>
      
      <div v-if="submitSuccess" class="success-message">
        <h3>Yanıtınız için teşekkürler!</h3>
        <p>Ankete katılımınız başarıyla kaydedildi.</p>
        <router-link to="/" class="btn btn-primary">Ana Sayfaya Dön</router-link>
      </div>
      
      <form v-else @submit.prevent="submitSurvey" class="survey-form">
        <div v-for="(question, qIndex) in survey.questions" :key="qIndex" class="question-card">
          <h3 class="question-text">
            {{ question.text }}
            <span v-if="question.required" class="required-mark">*</span>
          </h3>
          
          <!-- Tek seçim (Radio) -->
          <div v-if="question.type === 'radio'" class="radio-options">
            <div v-for="(option, oIndex) in question.options" :key="oIndex" class="radio-option">
              <label :for="`q${qIndex}_o${oIndex}`" class="option-label">
                <input 
                  type="radio" 
                  :id="`q${qIndex}_o${oIndex}`" 
                  :name="`question_${qIndex}`"
                  v-model="answers[qIndex]"
                  :value="oIndex"
                  :required="question.required"
                />
                <span class="option-text">{{ option }}</span>
              </label>
            </div>
          </div>
          
          <!-- Çoklu seçim (Checkbox) -->
          <div v-else-if="question.type === 'checkbox'" class="checkbox-options">
            <div v-for="(option, oIndex) in question.options" :key="oIndex" class="checkbox-option">
              <label :for="`q${qIndex}_o${oIndex}`" class="option-label">
                <input 
                  type="checkbox" 
                  :id="`q${qIndex}_o${oIndex}`"
                  v-model="checkboxAnswers[qIndex][oIndex]"
                  @change="validateCheckboxes(qIndex)"
                />
                <span class="option-text">{{ option }}</span>
              </label>
            </div>
            <div v-if="checkboxErrors[qIndex]" class="error-message">
              {{ checkboxErrors[qIndex] }}
            </div>
          </div>
          
          <!-- Metin girişi -->
          <div v-else-if="question.type === 'text'" class="text-answer">
            <textarea 
              v-model="answers[qIndex]" 
              :placeholder="question.required ? 'Lütfen yanıtınızı girin (zorunlu)' : 'Yanıtınızı girin (isteğe bağlı)'"
              :required="question.required"
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <p v-if="formError" class="error-message">{{ formError }}</p>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Gönderiliyor...' : 'Anketi Gönder' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/surveyStore'

export default {
  name: 'SurveyDetailView',
  setup() {
    const route = useRoute()
    const surveyStore = useSurveyStore()
    
    const surveyId = computed(() => route.params.id)
    const isLoading = ref(true)
    const isSubmitting = ref(false)
    const submitSuccess = ref(false)
    const formError = ref('')
    
    // Checkbox yanıtları için ayrı bir yapı kullanıyoruz
    const checkboxAnswers = reactive({})
    const checkboxErrors = reactive({})
    
    // Tüm yanıtlar için tek bir dizi
    const answers = reactive([])
    
    // Anketi getir
    const survey = computed(() => {
      return surveyStore.getSurveyById(surveyId.value)
    })
    
    // Checkbox validasyonu
    const validateCheckboxes = (questionIndex) => {
      if (!survey.value || !survey.value.questions || !survey.value.questions[questionIndex]) {
        return false;
      }
      
      const question = survey.value.questions[questionIndex]
      
      if (question.required) {
        if (!checkboxAnswers[questionIndex]) {
          checkboxErrors[questionIndex] = 'Bu soru için yanıt vermelisiniz'
          return false;
        }
        
        const hasChecked = Object.values(checkboxAnswers[questionIndex]).some(val => val === true)
        
        if (!hasChecked) {
          checkboxErrors[questionIndex] = 'Bu soru için en az bir seçenek işaretlemeniz gerekiyor'
          return false
        } else {
          checkboxErrors[questionIndex] = ''
          return true
        }
      }
      
      return true
    }
    
    // Tüm formu doğrula
    const validateForm = () => {
      let isValid = true
      formError.value = ''
      
      // Her soru için kontrol
      if (survey.value && survey.value.questions) {
        survey.value.questions.forEach((question, index) => {
          if (question.required) {
            if (question.type === 'checkbox') {
              if (!validateCheckboxes(index)) {
                isValid = false
              }
            } else if (!answers[index] && answers[index] !== 0) {
              // Radio ve text için basit kontrol
              isValid = false
            }
          }
        })
      } else {
        isValid = false
        formError.value = 'Anket yüklenemedi. Lütfen daha sonra tekrar deneyin.'
      }
      
      if (!isValid) {
        formError.value = formError.value || 'Lütfen tüm zorunlu alanları doldurun'
        window.scrollTo({top: 0, behavior: 'smooth'})
      }
      
      return isValid
    }
    
    // Anketi gönder
    const submitSurvey = () => {
      if (!validateForm()) {
        return
      }
      
      isSubmitting.value = true
      
      try {
        // Cevapları hazırla
        const finalAnswers = survey.value.questions.map((question, qIndex) => {
          if (question.type === 'checkbox') {
            // Checkbox'lar için seçilen indeksleri dizi olarak döndür
            const selectedOptions = []
            if (checkboxAnswers[qIndex]) {
              Object.entries(checkboxAnswers[qIndex]).forEach(([optIndex, isChecked]) => {
                if (isChecked) {
                  selectedOptions.push(parseInt(optIndex))
                }
              })
            }
            return selectedOptions
          } else {
            // Radio butonlar ve text için normal cevapları döndür
            return answers[qIndex]
          }
        })
        
        // API çağrısı simülasyonu
        setTimeout(() => {
          try {
            // Store'a yanıtı kaydet
            surveyStore.submitSurveyResponse(surveyId.value, finalAnswers)
            
            // Başarı mesajı göster
            submitSuccess.value = true
            
            // Sayfayı başa kaydır
            window.scrollTo({top: 0, behavior: 'smooth'})
          } catch (error) {
            console.error('Anket gönderme hatası:', error)
            formError.value = 'Anket gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
          } finally {
            isSubmitting.value = false
          }
        }, 800)
      } catch (error) {
        console.error('Yanıtları hazırlarken hata:', error)
        formError.value = 'Bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.'
        isSubmitting.value = false
      }
    }
    
    // Tarih formatı
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    }
    
    // Anketi yükle veya demo veri oluştur
    onMounted(() => {
      // API isteği simülasyonu
      setTimeout(() => {
        isLoading.value = false
        
        if (survey.value) {
          try {
            // Checkbox soruları için gerekli yapıları oluştur
            if (survey.value.questions && Array.isArray(survey.value.questions)) {
              survey.value.questions.forEach((question, qIndex) => {
                if (question && question.type === 'checkbox' && question.options && Array.isArray(question.options)) {
                  checkboxAnswers[qIndex] = {}
                  
                  question.options.forEach((_, oIndex) => {
                    checkboxAnswers[qIndex][oIndex] = false
                  })
                }
              })
            }
          } catch (error) {
            console.error('Anket yüklenirken hata oluştu:', error)
          }
        } else if (surveyId.value === '1' || surveyId.value === '2') {
          // Demo anket oluşturma
          const demoQuestions = [
            {
              text: 'Hizmetlerimizden ne kadar memnunsunuz?',
              type: 'radio',
              required: true,
              options: ['Çok memnunum', 'Memnunum', 'Kararsızım', 'Memnun değilim', 'Hiç memnun değilim']
            },
            {
              text: 'Hangi ürünlerimizi kullanıyorsunuz?',
              type: 'checkbox',
              required: true,
              options: ['Ürün A', 'Ürün B', 'Ürün C', 'Ürün D', 'Ürün E']
            },
            {
              text: 'Ürün ve hizmetlerimiz hakkında önerileriniz nelerdir?',
              type: 'text',
              required: false
            }
          ]
          
          const demoSurvey = {
            id: surveyId.value,
            title: surveyId.value === '1' ? 'Müşteri Memnuniyet Anketi' : 'Ürün Kullanım Araştırması',
            description: 'Bu anket ile hizmetlerimiz hakkındaki görüşlerinizi almak istiyoruz.',
            createdAt: new Date().toISOString(),
            isOwner: false,
            responses: surveyId.value === '1' ? 248 : 157,
            questions: demoQuestions
          }
          
          // Store'a ekle
          surveyStore.surveys.push(demoSurvey)
          
          // Checkbox soruları için gerekli yapıları oluştur
          demoQuestions.forEach((question, qIndex) => {
            if (question.type === 'checkbox') {
              checkboxAnswers[qIndex] = {}
              
              question.options.forEach((_, oIndex) => {
                checkboxAnswers[qIndex][oIndex] = false
              })
            }
          })
        }
      }, 800)
    })
    
    return {
      survey,
      isLoading,
      isSubmitting,
      submitSuccess,
      answers,
      checkboxAnswers,
      checkboxErrors,
      formError,
      formatDate,
      validateCheckboxes,
      submitSurvey
    }
  }
}
</script>

<style lang="scss" scoped>
.survey-detail-view {
  .loading-container, .not-found {
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
  }
  
  .survey-header {
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
      font-size: 2rem;
      margin-bottom: 15px;
      color: #333;
    }
    
    .survey-description {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    
    .survey-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 0.9rem;
      color: #777;
      
      .survey-responses {
        font-weight: 500;
        color: #4a6bff;
      }
    }
  }
  
  .success-message {
    background-color: rgba(76, 175, 80, 0.1);
    border-left: 4px solid #4caf50;
    padding: 30px;
    border-radius: 8px;
    margin-bottom: 30px;
    
    h3 {
      font-size: 1.6rem;
      color: #2e7d32;
      margin-bottom: 15px;
    }
    
    p {
      font-size: 1.1rem;
      color: #388e3c;
      margin-bottom: 20px;
    }
  }
  
  .survey-form {
    .question-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      padding: 25px;
      margin-bottom: 25px;
      
      .question-text {
        font-size: 1.3rem;
        margin-bottom: 20px;
        color: #333;
        
        .required-mark {
          color: #f44336;
          margin-left: 5px;
        }
      }
      
      .radio-options, .checkbox-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .option-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 10px;
          border-radius: 5px;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: #f5f7ff;
          }
          
          input {
            margin-right: 10px;
          }
          
          .option-text {
            font-size: 1.05rem;
          }
        }
      }
      
      .text-answer {
        textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.3s;
          
          &:focus {
            outline: none;
            border-color: #4a6bff;
            box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.2);
          }
        }
      }
    }
    
    .form-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20px;
      
      .error-message {
        color: #f44336;
        margin-bottom: 15px;
        font-weight: 500;
      }
      
      button {
        min-width: 200px;
      }
    }
  }
  
  .error-message {
    color: #f44336;
    font-size: 0.9rem;
    margin-top: 5px;
  }
}
</style> 