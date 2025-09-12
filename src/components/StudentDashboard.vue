<script setup>
import { ref, computed } from 'vue';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import TranscriptExtract from './TranscriptExtract.vue';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const emit = defineEmits(['logout']);

const activeView = ref('upload');
const uploadedFile = ref(null);
const filePreviewUrl = ref(null);
const isExtracting = ref(false);
const extractionProgress = ref(0);
const extractedText = ref('');

const notifications = ref([
  "Extraction completed successfully!",
  "Dean has evaluated your subjects."
]);
const unreadNotifications = ref(notifications.value.length);
const showNotifications = ref(false);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    unreadNotifications.value = 0;
  }
};

const dismissNotification = (index) => {
  notifications.value.splice(index, 1);
};

const showPopup = ref(false);
const popupMessage = ref('');

const handleFileUpload = (event) => {
  const target = event.target;
  const file = target.files?.[0];

  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
  }

  if (file) {
    uploadedFile.value = file;
    extractedText.value = '';
    if (file.type.startsWith('image/')) {
      filePreviewUrl.value = URL.createObjectURL(file);
    } else {
      filePreviewUrl.value = null;
    }
  }
};

const handleExtraction = async () => {
  if (!uploadedFile.value) return;

  isExtracting.value = true;
  extractionProgress.value = 0;
  extractedText.value = '';

  try {
    if (uploadedFile.value.type === 'application/pdf') {
      const arrayBuffer = await uploadedFile.value.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
        extractionProgress.value = Math.round((i / numPages) * 100);
      }
      extractedText.value = fullText;

    } else if (uploadedFile.value.type.startsWith('image/')) {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            extractionProgress.value = Math.round(m.progress * 100);
          }
        }
      });

      const { data: { text } } = await worker.recognize(uploadedFile.value);
      extractedText.value = text;
      await worker.terminate();

    } else {
      extractedText.value = 'Unsupported file type. Please upload an image or a PDF.';
    }

    // Show popup when extraction is complete
    popupMessage.value = 'Extraction completed successfully!';
    showPopup.value = true;

  } catch (error) {
    console.error('Extraction Error:', error);
    extractedText.value = 'Error during text extraction.';
  } finally {
    isExtracting.value = false;
  }
};

const handleLogout = () => {
  emit('logout');
};
</script>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
        <div>
            <div class="sidebar-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Subject Evaluator</span>
                <div class="notification-bell" @click="toggleNotifications">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 24c1.104 0 2-.896 2-2h-4c0 1.104.896 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V6c0-.828-.672-1.5-1.5-1.5S10 5.172 10 6v.68C7.14 7.36 5.5 9.93 5.5 13v5l-1.5 1.5V20h16v-.5l-1.5-1.5zM12 4c.828 0 1.5-.672 1.5-1.5S12.828 1 12 1s-1.5.672-1.5 1.5S11.172 4 12 4z"/></svg>
                  <span v-if="unreadNotifications > 0" class="notification-badge">{{ unreadNotifications }}</span>
                </div>
            </div>
            <nav class="sidebar-nav">
                <a href="#" :class="{ active: activeView === 'dashboard' }" @click="activeView = 'dashboard'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    <span>Dashboard</span>
                </a>
                <a href="#" :class="{ active: activeView === 'upload' }" @click="activeView = 'upload'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                    <span>Upload TOR</span>
                </a>
                <a href="#" :class="{ active: activeView === 'extract' }" @click="activeView = 'extract'">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path fill="currentColor" d="M9 15h6v-2H9v2zm0-4h6v-2H9v2z"/><path fill="currentColor" d="M13 9V3.5L18.5 9H13z"/></svg>
                    <span>Transcript Extract</span>
                </a>
            </nav>
        </div>
        <div class="sidebar-footer">
            <div class="user-profile">
                <div class="avatar">S</div>
                <span>Student Name</span>
                <button class="logout-button" @click="handleLogout">
                  Logout
                </button>
            </div>
        </div>
    </aside>
    <main class="main-content">
      <div v-if="activeView === 'dashboard'" class="view-container">
        <div class="dashboard-header">
          <h2>Dashboard</h2>
          <p>Welcome back, Student. Your academic overview is available here.</p>
        </div>

        <div class="dashboard-cards">
          <div class="card">
            <h3>Subjects Evaluated</h3>
            <p>12</p>
          </div>
          <div class="card">
            <h3>Pending Evaluations</h3>
            <p>3</p>
          </div>
          <div class="card">
            <h3>Last Activity</h3>
            <p>Uploaded Transcript on Sep 10, 2025</p>
          </div>
        </div>

        <div class="recent-activities">
          <h3>Recent Activities</h3>
          <ul>
            <li>Extracted subjects from "Transcript_Sep10.pdf"</li>
            <li>Uploaded "Transcript_Sep10.pdf"</li>
            <li>Logged in on Sep 10, 2025</li>
          </ul>
        </div>
      </div>

      <div v-if="activeView === 'upload'" class="view-container">
        <div class="upload-header">
            <h2>Upload Transcript of Records</h2>
            <p>Upload your transcript to automatically extract and evaluate your subjects.</p>
        </div>
        
        <div class="upload-box">
            <input type="file" id="file-upload" @change="handleFileUpload" accept=".jpg, .jpeg, .png, .pdf" hidden/>
            <label for="file-upload" class="upload-label">
                <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4S5.33 6.59 4.65 10.04C2.34 10.36 0 12.91 0 16c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96ZM14 14v4h-4v-4H7l5-5l5 5h-3z"/></svg>
                <span>Drag & drop your file here, or click to select a file</span>
            </label>
             <div v-if="filePreviewUrl" class="image-preview-section">
              <img :src="filePreviewUrl" alt="Transcript Preview" class="image-preview" />
            </div>
        </div>

        <div class="extract-button-container" v-if="uploadedFile">
          <button class="extract-button" @click="handleExtraction" :disabled="isExtracting">
            <span v-if="!isExtracting">Extract</span>
            <span v-else>Extracting... {{ extractionProgress }}%</span>
          </button>
        </div>
      </div>

      <div v-if="activeView === 'extract'" class="view-container">
        <TranscriptExtract :extractedText="extractedText" />
      </div>
    </main>

    <div v-if="showNotifications" class="toast-container">
      <div v-for="(notification, index) in notifications" :key="index" class="toast">
        <p>{{ notification }}</p>
        <button @click="dismissNotification(index)">Dismiss</button>
      </div>
    </div>

    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <p>{{ popupMessage }}</p>
        <button @click="showPopup = false">Close</button>
      </div>
    </div>
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

