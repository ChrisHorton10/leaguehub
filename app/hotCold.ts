export async function saveWeeklyStats(supabase: any, week: number, matchups: any[], allPlayers: any, weekStats: any) {
    const { data: existing } = await supabase
      .from("player_weekly_stats")
      .select("id")
      .eq("week", week)
      .limit(1);
  
    if (existing && existing.length > 0) return;
  
    const rows: any[] = [];
    const startedIds = new Set<string>();
    matchups.forEach((m: any) => (m.starters || []).forEach((id: string) => startedIds.add(id)));
  
    startedIds.forEach(id => {
      const player = allPlayers[id];
      const stats = weekStats[id];
      if (!player || !stats || !["QB", "RB", "WR", "TE"].includes(player.position)) return;
  
      const actual = stats.pts_ppr || stats.pts_half_ppr || stats.pts_std || 0;
      const projected = stats.proj_pts_ppr || stats.proj_pts_half_ppr || stats.proj_pts_std || 0;
  
      rows.push({
        week,
        player_id: id,
        player_name: player.full_name,
        position: player.position,
        actual_pts: actual,
        projected_pts: projected
      });
    });
  
    if (rows.length > 0) {
      await supabase.from("player_weekly_stats").insert(rows);
    }
  }
  
  export async function getHotColdPlayers(supabase: any, currentWeek: number) {
    if (currentWeek < 3) return { hot: [], cold: [] };
  
    const weeksToCheck = [currentWeek - 2, currentWeek - 1, currentWeek];
  
    const { data: stats } = await supabase
      .from("player_weekly_stats")
      .select("*")
      .in("week", weeksToCheck);
  
    if (!stats || stats.length === 0) return { hot: [], cold: [] };
  
    const playerMap: any = {};
    stats.forEach((row: any) => {
      if (!playerMap[row.player_id]) {
        playerMap[row.player_id] = {
          name: row.player_name,
          position: row.position,
          weeks: []
        };
      }
      playerMap[row.player_id].weeks.push({
        actual: row.actual_pts,
        projected: row.projected_pts,
        diff: row.actual_pts - row.projected_pts
      });
    });
  
    const qualified = Object.values(playerMap).filter((p: any) => p.weeks.length === 3);
  
    const withAvg = qualified.map((p: any) => {
      const avgDiff = p.weeks.reduce((sum: number, w: any) => sum + w.diff, 0) / p.weeks.length;
      const avgActual = p.weeks.reduce((sum: number, w: any) => sum + w.actual, 0) / p.weeks.length;
      return { ...p, avgDiff, avgActual };
    });
  
    const hot = withAvg
      .filter((p: any) => p.avgDiff > 0)
      .sort((a: any, b: any) => b.avgDiff - a.avgDiff)
      .slice(0, 5);
  
    const cold = withAvg
      .filter((p: any) => p.avgDiff < 0)
      .sort((a: any, b: any) => a.avgDiff - b.avgDiff)
      .slice(0, 5);
  
    return { hot, cold };
  }