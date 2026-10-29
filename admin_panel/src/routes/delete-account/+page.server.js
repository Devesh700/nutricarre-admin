import { supabaseAdmin } from '$lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { fail } from '@sveltejs/kit';

function generateReferenceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'DTR-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export const load = async ({ url }) => {
  return {
    emailParam: url.searchParams.get('email') || ''
  };
};

export const actions = {
  // Method 1: Public Deletion Request (Without Password / Uninstalled App)
  requestDeletion: async ({ request, getClientAddress }) => {
    const formData = await request.formData();
    const email = (formData.get('email') || '').toString().trim().toLowerCase();
    const phone = (formData.get('phone') || '').toString().trim();
    const reason = (formData.get('reason') || '').toString().trim();
    const notes = (formData.get('notes') || '').toString().trim();
    const confirmIrreversible = formData.get('confirmIrreversible') === 'on';
    const confirmSubscription = formData.get('confirmSubscription') === 'on';

    if (!email || !email.includes('@')) {
      return fail(400, {
        requestError: 'A valid registered email address is required.',
        email,
        phone,
        reason,
        notes
      });
    }

    if (!confirmIrreversible) {
      return fail(400, {
        requestError: 'You must confirm that you understand account and data erasure is permanent.',
        email,
        phone,
        reason,
        notes
      });
    }

    if (!confirmSubscription) {
      return fail(400, {
        requestError: 'You must acknowledge the Google Play subscription cancellation policy.',
        email,
        phone,
        reason,
        notes
      });
    }

    const referenceId = generateReferenceId();
    let ip = '';
    try {
      ip = getClientAddress();
    } catch {
      ip = 'unknown';
    }

    let foundProfile = null;
    try {
      // Check if profile exists
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, is_active')
        .ilike('email', email)
        .maybeSingle();

      foundProfile = profile;

      if (profile && profile.id) {
        // Deactivate account immediately so user cannot be logged in or receive reminders
        await supabaseAdmin
          .from('profiles')
          .update({ is_active: false })
          .eq('id', profile.id);
      }

      // Record deletion request in database if table is available
      try {
        await supabaseAdmin.from('account_deletion_requests').insert({
          reference_id: referenceId,
          user_id: profile ? profile.id : null,
          email,
          phone: phone || null,
          reason: reason || 'Not specified',
          notes: notes || null,
          status: 'pending',
          ip_address: ip,
          scheduled_purge_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } catch (tableErr) {
        console.warn('account_deletion_requests table insert skipped or unavailable:', tableErr?.message);
      }
    } catch (err) {
      console.error('Error processing deletion request:', err);
    }

    const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      requestSubmitted: true,
      referenceId,
      email,
      accountFound: !!foundProfile,
      scheduledPurgeDate: purgeDate
    };
  },

  // Method 2: Instant Self-Service Deletion (Verify Credentials & Immediate Wipe)
  directDelete: async ({ request }) => {
    const formData = await request.formData();
    const email = (formData.get('email') || '').toString().trim().toLowerCase();
    const password = (formData.get('password') || '').toString();
    const confirmKeyword = (formData.get('confirmKeyword') || '').toString().trim();

    if (!email || !password) {
      return fail(400, {
        instantError: 'Email and password are required for instant account verification.',
        directEmail: email
      });
    }

    if (confirmKeyword !== 'DELETE') {
      return fail(400, {
        instantError: 'Please type DELETE exactly in uppercase to confirm account termination.',
        directEmail: email
      });
    }

    // Authenticate user to verify identity
    const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return fail(500, {
        instantError: 'Authentication service temporarily unavailable.',
        directEmail: email
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return fail(401, {
        instantError: authError?.message || 'Invalid credentials. Could not verify account ownership.',
        directEmail: email
      });
    }

    const userId = authData.user.id;

    // Permanently delete user from auth.users (cascades to public.profiles and all associated tracking data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Failed to permanently delete user:', deleteError);
      return fail(500, {
        instantError: 'Failed to delete account from system. Please contact privacy@nutricare.com.',
        directEmail: email
      });
    }

    // Try logging completed record in deletion requests
    const referenceId = generateReferenceId();
    try {
      await supabaseAdmin.from('account_deletion_requests').insert({
        reference_id: referenceId,
        user_id: null,
        email,
        reason: 'Instant user self-service deletion',
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    } catch {
      // Ignore if table not present
    }

    return {
      instantDeleted: true,
      email,
      referenceId,
      timestamp: new Date().toUTCString()
    };
  }
};
