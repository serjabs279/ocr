<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  extractedText: {
    type: String,
    default: ''
  }
});

const parsedRows = computed(() => {
  if (!props.extractedText) return [];

  const words = props.extractedText.split(/\s+/).map(w => w.trim()).filter(w => w);

  const rows = [];
  let currentSubject = [];

  const gradePattern = /^\d(\.\d)?$/;
  const unitPattern = /^[1-9]$/;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (gradePattern.test(word) && i + 1 < words.length && unitPattern.test(words[i + 1])) {
      rows.push({
        subject: currentSubject.join(" ").trim(),
        grade: word,
        units: words[i + 1]
      });
      currentSubject = [];
      i++;
    } else {
      currentSubject.push(word);
    }
  }

  if (currentSubject.length > 0) {
      rows.push({
        subject: currentSubject.join(" ").trim(),
        grade: '',
        units: ''
      });
  }

  return rows;
});
</script>

<template>
  <div class="transcript-extract-container">
    <h2>Transcript Extract</h2>
    <p v-if="!extractedText" class="info-text">No transcript text has been extracted yet. Please upload a transcript in the "Upload TOR" section first.</p>
    <table v-else class="results-table">
      <thead>
        <tr>
          <th>Course / Subject</th>
          <th>Final Grade</th>
          <th>Units</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in parsedRows" :key="index">
          <td>{{ row.subject }}</td>
          <td>{{ row.grade }}</td>
          <td>{{ row.units }}</td>
        </tr>
      </tbody>
    </table>
    <button v-if="extractedText" @click="$emit('extractData')" class="extract-button">Extract Data</button>
  </div>
</template>

<style scoped>
.transcript-extract-container h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text-dark);
}

.info-text {
  color: var(--text-light);
  background-color: var(--feature-bg);
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid #444;
  text-align: center;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: var(--feature-bg);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.results-table th,
.results-table td {
  border: 1px solid #444;
  padding: 1rem 1.2rem;
  text-align: left;
}

.results-table th {
  background-color: #2a2a2a;
  font-weight: 600;
}

.results-table td {
    text-align: center;
}

.results-table td:first-child {
    text-align: left;
}

.extract-button {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s;
}

.extract-button:hover {
  background-color: #4cae4c;
}
</style>
