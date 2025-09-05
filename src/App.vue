<script setup lang="ts">
import { ref } from 'vue';
import LandingPage from './components/LandingPage.vue';
import Login from './components/Login.vue';
import StudentDashboard from './components/StudentDashboard.vue';

const showLoginModal = ref(false);
const loggedIn = ref(false);

const handleShowLogin = () => {
  showLoginModal.value = true;
};

const handleCloseLogin = () => {
  showLoginModal.value = false;
};

const handleLoginSuccess = () => {
  loggedIn.value = true;
  showLoginModal.value = false;
};

const handleLogout = () => {
  loggedIn.value = false;
};

</script>

<template>
  <div id="app">
    <div v-if="!loggedIn">
      <LandingPage @get-started="handleShowLogin" />
      <Login v-if="showLoginModal" @close-login="handleCloseLogin" @login-success="handleLoginSuccess" />
    </div>
    <StudentDashboard v-else @logout="handleLogout" />
  </div>
</template>

<style scoped>
</style>
