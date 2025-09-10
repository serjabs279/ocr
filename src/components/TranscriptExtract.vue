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

<script>
export default {
  // This is the component's data.
  data() {
    return {
      // This is the raw OCR text that will be parsed.
      ocrText: `
AR 111 Math 1 Math 2 Engl 1 Fil 1 AR 112 AR 113 AR 114 P.E. 1 NSTP 1
Introduction to Design College Algebra Plane Trigonometry
Study and Thinking Skills in English Komunikasyon sa Akademikong Filipino
Architectural Visual Communication 1 Architectural Visual Communication 2
Theory of Architecture 1 Physical Fitness and Gymnastics Civil Welfare Training Service
Final Grade 2.2 2.2 2.0 1.3 2.1 2.5 2.3 2.0 1.5 1.5
Units 3 3 3 3 3 2 2 2 3 2
`
    };
  },
  // This is the component's computed properties.
  computed: {
    // This computed property parses the OCR text and returns an array of rows.
    parsedRows() {
      // This splits the OCR text into an array of words.
      const words = this.ocrText.split(/\s+/).map(w => w.trim()).filter(w => w);

      // This is the array that will store the parsed rows.
      const rows = [];
      // This is the array that will store the current subject.
      let currentSubject = [];

      // This is the regex pattern for a grade.
      const gradePattern = /^\d(\.\d)?$/;   // matches 1.0, 2.5, 3.0, etc.
      // This is the regex pattern for a unit.
      const unitPattern = /^[1-9]$/;        // matches 1–9 only

      // This loops through the words array.
      for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // This checks if the current word is a grade and the next word is a unit.
        if (gradePattern.test(word) && i + 1 < words.length && unitPattern.test(words[i + 1])) {
          // This pushes a new row to the rows array.
          rows.push({
            subject: currentSubject.join(" ").trim(),
            grade: word,
            units: words[i + 1]
          });
          // This resets the current subject.
          currentSubject = []; // reset
          // This skips the next word (the unit) because we've already processed it.
          i++; // skip the unit we already consumed
        } else {
          // This pushes the current word to the current subject array.
          currentSubject.push(word);
        }
      }

      // This returns the parsed rows.
      return rows;
    }
  }
};
</script>
