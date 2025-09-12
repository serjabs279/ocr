<script setup>
import { ref, onMounted } from 'vue';

const ocrText = ref(`
|__ [Fundemenuals of Progrzuming [rec iol | = | 5 | 3 | Nowe | |
| Fundamentals of Information Systems [1S100 | 3 | 0 | 3 | Nome | |
| [Undeandingthesell _ JGEOI | 5 | 0 | 3 | Nome | |
[Mathers inthe Modem World [GEO3 | 3 | 0 | 5 | Nowe | |
| |Puposive Communication GEG | 3 | 0 | 3 | None | |
[National Service Training Progrem 1__[NSTP1__| 3 [ 0 | 3 | Nome | |
`);

const formattedText = ref("");

const formatText = () => {
  const rows = ocrText.value
    .split("\n")
    .map((line) =>
      line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((col) => col.trim())
    )
    .filter((row) => row.length > 0 && row.some(col => col));

  if (rows.length === 0) return;

  const colWidths = [];
  rows.forEach((row) => {
    row.forEach((col, i) => {
      colWidths[i] = Math.max(colWidths[i] || 0, col.length);
    });
  });

  formattedText.value = rows
    .map((row) =>
      row.map((col, i) => col.padEnd(colWidths[i], " ")).join(" | ")
    )
    .join("\n");
};

onMounted(() => {
  formatText();
});
</script>

<template>
  <div class="p-4">
    <h2 class="text-lg font-bold mb-2">OCR Auto Formatter</h2>

    <h3 class="mt-4 font-semibold">Formatted Output</h3>
    <pre class="bg-gray-100 p-3 rounded font-mono text-sm whitespace-pre">
{{ formattedText }}
    </pre>
  </div>
</template>

<style scoped>
pre {
  overflow-x: auto;
}
</style>
