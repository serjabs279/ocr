<script setup>
import { ref } from 'vue';

const emit = defineEmits(['logout']);
const activeView = ref('dashboard');

const handleLogout = () => {
  emit('logout');
};

const notifications = ref([
  {
    id: 1,
    studentName: 'Juan dela Cruz',
    message: 'A student has submitted their credentials for evaluation.',
  },
  {
    id: 2,
    studentName: 'Maria Clara',
    message: 'A student has submitted their credentials for evaluation.',
  },
  {
    id: 3,
    studentName: 'Jose Rizal',
    message: 'A student has submitted their credentials for evaluation.',
  },
]);
</script>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
        <div>
            <div class="sidebar-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Subject Evaluator</span>
            </div>
            <nav class="sidebar-nav">
                <a href="#" :class="{ active: activeView === 'dashboard' }" @click="activeView = 'dashboard'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    <span>Dashboard</span>
                </a>
                <a href="#" :class="{ active: activeView === 'approvals' }" @click="activeView = 'approvals'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    <span>Pending Approvals</span>
                </a>
                <a href="#" :class="{ active: activeView === 'subjects' }" @click="activeView = 'subjects'">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                    <span>Subject Management</span>
                </a>
            </nav>
        </div>
        <div class="sidebar-footer">
            <div class="user-profile">
                <div class="avatar">A</div>
                <span>Admin</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 18l6-6l-6-6"/></svg>
            </div>
        </div>
    </aside>
    <main class="main-content">
      <div v-if="activeView === 'dashboard'" class="view-container">
         <div class="header">
            <h2>Dashboard</h2>
            <p>Welcome back, Admin. Here is an overview of pending tasks.</p>
        </div>
        <div class="notification-stack">
          <div v-for="notification in notifications" :key="notification.id" class="notification-banner">
            <div class="notification-content">
              <p class="notification-message">{{ notification.message }}</p>
              <p class="student-name">Student: {{ notification.studentName }}</p>
            </div>
            <button class="notification-button" @click="activeView = 'approvals'">
              See more
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeView === 'approvals'" class="view-container">
        <div class="header">
            <h2>Pending Approvals</h2>
            <p>Review and approve subject evaluations from transferee students.</p>
        </div>
      </div>

      <div v-if="activeView === 'subjects'" class="view-container">
        <div class="header">
            <h2>Subject Management</h2>
            <p>Manage the list of subjects and their corresponding evaluation criteria.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Base & Typography */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #111827;
  color: var(--text-dark);
  font-family: var(--font-family);
}

/* Sidebar */
.sidebar {
  width: 280px;
  background-color: #1F2937;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #374151;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #374151;
}

.logo-icon {
  color: var(--primary-color);
}

/* Navigation */
.sidebar-nav {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-light);
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.sidebar-nav a:hover {
  background-color: #374151;
  color: var(--text-dark);
}

.sidebar-nav a.active {
  background-color: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.sidebar-nav a svg {
    transition: fill 0.2s;
}

/* Sidebar Footer & User Profile */
.sidebar-footer {
  padding-top: 1.5rem;
  border-top: 1px solid #374151;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: var(--text-dark);
}

.user-profile .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border: 2px solid #111827;
}

.user-profile svg {
    margin-left: auto;
    color: var(--text-light);
}

/* Main Content Area */
.main-content {
  flex-grow: 1;
  padding: 2.5rem 4rem;
}

.header h2 {
    font-size: 1.875rem; /* 30px */
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-dark);
}

.header p {
    color: var(--text-light);
    margin-bottom: 2.5rem;
    font-size: 1.1rem;
}

/* Notification Banners */
.notification-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-banner {
  background-color: #1F2937;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #374151;
  transition: all 0.2s ease-in-out;
}

.notification-banner:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.1);
}

.notification-content {
  display: flex;
  flex-direction: column;
}

.notification-message {
  color: var(--text-dark);
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.student-name {
  color: var(--text-light);
  font-size: 0.9rem;
  margin: 0;
}

.notification-button {
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.notification-button:hover {
  background-color: var(--primary-dark);
}
</style>
