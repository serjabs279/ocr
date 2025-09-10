<script setup lang="ts">
// This imports the ref and computed functions from the vue library, which are used to create reactive variables and computed properties.
import { ref, computed } from 'vue';
// This imports the createWorker function from the tesseract.js library, which is used to create a new Tesseract.js worker.
import { createWorker } from 'tesseract.js';
// This imports the pdfjs-dist library, which is used to parse and render PDF files.
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// This imports the TranscriptExtract component, which is used to display the extracted transcript.
import TranscriptExtract from './TranscriptExtract.vue';

// This sets the worker source for the pdfjs-dist library.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

// This defines the events that this component can emit.
const emit = defineEmits(['logout']);
// This creates a reactive variable that stores the active view.
const activeView = ref('upload');
// This creates a reactive variable that stores the uploaded file.
const uploadedFile = ref<File | null>(null);
// This creates a reactive variable that stores the URL of the file preview.
const filePreviewUrl = ref<string | null>(null);
// This creates a reactive variable that determines whether the text is being extracted or not.
const isExtracting = ref(false);
// This creates a reactive variable that stores the progress of the text extraction.
const extractionProgress = ref(0);
// This creates a reactive variable that stores the extracted text.
const extractedText = ref('');

// This defines the interface for a course.
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

// This defines the interface for a semester.
interface Semester {
  title: string;
  courses: Course[];
  totalLec?: string;
  totalLab?: string;
  totalUnits?: string;
}

// This defines the interface for a year.
interface Year {
  title: string;
  semesters: Semester[];
}

// This function is called when the user uploads a file.
const handleFileUpload = (event: Event) => {
  // This gets the file from the event.
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  // This revokes the object URL of the previous file preview, if any.
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
  }

  // This checks if a file was uploaded.
  if (file) {
    // This sets the uploadedFile variable to the uploaded file.
    uploadedFile.value = file;
    // This resets the extractedText variable.
    extractedText.value = '';

    // This checks if the file is an image.
    if (file.type.startsWith('image/')) {
      // This creates a URL for the file preview.
      filePreviewUrl.value = URL.createObjectURL(file);
    } else {
      // This resets the filePreviewUrl variable.
      filePreviewUrl.value = null;
    }
  }
};

// This function is called when the user clicks the "Extract Text" button.
const handleExtraction = async () => {
  // This checks if a file was uploaded.
  if (!uploadedFile.value) return;

  // This sets the isExtracting variable to true.
  isExtracting.value = true;
  // This resets the extractionProgress variable.
  extractionProgress.value = 0;
  // This resets the extractedText variable.
  extractedText.value = '';

  try {
    // This checks if the file is a PDF.
    if (uploadedFile.value.type === 'application/pdf') {
      // This reads the file as an array buffer.
      const arrayBuffer = await uploadedFile.value.arrayBuffer();
      // This gets the PDF document.
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      // This gets the number of pages in the PDF.
      const numPages = pdf.numPages;
      // This creates a variable to store the full text.
      let fullText = '';

      // This loops through the pages of the PDF.
      for (let i = 1; i <= numPages; i++) {
        // This gets the page.
        const page = await pdf.getPage(i);
        // This gets the text content of the page.
        const textContent = await page.getTextContent();
        // This gets the text of the page.
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        // This adds the text of the page to the full text.
        fullText += pageText + '\n';
        // This updates the extraction progress.
        extractionProgress.value = Math.round((i / numPages) * 100);
      }
      // This sets the extractedText variable to the full text.
      extractedText.value = fullText;

    // This checks if the file is an image.
    } else if (uploadedFile.value.type.startsWith('image/')) {
      // This creates a new Tesseract.js worker.
      const worker = await createWorker('eng', 1, {
        // This logs the progress of the text extraction.
        logger: m => {
          if (m.status === 'recognizing text') {
            extractionProgress.value = Math.round(m.progress * 100);
          }
        }
      });

      // This recognizes the text in the image.
      const { data: { text } } = await worker.recognize(uploadedFile.value);
      // This sets the extractedText variable to the recognized text.
      extractedText.value = text;
      // This terminates the Tesseract.js worker.
      await worker.terminate();

    } else {
      // This sets the extractedText variable to an error message.
      extractedText.value = 'Unsupported file type. Please upload an image or a PDF.';
    }
  } catch (error) {
    // This logs the error to the console.
    console.error('Extraction Error:', error);
    // This sets the extractedText variable to an error message.
    extractedText.value = 'Error during text extraction.';
  } finally {
    // This sets the isExtracting variable to false.
    isExtracting.value = false;
  }
};

