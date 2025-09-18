<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['logout']);
const activeView = ref('dashboard');
const isModalVisible = ref(false);
const activeApprovalId = ref(null);
const creditedCourses = ref([]);
const chosenCourses = ref([]);

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

const pendingApprovals = ref([
  {
    id: 1,
    studentName: 'Juan dela Cruz',
    fileName: 'tor_juan_dela_cruz.pdf',
    status: 'Pending',
    torCourses: [
      { id: 'math101', name: 'College Algebra', units: 3 },
      { id: 'eng101', name: 'English Composition', units: 3 },
      { id: 'cs101', name: 'Introduction to Computer Science', units: 3 },
    ]
  },
  {
    id: 2,
    studentName: 'Maria Clara',
    fileName: 'tor_maria_clara.pdf',
    status: 'Pending',
    torCourses: [
      { id: 'phy101', name: 'General Physics I', units: 4 },
      { id: 'chem101', name: 'General Chemistry I', units: 4 },
    ]
  },
  {
    id: 3,
    studentName: 'Jose Rizal',
    fileName: 'tor_jose_rizal.pdf',
    status: 'Pending',
    torCourses: [
      { id: 'hist101', name: 'Philippine History', units: 3 },
    ]
  },
]);

const availableCourses = ref([
    { id: 'bsit-101', name: 'BSIT Course 1', units: 3 },
    { id: 'bsit-102', name: 'BSIT Course 2', units: 3 },
    { id: 'bsit-103', name: 'BSIT Course 3', units: 4 },
    { id: 'bse-101', name: 'BSE Course 1', units: 3 },
    { id: 'bse-102', name: 'BSE Course 2', units: 3 },
]);

const selectedTorCourseIds = ref([]);
const selectedAvailableCourseIds = ref([]);

const activeApproval = computed(() => 
  pendingApprovals.value.find(a => a.id === activeApprovalId.value)
);

const handleStatusClick = (approval) => {
  alert(`Status for ${approval.studentName} is currently ${approval.status}.`);
};

