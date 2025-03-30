<template>
  <div class="my-surveys-view">
    <h1 class="page-title">Anketlerim</h1>
    
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Anketleriniz yükleniyor...</p>
    </div>
    
    <div v-else-if="mySurveys.length === 0" class="empty-state">
      <div class="empty-illustration"></div>
      <h2>Henüz bir anket oluşturmadınız</h2>
      <p>İlk anketinizi oluşturmak için aşağıdaki butona tıklayın.</p>
      <router-link to="/create" class="btn btn-primary">Anket Oluştur</router-link>
    </div>
    
    <div v-else class="surveys-container">
      <div class="surveys-header">
        <div class="surveys-count">{{ mySurveys.length }} anket bulundu</div>
        <div class="header-actions">
          <button class="btn btn-outline btn-sm" @click="sortSurveys('date')">
            {{ sortBy === 'date' ? (sortDir === 'asc' ? 'Eskiden Yeniye' : 'Yeniden Eskiye') : 'Tarihe Göre Sırala' }}
          </button>
          <button class="btn btn-outline btn-sm" @click="sortSurveys('responses')">
            {{ sortBy === 'responses' ? (sortDir === 'asc' ? 'Az Yanıta Göre' : 'Çok Yanıta Göre') : 'Yanıt Sayısına Göre Sırala' }}
          </button>
        </div>
      </div>
      
      <div class="surveys-list">
        <div v-for="survey in sortedSurveys" :key="survey.id" class="survey-card">
          <div class="survey-info">
            <h3 class="survey-title">{{ survey.title }}</h3>
            <p class="survey-description">{{ survey.description || 'Açıklama bulunmamaktadır.' }}</p>
            <div class="survey-meta">
              <span class="survey-date">Oluşturma: {{ formatDate(survey.createdAt) }}</span>
              <span class="survey-responses">{{ survey.responses }} yanıt</span>
            </div>
          </div>
          
          <div class="survey-actions">
            <router-link :to="`/survey/${survey.id}`" class="btn btn-sm">Görüntüle</router-link>
            <router-link v-if="survey.responses > 0" :to="`/survey/${survey.id}/answers`" class="btn btn-sm btn-secondary">Yanıtlar</router-link>
            <button @click="copyLinkToClipboard(survey.id)" class="btn btn-sm btn-outline" title="Anketi Paylaş">Paylaş</button>
            <button @click="confirmDelete(survey)" class="btn btn-sm btn-danger">Sil</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Silme Onay Modalı -->
    <div v-if="showDeleteModal" class="delete-modal">
      <div class="modal-content">
        <h3>Anketi Silmek İstediğinize Emin Misiniz?</h3>
        <p>"{{ surveyToDelete?.title }}" başlıklı anket kalıcı olarak silinecektir.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-outline">İptal</button>
          <button @click="deleteSurvey" class="btn btn-danger">Evet, Sil</button>
        </div>
      </div>
      <div class="modal-overlay" @click="showDeleteModal = false"></div>
    </div>
    
    <!-- Başarı Mesajı -->
    <div v-if="successMessage" class="success-toast">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSurveyStore } from '@/stores/surveyStore'

