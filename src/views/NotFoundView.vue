<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="error-code">404</div>
      <h1 class="error-title">Sayfa Bulunamadı</h1>
      <p class="error-message">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
      <div class="action-buttons">
        <router-link to="/" class="btn btn-primary">Ana Sayfaya Dön</router-link>
        <router-link to="/create" class="btn btn-outline">Anket Oluştur</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style lang="scss" scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  
  .not-found-container {
    max-width: 600px;
    
    .error-code {
      font-size: 8rem;
      font-weight: 700;
      color: #4a6bff;
      line-height: 1;
      margin-bottom: 20px;
      opacity: 0.8;
      text-shadow: 5px 5px 0 rgba(0, 0, 0, 0.1);
    }
    
    .error-title {
      font-size: 2rem;
      color: #333;
      margin-bottom: 15px;
    }
    
    .error-message {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 30px;
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 15px;
    }
  }
}
</style> 