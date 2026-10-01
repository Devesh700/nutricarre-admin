<script>
  import { onMount } from 'svelte';

  let searchQuery = $state('');
  let activeTab = $state('terms'); // 'terms', 'privacy', 'cookies'
  let activeSection = $state('sec-1');
  let printedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sections = [
    { id: 'sec-1', title: '1. Acceptance of Terms' },
    { id: 'sec-2', title: '2. Health & Medical Disclaimer' },
    { id: 'sec-3', title: '3. Eligibility & Account Registration' },
    { id: 'sec-4', title: '4. Service Scope & Features' },
    { id: 'sec-5', title: '5. Subscriptions & Billing' },
    { id: 'sec-6', title: '6. User Conduct & Rules' },
    { id: 'sec-7', title: '7. Intellectual Property' },
    { id: 'sec-8', title: '8. Privacy & Data Protection' },
    { id: 'sec-9', title: '9. Limitation of Liability' },
    { id: 'sec-10', title: '10. Termination & Cancellation' },
    { id: 'sec-11', title: '11. Governing Law' },
    { id: 'sec-12', title: '12. Contact & Legal Notices' }
  ];

  function scrollToSection(id) {
    activeSection = id;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handlePrint() {
    window.print();
  }

  function matchesSearch(text) {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  }
</script>

<svelte:head>
  <title>Terms & Conditions | DietWise Health Portal</title>
  <meta name="description" content="DietWise Terms and Conditions - Read our terms of service, medical disclaimer, and subscription guidelines." />
</svelte:head>

<div class="public-legal-wrapper">
  <!-- Top Navigation Header -->
  <header class="legal-header">
    <div class="header-inner container">
      <a href="/" class="brand-logo">
        <span class="logo-dot"></span>
        <span class="logo-text">DietWise</span>
        <span class="badge-tag">Public Legal Center</span>
      </a>

      <div class="header-nav">
        <a href="/terms" class="nav-link active">Terms & Conditions</a>
        <a href="/privacy" class="nav-link">Privacy Policy</a>
        <a href="/login" class="btn-login">Sign In →</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-banner">
    <div class="container hero-content">
      <div class="version-badge">Version 2.4 • Effective Date: October 1, 2026</div>
      <h1>Terms & Conditions</h1>
      <p class="hero-subtitle">
        Please read these Terms and Conditions carefully before using the DietWise platform, mobile application, or nutritional consultation services.
      </p>

      <div class="action-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search within Terms (e.g., medical, refund, account)..." 
            bind:value={searchQuery}
          />
          {#if searchQuery}
            <button class="clear-btn" onclick={() => searchQuery = ''}>✕</button>
          {/if}
        </div>

        <button class="print-btn" onclick={handlePrint}>
          <span>🖨️</span> Print / Save PDF
        </button>
      </div>
    </div>
  </section>

  <!-- Main Content Layout -->
  <main class="container main-layout">
    <!-- Sidebar Table of Contents -->
    <aside class="toc-sidebar">
      <div class="toc-card">
        <h3>Contents Overview</h3>
        <nav class="toc-list">
          {#each sections as sec}
            <button 
              class="toc-item {activeSection === sec.id ? 'active' : ''}" 
              onclick={() => scrollToSection(sec.id)}
            >
              {sec.title}
            </button>
          {/each}
        </nav>

        <div class="toc-footer">
          <p>Need urgent legal assistance?</p>
          <a href="mailto:legal@nutricare.com" class="support-link">✉️ legal@nutricare.com</a>
        </div>
      </div>
    </aside>

    <!-- Detailed Legal Document -->
    <article class="document-body">

      <!-- Important Medical Disclaimer Box -->
      <div class="alert-card warning-box">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <h4>IMPORTANT HEALTH & MEDICAL DISCLAIMER</h4>
          <p>
            DietWise provides nutritional recommendations, calorie tracking, meal plans, and diet templates for general health, wellness, and educational purposes only. 
            <strong>DietWise is NOT a medical organization and does NOT provide medical advice, diagnosis, or treatment.</strong> 
            Always consult a qualified physician or registered dietitian before starting any restrictive diet, meal modification, or fitness regimen.
          </p>
        </div>
      </div>

      <!-- Section 1 -->
      {#if matchesSearch('Acceptance of Terms Agreement Eligibility Rules Services')}
      <section id="sec-1" class="legal-section">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing, downloading, registering for, or using the <strong>DietWise</strong> software application, administrative portal, or related web services (collectively, the "Platform"), owned and operated by NutriCare Systems ("Company", "we", "us", or "our"), you signify that you have read, understood, and agreed to be legally bound by these Terms & Conditions ("Terms").
        </p>
        <p>
          If you do not agree to all of these Terms, you are expressly prohibited from using or accessing the Platform, and you must immediately discontinue all usage.
        </p>
      </section>
      {/if}

      <!-- Section 2 -->
      {#if matchesSearch('Health Medical Disclaimer Physician Doctor Diagnosis Nutrition Dietary')}
      <section id="sec-2" class="legal-section">
        <h2>2. Health & Medical Disclaimer</h2>
        <p>
          The services, meal plans, calorie targets, macro distributions, recipes, and recommendations generated by DietWise are calculated based on general nutritional science and user-provided inputs (such as weight, height, age, activity level, and dietary goals).
        </p>
        <ul class="bullet-list">
          <li><strong>No Doctor-Patient Relationship:</strong> Using DietWise does not establish a doctor-patient, dietitian-patient, or clinical relationship between you and NutriCare.</li>
          <li><strong>Individual Health Variations:</strong> Nutritional requirements vary greatly by individual based on underlying health conditions, medications, pregnancy, and metabolic factors.</li>
          <li><strong>Emergency Situations:</strong> If you experience any severe physical discomfort, allergic reactions, faintness, or medical emergencies, seek immediate emergency medical care. Never delay seeking professional advice due to information provided on the Platform.</li>
          <li><strong>Allergies & Intolerances:</strong> Users remain solely responsible for cross-checking ingredients in meal recommendations against their personal medical history and known severe food allergies.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 3 -->
      {#if matchesSearch('Eligibility Account Registration Password Security Age Requirement')}
      <section id="sec-3" class="legal-section">
        <h2>3. Eligibility & Account Registration</h2>
        <p>
          To access certain features of the Platform—including personalized diet templates, consultant chats, and progress tracking—you must register for an account.
        </p>
        <ul class="bullet-list">
          <li><strong>Age Limit:</strong> You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to create an account. Individuals under 18 may only use the Platform under parental or legal guardian supervision.</li>
          <li><strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete information during registration and keep your profile updated.</li>
          <li><strong>Credential Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and password. You accept full responsibility for all activities occurring under your account.</li>
          <li><strong>Unauthorized Access:</strong> You agree to notify us immediately at <code>security@nutricare.com</code> if you suspect any unauthorized access or breach of account security.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 4 -->
      {#if matchesSearch('Service Scope Features Meal Library Reels Consultants Diet Schedules')}
      <section id="sec-4" class="legal-section">
        <h2>4. Service Scope & Platform Features</h2>
        <p>
          DietWise provides tools for diet management, nutrition consultation, recipe libraries, short wellness video reels, and client progress analytics:
        </p>
        <div class="feature-grid">
          <div class="feature-card">
            <h4>🍏 Meal & Recipe Library</h4>
            <p>Access curated database recipes and nutritional breakdowns for meal preparation.</p>
          </div>
          <div class="feature-card">
            <h4>📅 Diet Templates & Schedules</h4>
            <p>Customized meal interval schedules and automated macronutrient goal calculators.</p>
          </div>
          <div class="feature-card">
            <h4>💬 Consultant Messaging</h4>
            <p>Direct communication channels with assigned nutrition coaches or dietitians.</p>
          </div>
          <div class="feature-card">
            <h4>📱 Educational Reels</h4>
            <p>Short-form video content and educational guides regarding healthy lifestyle habits.</p>
          </div>
        </div>
      </section>
      {/if}

      <!-- Section 5 -->
      {#if matchesSearch('Subscriptions Billing Payment Refund Renewal Price Cancellation')}
      <section id="sec-5" class="legal-section">
        <h2>5. Subscriptions, Payments & Refund Policy</h2>
        <p>
          Certain features or premium diet consultation packages on DietWise require paid subscriptions.
        </p>
        <ul class="bullet-list">
          <li><strong>Billing Cycle:</strong> Subscription fees are billed in advance on a recurring monthly, quarterly, or annual basis depending on your selected plan.</li>
          <li><strong>Auto-Renewal:</strong> Your subscription automatically renews unless cancelled at least 24 hours prior to the end of the current billing cycle.</li>
          <li><strong>Refund Policy:</strong> Payments are non-refundable except where explicitly required by applicable consumer protection laws or as stated in a specific promotional offer. Refund requests submitted within 7 days of initial purchase may be considered on a case-by-case basis.</li>
          <li><strong>Price Adjustments:</strong> We reserve the right to change subscription pricing with a minimum of 30 days prior notice to existing active subscribers.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 6 -->
      {#if matchesSearch('User Conduct Rules Prohibited Activities Reverse Engineering Scraping Spam')}
      <section id="sec-6" class="legal-section">
        <h2>6. User Conduct & Prohibited Activities</h2>
        <p>When interacting with the Platform, consultants, or other users, you agree NOT to:</p>
        <div class="conduct-box">
          <ul>
            <li>❌ Use automated bots, scrapers, or data extraction scripts to scrape recipe databases or diet templates.</li>
            <li>❌ Impersonate any licensed healthcare provider, dietitian, or fellow user.</li>
            <li>❌ Upload or transmit viruses, malware, or malicious code to the Platform.</li>
            <li>❌ Harass, threaten, or send inappropriate content to consultants or administrators.</li>
            <li>❌ Reverse engineer, decompile, or attempt to derive source code of the DietWise platform.</li>
          </ul>
        </div>
      </section>
      {/if}

      <!-- Section 7 -->
      {#if matchesSearch('Intellectual Property Copyright Trademarks License Proprietary')}
      <section id="sec-7" class="legal-section">
        <h2>7. Intellectual Property Rights</h2>
        <p>
          The Platform and its original content, features, layout design, graphics, meal algorithms, software code, logos, and trademarks are the exclusive property of NutriCare Systems and its licensors.
        </p>
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for your personal, non-commercial health management purposes. You may not reproduce, distribute, or create derivative works without explicit written permission.
        </p>
      </section>
      {/if}

      <!-- Section 8 -->
      {#if matchesSearch('Privacy Data Protection GDPR HIPAA Storage Cloudflare Supabase')}
      <section id="sec-8" class="legal-section">
        <h2>8. Privacy & Data Protection</h2>
        <p>
          Your privacy is paramount to us. Our collection, use, and protection of your personal and health data are governed by our public <a href="/privacy" class="inline-link">Privacy Policy</a>.
        </p>
        <p>
          By using DietWise, you consent to the collection and processing of your data in accordance with our Privacy Policy, including secure storage handled via encrypted cloud infrastructure (Supabase & Cloudflare R2).
        </p>
      </section>
      {/if}

      <!-- Section 9 -->
      {#if matchesSearch('Limitation of Liability Warranty Disclaimer Damages Cap As Is')}
      <section id="sec-9" class="legal-section">
        <h2>9. Limitation of Liability & Warranty Disclaimer</h2>
        <p>
          THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>
        <p>
          IN NO EVENT SHALL NUTRICARE SYSTEMS, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM.
        </p>
      </section>
      {/if}

      <!-- Section 10 -->
      {#if matchesSearch('Termination Account Suspension Cancellation Deletion')}
      <section id="sec-10" class="legal-section">
        <h2>10. Termination & Account Suspension</h2>
        <p>
          We reserve the right to suspend or terminate your account and block access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
        </p>
        <p>
          You may request account deletion at any time via your profile settings or by contacting our data protection officer.
        </p>
      </section>
      {/if}

      <!-- Section 11 -->
      {#if matchesSearch('Governing Law Dispute Resolution Jurisdiction Arbitration')}
      <section id="sec-11" class="legal-section">
        <h2>11. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
        </p>
        <p>
          Any disputes arising out of these Terms or use of the Platform shall first be submitted to informal negotiations in good faith for a period of 30 days prior to initiating formal arbitration or court proceedings.
        </p>
      </section>
      {/if}

      <!-- Section 12 -->
      {#if matchesSearch('Contact Legal Notices Support Email Address Address')}
      <section id="sec-12" class="legal-section">
        <h2>12. Contact & Legal Notices</h2>
        <p>If you have any questions, concerns, or legal notices regarding these Terms & Conditions, please contact us:</p>
        <div class="contact-card">
          <div class="contact-item">
            <span class="icon">🏢</span>
            <div>
              <strong>NutriCare Systems Inc.</strong>
              <p>Legal & Compliance Division</p>
            </div>
          </div>
          <div class="contact-item">
            <span class="icon">✉️</span>
            <div>
              <strong>Email:</strong> <a href="mailto:legal@nutricare.com">legal@nutricare.com</a>
            </div>
          </div>
          <div class="contact-item">
            <span class="icon">🌐</span>
            <div>
              <strong>Support Portal:</strong> <a href="/privacy">Privacy & Security Hub</a>
            </div>
          </div>
        </div>
      </section>
      {/if}

    </article>
  </main>

  <!-- Public Footer -->
  <footer class="public-footer">
    <div class="container footer-inner">
      <div class="footer-left">
        <div class="brand">
          <span class="logo-dot"></span>
          <span>DietWise Legal Center</span>
        </div>
        <p>© 2026 NutriCare Systems Inc. All rights reserved.</p>
      </div>

      <div class="footer-links">
        <a href="/terms">Terms of Service</a>
        <span class="sep">•</span>
        <a href="/privacy">Privacy Policy</a>
        <span class="sep">•</span>
        <a href="/login">Admin Login</a>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    background-color: #F8FAFC !important;
  }

  .public-legal-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: #0F172A;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
  }

  /* Header */
  .legal-header {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #E2E8F0;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .header-inner {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    text-decoration: none;
    color: #0F172A;
  }

  .logo-dot {
    width: 12px;
    height: 12px;
    background: #2563EB;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(37, 99, 235, 0.4);
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .badge-tag {
    background: #EFF6FF;
    color: #1D4ED8;
    border: 1px solid #BFDBFE;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    text-transform: uppercase;
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .nav-link {
    text-decoration: none;
    color: #64748B;
    font-weight: 600;
    font-size: 0.875rem;
    transition: color 0.2s;
  }

  .nav-link:hover, .nav-link.active {
    color: #2563EB;
  }

  .btn-login {
    background: #0F172A;
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    transition: background 0.2s;
  }

  .btn-login:hover {
    background: #1E293B;
  }

  /* Hero */
  .hero-banner {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    color: white;
    padding: 4rem 0 3.5rem;
  }

  .version-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #93C5FD;
    margin-bottom: 1.25rem;
  }

  .hero-banner h1 {
    font-size: 2.75rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
    color: white;
  }

  .hero-subtitle {
    font-size: 1.125rem;
    color: #94A3B8;
    max-width: 680px;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .action-bar {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .search-box {
    position: relative;
    flex: 1;
    max-width: 480px;
  }

  .search-box input {
    width: 100%;
    padding: 0.85rem 2.5rem 0.85rem 2.75rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s;
  }

  .search-box input:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: #60A5FA;
  }

  .search-box input::placeholder {
    color: #94A3B8;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    opacity: 0.7;
  }

  .clear-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94A3B8;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .print-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.25rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .print-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Main Layout */
  .main-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2.5rem;
    padding-top: 3rem;
    padding-bottom: 5rem;
    flex: 1;
  }

  /* TOC Sidebar */
  .toc-sidebar {
    position: sticky;
    top: 90px;
    height: fit-content;
  }

  .toc-card {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
  }

  .toc-card h3 {
    font-size: 0.875rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748B;
    margin-bottom: 1rem;
  }

  .toc-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .toc-item {
    text-align: left;
    background: none;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;
    line-height: 1.4;
  }

  .toc-item:hover {
    background: #F1F5F9;
    color: #0F172A;
  }

  .toc-item.active {
    background: #EFF6FF;
    color: #2563EB;
    font-weight: 700;
  }

  .toc-footer {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #F1F5F9;
    font-size: 0.75rem;
    color: #64748B;
  }

  .support-link {
    display: inline-block;
    margin-top: 0.25rem;
    color: #2563EB;
    font-weight: 600;
    text-decoration: none;
  }

  /* Document Body */
  .document-body {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 1.25rem;
    padding: 3rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  }

  .alert-card {
    display: flex;
    gap: 1.25rem;
    padding: 1.5rem;
    border-radius: 0.875rem;
    margin-bottom: 2.5rem;
  }

  .warning-box {
    background: #FFFBEB;
    border: 1.5px solid #FCD34D;
  }

  .alert-icon {
    font-size: 1.75rem;
  }

  .alert-content h4 {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #92400E;
    margin-bottom: 0.5rem;
    letter-spacing: 0.02em;
  }

  .alert-content p {
    font-size: 0.875rem;
    color: #78350F;
    line-height: 1.6;

  }

  .legal-section {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #F1F5F9;
  }

  .legal-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .legal-section h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }

  .legal-section p {
    font-size: 0.9375rem;
    color: #475569;
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  .bullet-list {
    margin-left: 1.25rem;
    margin-bottom: 1rem;
  }

  .bullet-list li {
    font-size: 0.9375rem;
    color: #475569;
    line-height: 1.7;
    margin-bottom: 0.625rem;
  }

  .inline-link {
    color: #2563EB;
    text-decoration: underline;
    font-weight: 600;
  }

  code {
    background: #F1F5F9;
    color: #0F172A;
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
  }

  /* Feature Grid */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1.25rem;
  }

  .feature-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .feature-card h4 {
    font-size: 0.875rem;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 0.35rem;
  }

  .feature-card p {
    font-size: 0.8125rem;
    color: #64748B;
    margin-bottom: 0;
  }

  /* Conduct Box */
  .conduct-box {
    background: #FEF2F2;
    border: 1px solid #FCA5A5;
    border-radius: 0.875rem;
    padding: 1.25rem 1.5rem;
  }

  .conduct-box ul {
    list-style: none;
    padding: 0;
  }

  .conduct-box li {
    font-size: 0.875rem;
    color: #991B1B;
    font-weight: 500;
    margin-bottom: 0.625rem;
  }
  .conduct-box li:last-child { margin-bottom: 0; }

  /* Contact Card */
  .contact-card {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1.25rem;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    padding: 1.5rem;
    border-radius: 0.875rem;
  }

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .contact-item .icon {
    font-size: 1.25rem;
  }

  .contact-item strong {
    display: block;
    font-size: 0.875rem;
    color: #0F172A;
  }

  .contact-item p, .contact-item a {
    font-size: 0.8125rem;
    color: #64748B;
  }

  /* Footer */
  .public-footer {
    background: #0F172A;
    color: #94A3B8;
    padding: 2.5rem 0;
    border-top: 1px solid #1E293B;
  }

  .footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-left .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.35rem;
  }

  .footer-left p {
    font-size: 0.8125rem;
  }

  .footer-links {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .footer-links a {
    color: #CBD5E1;
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover {
    color: #60A5FA;
  }

  .sep {
    color: #475569;
  }

  /* Print styles */
  @media print {
    .legal-header, .toc-sidebar, .action-bar, .public-footer {
      display: none !important;
    }
    .main-layout {
      grid-template-columns: 1fr !important;
      padding: 0 !important;
    }
    .document-body {
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
    }
  }

  /* Responsive */
  @media (max-width: 900px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .toc-sidebar {
      display: none;
    }
    .feature-grid, .contact-card {
      grid-template-columns: 1fr;
    }
    .hero-banner h1 {
      font-size: 2rem;
    }
    .document-body {
      padding: 1.75rem;
    }
  }
</style>
