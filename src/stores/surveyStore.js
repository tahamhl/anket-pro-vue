import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSurveyStore = defineStore('survey', () => {
  // State
  const surveys = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const getSurveyById = computed(() => {
    return (id) => surveys.value.find(survey => survey.id === id)
  })

  const getMySurveys = computed(() => {
    return surveys.value.filter(survey => survey.isOwner)
  })
  
  // Actions
  function addSurvey(survey) {
    // Gerçek bir uygulamada bu işlem sunucuya gönderilirdi
    const newSurvey = {
      ...survey,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isOwner: true,
      responses: 0
    }
    surveys.value.push(newSurvey)
    return newSurvey
  }
  
  function updateSurvey(id, updatedData) {
    const index = surveys.value.findIndex(survey => survey.id === id)
    if (index !== -1) {
      surveys.value[index] = { ...surveys.value[index], ...updatedData }
      return true
    }
    return false
  }
  
  function deleteSurvey(id) {
    const index = surveys.value.findIndex(survey => survey.id === id)
    if (index !== -1) {
      surveys.value.splice(index, 1)
      return true
    }
    return false
  }
  
  function submitSurveyResponse(surveyId, answers) {
    const survey = getSurveyById.value(surveyId)
    if (survey) {
      // Gerçek uygulamada bu yanıtlar sunucuya kaydedilirdi
      if (!survey.allResponses) {
        survey.allResponses = []
      }
      
      survey.allResponses.push({
        id: Date.now().toString(),
        answeredAt: new Date().toISOString(),
        answers
      })
      
      survey.responses += 1
      return true
    }
    return false
  }
  
  return {
    // State
    surveys,
    isLoading,
    error,
    
    // Getters
    getSurveyById,
    getMySurveys,
    
    // Actions
    addSurvey,
    updateSurvey,
    deleteSurvey,
    submitSurveyResponse
  }
}) 