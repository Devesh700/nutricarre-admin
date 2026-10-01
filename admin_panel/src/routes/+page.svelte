<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let session = $state(null);
  let showQrModal = $state(false);

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  });

  function handleAdminClick() {
    if (session) {
      goto('/admin/dashboard');
    } else {
      goto('/admin');
    }
  }
</script>

<svelte:head>
  <title>DietWise - Personalised Nutrition & Diet Management App</title>
  <meta name="description" content="DietWise is your ultimate nutrition companion. Download our Android app on Google Play to get personalized diet plans, track calories, and connect with expert dietitians." />
</svelte:head>

<div class="landing-page">
  <!-- Top Navigation Bar -->
  <nav class="navbar">
    <div class="container nav-content">
      <a href="/" class="brand">
        <img src="/logo_transparent.png" alt="DietWise Brand Logo" class="brand-logo" />
        <span class="brand-title">DietWise</span>
      </a>

      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#screenshots">App Showcase</a>
        <a href="#download" class="highlight-link">Google Play App</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
        <button class="btn-admin" onclick={handleAdminClick}>
          <span>🔑</span> Admin Portal
        </button>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="hero">
    <div class="container hero-grid">
      <div class="hero-text">
        <div class="play-badge">
          <span class="green-dot"></span> Official Google Play Release
        </div>

        <h1>Personalised Nutrition & Diet Management in Your Pocket</h1>
        <p class="hero-description">
          Achieve your fitness goals with custom diet schedules, macro calculators, direct dietitian consultation, and healthy recipe reels—all in one seamless mobile experience.
        </p>

        <!-- CTA Action Row -->
        <div class="hero-ctas">
          <a href="#download" class="playstore-btn">
            <svg viewBox="0 0 24 24" class="play-icon" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.97C19.46,13.59 19.46,12.41 18.81,12.03L16.81,10.88L14.81,12.88L16.81,15.12M4.6,22.61L15.39,11.82L15.39,12.18L4.6,1.39C4.85,1.14 5.23,1 5.64,1.17L16.03,7.17L13.69,9.5L4.6,0.41M13.69,14.5L16.03,16.83L5.64,22.83C5.23,23 4.85,22.86 4.6,22.61Z" />
            </svg>
            <div class="btn-text">
              <span class="sub font-mono">GET IT ON</span>
              <span class="main">Google Play</span>
            </div>
          </a>

          <button class="qr-btn" onclick={() => showQrModal = true}>
            <span>📱</span> Scan QR Code
          </button>
        </div>

        <!-- Rating & Metrics -->
        <div class="metrics-row">
          <div class="metric">
            <span class="stars">★★★★★</span>
            <span class="metric-val">4.9 / 5.0</span>
            <span class="metric-sub">12,400+ User Reviews</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric">
            <span class="metric-val">100,000+</span>
            <span class="metric-sub">Active Downloads</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric">
            <span class="metric-val">Free</span>
            <span class="metric-sub">On Google Play Store</span>
          </div>
        </div>
      </div>

      <!-- App Preview Frame -->
      <div class="hero-media">
        <div class="phone-frame shadow-2xl">
          <div class="phone-screen">
            <div class="app-header-mock">
              <img src="/logo_transparent.png" alt="DietWise" class="mock-logo" />
              <div>
                <strong>DietWise Mobile</strong>
                <span>Today's Meal Target</span>
              </div>
            </div>

            <div class="mock-card calorie-card">
              <div class="cal-title">Daily Calorie Target</div>
              <div class="cal-big">1,850 <span>/ 2,200 kcal</span></div>
              <div class="progress-bar-bg">
                <div class="progress-fill" style="width: 84%"></div>
              </div>
              <div class="macro-grid">
                <div>Protein: 140g</div>
                <div>Carbs: 180g</div>
                <div>Fats: 55g</div>
              </div>
            </div>

            <div class="mock-card meal-item">
              <div class="meal-icon">🥑</div>
              <div class="meal-info">
                <strong>Avocado & Egg Salad</strong>
                <span>Breakfast • 420 kcal</span>
              </div>
              <span class="badge-done">Done</span>
            </div>

            <div class="mock-card meal-item">
              <div class="meal-icon">🍗</div>
              <div class="meal-info">
                <strong>Grilled Chicken Bowl</strong>
                <span>Lunch • 650 kcal</span>
              </div>
              <span class="badge-done">Done</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Features Grid Section -->
  <section id="features" class="features-section">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">WHY DIETWISE</span>
        <h2>Designed for Real Results & Healthy Habits</h2>
        <p>Everything you need to plan, track, and sustain your nutritional goals.</p>
      </div>

      <div class="grid-3">
        <div class="feature-card">
          <div class="feature-icon bg-blue">🥗</div>
          <h3>Tailored Meal Schedules</h3>
          <p>Automated meal templates customized by dietitians for weight loss, muscle gain, or clinical diets.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon bg-green">👨‍⚕️</div>
          <h3>Expert Consultant Chat</h3>
          <p>Direct 1-on-1 messaging with certified nutrition coaches to guide your daily nutrition choices.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon bg-purple">🎥</div>
          <h3>Healthy Recipe Reels</h3>
          <p>Explore short educational videos and step-by-step healthy cooking reels directly in the app.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon bg-amber">⚡</div>
          <h3>WhatsApp Reminders</h3>
          <p>Never miss a meal or water intake target with automated WhatsApp notifications.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon bg-red">📊</div>
          <h3>Progress & Macro Analytics</h3>
          <p>Track your daily calorie targets, weight trends, and macronutrient balance with clean visual charts.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon bg-teal">🔒</div>
          <h3>Bank-Grade Data Privacy</h3>
          <p>Your biometric and health data is encrypted and strictly protected under GDPR privacy standards.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Screenshots / App Highlights Section -->
  <section id="screenshots" class="screenshots-section">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">INSIDE THE APP</span>
        <h2>Experience the DietWise Interface</h2>
      </div>

      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="sc-badge">Meal Planner</div>
          <h4>Smart Calorie Tracker</h4>
          <p>Log meals instantly with nutrient auto-calculation and barcode scan support.</p>
        </div>
        <div class="showcase-card">
          <div class="sc-badge">Consultant Hub</div>
          <h4>Personal Dietitian</h4>
          <p>Receive personalized adjustments to your weekly meal plan based on your progress.</p>
        </div>
        <div class="showcase-card">
          <div class="sc-badge">Recipe Media</div>
          <h4>HD Video Reels</h4>
          <p>Short 60-second video guides for quick, delicious, low-calorie home meals.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Download CTA Section -->
  <section id="download" class="download-section">
    <div class="container download-box">
      <div class="download-content">
        <img src="/logo_transparent.png" alt="DietWise Logo" class="cta-logo" />
        <h2>Download DietWise on Google Play</h2>
        <p>Start your journey to a healthier, happier lifestyle today. Compatible with Android 7.0 and up.</p>

        <div class="cta-action-row">
          <a href="https://play.google.com/store" target="_blank" class="playstore-btn lg">
            <svg viewBox="0 0 24 24" class="play-icon" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.97C19.46,13.59 19.46,12.41 18.81,12.03L16.81,10.88L14.81,12.88L16.81,15.12M4.6,22.61L15.39,11.82L15.39,12.18L4.6,1.39C4.85,1.14 5.23,1 5.64,1.17L16.03,7.17L13.69,9.5L4.6,0.41M13.69,14.5L16.03,16.83L5.64,22.83C5.23,23 4.85,22.86 4.6,22.61Z" />
            </svg>
            <div class="btn-text">
              <span class="sub">DOWNLOAD NOW FROM</span>
              <span class="main">Google Play Store</span>
            </div>
          </a>

          <button class="btn-admin-cta" onclick={handleAdminClick}>
            Admin Portal Sign In →
          </button>
        </div>

        <div class="app-specs">
          <span>📦 Package Size: 28 MB</span>
          <span>•</span>
          <span>⚡ Version: 2.4.0</span>
          <span>•</span>
          <span>🛡️ Verified Safe by Google Play Protect</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-left">
        <a href="/" class="footer-brand">
          <img src="/logo_transparent.png" alt="DietWise Logo" class="footer-logo-img" />
          <span>DietWise Systems</span>
        </a>
        <p>© 2026 DietWise Systems Inc. All rights reserved.</p>
      </div>

      <div class="footer-right">
        <a href="/terms">Terms & Conditions</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/legal">Legal Hub</a>
        <button class="footer-admin-link" onclick={handleAdminClick}>Admin Login</button>
      </div>
    </div>
  </footer>
