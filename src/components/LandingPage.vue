<script setup>
const emit = defineEmits(['login']);

const handleLogin = () => {
  emit('login');
};
</script>

<template>
  <div class="landing-page-container">
    <div class="landing-page">
      <header class="header">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          <span>Subject Evaluator</span>
        </div>
        <button class="login-button" @click="handleLogin">Log In</button>
      </header>

      <main class="main-content">
        <section class="hero">
          <div class="hero-text">
            <h1>Streamline Your Subject Evaluation Process</h1>
            <p>
              Our system simplifies the process of evaluating subjects for
              transferee students, ensuring a smooth and efficient transition.
            </p>
          </div>
          <div class="hero-image">
            <svg width="100%" height="100%" viewBox="0 0 531 501" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M425.412 104.041C392.649 133.562 366.521 168.348 359.138 213.606C350.291 267.863 361.69 332.99 339.231 382.49C316.402 432.85 259.943 467.243 205.908 459.13C152.091 451.05 102.261 400.953 73.1991 352.341C43.9999 303.483 35.6186 246.015 54.4925 195.83C73.4395 145.427 119.529 102.308 172.936 82.0282C226.547 61.666 287.541 64.1207 339.231 66.6993" fill="#EAF7F2"/>
              <path d="M379 1.00001C427 -1.99999 498.5 28 513 67.0001C530.5 113 494 179 481 209C469.5 235.5 441.5 261.5 410.5 264.5C379.5 267.5 362 245 348 221C334 197 304 152.5 301 113C298.5 79.5 331 4.00001 379 1.00001Z" fill="#D6EFE6"/>
              <path d="M397.747 31.7884C397.747 31.7884 410.144 103.111 366.657 122.569C323.169 142.026 290.757 85.6548 290.757 85.6548L281.334 29.873C281.334 29.873 294.67 -3.93041 332.617 0.730878C370.563 5.39217 397.747 31.7884 397.747 31.7884Z" fill="#4CAF50"/>
              <path d="M385.152 23.3642L378.188 84.7766C378.188 84.7766 322.215 84.7766 307.746 71.9333C293.277 59.09 299.117 23.3642 299.117 23.3642L385.152 23.3642Z" fill="#FFFFFF"/>
              <path d="M313.253 71.9333C313.253 71.9333 306.49 53.663 325.215 45.4057C343.94 37.1484 358.557 59.09 358.557 59.09L365.176 71.9333L313.253 71.9333Z" fill="#A5D6A7"/>
              <g filter="url(#filter0_d_101_2)">
                <rect x="110" y="120" width="300" height="250" rx="15" fill="white"/>
              </g>
              <text x="130" y="160" font-family="'Poppins', sans-serif" font-size="18" font-weight="600" fill="#333">Student Transcript</text>
              <rect x="130" y="185" width="260" height="10" rx="5" fill="#f2f2f2"/>
              <rect x="130" y="205" width="260" height="10" rx="5" fill="#f2f2f2"/>
              <rect x="130" y="225" width="180" height="10" rx="5" fill="#f2f2f2"/>
              <rect x="130" y="255" width="260" height="10" rx="5" fill="#e0e0e0"/>
              <rect x="130" y="275" width="260" height="10" rx="5" fill="#e0e0e0"/>
              <rect x="130" y="295" width="210" height="10" rx="5" fill="#e0e0e0"/>
              <rect x="130" y="325" width="100" height="30" rx="8" fill="#42b883"/>
              <text x="155" y="345" font-family="'Poppins', sans-serif" font-size="14" fill="white">Evaluate</text>
            </svg>
          </div>
        </section>

        <section class="features">
            <h2>Key Features</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 14.5h5v-5h-5v5zm-2 2h9v-9h-9v9zm-5 5h20v-20h-20v20zm2-2v-16h16v16h-16z"/></svg>
                    </div>
                    <h3>Automated OCR</h3>
                    <p>Extract text from transcripts automatically.</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10s10-4.48 10-10s-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                    </div>
                    <h3>Smart Formatting</h3>
                    <p>Automatically format extracted text into a clean, readable format.</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19.35 10.04c-.65-2.26-2.64-4.04-5.35-4.04-2.28 0-4.27 1.44-5.05 3.5C6.27 9.5 4 11.45 4 14c0 2.76 2.24 5 5 5h10c2.21 0 4-1.79 4-4 0-2.05-1.53-3.76-3.65-3.96z"/></svg>
                    </div>
                    <h3>Cloud Storage</h3>
                    <p>Securely store and access transcripts from anywhere.</p>
                </div>
            </div>
        </section>
      </main>

      <footer class="footer">
        <p>&copy; 2024 Subject Evaluation System. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

:root {
  --primary-color: #42b883;
  --primary-dark: #36a374;
  --secondary-color: #f0f2f5;
  --feature-bg: #ffffff;
  --text-dark: #2c3e50;
  --text-light: #606f7b;
  --white: #ffffff;
  --font-family: 'Poppins', sans-serif;
}

.landing-page-container {
  background-color: var(--secondary-color);
}

.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-dark);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header {
  padding: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--text-dark);
}

.logo svg {
  color: var(--primary-color);
}

.login-button {
    background-color: transparent;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
    padding: 0.8rem 1.8rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.login-button:hover {
    background-color: var(--primary-color);
    color: var(--white);
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  width: 100%;
  padding: 4rem 0;
}

.hero-text h1 {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  animation: slide-in 1s forwards;
}

.hero-text p {
  font-size: 1.25rem;
  color: var(--text-light);
  margin-bottom: 3rem;
  line-height: 1.6;
  animation: slide-in 1s forwards .2s;
}

.hero-image {
  animation: fade-in 1.2s forwards;
}

.features {
    text-align: center;
    padding: 6rem 0;
}

.features h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 4rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.feature-item {
    background: var(--feature-bg);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.feature-icon {
    background-color: var(--primary-color);
    color: var(--white);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.feature-icon svg {
    width: 30px;
    height: 30px;
}

.feature-item h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.feature-item p {
    color: var(--text-light);
    line-height: 1.6;
}

.footer {
  padding: 2rem 0;
  text-align: center;
  font-size: 0.9rem;
  color: #7f8c8d;
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
    .hero {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .hero-image {
        order: -1;
        margin-bottom: 3rem;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }

    .hero-text h1 {
        font-size: 2.8rem;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }
}
</style>