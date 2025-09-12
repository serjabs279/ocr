<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Transcript OCR Extractor</h1>

    <!-- File Upload -->
    <input type="file" @change="handleFileUpload" accept="image/*" class="mb-4" />

    <!-- Progress -->
    <div v-if="progress > 0 && progress < 100" class="mb-4">
      <p class="text-blue-600">Processing: {{ progress }}%</p>
    </div>

    <!-- OCR Table Result -->
    <div v-if="courses.length" class="mt-6 overflow-x-auto">
      <h2 class="text-xl font-semibold mb-3">Extracted Courses</h2>
      <table class="w-full border border-gray-300 text-sm">
        <thead class="bg-gray-200">
          <tr>
            <th class="border p-2 text-left">Course No.</th>
            <th class="border p-2 text-left">Descriptive Title</th>
            <th class="border p-2 text-left">LEC</th>
            <th class="border p-2 text-left">LAB</th>
            <th class="border p-2 text-left">Units</th>
            <th class="border p-2 text-left">Pre-req</th>
            <th class="border p-2 text-left">Co-req</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(course, index) in courses" :key="index">
            <td class="border p-2 text-left">{{ course.courseNo }}</td>
            <td class="border p-2 text-left">{{ course.title }}</td>
            <td class="border p-2 text-left">{{ course.lec }}</td>
            <td class="border p-2 text-left">{{ course.lab }}</td>
            <td class="border p-2 text-left">{{ course.units }}</td>
            <td class="border p-2 text-left">{{ course.prereq }}</td>
            <td class="border p-2 text-left">{{ course.coreq }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Raw OCR (debugging) -->
    <div v-if="ocrText" class="mt-6">
      <h2 class="font-semibold mb-2">Raw OCR Text (debug):</h2>
      <pre class="bg-gray-100 p-3 rounded whitespace-pre-wrap">{{ ocrText }}</pre>
    </div>
  </div>
</template>

<script>
import Tesseract from "tesseract.js";

export default {
  name: "TranscriptOCR",
  data() {
    return {
      ocrText: "",
      progress: 0,
      courses: [],
    };
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.ocrText = "";
      this.progress = 0;
      this.courses = [];

      Tesseract.recognize(file, "eng", {
        tessedit_pageseg_mode: 6, // PSM 6: uniform block
        logger: (m) => {
          if (m.status === "recognizing text") {
            this.progress = Math.round(m.progress * 100);
          }
        },
      }).then(({ data: { text } }) => {
        this.ocrText = text;
        this.extractCourses(text);
      });
    },

    // ✅ Clean OCR text before parsing
    cleanOCRText(text) {
      let cleaned = text
        .replace(/[_\\\[\\\]\\\|=]+/g, " ")   // remove garbage symbols
        .replace(/([a-z])([A-Z])/g, "$1 $2") // split stuck words
        .replace(/\\s{2,}/g, " ")       // collapse spaces
        .replace(/\\bNome\\b/gi, "None")
        .replace(/\\bNowe\\b/gi, "None")
        .trim();

      // ✅ Auto-correction dictionary
      const corrections = {
        Fundemenuals: "Fundamentals",
        Progrzuming: "Programming",
        "Undeandingthesell": "Understanding the Self",
        Mathers: "Mathematics",
        Modem: "Modern",
        Puposive: "Purposive",
        Progrem: "Program",
        Homsn: "Human",
        interncdon: "Interaction",
        BusinesProcessDesignand: "Business Process Design and",
        Commanitis: "Communities",
        Mensgemem: "Management",
        Manial: "Martial",
      };

      Object.keys(corrections).forEach((wrong) => {
        const regex = new RegExp(wrong, "gi");
        cleaned = cleaned.replace(regex, corrections[wrong]);
      });

      return cleaned;
    },

    // ✅ Extract structured courses
    extractCourses(text) {
      const cleanedText = this.cleanOCRText(text);
      const lines = cleanedText.split("\\n").map((l) => l.trim()).filter(Boolean);

      // Flexible pattern: title can be messy, course code is [LETTERS+NUMBERS]
      const coursePattern =
        /^(.+?)\\s+([A-Z]{2,}\\d{2,})\\s+(\\d)\\s+(\\d)\\s+(\\d)\\s+(None|[A-Z0-9/ ]+)?$/i;

      this.courses = [];

      lines.forEach((line) => {
        const match = line.match(coursePattern);
        if (match) {
          this.courses.push({
            title: match[1].trim(),
            courseNo: match[2].trim(),
            lec: match[3],
            lab: match[4],
            units: match[5],
            prereq: match[6] && match[6] !== "None" ? match[6].trim() : "-",
            coreq: "-",
          });
        }
      });
    }
  },
};
</script>

<style>
body {
  font-family: sans-serif;
}
</style>
