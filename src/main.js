import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/scss/main.scss'; // CSS dosyasını ekliyoruz

// Vue uygulamasını oluşturuyoruz ve #app elementine bağlıyoruz
const app = createApp(App);

app.use(createPinia());
app.use(router);

// Eğer Vue Router veya Vuex gibi ek kütüphaneler kullanıyorsanız, burada ekleyebilirsiniz
// Örneğin:
// import router from './router';
// app.use(router);

app.mount('#app'); // Uygulamayı monte ediyoruz
