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
      // For non-image files like PDFs, we won't show a preview in the box
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

const parsedCurriculum = computed(() => {
  const lines = extractedText.value.split('\n');
  const curriculum = [];
  let currentYear = null;
  let currentSemester = null;

  const yearRegex = /(FIRST|SECOND|THIRD|FOURTH) YEAR/i;
  const semesterRegex = /(FIRST|SECOND) SEMESTER/i;

  for (const line of lines) {
    const yearMatch = line.match(yearRegex);
    if (yearMatch) {
        currentYear = { title: `${yearMatch[1].toUpperCase()} YEAR`, semesters: [] };
        curriculum.push(currentYear);
    }

    const semesterMatch = line.match(semesterRegex);
    if (semesterMatch && currentYear) {
      currentSemester = { title: `${semesterMatch[1].toUpperCase()} SEMESTER`, courses: [] };
      currentYear.semesters.push(currentSemester);
    }

    if (currentSemester) {
      const courseParts = line.match(/^([A-Z][A-Za-z\s.&,]+?)\s+([A-Z]{2,}\s?\d{3,}[A-Z]?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/);

      if (courseParts) {
        const [, descriptiveTitle, courseNo, lec, lab, units, rest] = courseParts;
        
        const preCoReqs = rest.trim().split(/\s{2,}/);
        const preRequisites = preCoReqs[0] || 'None';
        const coRequisites = preCoReqs[1] || 'None';

        currentSemester.courses.push({
          grade: '',
          descriptiveTitle: descriptiveTitle.trim(),
          courseNo: courseNo.trim(),
          lec: lec.trim(),
          lab: lab.trim(),
          units: units.trim(),
          preRequisites: preRequisites,
          coRequisites: coRequisites,
        });
      } else if (line.toLowerCase().includes('total')) {
          const totalMatch = line.match(/Total\s+(\d+)\s+(\d+)\s+(\d+)/);
          if (totalMatch && currentSemester) {
              currentSemester.totalLec = totalMatch[1];
              currentSemester.totalLab = totalMatch[2];
              currentSemester.totalUnits = totalMatch[3];
          }
      }
    }
  }

  return curriculum;
});

const handleLogout = () => {
  emit('logout');
};
</script>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                <span>Subject Evaluator</span>
            </div>
        </div>
        <nav class="sidebar-nav">
            <a href="#" :class="{ active: activeView === 'dashboard' }" @click="activeView = 'dashboard'">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>Dashboard</span>
            </a>
            <a href="#" :class="{ active: activeView === 'upload' }" @click="activeView = 'upload'">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                <span>Upload TOR</span>
            </a>
            <a href="#" :class="{ active: activeView === 'extract' }" @click="activeView = 'extract'">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>Transcript Extract</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <div class="user-profile">
                <div class="avatar">S</div>
                <span>Student Name</span>
            </div>
            <a href="#" @click.prevent="handleLogout" class="logout-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </a>
        </div>
    </aside>
    <main class="main-content">
      <div v-if="activeView === 'dashboard'" class="view-container">
        <h1>Welcome, Student!</h1>
        <p>This is your dashboard. You can navigate using the sidebar.</p>
      </div>

      <div v-if="activeView === 'upload'" class="view-container">
        <div class="upload-header">
            <h2>Upload Transcript of Records</h2>
            <p>Upload your transcript to automatically extract and evaluate your subjects.</p>
        </div>
        
        <div class="upload-box" :class="{ 'has-preview': filePreviewUrl }">
            <input type="file" id="file-upload" @change="handleFileUpload" accept=".jpg, .jpeg, .png, .pdf" hidden/>
            
            <label v-if="!filePreviewUrl" for="file-upload" class="upload-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5l5 5h-3z"/></svg>
                <span>Drag & drop your file here, or click to select a file</span>
            </label>

            <div v-if="filePreviewUrl" class="image-preview-section">
              <img :src="filePreviewUrl" alt="Transcript Preview" class="image-preview" />
            </div>
        </div>

        <div v-if="uploadedFile" class="extraction-section">
            <div class="file-info">
                <p>File selected: <strong>{{ uploadedFile.name }}</strong></p>
                <button @click="handleExtraction" :disabled="isExtracting">
                    <span v-if="isExtracting">
                        <div class="loader"></div>
                        Extracting... ({{ extractionProgress }}%)
                    </span>
                    <span v-else>Extract Text</span>
                </button>
            </div>
        </div>

        <div v-if="parsedCurriculum.length > 0" class="curriculum-view">
          <div v-for="year in parsedCurriculum" :key="year.title" class="year-section">
            <h2>{{ year.title }}</h2>
            <div v-for="semester in year.semesters" :key="semester.title" class="semester-section">
              <h3>{{ semester.title }}</h3>
              <table class="courses-table">
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Descriptive Title</th>
                    <th>Course No.</th>
                    <th>LEC</th>
                    <th>LAB</th>
                    <th>Units</th>
                    <th>Pre-requisite(s)</th>
                    <th>Co-requisite(s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(course, index) in semester.courses" :key="index">
                    <td>{{ course.grade }}</td>
                    <td>{{ course.descriptiveTitle }}</td>
                    <td>{{ course.courseNo }}</td>
                    <td>{{ course.lec }}</td>
                    <td>{{ course.lab }}</td>
                    <td>{{ course.units }}</td>
                    <td>{{ course.preRequisites }}</td>
                    <td>{{ course.coRequisites }}</td>
                  </tr>
                </tbody>
                <tfoot v-if="semester.totalLec">
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: bold;">Total</td>
                        <td>{{ semester.totalLec }}</td>
                        <td>{{ semester.totalLab }}</td>
                        <td>{{ semester.totalUnits }}</td>
                        <td colspan="2"></td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div v-else-if="extractedText.length > 0">
          <h3>Extracted Text Result:</h3>
          <pre class="extracted-text">{{ extractedText }}</pre>
        </div>
      </div>

      <div v-if="activeView === 'extract'" class="view-container">
        <TranscriptExtract :extractedText="extractedText" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--secondary-color);
  color: var(--text-dark);
}

