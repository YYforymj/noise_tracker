import { createApp } from 'vue'
import './styles/base.css'
import App from './App.vue'
import { applySeoMetadata } from './seo/site'

applySeoMetadata()
createApp(App).mount('#app')