.upload-header h2 {
    font-size: 1.875rem; /* 30px */
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-dark);
}

.upload-header p {
    color: var(--text-light);
    margin-bottom: 2.5rem;
    font-size: 1.1rem;
}

/* Upload Box */
.upload-box {
  border: 2px dashed #374151;
  border-radius: 8px;
  padding: 4rem;
  text-align: center;
  background-color: #1F2937;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-box:hover {
    border-color: var(--primary-color);
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    cursor: pointer;
    color: var(--text-light);
    font-weight: 500;
}

.upload-icon {
    color: var(--primary-color);
    transition: transform 0.3s;
}

.upload-box:hover .upload-icon {
    transform: scale(1.1);
}

.image-preview-section {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    padding: 1rem;
    box-sizing: border-box;
    background-color: #1F2937;
}

.image-preview {
    width: 100%; height: 100%;
    object-fit: contain;
    border-radius: 6px;
}

/* Extract Button */
.extract-button-container {
  margin-top: 1.5rem;
  text-align: center;
}

.extract-button {
  background-color: var(--primary-color);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.extract-button:disabled {
  background-color: #6b7280;
  cursor: not-allowed;
}

.extract-button:hover:not(:disabled) {
  background-color: #2563eb;
}

/* Logout Button */
.logout-button-container {
  margin-top: 1.5rem;
  text-align: center;
}

.logout-button {
  background-color: transparent;
  color: var(--text-light);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-left: auto;
  transition: color 0.3s ease;
}

.logout-button:hover {
  color: var(--primary-color);
}

/* Dashboard Cards */
.dashboard-cards {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
}

.card {
  background-color: #1F2937;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  flex: 1;
  text-align: center;
  color: var(--text-light);
}

.card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.card p {
  font-size: 2rem;
  font-weight: bold;
}

/* Recent Activities */
.recent-activities {
  margin-top: 2rem;
}

.recent-activities h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.recent-activities ul {
  list-style: none;
  padding: 0;
}

.recent-activities li {
  background-color: #1F2937;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
  color: var(--text-light);
}

/* Notification Bell */
.notification-bell {
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  background-color: #1F2937;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toast button {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.875rem;
}

.toast button:hover {
  text-decoration: underline;
}

/* Popup */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: #1F2937;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.popup-content button {
  margin-top: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.popup-content button:hover {
  background-color: #2563eb;
}
</style>
