<script setup>
// This imports the ref function from the vue library, which is used to create reactive variables.
import { ref } from 'vue';
// This imports the LandingPage component, which is the initial page the user sees.
import LandingPage from './components/LandingPage.vue';
// This imports the Login component, which is a modal that allows the user to log in.
import Login from './components/Login.vue';
// This imports the StudentDashboard component, which is the main page the user sees after logging in.
import StudentDashboard from './components/StudentDashboard.vue';

// This creates a reactive variable that determines whether the login modal is shown or not.
const showLoginModal = ref(false);
// This creates a reactive variable that determines whether the user is logged in or not.
const loggedIn = ref(false);

// This function is called when the user clicks the "Get Started" button on the landing page.
const handleShowLogin = () => {
  // This sets the showLoginModal variable to true, which shows the login modal.
  showLoginModal.value = true;
};

// This function is called when the user closes the login modal.
const handleCloseLogin = () => {
  // This sets the showLoginModal variable to false, which hides the login modal.
  showLoginModal.value = false;
};

// This function is called when the user successfully logs in.
const handleLoginSuccess = () => {
  // This sets the loggedIn variable to true, which shows the student dashboard.
  loggedIn.value = true;
  // This sets the showLoginModal variable to false, which hides the login modal.
  showLoginModal.value = false;
};

// This function is called when the user logs out.
const handleLogout = () => {
  // This sets the loggedIn variable to false, which shows the landing page.
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
/* This is where the styles for the App component are defined. The "scoped" attribute means that the styles will only apply to this component. */
</style>