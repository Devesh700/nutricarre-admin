import { supabase } from '$lib/supabase';

export async function load() {
    try {
        const { data: banners, error } = await supabase
            .from('homepage_banners')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        return {
            banners: banners || []
        };
    } catch (err) {
        console.warn('Failed to load real banners, returning mock data:', err.message);
        // Fallback mock banners in case table is not ready or mock mode is active
        return {
            banners: [
                {
                    id: 1,
                    title: 'Sip Your Way to Vitality',
                    subtitle: 'Hydration is key to healthy energy levels and metabolism.',
                    image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1200&auto=format&fit=crop',
                    display_order: 1,
                    is_active: true
                },
                {
                    id: 2,
                    title: 'Clean Eating made Delicious',
                    subtitle: 'Explore our curated doctor-approved healthy recipes database.',
                    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop',
                    display_order: 2,
                    is_active: true
                },
                {
                    id: 3,
                    title: 'Power Up Your Workout',
                    subtitle: 'Proper pre-workout and post-workout meals for clean muscle build.',
                    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
                    display_order: 3,
                    is_active: true
                }
            ]
        };
    }
}
