import { supabaseAdmin } from '$lib/supabaseAdmin';
import { fail } from '@sveltejs/kit';

export const actions = {
  deleteUser: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId');

    if (!userId) {
      return fail(400, { message: 'User ID is required' });
    }

    // 1. Delete from auth.users (This will cascade to public.profiles if setup correctly)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return fail(500, { message: authError.message });
    }

    return { success: true };
  },

  toggleActive: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId');
    const isActive = formData.get('isActive') === 'true';

    if (!userId) {
      return fail(400, { message: 'User ID is required' });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return fail(500, { message: error.message });
    }

    return { success: true };
  }
};
