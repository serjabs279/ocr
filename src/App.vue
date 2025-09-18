<script setup>
import { ref } from 'vue';
import LandingPage from './components/LandingPage.vue';
import Login from './components/Login.vue';
import StudentDashboard from './components/StudentDashboard.vue';
import AdminDashboard from './components/AdminDashboard.vue';

const showLoginModal = ref(false);
const loggedIn = ref(false);
const userType = ref(''); // student or admin
const loginButtonRect = ref(null);
const studentNotifications = ref([]);

const handleShowLogin = ({ buttonRect }) => {
  loginButtonRect.value = buttonRect;
  showLoginModal.value = true;
};

const handleCloseLogin = () => {
  showLoginModal.value = false;
};

const handleLoginSuccess = (type) => {
  loggedIn.value = true;
  userType.value = type;
  showLoginModal.value = false;
};

const handleLogout = () => {
  loggedIn.value = false;
  userType.value = '';
};

const addStudentNotification = (notification) => {
  studentNotifications.value.push(notification);
};

const beforeEnter = (el) => {
  if (!loginButtonRect.value) return;

  const { top, left, width, height } = loginButtonRect.value;
  el.style.setProperty('--start-top', `${top + height / 2}px`);
  el.style.setProperty('--start-left', `${left + width / 2}px`);
};
</script>

<template>
  <div id="app">
    <div v-if="!loggedIn">
      <LandingPage @login="handleShowLogin" />
      <Transition name="genie" @before-enter="beforeEnter">
        <Login v-if="showLoginModal" @close-login="handleCloseLogin" @login-success="handleLoginSuccess" />
      </Transition>
    </div>
    <div v-else>
      <StudentDashboard 
        v-if="userType === 'student'" 
        @logout="handleLogout" 
        :notifications="studentNotifications" 
      />
      <AdminDashboard 
        v-else-if="userType === 'admin'" 
        @logout="handleLogout"
        @add-notification="addStudentNotification"
      />
    </div>
  </div>
</template>

<style>
:root {
  --start-top: 50%;
  --start-left: 50%;
}

.genie-enter-active,
.genie-leave-active {
  transition: all 0.5s cubic-bezier(0.5, 0, 0.75, 0);
}

.genie-enter-from,
.genie-leave-to {
  clip-path: circle(0% at var(--start-left) var(--start-top));
}

.genie-enter-to,
.genie-leave-from {
  clip-path: circle(150% at 50% 50%);
}
</style>
