import { supabase } from '$lib/supabase';

export const load = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: userCount },
    { count: planCount },
    { data: calorieLogs },
    { data: recentUsers },
    { data: transactions },
    { data: newProfiles }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('diet_plans').select('*', { count: 'exact', head: true }),
    supabase.from('calorie_logs')
      .select('calories, logged_at')
      .gte('logged_at', thirtyDaysAgo.toISOString()),
    supabase.from('profiles')
      .select('*')
      .order('joined_at', { ascending: false })
      .limit(5),
    supabase.from('transactions').select('amount'),
    supabase.from('profiles')
      .select('joined_at')
      .gte('joined_at', thirtyDaysAgo.toISOString())
  ]);

  const totalCalories = calorieLogs?.reduce((sum, log) => sum + log.calories, 0) || 0;
  const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

  // Build weekly chart (last 7 days)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const logCount = calorieLogs?.filter(l => {
      return new Date(l.logged_at).toISOString().split('T')[0] === dateStr;
    }).length || 0;

    const signupCount = newProfiles?.filter(p => {
      return new Date(p.joined_at).toISOString().split('T')[0] === dateStr;
    }).length || 0;

    chartData.push({
      label: days[d.getDay()],
      value: logCount + signupCount
    });
  }

  return {
    stats: {
      userCount: userCount || 0,
      planCount: planCount || 0,
      totalCalories,
      revenue: totalRevenue
    },
    chartData,
    recentUsers: recentUsers || []
  };
};
