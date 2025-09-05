<script setup lang="ts">
import { ref, computed } from 'vue';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import TranscriptExtract from './TranscriptExtract.vue';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const emit = defineEmits(['logout']);
const activeView = ref('upload');
const uploadedFile = ref<File | null>(null);
const filePreviewUrl = ref<string | null>(null);
const isExtracting = ref(false);
const extractionProgress = ref(0);
const extractedText = ref('');

interface Course {
  grade: string;
  descriptiveTitle: string;
  courseNo: string;
  lec: string;
  lab: string;
  units: string;
  preRequisites: string;
  coRequisites: string;
}

interface Semester {
  title: string;
  courses: Course[];
  totalLec?: string;
  totalLab?: string;
  totalUnits?: string;
}

interface Year {
  title: string;
  semesters: Semester[];
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
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
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
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

const parsedCurriculum = computed((): Year[] => {
  const lines = extractedText.value.split('\n');
  const curriculum: Year[] = [];
  let currentYear: Year | null = null;
  let currentSemester: Semester | null = null;

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
        <span class="logo">🎓</span>
        <h2 class="sidebar-title">Dashboard</h2>
      </div>
      <nav class="sidebar-nav">
        <a href="#" :class="{ active: activeView === 'dashboard' }" @click="activeView = 'dashboard'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="nav-text">Dashboard</span>
        </a>
        <a href="#" :class="{ active: activeView === 'upload' }" @click="activeView = 'upload'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          <span class="nav-text">Upload TOR</span>
        </a>
        <a href="#" :class="{ active: activeView === 'extract' }" @click="activeView = 'extract'">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span class="nav-text">Transcript Extract</span>
        </a>
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="nav-text">Profile</span>
        </a>
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          <span class="nav-text">Settings</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <a href="#" @click.prevent="handleLogout" class="logout-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span class="nav-text">Logout</span>
        </a>
      </div>
    </aside>
    <main class="main-content">
      <div v-if="activeView === 'dashboard'" class="dashboard-view">
        <h1>Welcome, Student!</h1>
        <p>This is your dashboard. You can navigate using the sidebar.</p>
      </div>
      <div v-if="activeView === 'upload'" class="upload-view">
        <h2>Upload Transcript of Records</h2>
        <div class="upload-box">
          <input type="file" @change="handleFileUpload" accept=".jpg, .jpeg, .png, .pdf" />
          <p>Drag and drop your file here or click to browse.</p>
        </div>

        <div v-if="filePreviewUrl" class="image-preview-section">
          <h3>Preview:</h3>
          <img :src="filePreviewUrl" alt="Transcript Preview" class="image-preview" />
        </div>

        <div v-if="uploadedFile" class="extraction-section">
          <p>File selected: <strong>{{ uploadedFile.name }}</strong></p>
          <button @click="handleExtraction" :disabled="isExtracting">
            <span v-if="isExtracting">Extracting... ({{ extractionProgress }}%)</span>
            <span v-else>Extract Text</span>
          </button>
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
       <div v-if="activeView === 'extract'" class="extract-view">
        <TranscriptExtract />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f4f7fa;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-size: 2rem;
}

.sidebar-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
}

.sidebar-nav a,
.logout-button {
  color: #ecf0f1;
  text-decoration: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.sidebar-nav a svg,
.logout-button svg {
  min-width: 24px;
}

.sidebar-nav a:hover,
.sidebar-nav a.active {
  background-color: #34495e;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #34495e;
}

.logout-button {
  background-color: transparent;
  border-radius: 8px;
  width: 100%;
  margin-bottom: 0.5rem;
}

.logout-button:hover {
  background-color: #e74c3c;
}

.main-content {
  margin-left: 250px;
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
}

.dashboard-view h1,
.upload-view h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.upload-box {
  border: 2px dashed #bdc3c7;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  background-color: #ffffff;
}

.upload-box input[type="file"] {
  display: block;
  margin: 0 auto 1rem;
}

.upload-box p {
  color: #7f8c8d;
}

.extraction-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  text-align: center;
}

.image-preview-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  text-align: center;
}

.image-preview {
  max-width: 100%;
  max-height: 500px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-top: 1rem;
}

.extraction-section button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.extraction-section button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.extracted-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  color: #2c3e50;
}

.curriculum-view {
  margin-top: 2rem;
}

.year-section h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.semester-section h3 {
  font-size: 1.5rem;
  color: #34495e;
  margin-bottom: 1rem;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.courses-table th,
.courses-table td {
  border: 1px solid #dee2e6;
  padding: 0.8rem 1rem;
  text-align: left;
}

.courses-table th {
  background-color: #f2f2f2;
  font-weight: 600;
  color: #333;
}
</style>
