import { supabaseAdmin } from '$lib/supabaseAdmin';
import { error, fail } from '@sveltejs/kit';

export async function load() {
    const { data: consultants, error: err } = await supabaseAdmin
        .from('consultants')
        .select('*')
        .order('created_at', { ascending: false });

    if (err) throw error(500, err.message);

    return {
        consultants: consultants || []
    };
}

export const actions = {
    updateStatus: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');
        const status = data.get('status');

        if (!id || !status) {
            return fail(400, { message: 'ID and status are required' });
        }

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return fail(400, { message: 'Invalid status' });
        }

        const { error: err } = await supabaseAdmin
            .from('consultants')
            .update({ status })
            .eq('id', id);

        if (err) return fail(400, { message: err.message });

        return { success: true };
    },

    delete: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');
        const userId = data.get('user_id');

        if (!id) return fail(400, { message: 'ID is required' });

        // Delete the auth user if they exist
        if (userId) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
        }

        const { error: err } = await supabaseAdmin
            .from('consultants')
            .delete()
            .eq('id', id);

        if (err) return fail(400, { message: err.message });

        return { success: true };
    }
};
