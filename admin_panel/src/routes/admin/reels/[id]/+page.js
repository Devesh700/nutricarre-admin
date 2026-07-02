import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { data: reel, error: err } = await supabase
        .from('videos')
        .select('*')
        .eq('id', params.id)
        .single();

    if (err || !reel) {
        throw error(404, 'Reel not found');
    }

    return {
        reel
    };
}
