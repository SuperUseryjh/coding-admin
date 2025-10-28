import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入 router

const app = createApp(App);
app.use(router); // 使用 router
app.mount('#app');