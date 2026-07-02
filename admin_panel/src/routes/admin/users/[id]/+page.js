import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { id } = params;

    const [
        userResponse,
        caloriesResponse,
        hydrationResponse,
        mealResponse,
        subscriptionPlansResponse,
        assignmentResponse,
        scheduleResponse,
        recipesResponse
    ] = await Promise.all([
        supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single(),
        supabase
            .from('calorie_logs')
            .select('*')
            .eq('user_id', id)
            .order('logged_at', { ascending: false })
            .limit(20),
        supabase
            .from('hydration_logs')
            .select('*')
            .eq('user_id', id)
            .order('logged_at', { ascending: false })
            .limit(20),
        supabase
            .from('meal_logs')
            .select('*, schedule:schedule_id(meal_name, recipes(name))')
            .eq('user_id', id)
            .order('log_date', { ascending: false })
            .limit(20),
        supabase
            .from('subscription_plans')
            .select('id, name, target_goal, price, duration_months, diet_template_id, accessible_weeks, assignment_mode, fixed_start_week, is_popular, features'),
        supabase
            .from('user_diet_assignments')
            .select('*, subscription_plans(id, name, target_goal), diet_templates(diet_name, diet_code, total_weeks, calories_min, calories_max)')
            .eq('user_id', id)
            .order('assigned_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from('user_meal_schedule')
            .select('*, recipes(*)')
            .eq('user_id', id)
            .order('day_index'),
        supabase
            .from('recipes')
            .select('*')
            .order('name')
    ]);

    if (userResponse.error) {
        throw error(404, 'User not found');
    }

    let templateMeals = [];
    let totalWeeks = 0;
    let accessibleWeeks = 0;

    const assignment = assignmentResponse.data;
    if (assignment) {
        const dietCode = assignment.diet_templates?.diet_code;
        totalWeeks = assignment.weeks_granted || 0;
        accessibleWeeks = assignment.weeks_granted || 0;

        if (dietCode) {
            const startWeek = assignment.actual_start_week || 1;
            const endWeek = assignment.actual_end_week || (startWeek + totalWeeks - 1);

            const { data: meals } = await supabase
                .from('diet_template_meals')
                .select('*, meal_library(*)')
                .eq('diet_code', dietCode)
                .gte('week_no', startWeek)
                .lte('week_no', endWeek)
                .order('week_no')
                .order('day_no')
                .order('meal_time');

            templateMeals = meals || [];
        }
    }

    return {
        profile: userResponse.data,
        calorieLogs: caloriesResponse.data || [],
        hydrationLogs: hydrationResponse.data || [],
        mealLogs: mealResponse.data || [],
        subscriptionPlans: subscriptionPlansResponse.data || [],
        currentAssignment: assignment,
        schedule: scheduleResponse.data || [],
        recipes: recipesResponse.data || [],
        templateMeals,
        totalWeeks,
        accessibleWeeks
    };
}

