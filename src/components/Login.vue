<script setup>
// This imports the ref function from the vue library, which is used to create reactive variables.
import { ref } from 'vue';

// This defines the events that this component can emit.
const emit = defineEmits(['close-login', 'login-success']);

// This creates a reactive variable that stores the user's email.
const email = ref('');
// This creates a reactive variable that stores the user's password.
const password = ref('');
// This creates a reactive variable that stores the user's type.
const userType = ref('student'); // 'student' or 'admin'
// This creates a reactive variable that stores an error message, if any.
const errorMessage = ref('');

// This function is called when the user submits the login form.
const handleLogin = () => {
  // This is a mock user data for demonstration purposes.
  const mockStudent = { email: 'student@example.com', password: 'password123' };
  const mockAdmin = { email: 'admin@example.com', password: 'adminpassword' };

  // This resets the error message.
  errorMessage.value = '';

  // This checks if the user is a student.
  if (userType.value === 'student') {
    // This checks if the user's credentials are valid.
    if (email.value === mockStudent.email && password.value === mockStudent.password) {
      // This emits the "login-success" event, which is handled by the parent component.
      emit('login-success');
    } else {
      // This sets the error message.
      errorMessage.value = 'Invalid student credentials.';
    }
  // This checks if the user is an admin.
  } else if (userType.value === 'admin') {
    // This checks if the user's credentials are valid.
    if (email.value === mockAdmin.email && password.value === mockAdmin.password) {
      // This emits the "login-success" event, which is handled by the parent component.
      emit('login-success');
    } else {
      // This sets the error message.
      errorMessage.value = 'Invalid admin credentials.';
    }
  }
};

// This function is called when the user closes the login modal.
const handleClose = () => {
  // This emits the "close-login" event, which is handled by the parent component.
  emit('close-login');
};
</script>

<template>
  <!-- This is the main container for the login modal. -->
  <div class="modal-overlay" @click.self="handleClose">
    <!-- This is the content of the login modal. -->
    <div class="modal-content">
      <!-- This is the close button for the login modal. -->
      <button class="close-button" @click="handleClose">&times;</button>
      <!-- This is the title of the login modal. -->
      <h2>Login</h2>
      <!-- This is the login form. -->
      <form @submit.prevent="handleLogin">
        <!-- This is the user type toggle. -->
        <div class="user-type-toggle">
          <!-- This is the student button. -->
          <button
            type="button"
            :class="{ active: userType === 'student' }"
            @click="userType = 'student'"
          >
            Student
          </button>
          <!-- This is the admin button. -->
          <button
            type="button"
            :class="{ active: userType === 'admin' }"
            @click="userType = 'admin'"
          >
            Admin
          </button>
        </div>
        <!-- This is the email input group. -->
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
        <!-- This is the password input group. -->
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
        <!-- This is the error message. -->
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <!-- This is the extra options section. -->
        <div class="extra-options">
          <a href="#" class="forgot-password">Forgot Password?</a>
        </div>
        <!-- This is the login button. -->
        <button type="submit" class="login-button">Login</button>
        <!-- This is the cancel button. -->
        <button type="button" @click="handleClose" class="cancel-button">Cancel</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* This is where the styles for the Login component are defined. The "scoped" attribute means that the styles will only apply to this component. */
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
  font-size: 1rem;
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