<script setup lang="ts">
const emit = defineEmits(['get-started']);

const handleClick = () => {
  emit('get-started');
};
</script>

<template>
  <div class="landing-page">
    <header class="header">
      <h1>Web-Based Subject Evaluation System for Transferee Students</h1>
    </header>

    <main class="main-content">
      <section class="hero">
        <h2>Streamline Your Subject Evaluation Process</h2>
        <p>
          Our system simplifies the process of evaluating subjects for transferee
          students, ensuring a smooth and efficient transition.
        </p>
        <button class="cta-button" @click="handleClick">Get Started</button>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; 2024 Subject Evaluation System. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f0f2f5;
}

.header {
  background-color: #ffffff;
  padding: 2rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #34495e;
}

.main-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.hero {
  max-width: 600px;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 2rem;
}

.cta-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #36a374;
}

.footer {
  background-color: #ffffff;
  padding: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}
</style>
