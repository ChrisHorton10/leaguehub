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
  
      const actual = stats.pts_ppr || 0;
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
      .in("week", weeksToCheck)
      .gte("actual_pts", 5);
  
    if (!stats || stats.length === 0) return { hot: [], cold: [] };
  
    const playerMap: any = {};
    stats.forEach((row: any) => {
        if (!playerMap[row.player_id]) {
          playerMap[row.player_id] = {
            name: row.player_name,
            position: row.position,
            weekMap: {}
          };
        }
        // Only keep one entry per week (latest)
        playerMap[row.player_id].weekMap[row.week] = {
          actual: row.actual_pts,
          projected: row.projected_pts,
          diff: row.actual_pts - row.projected_pts
        };
      });
    
      // Convert weekMap to weeks array
      Object.values(playerMap).forEach((p: any) => {
        p.weeks = Object.values(p.weekMap);
      });
    
      const qualified = Object.values(playerMap).filter((p: any) =>
        p.weeks.length >= 3 && p.weeks.every((w: any) => w.actual >= 8)
      );
      
      console.log("Total players in map:", Object.keys(playerMap).length);
      console.log("Qualified players:", qualified.length);
      const jsnCheck = playerMap["9488"];
      console.log("JSN data:", JSON.stringify(jsnCheck));
  
    const positionThresholds: any = {
        QB: 18,
        RB: 12,
        WR: 12,
        TE: 10
      };
    
      const withAvg = qualified.map((p: any) => {
        const avgActual = p.weeks.reduce((sum: number, w: any) => sum + w.actual, 0) / p.weeks.length;
        const threshold = positionThresholds[p.position] || 10;
        const avgDiff = avgActual - threshold;
        return { ...p, avgDiff, avgActual };
      });
    
      const positions = ["QB", "RB", "WR", "TE"];
      const hot: any[] = [];
      const cold: any[] = [];
    
      positions.forEach(pos => {
        const posPlayers = withAvg.filter((p: any) => p.position === pos);
    
        const hotPos = posPlayers
          .filter((p: any) => p.avgDiff > 0)
          .sort((a: any, b: any) => b.avgDiff - a.avgDiff)
          .slice(0, 2);
    
        const coldPos = posPlayers
          .filter((p: any) => p.avgDiff < 0)
          .sort((a: any, b: any) => a.avgDiff - b.avgDiff)
          .slice(0, 2);
    
        hot.push(...hotPos);
        cold.push(...coldPos);
      });
  
    return { hot, cold };
  }