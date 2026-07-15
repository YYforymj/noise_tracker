import { createApp } from 'vue'
import './styles/base.css'
import App from './App.vue'
import { applySeoMetadata, getLocaleFromPath } from './seo/site'

applySeoMetadata(getLocaleFromPath(window.location.pathname))
createApp(App).mount('#app')
