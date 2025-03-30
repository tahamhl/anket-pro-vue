<template>
  <div class="create-survey-view">
    <h1 class="page-title">Yeni Anket Oluştur</h1>
    
    <div class="survey-form-container">
      <div class="survey-form-header">
        <div class="form-group">
          <label for="survey-title">Anket Başlığı</label>
          <input 
            id="survey-title" 
            type="text" 
            v-model="survey.title" 
            placeholder="Anket başlığı girin"
            required
          />
          <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
        </div>
        
        <div class="form-group">
          <label for="survey-description">Anket Açıklaması</label>
          <textarea 
            id="survey-description" 
            v-model="survey.description" 
            placeholder="Anketiniz hakkında kısa bir açıklama yazın"
          ></textarea>
        </div>
      </div>
      
      <div class="questions-container">
        <h2>Anket Soruları</h2>
        
        <div v-for="(question, questionIndex) in survey.questions" :key="questionIndex" class="question-card">
          <div class="question-header">
            <h3>Soru {{ questionIndex + 1 }}</h3>
            <button 
              v-if="survey.questions.length > 1" 
              @click="removeQuestion(questionIndex)" 
              class="btn-icon btn-danger"
              title="Soruyu Sil"
            >
              ❌
            </button>
          </div>
          
          <div class="form-group">
            <label :for="`question-${questionIndex}`">Soru Metni</label>
            <input 
              :id="`question-${questionIndex}`" 
              type="text" 
              v-model="question.text" 
              placeholder="Soru metnini girin"
              required
            />
            <p v-if="getQuestionError(questionIndex, 'text')" class="form-error">
              {{ getQuestionError(questionIndex, 'text') }}
            </p>
          </div>
          
          <div class="form-group">
            <label>Soru Tipi</label>
            <select v-model="question.type">
              <option value="radio">Tek Seçim (Radio)</option>
              <option value="checkbox">Çoklu Seçim (Checkbox)</option>
              <option value="text">Metin Yanıtı</option>
            </select>
          </div>
          
          <div v-if="question.type !== 'text'" class="options-container">
            <label>Seçenekler</label>
            
            <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-row">
              <input 
                type="text" 
                v-model="question.options[optionIndex]" 
                placeholder="Seçenek metni"
                required
              />
              <button 
                v-if="question.options.length > 1" 
                @click="removeOption(questionIndex, optionIndex)" 
                class="btn-icon btn-danger"
                title="Seçeneği Sil"
              >
                ❌
              </button>
            </div>
            
            <p v-if="getQuestionError(questionIndex, 'options')" class="form-error">
              {{ getQuestionError(questionIndex, 'options') }}
            </p>
            
            <button @click="addOption(questionIndex)" class="btn btn-outline btn-sm">
              + Seçenek Ekle
            </button>
          </div>
          
          <div class="question-settings">
            <label class="checkbox-label">
              <input type="checkbox" v-model="question.required" />
              Bu soru zorunlu
            </label>
          </div>
        </div>
        
        <button @click="addQuestion" class="btn btn-outline add-question-btn">
          + Yeni Soru Ekle
        </button>
      </div>
      
      <div class="form-actions">
        <button @click="resetForm" class="btn btn-outline">Formu Temizle</button>
        <button @click="saveSurvey" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Kaydediliyor...' : 'Anketi Oluştur' }}
        </button>
      </div>
    </div>
    
    <div v-if="successMessage" class="success-message">
      <p>{{ successMessage }}</p>
      <div class="success-actions">
        <router-link :to="`/survey/${createdSurveyId}`" class="btn btn-primary">Anketi Görüntüle</router-link>
        <router-link to="/my-surveys" class="btn btn-outline">Anketlerim</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useSurveyStore } from '@/stores/surveyStore'

