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
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 18l6-6l-6-6"/></svg>
            </div>
        </div>
    </aside>
    <main class="main-content">
      <div v-if="activeView === 'dashboard'" class="view-container">
         <div class="upload-header">
            <h2>Dashboard</h2>
            <p>Welcome back, Student. Your academic overview is available here.</p>
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
      </div>

      <div v-if="activeView === 'extract'" class="view-container">
        <TranscriptExtract :extractedText="extractedText" />
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
</style>
