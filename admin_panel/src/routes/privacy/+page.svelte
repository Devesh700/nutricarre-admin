<script>
  import { onMount } from 'svelte';

  let searchQuery = $state('');
  let activeSection = $state('sec-1');
  let effectiveDate = 'October 1, 2026';

  const sections = [
    { id: 'sec-1', title: '1. Information We Collect' },
    { id: 'sec-2', title: '2. Health & Dietary Data Protection' },
    { id: 'sec-3', title: '3. How We Use Your Information' },
    { id: 'sec-4', title: '4. Third-Party Data Sharing' },
    { id: 'sec-5', title: '5. Cookies & Tracking Technologies' },
    { id: 'sec-6', title: '6. Data Retention & Erasure' },
    { id: 'sec-7', title: '7. User Rights (GDPR & CCPA)' },
    { id: 'sec-8', title: '8. Security Architecture & Storage' },
    { id: 'sec-9', title: '9. Children\'s Privacy' },
    { id: 'sec-10', title: '10. Policy Updates & Contact' }
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
  <title>Privacy Policy | DietWise Health Portal</title>
  <meta name="description" content="DietWise Privacy Policy - How we collect, safeguard, and process your health data and personal information." />
</svelte:head>

<div class="public-legal-wrapper">
  <!-- Top Navigation Header -->
  <header class="legal-header">
    <div class="header-inner container">
      <a href="/" class="brand-logo">
        <span class="logo-dot"></span>
        <span class="logo-text">DietWise</span>
        <span class="badge-tag">Public Privacy Hub</span>
      </a>

      <div class="header-nav">
        <a href="/terms" class="nav-link">Terms & Conditions</a>
        <a href="/privacy" class="nav-link active">Privacy Policy</a>
        <a href="/login" class="btn-login">Sign In →</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-banner">
    <div class="container hero-content">
      <div class="version-badge">GDPR & CCPA Compliant • Effective Date: {effectiveDate}</div>
      <h1>Privacy Policy</h1>
      <p class="hero-subtitle">
        Your privacy and health data security are our highest priorities. Learn how DietWise protects, uses, and guarantees your personal data rights.
      </p>

      <div class="action-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search Privacy Policy (e.g., GDPR, delete data, cookies, Supabase)..." 
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
        <h3>Privacy Topics</h3>
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
          <p>Data Protection Officer (DPO):</p>
          <a href="mailto:dpo@nutricare.com" class="support-link">✉️ dpo@nutricare.com</a>
        </div>
      </div>
    </aside>

    <!-- Detailed Legal Document -->
    <article class="document-body">

      <!-- Privacy Guarantee Banner -->
      <div class="alert-card success-box">
        <div class="alert-icon">🛡️</div>
        <div class="alert-content">
          <h4>WE DO NOT SELL YOUR HEALTH DATA</h4>
          <p>
            DietWise operates under a strict privacy pledge: <strong>We never sell, rent, or trade your personal health logs, dietary records, or biometric information</strong> to third-party ad brokers or data aggregators.
          </p>
        </div>
      </div>

      <!-- Section 1 -->
      {#if matchesSearch('Information We Collect Personal Data Health Biometric Calorie Log Weight Profile')}
      <section id="sec-1" class="legal-section">
        <h2>1. Information We Collect</h2>
        <p>
          We collect several categories of information to provide you with tailored nutrition recommendations, calorie goal tracking, and diet consulting:
        </p>
        
        <div class="data-category-grid">
          <div class="data-card">
            <h4>👤 Account Identifiers</h4>
            <p>Full name, email address, phone number, password credentials, profile picture, and preferred communication methods.</p>
          </div>
          <div class="data-card">
            <h4>🥗 Health & Biometric Data</h4>
            <p>Age, gender, height, current weight, target weight, activity level, allergy history, dietary preferences (e.g. Keto, Vegan), daily calorie logs, and water intake.</p>
          </div>
          <div class="data-card">
            <h4>💳 Billing & Transaction Data</h4>
            <p>Tokenized subscription details, invoice histories, and payment receipts (processed securely via PCI-DSS compliant gateways).</p>
          </div>
          <div class="data-card">
            <h4>📱 Technical & Device Data</h4>
            <p>IP address, browser type, operating system version, device identifier, crash logs, and feature usage statistics.</p>
          </div>
        </div>
      </section>
      {/if}

      <!-- Section 2 -->
      {#if matchesSearch('Health Dietary Data Protection Sensitivity Encryption Encryption TLS RLS')}
      <section id="sec-2" class="legal-section">
        <h2>2. Health & Dietary Data Protection</h2>
        <p>
          We recognize that dietary and biometric records are sensitive personal data. DietWise employs advanced security controls to protect your health records:
        </p>
        <ul class="bullet-list">
          <li><strong>Encryption in Transit:</strong> All data transmitted between your device and our servers is encrypted using Industry-standard TLS 1.3 protocols.</li>
          <li><strong>Encryption at Rest:</strong> Database records, user profiles, and storage buckets are encrypted at rest using AES-256 encryption keys.</li>
          <li><strong>Row Level Security (RLS):</strong> Our database architecture (powered by Supabase) enforces strict Row Level Security policies so only authorized users and assigned consultants can view specific client health files.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 3 -->
      {#if matchesSearch('How We Use Information Purpose Meal Plans Analytics Notifications WhatsApp')}
      <section id="sec-3" class="legal-section">
        <h2>3. How We Use Your Information</h2>
        <p>We process your data strictly for legitimate operational and health management purposes:</p>
        <ul class="bullet-list">
          <li><strong>Personalized Meal & Diet Plans:</strong> Calculating tailored basal metabolic rate (BMR), total daily energy expenditure (TDEE), and macro targets.</li>
          <li><strong>Consultant Assistance:</strong> Enabling authorized dietitians and nutrition coaches to review meal logs and adjust diet schedules.</li>
          <li><strong>Reminders & Notifications:</strong> Sending automated meal reminders, water hydration prompts, and updates (via email or Meta/WhatsApp API integrations when enabled).</li>
          <li><strong>Platform Maintenance & Improvement:</strong> Analyzing aggregated, anonymized usage trends to enhance algorithm accuracy and user interface experience.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 4 -->
      {#if matchesSearch('Third-Party Data Sharing Vendors Supabase Cloudflare R2 Processors Meta')}
      <section id="sec-4" class="legal-section">
        <h2>4. Third-Party Data Sharing</h2>
        <p>
          We only share necessary data with trusted infrastructure providers who comply with stringent privacy standards:
        </p>
        
        <table class="vendor-table">
          <thead>
            <tr>
              <th>Provider / Vendor</th>
              <th>Purpose / Service</th>
              <th>Data Handled</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Supabase Inc.</strong></td>
              <td>Database & Authentication Hosting</td>
              <td>Encrypted user accounts, diet logs, and auth sessions</td>
            </tr>
            <tr>
              <td><strong>Cloudflare R2</strong></td>
              <td>Secure Object Storage</td>
              <td>Recipe images, media files, and short educational video reels</td>
            </tr>
            <tr>
              <td><strong>Meta / WhatsApp API</strong></td>
              <td>Messaging & Notifications</td>
              <td>Transactional notification phone numbers & meal reminders</td>
            </tr>
            <tr>
              <td><strong>Payment Gateways</strong></td>
              <td>Subscription Processing</td>
              <td>Tokenized billing details (No raw card data stored by us)</td>
            </tr>
          </tbody>
        </table>
      </section>
      {/if}

      <!-- Section 5 -->
      {#if matchesSearch('Cookies Tracking Technologies Session Analytics LocalStorage Preference')}
      <section id="sec-5" class="legal-section">
        <h2>5. Cookies & Tracking Technologies</h2>
        <p>
          DietWise uses essential cookies and browser local storage to maintain session state, security tokens, and user preferences:
        </p>
        <ul class="bullet-list">
          <li><strong>Essential Cookies:</strong> Required for secure authentication, session management, and access to protected admin/user portals.</li>
          <li><strong>Preference Storage:</strong> Saving UI preferences, search filters, and dark/light mode choices locally on your browser.</li>
          <li><strong>No Ad Trackers:</strong> We do not deploy third-party advertising tracking cookies or cross-site behavioral retargeting pixels.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 6 -->
      {#if matchesSearch('Data Retention Erasure Deletion Purge Account Deletion Period')}
      <section id="sec-6" class="legal-section">
        <h2>6. Data Retention & Erasure Policy</h2>
        <p>
          We retain your personal data for as long as your account remains active or as needed to fulfill your health tracking goals.
        </p>
        <ul class="bullet-list">
          <li><strong>Account Inactivity:</strong> Accounts inactive for over 24 consecutive months are flagged for automated archiving.</li>
          <li><strong>Immediate Account Deletion:</strong> Upon receiving an explicit deletion request, all associated personal identifiers, calorie logs, and profile records are permanently purged from our primary databases within 30 calendar days.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 7 -->
      {#if matchesSearch('User Rights GDPR CCPA Export Access Correction Erasure Right to be forgotten')}
      <section id="sec-7" class="legal-section">
        <h2>7. User Rights (GDPR & CCPA Compliance)</h2>
        <p>Regardless of your geographic location, DietWise respects your fundamental data rights:</p>

        <div class="rights-grid">
          <div class="right-card">
            <h4>📥 Right to Access & Export</h4>
            <p>Request a complete export of your personal health logs and account data in JSON/CSV format.</p>
          </div>
          <div class="right-card">
            <h4>✏️ Right to Rectification</h4>
            <p>Update or correct any inaccurate personal profile, biometric data, or dietary preferences.</p>
          </div>
          <div class="right-card">
            <h4>🗑️ Right to Erasure ("Right to be Forgotten")</h4>
            <p>Request permanent deletion of your account and associated health records at any time.</p>
          </div>
          <div class="right-card">
            <h4>🛑 Right to Object / Restrict Processing</h4>
            <p>Opt-out of non-essential promotional messages, automated reminders, or specific data processing activities.</p>
          </div>
        </div>
      </section>
      {/if}

      <!-- Section 8 -->
      {#if matchesSearch('Security Architecture Infrastructure Backups Firewalls Storage Security')}
      <section id="sec-8" class="legal-section">
        <h2>8. Security Architecture & Safeguards</h2>
        <p>
          DietWise employs multi-layered technical, administrative, and physical security measures to safeguard your health records against unauthorized access, alteration, or disclosure:
        </p>
        <ul class="bullet-list">
          <li>Strict API authentication tokens with short expiration lifespans.</li>
          <li>Regular security code reviews, vulnerability scans, and database backups.</li>
          <li>Role-based access controls (RBAC) ensuring administrative staff access data strictly on a need-to-know basis.</li>
        </ul>
      </section>
      {/if}

      <!-- Section 9 -->
      {#if matchesSearch('Children Privacy Age Limit COPPA Minors Under 13 16')}
      <section id="sec-9" class="legal-section">
        <h2>9. Children's Privacy Protection</h2>
        <p>
          Our services are not intended for children under the age of 13 (or under 16 in certain jurisdiction European territories). We do not knowingly collect or solicit personal health data from minors.
        </p>
        <p>
          If you believe a minor under 13 has provided personal data to DietWise, please contact us immediately at <code>privacy@nutricare.com</code> for prompt removal of the record.
        </p>
      </section>
      {/if}

      <!-- Section 10 -->
      {#if matchesSearch('Policy Updates Contact Officer DPO Support Email Address Notice')}
      <section id="sec-10" class="legal-section">
        <h2>10. Policy Updates & Contact Details</h2>
        <p>
          We may update this Privacy Policy periodically to reflect technological changes, regulatory requirements, or platform updates. We will notify active users of material changes via email or in-app notice prior to the change taking effect.
        </p>

        <div class="contact-card">
          <div class="contact-item">
            <span class="icon">🛡️</span>
            <div>
              <strong>Data Protection Officer (DPO)</strong>
              <p>Privacy & Data Ethics Department</p>
            </div>
          </div>
          <div class="contact-item">
            <span class="icon">✉️</span>
            <div>
              <strong>Privacy Inquiries:</strong> <a href="mailto:privacy@nutricare.com">privacy@nutricare.com</a>
            </div>
          </div>
          <div class="contact-item">
            <span class="icon">📜</span>
            <div>
              <strong>Terms of Service:</strong> <a href="/terms">View Public Terms</a>
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
          <span>DietWise Privacy Hub</span>
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
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .badge-tag {
    background: #ECFDF5;
    color: #047857;
    border: 1px solid #A7F3D0;
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
    color: #10B981;
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
    background: linear-gradient(135deg, #064E3B 0%, #0F172A 100%);
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
    color: #A7F3D0;
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
    color: #CBD5E1;
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
    border-color: #34D399;
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
    background: #ECFDF5;
    color: #047857;
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
    color: #10B981;
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

  .success-box {
    background: #ECFDF5;
    border: 1.5px solid #6EE7B7;
  }

  .alert-icon {
    font-size: 1.75rem;
  }

  .alert-content h4 {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #065F46;
    margin-bottom: 0.5rem;
    letter-spacing: 0.02em;
  }

  .alert-content p {
    font-size: 0.875rem;
    color: #047857;
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

  code {
    background: #F1F5F9;
    color: #0F172A;
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
  }

  /* Data Category Grid */
  .data-category-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1.25rem;
  }

  .data-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .data-card h4 {
    font-size: 0.875rem;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 0.35rem;
  }

  .data-card p {
    font-size: 0.8125rem;
    color: #64748B;
    margin-bottom: 0;
  }

  /* Vendor Table */
  .vendor-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1.25rem;
    border: 1px solid #E2E8F0;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .vendor-table th {
    background: #F1F5F9;
    color: #475569;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.75rem 1rem;
    text-align: left;
  }

  .vendor-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #E2E8F0;
    font-size: 0.8125rem;
    color: #334155;
  }

  /* Rights Grid */
  .rights-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1.25rem;
  }

  .right-card {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .right-card h4 {
    font-size: 0.875rem;
    font-weight: 700;
    color: #166534;
    margin-bottom: 0.35rem;
  }

  .right-card p {
    font-size: 0.8125rem;
    color: #15803D;
    margin-bottom: 0;
  }

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
    color: #34D399;
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
    .data-category-grid, .rights-grid, .contact-card {
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
