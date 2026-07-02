import { supabaseAdmin } from '$lib/supabaseAdmin';
import { error, fail } from '@sveltejs/kit';

export async function load({ locals }) {
    const { data: employees, error: err } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'employee')
        .order('joined_at', { ascending: false });

    if (err) throw error(500, err.message);

    return {
        employees: employees || []
    };
}

export const actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');
        const fullName = data.get('fullName');

        if (!email || !password || !fullName) {
            return fail(400, { message: 'All fields are required' });
        }

        // 1. Create the auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            return fail(400, { message: authError.message });
        }

        // 2. Upsert the profile with employee role
        // We use upsert because the auth trigger might not have finished creating the profile yet
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({ 
                id: authData.user.id,
                email: email,
                role: 'employee',
                full_name: fullName,
                joined_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('Profile Upsert Error:', profileError);
            return fail(400, { message: 'User created but profile role assignment failed: ' + profileError.message });
        }

        return { success: true };
    },

    delete: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');

        if (!id) return fail(400, { message: 'ID is required' });

        const { error: err } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (err) return fail(400, { message: err.message });

        return { success: true };
    }
};