export default {
  name: 'MySurveysView',
  setup() {
    const surveyStore = useSurveyStore()
    const isLoading = ref(true)
    const showDeleteModal = ref(false)
    const surveyToDelete = ref(null)
    const successMessage = ref('')
    const sortBy = ref('date')
    const sortDir = ref('desc')
    
    // Kullanıcının anketlerini al
    const mySurveys = computed(() => {
      return surveyStore.getMySurveys
    })
    
    // Anketleri sırala
    const sortedSurveys = computed(() => {
      if (sortBy.value === 'date') {
        return [...mySurveys.value].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return sortDir.value === 'asc' ? dateA - dateB : dateB - dateA
        })
      } else if (sortBy.value === 'responses') {
        return [...mySurveys.value].sort((a, b) => {
          return sortDir.value === 'asc' ? a.responses - b.responses : b.responses - a.responses
        })
      }
      return mySurveys.value
    })
    
    // Sıralama ayarlarını değiştir
    const sortSurveys = (sortType) => {
      if (sortBy.value === sortType) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = sortType
        sortDir.value = 'desc'
      }
    }
    
    // Tarih formatı
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
    
    // Silme onayı
    const confirmDelete = (survey) => {
      surveyToDelete.value = survey
      showDeleteModal.value = true
    }
    
    // Anketi sil
    const deleteSurvey = () => {
      if (surveyToDelete.value) {
        surveyStore.deleteSurvey(surveyToDelete.value.id)
        showSuccessMessage('Anket başarıyla silindi')
        showDeleteModal.value = false
        surveyToDelete.value = null
      }
    }
    
    // Link paylaşma
    const copyLinkToClipboard = (surveyId) => {
      const surveyLink = `${window.location.origin}/survey/${surveyId}`
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
    
    // Sayfa yüklendiğinde verileri getir
    onMounted(() => {
      // API isteği simülasyonu
      setTimeout(() => {
        isLoading.value = false
        
        // Test verileri ekliyoruz (eğer daha önce eklenmemişse)
        if (mySurveys.value.length === 0) {
          const demoMySurveys = [
            {
              id: '101',
              title: 'Çalışan Memnuniyet Anketi',
              description: 'Şirketimizdeki çalışanların memnuniyet durumunu ölçen anket',
              createdAt: new Date(Date.now() - 864000000).toISOString(), // 10 gün önce
              isOwner: true,
              responses: 42
            },
            {
              id: '102',
              title: 'Eğitim Değerlendirme Anketi',
              description: 'Son eğitim programının değerlendirilmesi',
              createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 gün önce
              isOwner: true,
              responses: 15
            }
          ]
          
          demoMySurveys.forEach(survey => surveyStore.surveys.push(survey))
        }
      }, 800)
    })
    
    return {
      isLoading,
      mySurveys,
      sortedSurveys,
      showDeleteModal,
      surveyToDelete,
      successMessage,
      sortBy,
      sortDir,
      formatDate,
      sortSurveys,
      confirmDelete,
      deleteSurvey,
      copyLinkToClipboard
    }
  }
}
</script>

<style lang="scss" scoped>
.my-surveys-view {
  position: relative;
  
  .page-title {
    margin-bottom: 30px;
    text-align: center;
    color: #333;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    
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
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    
    .empty-illustration {
      width: 200px;
      height: 200px;
      background-color: #f0f4ff;
      border-radius: 50%;
      margin-bottom: 30px;
      position: relative;
      
      &::before {
        content: '?';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 100px;
        color: #4a6bff;
        opacity: 0.5;
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
      text-align: center;
    }
  }
  
  .surveys-container {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    padding: 25px;
    
    .surveys-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      
      .surveys-count {
        font-weight: 500;
        color: #666;
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .surveys-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      
      .survey-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-radius: 8px;
        background-color: #f9faff;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .survey-info {
          flex: 1;
          
          .survey-title {
            font-size: 1.3rem;
            margin-bottom: 10px;
            color: #333;
          }
          
          .survey-description {
            color: #666;
            margin-bottom: 10px;
            font-size: 0.95rem;
          }
          
          .survey-meta {
            display: flex;
            gap: 15px;
            font-size: 0.85rem;
            color: #777;
            
            .survey-responses {
              color: #4a6bff;
              font-weight: 500;
            }
          }
        }
        
        .survey-actions {
          display: flex;
          gap: 8px;
          
          @media (max-width: 768px) {
            flex-direction: column;
          }
        }
      }
    }
  }
  
  .btn-sm {
    font-size: 0.85rem;
    padding: 8px 12px;
  }
  
  // Modal
  .delete-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
      position: relative;
      background-color: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 500px;
      z-index: 1001;
      
      h3 {
        margin-bottom: 15px;
        color: #333;
      }
      
      p {
        margin-bottom: 25px;
        color: #666;
      }
      
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 15px;
      }
    }
  }
  
  // Toast
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
</style> 