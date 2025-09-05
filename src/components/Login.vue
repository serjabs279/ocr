<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['close-login', 'login-success']);

const email = ref('');
const password = ref('');
const userType = ref('student'); // 'student' or 'admin'
const errorMessage = ref('');

const handleLogin = () => {
  // Mock user data
  const mockStudent = { email: 'student@example.com', password: 'password123' };
  const mockAdmin = { email: 'admin@example.com', password: 'adminpassword' };

  errorMessage.value = '';

  if (userType.value === 'student') {
    if (email.value === mockStudent.email && password.value === mockStudent.password) {
      emit('login-success');
    } else {
      errorMessage.value = 'Invalid student credentials.';
    }
  } else if (userType.value === 'admin') {
    if (email.value === mockAdmin.email && password.value === mockAdmin.password) {
      emit('login-success');
    } else {
      errorMessage.value = 'Invalid admin credentials.';
    }
  }
};

const handleClose = () => {
  emit('close-login');
};
</script>

<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <button class="close-button" @click="handleClose">&times;</button>
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="user-type-toggle">
          <button
            type="button"
            :class="{ active: userType === 'student' }"
            @click="userType = 'student'"
          >
            Student
          </button>
          <button
            type="button"
            :class="{ active: userType === 'admin' }"
            @click="userType = 'admin'"
          >
            Admin
          </button>
        </div>
        <div class="input-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Enter your email"
          />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="extra-options">
          <a href="#" class="forgot-password">Forgot Password?</a>
        </div>
        <button type="submit" class="login-button">Login</button>
        <button type="button" @click="handleClose" class="cancel-button">Cancel</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background-color: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  font-weight: bold;
  color: #888;
  cursor: pointer;
}

h2 {
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: #333;
}

.user-type-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  background-color: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.user-type-toggle button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background-color: transparent;
  color: #555;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.user-type-toggle button.active {
  background-color: #42b883;
  color: white;
  font-weight: 600;
}

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-sizu: 1rem;
  transition: border-color 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #42b883;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
  font-weight: 500;
}

.extra-options {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-password {
  color: #42b883;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  background-color: #42b883;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #36a374;
}

.cancel-button {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background-color: #f8f9fa;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #e9ecef;
  border-color: #c0c0c0;
}
</style>
