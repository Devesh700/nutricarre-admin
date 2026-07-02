import { supabase } from '$lib/supabase';

export async function load() {
    const { data: reels } = await supabase
        .from('videos')
        .select('*')
        .eq('video_type', 'reel')
        .order('created_at', { ascending: false });

    return {
        reels: reels || []
    };
}
