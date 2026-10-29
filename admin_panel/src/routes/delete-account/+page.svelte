<script>
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let activeTab = $state('request'); // 'request' | 'instant' | 'in-app'
  let isSubmitting = $state(false);
  let instantSubmitting = $state(false);
  let showConfirmModal = $state(false);

  // Form states
  let requestEmail = $state(data?.emailParam || '');
  let requestPhone = $state('');
  let requestReason = $state('not_using');
  let requestNotes = $state('');
  let confirmIrreversible = $state(false);
  let confirmSubscription = $state(false);

  // Instant delete states
  let instantEmail = $state(data?.emailParam || '');
  let instantPassword = $state('');
  let confirmKeyword = $state('');

  function printReceipt() {
    window.print();
  }
</script>

<svelte:head>
  <title>Account & Data Deletion | DietWise Health App</title>
  <meta name="description" content="Official Google Play account and personal data deletion request page for DietWise users. Request complete erasure of your health data, profile, and meal history." />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="deletion-page">
  <!-- Top Global Header -->
  <header class="deletion-header">
    <div class="container header-inner">
      <a href="/" class="brand-link">
        <div class="brand-badge-dot"></div>
        <span class="brand-title">DietWise</span>
        <span class="brand-tag">Compliance & Privacy Hub</span>
      </a>

      <nav class="header-nav">
        <a href="/" class="nav-item">Home</a>
        <a href="/privacy" class="nav-item">Privacy Policy</a>
        <a href="/terms" class="nav-item">Terms of Service</a>
        <a href="/legal" class="nav-item">Legal Center</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-banner">
    <div class="container hero-content">
      <div class="compliance-badge">
        <span class="shield-icon">🛡️</span> Google Play Data Safety & GDPR Article 17 Compliant
      </div>
      <h1>DietWise Account & Data Deletion Portal</h1>
      <p class="hero-desc">
        Under Google Play User Data policies and global privacy standards, you have the absolute right to request the permanent deletion of your <strong>DietWise</strong> mobile app account and all associated personal health data.
      </p>

      <div class="entity-info-bar">
        <span><strong>Application:</strong> DietWise - Personalised Nutrition & Diet Management</span>
        <span class="sep">•</span>
        <span><strong>Developer:</strong> NutriCare Systems Inc.</span>
        <span class="sep">•</span>
        <span><strong>Platform:</strong> Android (Google Play) & Web</span>
      </div>
    </div>
  </section>

  <!-- Main Container -->
  <main class="container main-content">

    <!-- Notification Banners -->
    {#if form?.instantDeleted}
      <div class="alert-box success-alert">
        <div class="alert-icon">✅</div>
        <div class="alert-body">
          <h3>Account Successfully & Permanently Deleted</h3>
          <p>
            The DietWise account associated with <strong>{form.email}</strong> has been completely removed from our authentication system and primary databases. All meal logs, diet schedules, calorie histories, and personal profiles have been permanently purged.
          </p>
          <div class="receipt-row">
            <span><strong>Reference ID:</strong> <code>{form.referenceId}</code></span>
            <span><strong>Execution Timestamp:</strong> {form.timestamp}</span>
          </div>
          <p class="sub-alert">
            A confirmation notification has been registered. If you were subscribed via Google Play, please make sure you have canceled your recurring billing in Google Play Subscriptions.
          </p>
        </div>
      </div>
    {:else if form?.requestSubmitted}
      <div class="alert-box success-alert" id="confirmation-receipt">
        <div class="alert-icon">📨</div>
        <div class="alert-body">
          <h3>Deletion Request Acknowledged & In Progress</h3>
          <p>
            Your account deletion request for <strong>{form.email}</strong> has been received and verified. Your account access has been restricted to prevent further notification reminders or data logging.
          </p>

          <div class="receipt-card">
            <div class="receipt-item">
              <span class="label">Reference Tracking ID:</span>
              <span class="val font-mono highlight">{form.referenceId}</span>
            </div>
            <div class="receipt-item">
              <span class="label">Associated Email:</span>
              <span class="val">{form.email}</span>
            </div>
            <div class="receipt-item">
              <span class="label">Processing Status:</span>
              <span class="val status-pill">Scheduled for Full Purge</span>
            </div>
            <div class="receipt-item">
              <span class="label">Scheduled Completion Date:</span>
              <span class="val">{form.scheduledPurgeDate}</span>
            </div>
          </div>

          <div class="receipt-actions">
            <button class="btn-print" onclick={printReceipt}>🖨️ Print / Save Deletion Receipt</button>
          </div>

          <p class="sub-alert">
            Please retain your Reference ID for your records. If you change your mind within 7 days, you can contact our Data Protection Officer at <code>privacy@nutricare.com</code> citing this Reference ID.
          </p>
        </div>
      </div>
    {/if}

    <!-- Google Play Subscription Warning Alert (Mandatory Review Item) -->
    <div class="subscription-warning-card">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <h4>Important Notice Regarding Google Play Subscriptions</h4>
        <p>
          Deleting your DietWise account or uninstalling the app from your Android device <strong>does NOT automatically cancel</strong> any active paid subscription billed through Google Play In-App Billing. Google Play operates subscription billing independently.
        </p>
        <p>
          To avoid future automated charges, please cancel your subscription directly in Google Play before deleting your account:
        </p>
        <div class="play-steps-row">
          <div class="play-step"><strong>1.</strong> Open Google Play Store app</div>
          <div class="play-step"><strong>2.</strong> Tap Profile &gt; <em>Payments &amp; subscriptions</em></div>
          <div class="play-step"><strong>3.</strong> Select <em>Subscriptions</em> &gt; <strong>DietWise</strong></div>
          <div class="play-step"><strong>4.</strong> Tap <em>Cancel subscription</em></div>
        </div>
        <div class="play-link-box">
          <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener noreferrer" class="btn-google-play-link">
            Manage Google Play Subscriptions ↗
          </a>
        </div>
      </div>
    </div>

    <!-- Interactive Options Tabs -->
    <div class="portal-nav-tabs">
      <button 
        class="tab-button {activeTab === 'request' ? 'active' : ''}" 
        onclick={() => activeTab = 'request'}
      >
        <span class="tab-icon">📝</span>
        <span class="tab-text">
          <strong>Submit Deletion Request</strong>
          <small>No app or password required</small>
        </span>
      </button>

      <button 
        class="tab-button {activeTab === 'instant' ? 'active' : ''}" 
        onclick={() => activeTab = 'instant'}
      >
        <span class="tab-icon">⚡</span>
        <span class="tab-text">
          <strong>Instant Self-Service Deletion</strong>
          <small>Verify password &amp; wipe immediately</small>
        </span>
      </button>

      <button 
        class="tab-button {activeTab === 'in-app' ? 'active' : ''}" 
        onclick={() => activeTab = 'in-app'}
      >
        <span class="tab-icon">📱</span>
        <span class="tab-text">
          <strong>In-App Deletion Guide</strong>
          <small>Delete from within Android app</small>
        </span>
      </button>
    </div>

    <!-- TAB 1: Public Web Request Form -->
    {#if activeTab === 'request'}
      <div class="card form-card">
        <div class="card-header">
          <h2>Submit Account Deletion Request</h2>
          <p>
            Use this online form if you have uninstalled the DietWise app, lost device access, or prefer our data safety team to process your account and health data removal.
          </p>
        </div>

        {#if form?.requestError}
          <div class="error-banner">
            <span>⚠️</span> {form.requestError}
          </div>
        {/if}

        <form 
          method="POST" 
          action="?/requestDeletion" 
          use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
              isSubmitting = false;
              await update();
            };
          }}
          class="form-layout"
        >
          <div class="form-group">
            <label for="req-email">Registered Email Address <span class="required">*</span></label>
            <input 
              id="req-email"
              type="email" 
              name="email" 
              placeholder="e.g. yourname@example.com" 
              bind:value={requestEmail} 
              required 
            />
            <span class="helper-text">The email address linked to your DietWise mobile account.</span>
          </div>

          <div class="form-group">
            <label for="req-phone">Registered Phone Number <span class="optional">(Optional)</span></label>
            <input 
              id="req-phone"
              type="tel" 
              name="phone" 
              placeholder="e.g. +1 555-019-2834" 
              bind:value={requestPhone} 
            />
            <span class="helper-text">Useful if you received meal reminders via WhatsApp or SMS.</span>
          </div>

          <div class="form-group">
            <label for="req-reason">Primary Reason for Deletion <span class="optional">(Optional)</span></label>
            <select id="req-reason" name="reason" bind:value={requestReason}>
              <option value="not_using">I am no longer using the DietWise app</option>
              <option value="privacy">Privacy or health data storage concerns</option>
              <option value="goals_reached">I achieved my fitness and target weight goal</option>
              <option value="switched">Switched to another fitness/nutrition tool</option>
              <option value="technical">Encountered technical issues or app bugs</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div class="form-group">
            <label for="req-notes">Additional Feedback or Specific Instructions <span class="optional">(Optional)</span></label>
            <textarea 
              id="req-notes"
              name="notes" 
              rows="3" 
              placeholder="Any details you would like our data protection team to note..." 
              bind:value={requestNotes}
            ></textarea>
          </div>

          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" name="confirmIrreversible" bind:checked={confirmIrreversible} required />
              <span>
                <strong>Irreversible Erasure Confirmation:</strong> I confirm that I want to delete my DietWise account. I understand that this action is permanent and will permanently delete my profile, biometric measurements, calorie tracking history, and diet plans.
              </span>
            </label>

            <label class="checkbox-label">
              <input type="checkbox" name="confirmSubscription" bind:checked={confirmSubscription} required />
              <span>
                <strong>Google Play Subscription Acknowledgment:</strong> I acknowledge that deleting my account does not cancel recurring subscriptions billed through Google Play, and I am responsible for canceling my subscription in Google Play Store settings.
              </span>
            </label>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-submit-danger" 
              disabled={isSubmitting || !requestEmail || !confirmIrreversible || !confirmSubscription}
            >
              {#if isSubmitting}
                <span class="spinner"></span> Processing Deletion Request...
              {:else}
                Submit Official Deletion Request →
              {/if}
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- TAB 2: Instant Self-Service Deletion -->
    {#if activeTab === 'instant'}
      <div class="card form-card">
        <div class="card-header">
          <h2>Instant Self-Service Account Termination</h2>
          <p>
            Authenticate with your DietWise credentials below to immediately delete your user account and purge all data in real time.
          </p>
        </div>

        {#if form?.instantError}
          <div class="error-banner">
            <span>⚠️</span> {form.instantError}
          </div>
        {/if}

        <form 
          method="POST" 
          action="?/directDelete" 
          use:enhance={() => {
            instantSubmitting = true;
            return async ({ update }) => {
              instantSubmitting = false;
              await update();
            };
          }}
          class="form-layout"
        >
          <div class="form-group">
            <label for="inst-email">Account Email <span class="required">*</span></label>
            <input 
              id="inst-email"
              type="email" 
              name="email" 
              placeholder="your-registered-email@domain.com" 
              bind:value={instantEmail} 
              required 
            />
          </div>

          <div class="form-group">
            <label for="inst-pass">Account Password <span class="required">*</span></label>
            <input 
              id="inst-pass"
              type="password" 
              name="password" 
              placeholder="Enter your DietWise password" 
              bind:value={instantPassword} 
              required 
            />
          </div>

          <div class="form-group highlight-input-group">
            <label for="inst-confirm">Security Confirmation: Type <code>DELETE</code> in uppercase <span class="required">*</span></label>
            <input 
              id="inst-confirm"
              type="text" 
              name="confirmKeyword" 
              placeholder="DELETE" 
              bind:value={confirmKeyword} 
              required 
            />
            <span class="helper-text">This step ensures you do not inadvertently erase your health metrics.</span>
          </div>

          <div class="danger-callout">
            <strong>⚠️ Immediate Permanent Impact:</strong>
            <p>
              Once confirmed, your authentication token is revoked instantly. Your personal profile, calorie diary, hydration logs, weight charts, and dietitian communications will be wiped from primary production databases immediately.
            </p>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-submit-danger" 
              disabled={instantSubmitting || !instantEmail || !instantPassword || confirmKeyword !== 'DELETE'}
            >
              {#if instantSubmitting}
                <span class="spinner"></span> Purging Account &amp; Health Records...
              {:else}
                Permanently Delete My DietWise Account Now 🗑️
              {/if}
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- TAB 3: In-App Deletion Guide -->
    {#if activeTab === 'in-app'}
      <div class="card in-app-guide-card">
        <div class="card-header">
          <h2>Deleting Your Account Within the Android App</h2>
          <p>
            If you currently have the DietWise application installed on your Android smartphone or tablet, you can delete your account directly through the mobile interface:
          </p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-badge">Step 1</div>
            <div class="step-icon">📱</div>
            <h4>Open Profile</h4>
            <p>Launch the <strong>DietWise</strong> app on your Android device and tap on the <strong>Profile</strong> tab in the bottom navigation menu.</p>
          </div>

          <div class="step-card">
            <div class="step-badge">Step 2</div>
            <div class="step-icon">⚙️</div>
            <h4>Access Settings</h4>
            <p>Tap the <strong>Settings (Gear)</strong> icon located at the top-right corner of your profile screen.</p>
          </div>

          <div class="step-card">
            <div class="step-badge">Step 3</div>
            <div class="step-icon">🔒</div>
            <h4>Privacy &amp; Security</h4>
            <p>Scroll down to the <em>Account &amp; Security</em> section and tap on <strong>Privacy &amp; Security</strong>.</p>
          </div>

          <div class="step-card danger-step">
            <div class="step-badge danger">Step 4</div>
            <div class="step-icon">🗑️</div>
            <h4>Delete Account</h4>
            <p>Select <strong>Delete Account</strong>, review the data erasure summary, and tap <strong>Confirm Permanent Deletion</strong>.</p>
          </div>
        </div>

        <div class="guide-note">
          <strong>Note:</strong> If you signed in via Google Sign-In on Android, your account ownership is validated directly through your Google authentication session without entering a separate password.
        </div>
      </div>
    {/if}

    <!-- Data Transparency Matrix (Crucial for Google Play Policy Reviewers) -->
    <section class="transparency-section">
      <div class="section-title-wrap">
        <span class="pill-tag">DATA SAFETY SPECIFICATIONS</span>
        <h2>Data Scope &amp; Retention Transparency</h2>
        <p>
          To maintain 100% compliance with Google Play Store User Data rules and GDPR Article 17 ("Right to Erasure"), DietWise provides complete transparency regarding how your data is handled during account deletion:
        </p>
      </div>

      <div class="data-grid">
        <!-- Deleted Data -->
        <div class="data-card deleted-data-card">
          <div class="card-top">
            <span class="icon-circle red">🗑️</span>
            <div>
              <h3>Data That IS Permanently Deleted</h3>
              <span class="subtext">Erased from production systems</span>
            </div>
          </div>

          <ul class="check-list red-list">
            <li>
              <strong>Account &amp; Credentials:</strong> Full name, registered email address, password hashes, phone number, avatar photos, and unique Supabase Auth UUID.
            </li>
            <li>
              <strong>Biometrics &amp; Health Metrics:</strong> Current weight, target weight, height, age, BMI logs, blood group, medical history, physical activity levels, and wellness goals.
            </li>
            <li>
              <strong>Diet &amp; Nutrition Tracking:</strong> Daily calorie consumption logs, macro-nutrient breakdowns (proteins, fats, carbs), water hydration logs, and step tracking streaks.
            </li>
            <li>
              <strong>Meal Schedules &amp; Plans:</strong> Custom weekly meal schedules, template diet assignments, favorite recipes, and meal timing preferences.
            </li>
            <li>
              <strong>Dietitian &amp; Support Chat:</strong> Consultation conversations with clinical dietitians, therapeutic feedback notes, and appointment preferences.
            </li>
            <li>
              <strong>Push Notification Tokens:</strong> Firebase Cloud Messaging (FCM) device push tokens, eliminating all promotional and meal reminder triggers.
            </li>
          </ul>
        </div>

        <!-- Retained Data -->
        <div class="data-card retained-data-card">
          <div class="card-top">
            <span class="icon-circle blue">⚖️</span>
            <div>
              <h3>Data That May Be Retained &amp; Legal Grounds</h3>
              <span class="subtext">Strictly limited statutory exceptions</span>
            </div>
          </div>

          <ul class="check-list blue-list">
            <li>
              <strong>Financial &amp; Tax Transaction Records:</strong> Invoices, payment transaction IDs, and sales tax receipts are retained for up to <strong>5 to 7 years</strong> in compliance with mandatory financial accounting and taxation laws. This data contains no biometric health logs and is decoupled from deleted accounts.
            </li>
            <li>
              <strong>Disaster Recovery Backups:</strong> Encrypted, read-only system backups are automatically rotated, overwritten, and permanently purged on a rolling <strong>30-day cycle</strong>.
            </li>
            <li>
              <strong>Aggregated Analytics:</strong> Fully anonymized statistical metrics (e.g. total historical meal log counters without identifiers) that can never be linked back to any individual.
            </li>
          </ul>

          <div class="retained-notice">
            <strong>Legal Basis:</strong> Data retention exceptions are governed strictly by Article 17(3)(b) &amp; (e) of the GDPR (compliance with a legal obligation and establishment of legal defenses).
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline & SLA Section -->
    <section class="timeline-section">
      <h3>Deletion Timelines &amp; SLA Commitment</h3>
      <div class="timeline-steps">
        <div class="time-step">
          <div class="time-icon">⚡</div>
          <div class="time-text">
            <strong>Immediate (Minute 0)</strong>
            <p>Authentication revoked; user sessions invalidated; automated reminders deactivated.</p>
          </div>
        </div>
        <div class="time-arrow">→</div>
        <div class="time-step">
          <div class="time-icon">🗄️</div>
          <div class="time-text">
            <strong>Within 24 to 48 Hours</strong>
            <p>Direct database cascade deletes profiles, logs, and custom plans from active storage.</p>
          </div>
        </div>
        <div class="time-arrow">→</div>
        <div class="time-step">
          <div class="time-icon">🛡️</div>
          <div class="time-text">
            <strong>Maximum 30 Days</strong>
            <p>Complete purging and overwriting across all encrypted disaster recovery backup snapshots.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="section-title-wrap">
        <span class="pill-tag">FREQUENTLY ASKED QUESTIONS</span>
        <h2>Common Questions About Account Deletion</h2>
      </div>

      <div class="faq-list">
        <div class="faq-item">
          <h4>Can I recover my diet logs or weight history once deleted?</h4>
          <p>
            No. Deletion is permanent and irreversible. We strongly recommend exporting any needed data before initiating an account deletion request.
          </p>
        </div>

        <div class="faq-item">
          <h4>What if I subscribed to DietWise Premium through Google Play?</h4>
          <p>
            You must cancel your subscription through your Google Play Store account settings. Deleting your DietWise account will terminate your access to Premium features, but Google will continue to bill your payment method until you cancel the active subscription in the Play Store.
          </p>
        </div>

        <div class="faq-item">
          <h4>I uninstalled the app months ago. How do I delete my data?</h4>
          <p>
            Simply use the <strong>Submit Deletion Request</strong> form above on this page. You do not need to reinstall the DietWise app or remember your password. Our data protection team will process the request using your registered email.
          </p>
        </div>

        <div class="faq-item">
          <h4>What if I signed up using Google Sign-In?</h4>
          <p>
            If you signed up using Google on your Android phone, enter the Google account email address associated with your DietWise app in the deletion form above.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact & DPO Card -->
    <section class="contact-dpo-card">
      <div class="dpo-icon">📬</div>
      <div class="dpo-info">
        <h3>Need Assistance or Have Questions Regarding Your Data?</h3>
        <p>
          If you have special data privacy requests, require assistance exporting your records, or need to follow up on an existing deletion Reference ID, our dedicated Data Protection Officer is ready to help:
        </p>
        <div class="contact-links">
          <a href="mailto:privacy@nutricare.com" class="contact-badge">
            ✉️ Email Data Protection Officer: <strong>privacy@nutricare.com</strong>
          </a>
          <a href="mailto:support@nutricare.com" class="contact-badge">
            💬 Customer Support: <strong>support@nutricare.com</strong>
          </a>
        </div>
      </div>
    </section>

  </main>

  <!-- Global Footer -->
  <footer class="deletion-footer">
    <div class="container footer-content">
      <div class="footer-left">
        <div class="footer-brand">
          <div class="brand-badge-dot sm"></div>
          <span>DietWise Health Portal</span>
        </div>
        <p class="copyright">© 2026 NutriCare Systems Inc. All rights reserved.</p>
        <p class="compliance-note">Operated in accordance with Google Play Developer Program Policies, GDPR (EU 2016/679), and CCPA regulations.</p>
      </div>

      <div class="footer-links">
        <a href="/terms">Terms &amp; Conditions</a>
        <span class="sep">•</span>
        <a href="/privacy">Privacy Policy</a>
        <span class="sep">•</span>
        <a href="/legal">Legal Hub</a>
        <span class="sep">•</span>
        <a href="/delete-account" class="active">Delete Account</a>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    background-color: #0B1120 !important;
    color: #F8FAFC !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .deletion-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.25) 0%, rgba(11, 17, 32, 1) 70%);
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
  }

  /* Header */
  .deletion-header {
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: #FFFFFF;
  }

  .brand-badge-dot {
    width: 12px;
    height: 12px;
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 14px rgba(16, 185, 129, 0.6);
  }

  .brand-badge-dot.sm {
    width: 8px;
    height: 8px;
  }

  .brand-title {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #FFFFFF;
  }

  .brand-tag {
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .header-nav {
    display: flex;
    gap: 1.25rem;
  }

  .nav-item {
    color: #94A3B8;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-item:hover {
    color: #FFFFFF;
  }

  /* Hero Banner */
  .hero-banner {
    padding: 3.5rem 0 2.5rem;
    text-align: center;
  }

  .compliance-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #93C5FD;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .hero-banner h1 {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.2;
    color: #FFFFFF;
    margin-bottom: 1rem;
    letter-spacing: -0.03em;
  }

  .hero-desc {
    max-width: 780px;
    margin: 0 auto 1.5rem;
    color: #94A3B8;
    font-size: 1.0625rem;
    line-height: 1.6;
  }

  .hero-desc strong {
    color: #E2E8F0;
  }

  .entity-info-bar {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1.25rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    color: #CBD5E1;
  }

  .sep {
    color: #475569;
  }

  /* Main layout */
  .main-content {
    flex: 1;
    padding-bottom: 4rem;
  }

  /* Subscription Warning Card (Play Store Requirement) */
  .subscription-warning-card {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(180, 83, 9, 0.08) 100%);
    border: 1.5px solid rgba(245, 158, 11, 0.4);
    border-radius: 1rem;
    padding: 1.5rem 1.75rem;
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.08);
  }

  .warning-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .warning-content h4 {
    color: #FCD34D;
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .warning-content p {
    color: #E2E8F0;
    font-size: 0.9375rem;
    line-height: 1.55;
    margin-bottom: 0.75rem;
  }

  .play-steps-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .play-step {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: 0.5rem;
    padding: 0.6rem 0.85rem;
    font-size: 0.8125rem;
    color: #FEF3C7;
  }

  .play-link-box {
    margin-top: 0.75rem;
  }

  .btn-google-play-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: #D97706;
    color: #FFFFFF;
    font-weight: 700;
    font-size: 0.875rem;
    text-decoration: none;
    padding: 0.5rem 1.25rem;
    border-radius: 0.5rem;
    transition: background 0.2s, transform 0.1s;
  }

  .btn-google-play-link:hover {
    background: #B45309;
    transform: translateY(-1px);
  }

  /* Alerts */
  .alert-box {
    border-radius: 1rem;
    padding: 1.75rem;
    display: flex;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .success-alert {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
    border: 1.5px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
  }

  .alert-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .alert-body h3 {
    color: #6EE7B7;
    font-size: 1.35rem;
    margin-bottom: 0.5rem;
  }

  .alert-body p {
    color: #E2E8F0;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .sub-alert {
    font-size: 0.875rem;
    color: #94A3B8 !important;
    margin-top: 1rem;
  }

  .receipt-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.75rem;
    padding: 1.25rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .receipt-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .receipt-item .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94A3B8;
  }

  .receipt-item .val {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #FFFFFF;
  }

  .receipt-item .highlight {
    color: #34D399;
    font-size: 1.15rem;
  }

  .status-pill {
    display: inline-block;
    background: rgba(16, 185, 129, 0.2);
    color: #34D399;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 700;
    width: fit-content;
  }

  .btn-print {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-print:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .error-banner {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #FCA5A5;
    padding: 0.85rem 1.25rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
  }

  /* Portal Nav Tabs */
  .portal-nav-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    .portal-nav-tabs {
      grid-template-columns: 1fr;
    }
  }

  .tab-button {
    background: rgba(30, 41, 59, 0.6);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.875rem;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    color: #94A3B8;
  }

  .tab-button:hover {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(255, 255, 255, 0.18);
    color: #FFFFFF;
  }

  .tab-button.active {
    background: rgba(30, 58, 138, 0.4);
    border-color: #3B82F6;
    color: #FFFFFF;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
  }

  .tab-icon {
    font-size: 1.75rem;
    line-height: 1;
  }

  .tab-text strong {
    display: block;
    font-size: 0.9375rem;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 0.2rem;
  }

  .tab-text small {
    display: block;
    font-size: 0.75rem;
    color: #94A3B8;
  }

  /* Card and Form Styles */
  .card {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2.25rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    margin-bottom: 2.5rem;
  }

  .card-header {
    margin-bottom: 1.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 1.25rem;
  }

  .card-header h2 {
    font-size: 1.5rem;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
  }

  .card-header p {
    color: #94A3B8;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .form-layout {
    display: flex;
    flex-direction: column;
    gap: 1.35rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #E2E8F0;
  }

  .required {
    color: #EF4444;
  }

  .optional {
    color: #64748B;
    font-weight: 400;
  }

  .helper-text {
    font-size: 0.75rem;
    color: #64748B;
  }

  input[type="email"],
  input[type="tel"],
  input[type="password"],
  input[type="text"],
  select,
  textarea {
    background: rgba(11, 17, 32, 0.8) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 0.625rem !important;
    color: #FFFFFF !important;
    padding: 0.75rem 1rem !important;
    font-size: 0.9375rem !important;
    font-family: inherit;
    transition: all 0.2s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
  }

  .highlight-input-group input {
    border-color: rgba(239, 68, 68, 0.4) !important;
    font-family: monospace;
    font-size: 1.1rem !important;
    letter-spacing: 0.1em;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    padding: 1.25rem;
    margin: 0.5rem 0;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #CBD5E1;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 0.2rem;
    accent-color: #EF4444;
    cursor: pointer;
    flex-shrink: 0;
  }

  .checkbox-label strong {
    color: #FFFFFF;
  }

  .danger-callout {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    color: #FECACA;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .btn-submit-danger {
    background: #DC2626;
    color: #FFFFFF;
    border: none;
    border-radius: 0.625rem;
    padding: 0.85rem 1.75rem;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
  }

  .btn-submit-danger:hover:not(:disabled) {
    background: #B91C1C;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
  }

  .btn-submit-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #FFFFFF;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* In-App Steps Grid */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    margin: 1.5rem 0;
  }

  .step-card {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.875rem;
    padding: 1.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .step-card.danger-step {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.05);
  }

  .step-badge {
    background: rgba(59, 130, 246, 0.2);
    color: #60A5FA;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    width: fit-content;
    text-transform: uppercase;
  }

  .step-badge.danger {
    background: rgba(239, 68, 68, 0.2);
    color: #F87171;
  }

  .step-icon {
    font-size: 2rem;
  }

  .step-card h4 {
    color: #FFFFFF;
    font-size: 1.1rem;
  }

  .step-card p {
    color: #94A3B8;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .guide-note {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.625rem;
    padding: 1rem 1.25rem;
    font-size: 0.875rem;
    color: #94A3B8;
  }

  .guide-note strong {
    color: #E2E8F0;
  }

  /* Data Transparency Section */
  .transparency-section {
    margin: 3.5rem 0;
  }

  .section-title-wrap {
    text-align: center;
    margin-bottom: 2rem;
  }

  .pill-tag {
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 0.2rem 0.75rem;
    border-radius: 999px;
    letter-spacing: 0.05em;
    display: inline-block;
    margin-bottom: 0.75rem;
  }

  .section-title-wrap h2 {
    font-size: 2rem;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
  }

  .section-title-wrap p {
    color: #94A3B8;
    max-width: 720px;
    margin: 0 auto;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .data-card {
    background: rgba(15, 23, 42, 0.7);
    border-radius: 1rem;
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .deleted-data-card {
    border: 1.5px solid rgba(239, 68, 68, 0.3);
    background: linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%);
  }

  .retained-data-card {
    border: 1.5px solid rgba(59, 130, 246, 0.3);
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 1rem;
  }

  .icon-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
  }

  .icon-circle.red {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
  }

  .icon-circle.blue {
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.4);
  }

  .card-top h3 {
    font-size: 1.15rem;
    color: #FFFFFF;
    margin-bottom: 0.2rem;
  }

  .card-top .subtext {
    font-size: 0.75rem;
    color: #94A3B8;
  }

  .check-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .check-list li {
    font-size: 0.875rem;
    color: #CBD5E1;
    line-height: 1.5;
    position: relative;
    padding-left: 1.5rem;
  }

  .red-list li::before {
    content: "✕";
    position: absolute;
    left: 0;
    color: #EF4444;
    font-weight: 800;
  }

  .blue-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #3B82F6;
    font-weight: 800;
  }

  .check-list strong {
    color: #FFFFFF;
  }

  .retained-notice {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    color: #94A3B8;
    line-height: 1.45;
  }

  .retained-notice strong {
    color: #E2E8F0;
  }

  /* Timeline & SLA */
  .timeline-section {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    padding: 2rem;
    margin: 2.5rem 0;
    text-align: center;
  }

  .timeline-section h3 {
    color: #FFFFFF;
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .timeline-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }

  .time-step {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1.25rem;
    max-width: 260px;
    text-align: left;
  }

  .time-icon {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .time-text strong {
    display: block;
    color: #FFFFFF;
    font-size: 0.9375rem;
    margin-bottom: 0.3rem;
  }

  .time-text p {
    color: #94A3B8;
    font-size: 0.8125rem;
    line-height: 1.45;
  }

  .time-arrow {
    font-size: 1.5rem;
    color: #475569;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    .time-arrow {
      display: none;
    }
  }

  /* FAQ */
  .faq-section {
    margin: 3.5rem 0;
  }

  .faq-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.25rem;
  }

  .faq-item {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.875rem;
    padding: 1.5rem;
  }

  .faq-item h4 {
    color: #FFFFFF;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .faq-item p {
    color: #94A3B8;
    font-size: 0.875rem;
    line-height: 1.55;
  }

  /* DPO Card */
  .contact-dpo-card {
    background: linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%);
    border: 1.5px solid rgba(59, 130, 246, 0.3);
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 2rem;
  }

  @media (max-width: 640px) {
    .contact-dpo-card {
      flex-direction: column;
      text-align: center;
    }
  }

  .dpo-icon {
    font-size: 2.5rem;
  }

  .dpo-info h3 {
    color: #FFFFFF;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .dpo-info p {
    color: #94A3B8;
    font-size: 0.9375rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .contact-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .contact-badge {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #E2E8F0;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: background 0.2s;
  }

  .contact-badge:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #FFFFFF;
  }

  .contact-badge strong {
    color: #60A5FA;
  }

  /* Footer */
  .deletion-footer {
    background: #070D18;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 2.5rem 0;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 0.35rem;
  }

  .copyright {
    color: #64748B;
    font-size: 0.8125rem;
  }

  .compliance-note {
    color: #475569;
    font-size: 0.75rem;
    margin-top: 0.35rem;
  }

  .footer-links {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .footer-links a {
    color: #94A3B8;
    text-decoration: none;
    font-size: 0.8125rem;
    transition: color 0.2s;
  }

  .footer-links a:hover,
  .footer-links a.active {
    color: #38BDF8;
  }

  @media print {
    .deletion-header,
    .portal-nav-tabs,
    .form-card,
    .subscription-warning-card,
    .transparency-section,
    .timeline-section,
    .faq-section,
    .contact-dpo-card,
    .deletion-footer {
      display: none !important;
    }

    body, .deletion-page {
      background: white !important;
      color: black !important;
    }

    .alert-box {
      border: 1px solid #000 !important;
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }

    .receipt-card {
      background: #f8f9fa !important;
      color: black !important;
      border: 1px solid #ccc !important;
    }

    .receipt-item .val, .receipt-item .label {
      color: black !important;
    }
  }
</style>
