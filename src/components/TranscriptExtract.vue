<script setup>
import { ref, computed } from 'vue';

const ocrText = ref(`
AR 111 Math 1 Math 2 Engl 1 Fil 1 AR 112 AR 113 AR 114 P.E. 1 NSTP 1
Introduction to Design College Algebra Plane Trigonometry
Study and Thinking Skills in English Komunikasyon sa Akademikong Filipino
Architectural Visual Communication 1 Architectural Visual Communication 2
Theory of Architecture 1 Physical Fitness and Gymnastics Civil Welfare Training Service
Final Grade 2.2 2.2 2.0 1.3 2.1 2.5 2.3 2.0 1.5 1.5
Units 3 3 3 3 3 2 2 2 3 2
`);

const parsedRows = computed(() => {
  const words = ocrText.value.split(/\s+/).map(w => w.trim()).filter(w => w);

  const rows = [];
  let currentSubject = [];

  const gradePattern = /^\d(\.\d)?$/; // matches 1.0, 2.5, 3.0, etc.
  const unitPattern = /^[1-9]$/; // matches 1–9 only

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (gradePattern.test(word) && i + 1 < words.length && unitPattern.test(words[i + 1])) {
      rows.push({
        subject: currentSubject.join(" ").trim(),
        grade: word,
        units: words[i + 1]
      });
      currentSubject = []; // reset
      i++; // skip the unit we already consumed
    } else {
      currentSubject.push(word);
    }
  }

  return rows;
});
</script>

<template>
  <!-- This is the main container for the transcript extract view. -->
  <div class="p-6">
    <!-- This is the title of the view. -->
    <h2 class="text-xl font-bold mb-4">Transcript Extract</h2>

    <!-- This is the table that displays the parsed transcript data. -->
    <table class="w-full border-collapse border border-gray-400 text-sm">
      <!-- This is the table header. -->
      <thead class="bg-gray-200">
        <tr>
          <th class="border border-gray-400 px-2 py-1 text-left">Course / Subject</th>
          <th class="border border-gray-400 px-2 py-1 text-center">Final Grade</th>
          <th class="border border-gray-400 px-2 py-1 text-center">Units</th>
        </tr>
      </thead>
      <!-- This is the table body. -->
      <tbody>
        <!-- This loops through the parsed rows and displays each one in a table row. -->
        <tr v-for="(row, index) in parsedRows" :key="index">
          <td class="border border-gray-300 px-2 py-1">{{ row.subject }}</td>
          <td class="border border-gray-300 px-2 py-1 text-center">{{ row.grade }}</td>
          <td class="border border-gray-300 px-2 py-1 text-center">{{ row.units }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>
