import { supabase } from '$lib/supabase';

export const load = async () => {
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            *,
            profiles:user_id (
                id,
                full_name,
                email
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return {
            transactions: [],
            error: error.message
        };
    }

    return {
        transactions: transactions || [],
        error: null
    };
};
