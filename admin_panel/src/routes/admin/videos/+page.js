import { supabase } from '$lib/supabase';

export async function load() {
  const [videosResponse, seriesResponse] = await Promise.all([
    supabase.from('videos').select('*').order('created_at', { ascending: false }),
    supabase.from('series').select('*').order('created_at', { ascending: false })
  ]);

  if (videosResponse.error) console.error('Error fetching videos:', videosResponse.error);
  if (seriesResponse.error) console.error('Error fetching series:', seriesResponse.error);

  return {
    videos: videosResponse.data || [],
    series: seriesResponse.data || []
  };
}