</div>

<!-- QR Code Download Modal -->
{#if showQrModal}
<div class="modal-backdrop" onclick={() => showQrModal = false}>
  <div class="modal-card" onclick={(e) => e.stopPropagation()}>
    <button class="modal-close" onclick={() => showQrModal = false}>✕</button>
    <img src="/logo_transparent.png" alt="DietWise" class="modal-logo" />
    <h3>Scan to Download App</h3>
    <p>Scan this QR code with your smartphone camera to open DietWise directly on the Google Play Store.</p>
    <div class="qr-box">
      <div class="qr-mock">
        <div class="qr-grid"></div>
        <span>📱 DIETWISE APP</span>
      </div>
    </div>
    <p class="qr-sub">Available for Android 7.0+</p>
  </div>
</div>
{/if}

<style>
  .landing-page {
    background: #F8FAFC;
    color: #0F172A;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* Navbar */
  .navbar {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #E2E8F0;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .nav-content {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #0F172A;
  }

  .brand-logo {
    height: 38px;
    width: auto;
    object-fit: contain;
  }

  .brand-title {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0F172A;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-links a {
    text-decoration: none;
    color: #475569;
    font-size: 0.875rem;
    font-weight: 600;
    transition: color 0.2s;
  }

  .nav-links a:hover {
    color: #2563EB;
  }

  .highlight-link {
    color: #2563EB !important;
    font-weight: 700 !important;
  }

  .btn-admin {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: #0F172A;
    color: white;
    border: none;
    padding: 0.55rem 1.1rem;
    border-radius: 0.625rem;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-admin:hover {
    background: #1E293B;
    transform: translateY(-1px);
  }

  /* Hero */
  .hero {
    padding: 5rem 0 4rem;
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    color: white;
    overflow: hidden;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 3.5rem;
    align-items: center;
  }

  .play-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34D399;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    text-transform: uppercase;
  }

  .green-dot {
    width: 8px;
    height: 8px;
    background: #34D399;
    border-radius: 50%;
    box-shadow: 0 0 8px #34D399;
  }

  .hero-text h1 {
    font-size: 3rem;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: white;
    margin-bottom: 1.25rem;
  }

  .hero-description {
    font-size: 1.125rem;
    color: #94A3B8;
    line-height: 1.6;
    margin-bottom: 2.25rem;
  }

  .hero-ctas {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
  }

  /* Play Store Button */
  .playstore-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.875rem;
    background: #000000;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 0.75rem 1.5rem;
    border-radius: 0.875rem;
    text-decoration: none;
    transition: all 0.2s;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .playstore-btn:hover {
    background: #111111;
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.4);
    border-color: #60A5FA;
  }

  .play-icon {
    width: 28px;
    height: 28px;
    color: #34D399;
  }

  .btn-text {
    display: flex;
    flex-direction: column;
    text-align: left;
    line-height: 1.1;
  }

  .btn-text .sub {
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    color: #94A3B8;
    font-weight: 700;
  }

  .btn-text .main {
    font-size: 1.125rem;
    font-weight: 800;
    color: white;
  }

  .qr-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.85rem 1.25rem;
    border-radius: 0.875rem;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .qr-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Metrics */
  .metrics-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .metric {
    display: flex;
    flex-direction: column;
  }

  .stars {
    color: #F59E0B;
    font-size: 0.875rem;
  }

  .metric-val {
    font-size: 1.125rem;
    font-weight: 800;
    color: white;
  }

  .metric-sub {
    font-size: 0.75rem;
    color: #94A3B8;
  }

  .metric-divider {
    width: 1px;
    height: 32px;
    background: rgba(255, 255, 255, 0.15);
  }

  /* Hero Media Phone Mock */
  .hero-media {
    display: flex;
    justify-content: center;
  }

  .phone-frame {
    width: 320px;
    height: 520px;
    background: #000000;
    border-radius: 40px;
    padding: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    border: 4px solid #334155;
  }

  .phone-screen {
    background: #F1F5F9;
    width: 100%;
    height: 100%;
    border-radius: 30px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: #0F172A;
    overflow: hidden;
  }

  .app-header-mock {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .mock-logo {
    width: 32px;
    height: 32px;
  }

  .app-header-mock strong {
    display: block;
    font-size: 0.875rem;
  }

  .app-header-mock span {
    font-size: 0.75rem;
    color: #64748B;
  }

  .mock-card {
    background: white;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .calorie-card {
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    color: white;
  }

  .cal-title {
    font-size: 0.75rem;
    color: #94A3B8;
    text-transform: uppercase;
  }

  .cal-big {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0.25rem 0;
  }

  .cal-big span {
    font-size: 0.875rem;
    color: #94A3B8;
  }

  .progress-bar-bg {
    background: rgba(255, 255, 255, 0.1);
    height: 8px;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .progress-fill {
    background: #3B82F6;
    height: 100%;
    border-radius: 999px;
  }

  .macro-grid {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: #CBD5E1;
  }

  .meal-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .meal-icon {
    font-size: 1.5rem;
    background: #F8FAFC;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  .meal-info {
    flex: 1;
  }

  .meal-info strong {
    display: block;
    font-size: 0.8125rem;
  }

  .meal-info span {
    font-size: 0.7rem;
    color: #64748B;
  }

  .badge-done {
    background: #DCFCE7;
    color: #15803D;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
  }

  /* Features Section */
  .features-section {
    padding: 6rem 0;
  }

  .section-header {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 4rem;
  }

  .section-tag {
    color: #2563EB;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .section-header h2 {
    font-size: 2.25rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0.5rem 0 0.75rem;
  }

  .section-header p {
    color: #64748B;
    font-size: 1rem;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .feature-card {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 1.25rem;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
  }

  .feature-icon {
    width: 50px;
    height: 50px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .bg-blue { background: #EFF6FF; }
  .bg-green { background: #ECFDF5; }
  .bg-purple { background: #F3E8FF; }
  .bg-amber { background: #FEF3C7; }
  .bg-red { background: #FEE2E2; }
  .bg-teal { background: #CCFBF1; }

  .feature-card h3 {
    font-size: 1.125rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: #64748B;
    line-height: 1.6;
  }

  /* Screenshots Section */
  .screenshots-section {
    background: #F1F5F9;
    padding: 5rem 0;
  }

  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .showcase-card {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 1.25rem;
    padding: 2rem;
  }

  .sc-badge {
    display: inline-block;
    background: #DBEAFE;
    color: #1E40AF;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .showcase-card h4 {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .showcase-card p {
    font-size: 0.875rem;
    color: #64748B;
  }

  /* Download Box CTA */
  .download-section {
    padding: 5rem 0;
  }

  .download-box {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    border-radius: 2rem;
    padding: 4rem 2rem;
    text-align: center;
    color: white;
  }

  .cta-logo {
    width: 64px;
    height: 64px;
    margin-bottom: 1.25rem;
  }

  .download-box h2 {
    font-size: 2.5rem;
    font-weight: 900;
    margin-bottom: 1rem;
  }

  .download-box p {
    font-size: 1.125rem;
    color: #94A3B8;
    max-width: 540px;
    margin: 0 auto 2.5rem;
  }

  .cta-action-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .playstore-btn.lg {
    padding: 1rem 2rem;
  }

  .btn-admin-cta {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1.1rem 1.75rem;
    border-radius: 0.875rem;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-admin-cta:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .app-specs {
    font-size: 0.8125rem;
    color: #64748B;
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }

  /* Footer */
  .footer {
    background: #0B0F17;
    color: #94A3B8;
    padding: 3rem 0;
    border-top: 1px solid #1E293B;
  }

  .footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    color: white;
    font-weight: 800;
    text-decoration: none;
    font-size: 1.125rem;
    margin-bottom: 0.35rem;
  }

  .footer-logo-img {
    height: 28px;
    width: auto;
  }

  .footer-left p {
    font-size: 0.8125rem;
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    font-size: 0.875rem;
  }

  .footer-right a {
    color: #CBD5E1;
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-right a:hover {
    color: #60A5FA;
  }

  .footer-admin-link {
    background: none;
    border: 1px solid #334155;
    color: white;
    padding: 0.35rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }

  .modal-card {
    background: white;
    color: #0F172A;
    border-radius: 1.5rem;
    padding: 2.5rem;
    max-width: 420px;
    width: 100%;
    text-align: center;
    position: relative;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #64748B;
  }

  .modal-logo {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  .modal-card h3 {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .modal-card p {
    font-size: 0.875rem;
    color: #64748B;
    margin-bottom: 1.5rem;
  }

  .qr-box {
    background: #F8FAFC;
    border: 2px dashed #CBD5E1;
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 1rem;
  }

  .qr-mock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 800;
    color: #2563EB;
  }

  .qr-grid {
    width: 120px;
    height: 120px;
    background: radial-gradient(#0F172A 3px, transparent 3px);
    background-size: 10px 10px;
    border: 4px solid #0F172A;
    border-radius: 0.5rem;
  }

  .qr-sub {
    font-size: 0.75rem !important;
    margin-bottom: 0 !important;
  }

  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }
    .grid-3, .showcase-grid {
      grid-template-columns: 1fr;
    }
    .hero-text h1 {
      font-size: 2.25rem;
    }
  }
</style>