const openModal = (approval) => {
  activeApprovalId.value = approval.id;
  selectedTorCourseIds.value = approval.torCourses.map(c => c.id);
  selectedAvailableCourseIds.value = [];
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const saveEquivalency = () => {
  if (activeApproval.value) {
    activeApproval.value.status = 'Processing';

    notifications.value.unshift({
      id: notifications.value.length + 1,
      studentName: activeApproval.value.studentName,
      message: `The TOR of ${activeApproval.value.studentName} is now under evaluation.`,
    });
    
    creditedCourses.value = activeApproval.value.torCourses.filter(course => 
      selectedTorCourseIds.value.includes(course.id)
    );

    chosenCourses.value = availableCourses.value.filter(course =>
      selectedAvailableCourseIds.value.includes(course.id)
    );

    closeModal();
    activeView.value = 'subjects';
  }
};

const finalizeEvaluation = () => {
  if (activeApproval.value) {
    activeApproval.value.status = 'Evaluation Done';

     notifications.value.unshift({
      id: notifications.value.length + 1,
      studentName: activeApproval.value.studentName,
      message: `The evaluation for ${activeApproval.value.studentName} is complete.`,
    });

    printEvaluation();
    activeView.value = 'approvals';
    activeApprovalId.value = null; 
  }
};

const printEvaluation = () => {
  window.print();
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
        <table class="approvals-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>File Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="approval in pendingApprovals" :key="approval.id">
              <td>{{ approval.studentName }}</td>
              <td>
                <a href="#" @click.prevent="openModal(approval)">{{ approval.fileName }}</a>
              </td>
              <td>
                <span 
                  :class="['status-banner', `status-${approval.status.toLowerCase().replace(/ /g, '-')}`]"
                  @click="handleStatusClick(approval)">
                  {{ approval.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

       <div v-if="activeView === 'subjects'" class="view-container">
        <div class="header no-print">
            <h2>Subject Management</h2>
            <p>Review the credited subjects and the new curriculum for the student.</p>
        </div>

        <div class="evaluation-layout" v-if="creditedCourses.length > 0 || chosenCourses.length > 0">
            <div class="evaluation-tables">
                <div class="table-container">
                    <h3>New Curriculum Subjects</h3>
                    <table class="evaluation-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Units</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="course in chosenCourses" :key="course.id">
                                <td>{{ course.name }}</td>
                                <td>{{ course.units }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="table-container">
                    <h3>Credited Subjects</h3>
                    <table class="evaluation-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Units</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="course in creditedCourses" :key="course.id">
                                <td>{{ course.name }}</td>
                                <td>{{ course.units }}</td>
                                <td><span class="credited-tag">Credited</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="evaluation-actions no-print">
                <button class="print-button" @click="finalizeEvaluation">Save as PDF and Print</button>
            </div>
        </div>
         <div v-else class="no-evaluation">
            <p>No evaluation data to display. Please process a student's application first.</p>
        </div>
    </div>

       <div v-if="isModalVisible && activeApproval" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Course Equivalency for {{ activeApproval.studentName }}</h2>
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="course-panel">
            <h3>Available Courses</h3>
            <ul>
              <li v-for="course in availableCourses" :key="course.id">
                <label>
                  <input type="checkbox" :value="course.id" v-model="selectedAvailableCourseIds">
                  {{ course.name }} ({{ course.units }} units)
                </label>
              </li>
            </ul>
          </div>
          <div class="course-panel">
            <h3>Extracted TOR Courses</h3>
            <ul>
              <li v-for="course in activeApproval.torCourses" :key="course.id">
                <label>
                  <input type="checkbox" :value="course.id" v-model="selectedTorCourseIds">
                   {{ course.name }} ({{ course.units }} units)
                </label>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
            <button class="save-button" @click="saveEquivalency">Save Equivalency</button>
        </div>
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

/* Approvals Table */
.approvals-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-dark);
}

.approvals-table th,
.approvals-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #374151;
}

.approvals-table th {
  background-color: #1F2937;
  font-weight: 600;
}

.approvals-table a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.approvals-table a:hover {
  text-decoration: underline;
}

.status-banner {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-block;
  text-transform: capitalize;
  cursor: pointer;
  user-select: none;
}

.status-pending {
  background-color: #FBBF24;
  color: #111827;
}

.status-processing {
  background-color: #3B82F6;
  color: #ffffff;
}

.status-evaluation-done {
    background-color: #10B981;
    color: #ffffff;
}

.status-approved-for-advising {
  background-color: #34D399;
  color: #111827;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1F2937;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-dark);
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-light);
  cursor: pointer;
}

.modal-body {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
}

.course-panel {
  flex: 1;
  background-color: #111827;
  border-radius: 8px;
  padding: 1.5rem;
}

.course-panel h3 {
    color: var(--text-dark);
    margin: 0 0 1.5rem 0;
    border-bottom: 1px solid #374151;
    padding-bottom: 1rem;
}

.course-panel ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 400px;
    overflow-y: auto;
}

.course-panel li {
    margin-bottom: 1rem;
}

.course-panel label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-light);
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #374151;
    display: flex;
    justify-content: flex-end;
}

.save-button {
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.save-button:hover {
    background-color: var(--primary-dark);
}

/* Subject Management */
.evaluation-layout {
    background-color: #1F2937;
    border-radius: 8px;
    padding: 2rem;
    border: 1px solid #374151;
}

.evaluation-tables {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
}

.table-container {
    flex: 1;
}

.table-container h3 {
    font-size: 1.25rem;
    color: var(--text-dark);
    margin-bottom: 1rem;
}

.evaluation-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #374151;
}

.evaluation-table th, .evaluation-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #374151;
    color: var(--text-light);
}

.evaluation-table th {
    color: var(--text-dark);
    font-weight: 600;
    background-color: #111827;
}

.credited-tag {
    background-color: #34D399;
    color: #111827;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
}

.print-button {
    background-color: var(--primary-color);
    color: #ffffff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.print-button:hover {
    background-color: var(--primary-dark);
}

.no-evaluation {
    text-align: center;
    padding: 3rem;
    background-color: #1F2937;
    border-radius: 8px;
}

@media print {
  .no-print, .sidebar, .header, .notification-stack, .approvals-table, .modal-overlay, .evaluation-actions {
    display: none;
  }

  .main-content {
      padding: 0;
  }

  .evaluation-layout {
      background-color: #ffffff;
      color: #000000;
      border: none;
  }

  .evaluation-table th, .evaluation-table td, .table-container h3 {
      color: #000000 !important;
      border-color: #dddddd !importan;
  }

  .evaluation-table th {
      background-color: #f2f2f2 !important;
  }

  .credited-tag {
      background-color: #34D399 !important;
      color: #111827 !important;
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact;
  }
}
</style>
