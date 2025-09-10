// This imports the createApp function from the vue library, which is used to create a new Vue application instance.
import { createApp } from 'vue'
// This imports the global stylesheet for the application.
import './style.css'
// This imports the root component of the application.
import App from './App.vue'

// This creates a new Vue application instance with the App component as the root component and mounts it to the DOM element with the id of "app".
createApp(App).mount('#app')
