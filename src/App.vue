<template>
  <div class="app-container">
    <header class="app-header">
      <div class="container">
        <h1 class="app-title">Anket Pro</h1>
        <nav class="app-nav">
          <router-link to="/" class="nav-link">Ana Sayfa</router-link>
          <router-link to="/create" class="nav-link">Anket Oluştur</router-link>
          <router-link to="/my-surveys" class="nav-link">Anketlerim</router-link>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>
    
    <footer class="app-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} Anket Pro - Tüm hakları saklıdır</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
// Ana stiller CSS dosyasında tanımlanmıştır
</style>