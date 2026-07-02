import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/private'
import { env as publicEnv } from '$env/dynamic/public'

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

let _adminClient = null;

function getAdminClient() {
  if (_adminClient) return _adminClient;
  _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return _adminClient;
}

export const supabaseAdmin = new Proxy({}, {
  get(_, prop) {
    return getAdminClient()[prop];
  }
});
