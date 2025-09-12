<script setup>
import { ref } from 'vue';

const emit = defineEmits(['close-login', 'login-success']);

const email = ref('');
const password = ref('');
const userType = ref('student'); // 'student' or 'admin'
const errorMessage = ref('');

const handleLogin = () => {
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
      <div class="close-button" @click="handleClose">&times;</div>
      
      <div class="login-header">
        <h2>Welcome Back</h2>
        <p>Log in to continue your session</p>
      </div>

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
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Email Address"
          />
        </div>

        <div class="input-group">
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Password"
          />
        </div>
        
        <div class="extra-options">
          <a href="#" class="forgot-password">Forgot Password?</a>
        </div>
        
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <button type="submit" class="login-button">Log In</button>
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fade-in 0.3s ease;
}

.modal-content {
  position: relative;
  background-color: var(--feature-bg);
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  text-align: center;
  animation: slide-up 0.4s ease;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  border: none;
  background: transparent;
  font-size: 2rem;
  color: var(--text-light);
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
    color: var(--white);
}

.login-header h2 {
  margin-bottom: 0.5rem;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-dark);
}

.login-header p {
  margin-bottom: 2.5rem;
  color: var(--text-light);
}

.user-type-toggle {
  display: flex;
  margin-bottom: 2rem;
  background-color: var(--secondary-color);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #444;
}

.user-type-toggle button {
  flex: 1;
  padding: 0.9rem;
  border: none;
  background-color: transparent;
  color: var(--text-light);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-type-toggle button.active {
  background-color: var(--primary-color);
  color: var(--white);
  font-weight: 600;
  box-shadow: 0 0 10px rgba(66, 184, 131, 0.5);
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #444;
  background-color: var(--secondary-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-dark);
  transition: all 0.3s ease;
}

.input-group input::placeholder {
    color: var(--text-light);
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.3);
}

.error-message {
  color: #ff6b6b;
  margin-bottom: 1.5rem;
  font-weight: 500;
  animation: shake 0.5s;
}

.extra-options {
  text-align: right;
  margin: -1rem 0 1.5rem;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--primary-dark);
}

.login-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.4);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>