.sidebar {
  width: 260px;
  background-color: var(--feature-bg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #444;
}

.sidebar-header .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 1.25rem;
    color: var(--text-dark);
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #444;
}

.sidebar-header .logo svg {
    color: var(--primary-color);
}

.sidebar-nav {
  flex-grow: 1;
  margin-top: 2rem;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-light);
  transition: all 0.3s ease;
}

.sidebar-nav a:hover, .sidebar-nav a.active {
  background-color: var(--primary-color);
  color: var(--white);
}

.sidebar-footer {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1.5rem;
    border-top: 1px solid #444;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
}

.user-profile .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.logout-button {
    background: transparent;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.logout-button:hover {
    background-color: var(--primary-dark);
    color: var(--white);
}

.main-content {
  flex-grow: 1;
  padding: 2rem 3rem;
  overflow-y: auto;
}

.view-container {
    animation: fade-in 0.5s ease;
}

.upload-header h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.upload-header p {
    color: var(--text-light);
    margin-bottom: 2.5rem;
}

.upload-box {
  border: 2px dashed #555;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  background-color: var(--feature-bg);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  overflow: hidden;
}

.upload-box.has-preview {
  padding: 0;
  border-style: solid;
  border-color: var(--primary-color);
}

.upload-box:hover {
    border-color: var(--primary-color);
    background-color: #2a2a2a;
}

.upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    cursor: pointer;
    color: var(--text-light);
}

.upload-label svg {
    color: var(--primary-color);
}

.extraction-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: var(--feature-bg);
    border-radius: 10px;
}

.file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.file-info p {
    margin: 0;
}

.file-info button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.file-info button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.loader {
    width: 18px;
    height: 18px;
    border: 2px solid #fff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

.image-preview-section {
  width: 100%;
  height: auto;
  max-height: 400px;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.extracted-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: var(--feature-bg);
  padding: 1.5rem;
  border-radius: 8px;
  max-height: 500px;
  overflow-y: auto;
  color: var(--text-light);
  border: 1px solid #444;
}

.curriculum-view {
  margin-top: 3rem;
}

.year-section h2 {
  font-size: 1.8rem;
  color: var(--text-dark);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.8rem;
  margin-bottom: 1.5rem;
}

.semester-section h3 {
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: var(--feature-bg);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.courses-table th,
.courses-table td {
  border: 1px solid #444;
  padding: 1rem 1.2rem;
  text-align: left;
}

.courses-table th {
  background-color: #2a2a2a;
  font-weight: 600;
}

@keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>