export default {
  name: 'CreateSurveyView',
  setup() {
    const surveyStore = useSurveyStore()
    
    const isLoading = ref(false)
    const successMessage = ref('')
    const createdSurveyId = ref(null)
    const errors = reactive({
      title: '',
      questions: []
    })
    
    // Anket nesnesi
    const survey = reactive({
      title: '',
      description: '',
      questions: [
        {
          text: '',
          type: 'radio',
          options: ['', ''],
          required: true
        }
      ]
    })
    
    // Yeni soru ekle
    const addQuestion = () => {
      survey.questions.push({
        text: '',
        type: 'radio',
        options: ['', ''],
        required: true
      })
    }
    
    // Soru sil
    const removeQuestion = (index) => {
      survey.questions.splice(index, 1)
    }
    
    // Seçenek ekle
    const addOption = (questionIndex) => {
      survey.questions[questionIndex].options.push('')
    }
    
    // Seçenek sil
    const removeOption = (questionIndex, optionIndex) => {
      survey.questions[questionIndex].options.splice(optionIndex, 1)
    }
    
    // Formu doğrula
    const validateForm = () => {
      let isValid = true
      errors.title = ''
      errors.questions = []
      
      // Başlık kontrolü
      if (!survey.title.trim()) {
        errors.title = 'Anket başlığı zorunludur'
        isValid = false
      }
      
      // Her soru için kontrol
      survey.questions.forEach((question, index) => {
        if (!errors.questions[index]) {
          errors.questions[index] = {}
        }
        
        // Soru metni kontrolü
        if (!question.text.trim()) {
          errors.questions[index].text = 'Soru metni zorunludur'
          isValid = false
        }
        
        // Seçenek kontrolü (metin tipi değilse)
        if (question.type !== 'text') {
          const emptyOptions = question.options.filter(opt => !opt.trim()).length
          
          if (emptyOptions > 0) {
            errors.questions[index].options = 'Tüm seçenekler doldurulmalıdır'
            isValid = false
          }
          
          if (question.options.length < 2) {
            errors.questions[index].options = 'En az 2 seçenek girmelisiniz'
            isValid = false
          }
        }
      })
      
      return isValid
    }
    
    // Soru hatası getir
    const getQuestionError = (questionIndex, field) => {
      if (errors.questions[questionIndex]) {
        return errors.questions[questionIndex][field] || ''
      }
      return ''
    }
    
    // Anketi kaydet
    const saveSurvey = () => {
      if (!validateForm()) {
        window.scrollTo(0, 0)
        return
      }
      
      isLoading.value = true
      
      // Gerçek uygulamada burada API çağrısı yapılırdı
      setTimeout(() => {
        try {
          const newSurvey = {
            title: survey.title,
            description: survey.description,
            questions: survey.questions.map(q => ({
              text: q.text,
              type: q.type,
              required: q.required,
              options: q.type !== 'text' ? q.options : []
            }))
          }
          
          // Store'a ekle
          const result = surveyStore.addSurvey(newSurvey)
          
          // Başarı mesajı
          successMessage.value = 'Anketiniz başarıyla oluşturuldu!'
          createdSurveyId.value = result.id
          
          // Formu temizle
          resetForm()
          
          // Sayfayı başa kaydır
          window.scrollTo(0, 0)
        } catch (error) {
          console.error('Anket oluşturma hatası:', error)
        } finally {
          isLoading.value = false
        }
      }, 800)
    }
    
    // Formu temizle
    const resetForm = () => {
      survey.title = ''
      survey.description = ''
      survey.questions = [
        {
          text: '',
          type: 'radio',
          options: ['', ''],
          required: true
        }
      ]
      errors.title = ''
      errors.questions = []
    }
    
    return {
      survey,
      isLoading,
      errors,
      successMessage,
      createdSurveyId,
      addQuestion,
      removeQuestion,
      addOption,
      removeOption,
      getQuestionError,
      saveSurvey,
      resetForm
    }
  }
}
</script>

<style lang="scss" scoped>
.create-survey-view {
  .page-title {
    margin-bottom: 30px;
    text-align: center;
    color: #333;
  }
  
  .survey-form-container {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    padding: 30px;
    margin-bottom: 30px;
  }
  
  .survey-form-header {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .questions-container {
    h2 {
      margin-bottom: 20px;
      font-size: 1.5rem;
      color: #333;
    }
  }
  
  .question-card {
    background-color: #f9faff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        font-size: 1.2rem;
        color: #4a6bff;
      }
    }
    
    .options-container {
      margin: 15px 0;
      
      .option-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        
        input {
          flex: 1;
          margin-right: 10px;
        }
      }
    }
    
    .question-settings {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #ddd;
      
      .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        input[type="checkbox"] {
          margin-right: 8px;
          width: auto;
        }
      }
    }
  }
  
  .btn-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    &.btn-danger:hover {
      background-color: rgba(244, 67, 54, 0.1);
    }
  }
  
  .add-question-btn {
    width: 100%;
    padding: 15px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  
  .btn-sm {
    font-size: 0.85rem;
    padding: 8px 12px;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .success-message {
    background-color: rgba(76, 175, 80, 0.1);
    border-left: 4px solid #4caf50;
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 30px;
    
    p {
      color: #2e7d32;
      font-weight: 500;
      margin-bottom: 15px;
    }
    
    .success-actions {
      display: flex;
      gap: 15px;
    }
  }
}
</style> 