// This computed property parses the extracted text and returns a curriculum.
const parsedCurriculum = computed((): Year[] => {
  // This splits the extracted text into lines.
  const lines = extractedText.value.split('\n');
  // This creates an array to store the curriculum.
  const curriculum: Year[] = [];
  // This creates a variable to store the current year.
  let currentYear: Year | null = null;
  // This creates a variable to store the current semester.
  let currentSemester: Semester | null = null;

  // This defines the regex for a year.
  const yearRegex = /(FIRST|SECOND|THIRD|FOURTH) YEAR/i;
  // This defines the regex for a semester.
  const semesterRegex = /(FIRST|SECOND) SEMESTER/i;

  // This loops through the lines of the extracted text.
  for (const line of lines) {
    // This matches the year regex.
    const yearMatch = line.match(yearRegex);
    // This checks if a year was matched.
    if (yearMatch) {
        // This creates a new year.
        currentYear = { title: `${yearMatch[1].toUpperCase()} YEAR`, semesters: [] };
        // This pushes the new year to the curriculum.
        curriculum.push(currentYear);
    }

    // This matches the semester regex.
    const semesterMatch = line.match(semesterRegex);
    // This checks if a semester was matched and if there is a current year.
    if (semesterMatch && currentYear) {
      // This creates a new semester.
      currentSemester = { title: `${semesterMatch[1].toUpperCase()} SEMESTER`, courses: [] };
      // This pushes the new semester to the current year.
      currentYear.semesters.push(currentSemester);
    }

    // This checks if there is a current semester.
    if (currentSemester) {
      // This matches the course regex.
      const courseParts = line.match(/^([A-Z][A-Za-z\s.&,]+?)\s+([A-Z]{2,}\s?\d{3,}[A-Z]?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/);

      // This checks if a course was matched.
      if (courseParts) {
        // This gets the course parts.
        const [, descriptiveTitle, courseNo, lec, lab, units, rest] = courseParts;
        
        // This gets the pre-requisites and co-requisites.
        const preCoReqs = rest.trim().split(/\s{2,}/);
        const preRequisites = preCoReqs[0] || 'None';
        const coRequisites = preCoReqs[1] || 'None';

        // This pushes the new course to the current semester.
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
      // This checks if the line contains "Total".
      } else if (line.toLowerCase().includes('total')) {
          // This matches the total regex.
          const totalMatch = line.match(/Total\s+(\d+)\s+(\d+)\s+(\d+)/);
          // This checks if a total was matched and if there is a current semester.
          if (totalMatch && currentSemester) {
              // This sets the total lec, lab, and units for the current semester.
              currentSemester.totalLec = totalMatch[1];
              currentSemester.totalLab = totalMatch[2];
              currentSemester.totalUnits = totalMatch[3];
          }
      }
    }
  }

  // This returns the curriculum.
  return curriculum;
});

// This function is called when the user clicks the "Logout" button.
const handleLogout = () => {
  // This emits the "logout" event, which is handled by the parent component.
  emit('logout');
};
</script>

<template>
  // This is the main container for the dashboard.
  <div class="dashboard-layout">
    // This is the sidebar of the dashboard.
    <aside class="sidebar">
      // This is the header of the sidebar.
      <div class="sidebar-header">
        // This is the logo of the dashboard.
        <span class="logo">🎓</span>
        // This is the title of the sidebar.
        <h2 class="sidebar-title">Dashboard</h2>
      </div>
      // This is the navigation of the sidebar.
      <nav class="sidebar-nav">
        // This is the dashboard link.
        <a href="#" :class="{ active: activeView === 'dashboard' }" @click="activeView = 'dashboard'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="nav-text">Dashboard</span>
        </a>
        // This is the upload link.
        <a href="#" :class="{ active: activeView === 'upload' }" @click="activeView = 'upload'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          <span class="nav-text">Upload TOR</span>
        </a>
        // This is the transcript extract link.
        <a href="#" :class="{ active: activeView === 'extract' }" @click="activeView = 'extract'">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span class="nav-text">Transcript Extract</span>
        </a>
        // This is the profile link.
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="nav-text">Profile</span>
        </a>
        // This is the settings link.
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          <span class="nav-text">Settings</span>
        </a>
      </nav>
      // This is the footer of the sidebar.
      <div class="sidebar-footer">
        // This is the logout button.
        <a href="#" @click.prevent="handleLogout" class="logout-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span class="nav-text">Logout</span>
        </a>
      </div>
    </aside>
    // This is the main content of the dashboard.
    <main class="main-content">
      // This is the dashboard view.
      <div v-if="activeView === 'dashboard'" class="dashboard-view">
        <h1>Welcome, Student!</h1>
        <p>This is your dashboard. You can navigate using the sidebar.</p>
      </div>
      // This is the upload view.
      <div v-if="activeView === 'upload'" class="upload-view">
        <h2>Upload Transcript of Records</h2>
        // This is the upload box.
        <div class="upload-box">
          <input type="file" @change="handleFileUpload" accept=".jpg, .jpeg, .png, .pdf" />
          <p>Drag and drop your file here or click to browse.</p>
        </div>

        // This is the image preview section.
        <div v-if="filePreviewUrl" class="image-preview-section">
          <h3>Preview:</h3>
          <img :src="filePreviewUrl" alt="Transcript Preview" class="image-preview" />
        </div>

        // This is the extraction section.
        <div v-if="uploadedFile" class="extraction-section">
          <p>File selected: <strong>{{ uploadedFile.name }}</strong></p>
          <button @click="handleExtraction" :disabled="isExtracting">
            <span v-if="isExtracting">Extracting... ({{ extractionProgress }}%)</span>
            <span v-else>Extract Text</span>
          </button>
        </div>

        // This is the curriculum view.
        <div v-if="parsedCurriculum.length > 0" class="curriculum-view">
          // This loops through the years of the curriculum.
          <div v-for="year in parsedCurriculum" :key="year.title" class="year-section">
            <h2>{{ year.title }}</h2>
            // This loops through the semesters of the year.
            <div v-for="semester in year.semesters" :key="semester.title" class="semester-section">
              <h3>{{ semester.title }}</h3>
              // This is the courses table.
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
                  // This loops through the courses of the semester.
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
                // This is the footer of the courses table.
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
        // This is the extracted text view.
        <div v-else-if="extractedText.length > 0">
          <h3>Extracted Text Result:</h3>
          <pre class="extracted-text">{{ extractedText }}</pre>
        </div>
      </div>
       // This is the extract view.
       <div v-if="activeView === 'extract'" class="extract-view">
        <TranscriptExtract />
      </div>
    </main>
  </div>
</template>

<style scoped>
// This is where the styles for the StudentDashboard component are defined. The "scoped" attribute means that the styles will only apply to this component.
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
