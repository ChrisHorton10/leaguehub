import { createClient } from "@supabase/supabase-js";
import { generateTeamBlurbs, LAST_YEAR_FINISH } from "./generateBlurbs";
import { generateMatchupRecaps } from "./generateRecaps";
import { saveWeeklyStats, getHotColdPlayers } from "./hotCold";
import { getClaudeRosterScores } from "./scoreRosters";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LEAGUE_ID = "1330820695583625216";
const CURRENT_WEEK = 1;
const IS_OFFSEASON = true;

const MANAGER_NICKNAMES: Record<string, string> = {
  "chrishorton10": "Commish",
  "BCregg": "Cregg",
  "ScubaSteve0709": "Scuba Steve",
  "kmyers": "Kyle",
  "Sher2Lose": "Sherlock",
  "Broth22": "Brothers",
  "shazman123": "Shaz",
  "ctracewell": "Tracewell",
  "GrimaceHugeSack": "Grimace",
  "Bdug14": "Dlugos",
  "SamHuman12": "Sam",
  "Gillilig": "Gill"
};

async function getLeagueData() {
  const [rostersRes, usersRes, matchupsRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`, { cache: "no-store" }),
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`, { cache: "no-store" }),
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/matchups/${CURRENT_WEEK}`, { cache: "no-store" })
  ]);

  const rosters = await rostersRes.json();
  const users = await usersRes.json();
  const matchups = await matchupsRes.json();

  return { rosters, users, matchups };
}

export default async function Home() {
  const { rosters, users, matchups } = await getLeagueData();

  const userMap: Record<string, any> = {};
  users.forEach((user: any) => {
    userMap[user.user_id] = {
      name: user.metadata?.team_name || user.display_name,
      username: user.display_name,
      avatar: user.avatar
    };
  });

  let allPlayers: Record<string, any> = {};
  let weekProjections: Record<string, any> = {};
  try {
    const [playersRes, projectionsRes] = await Promise.all([
      fetch("https://api.sleeper.app/v1/players/nfl", { cache: "no-store" }),
      fetch(`https://api.sleeper.app/v1/projections/nfl/regular/2026/${CURRENT_WEEK}`, { cache: "no-store" })
    ]);
    allPlayers = await playersRes.json();
    weekProjections = await projectionsRes.json();
  } catch (e) {
    console.log("Could not fetch players or projections", e);
  }

  const rosterInjuries: Record<string, any[]> = {};
  const rosterPlayers: Record<string, string[]> = {};
  const rosterScores: Record<string, number> = {};
  const rosterTeamData: any[] = [];

  rosters.forEach((roster: any) => {
    const user = userMap[roster.owner_id];
    if (!user) return;

    const actualStarters = (roster.starters || []).map((id: string) => {
      const player = allPlayers[id];
      const proj = weekProjections[id];
      const pts = proj?.pts_ppr || 0;
      if (!player) return { player_id: id, full_name: id, position: "DST", pts_ppr: pts };
      return { ...player, player_id: id, pts_ppr: pts };
    });

    const projectedPts = actualStarters.reduce((sum: number, p: any) => sum + (p.pts_ppr || 0), 0);

    const startingLineup = actualStarters.filter((p: any) =>
      p.full_name && ["QB", "RB", "WR", "TE"].includes(p.position)
    );

    const starterIds = new Set(actualStarters.map((p: any) => p.player_id));
    const taxiIds = new Set((roster.taxi || []) as string[]);
    const reserveIds = new Set((roster.reserve || []) as string[]);

    const benchPlayers = (roster.players || [])
      .filter((id: string) => !starterIds.has(id) && !taxiIds.has(id) && !reserveIds.has(id))
      .map((id: string) => {
        const player = allPlayers[id];
        const proj = weekProjections[id];
        return { ...player, player_id: id, pts_ppr: proj?.pts_ppr || 0 };
      })
      .filter((p: any) => p && p.full_name && ["QB", "RB", "WR", "TE"].includes(p.position))
      .sort((a: any, b: any) => b.pts_ppr - a.pts_ppr)
      .slice(0, 5);

    const benchScore = benchPlayers.reduce((sum: number, p: any) => sum + (p.pts_ppr || 0), 0);
    const lineupScore = (projectedPts * 0.75) + (benchScore * 0.25);

    rosterScores[user.username] = lineupScore;
    rosterPlayers[user.username] = startingLineup.map((p: any) => `${p.full_name} (${p.position})`);

    const injured = (roster.players || [])
      .map((id: string) => allPlayers[id])
      .filter((p: any) => p && p.injury_status && ["Out", "IR", "Doubtful", "Questionable"].includes(p.injury_status))
      .map((p: any) => `${p.full_name} (${p.injury_status})`);
    if (injured.length > 0) rosterInjuries[user.username] = injured;

    rosterTeamData.push({
      username: user.username,
      teamName: user.name || user.username,
      nickname: MANAGER_NICKNAMES[user.username] || user.username,
      starters: startingLineup.map((p: any) => `${p.full_name} (${p.position}) proj:${p.pts_ppr.toFixed(1)}`),
      bench: benchPlayers.map((p: any) => `${p.full_name} (${p.position}) proj:${p.pts_ppr.toFixed(1)}`),
      projectedPts
    });
  });

  let claudeScores: Record<string, number> = {};
  try {
    const { data: cachedScores } = await supabase
      .from("roster_scores_cache")
      .select("*")
      .eq("week", CURRENT_WEEK)
      .eq("is_offseason", IS_OFFSEASON)
      .limit(1);

    if (cachedScores && cachedScores.length > 0) {
      claudeScores = JSON.parse(cachedScores[0].scores);
    } else {
      const scores = await getClaudeRosterScores(rosterTeamData);
      rosterTeamData.forEach((team, index) => {
        claudeScores[team.username] = scores[index] || 5;
      });
      await supabase.from("roster_scores_cache").insert([{
        week: CURRENT_WEEK,
        is_offseason: IS_OFFSEASON,
        scores: JSON.stringify(claudeScores)
      }]);
    }
  } catch (e) {
    console.log("Could not get Claude scores", e);
  }

  const rankings = rosters
    .map((roster: any) => {
      const user = userMap[roster.owner_id];
      const username = user?.username || "Unknown";
      const wins = roster.settings.wins || 0;
      const losses = roster.settings.losses || 0;
      const points = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
      const rosterScore = rosterScores[username] || 0;
      const claudeScore = claudeScores[username] || 5;
      const finalScore = IS_OFFSEASON
  ? (rosterScore * 0.7) + (claudeScore * 10 * 0.3)
  : (rosterScore * 0.3) + (claudeScore * 10 * 0.2) + (points * 0.3) + (wins * 15 * 0.2);

      return {
        teamName: user?.name || "Unknown",
        username,
        avatar: user?.avatar,
        wins,
        losses,
        points,
        powerScore: finalScore,
        preseasonScore: finalScore
      };
    })
    .sort((a: any, b: any) => b.powerScore - a.powerScore);

  let blurbs: string[] = [];
  const { data: cachedBlurbs } = await supabase
    .from("blurbs_cache")
    .select("*")
    .eq("week", CURRENT_WEEK)
    .eq("is_offseason", IS_OFFSEASON)
    .order("created_at", { ascending: false })
    .limit(1);

  if (cachedBlurbs && cachedBlurbs.length > 0) {
    blurbs = JSON.parse(cachedBlurbs[0].blurbs);
  } else {
    blurbs = await generateTeamBlurbs(rankings, IS_OFFSEASON, CURRENT_WEEK, rosterInjuries, rosterPlayers);
    await supabase.from("blurbs_cache").insert([{
      week: CURRENT_WEEK,
      is_offseason: IS_OFFSEASON,
      blurbs: JSON.stringify(blurbs)
    }]);
  }

  const matchupMap: Record<string, any[]> = {};
  matchups.forEach((m: any) => {
    if (!matchupMap[m.matchup_id]) matchupMap[m.matchup_id] = [];
    matchupMap[m.matchup_id].push(m);
  });

  const games = Object.values(matchupMap).map((pair: any[]) => {
    const rosterA = rosters.find((r: any) => r.roster_id === pair[0]?.roster_id);
    const rosterB = rosters.find((r: any) => r.roster_id === pair[1]?.roster_id);
    const userA = userMap[rosterA?.owner_id];
    const userB = userMap[rosterB?.owner_id];
    return {
      matchup_id: pair[0]?.matchup_id,
      teamA: userA?.name || "Unknown",
      teamB: userB?.name || "Unknown",
      managerA: userA?.username || "Unknown",
      managerB: userB?.username || "Unknown",
      avatarA: userA?.avatar,
      avatarB: userB?.avatar,
      ptsA: pair[0]?.points || 0,
      ptsB: pair[1]?.points || 0,
    };
  });

  let recaps: string[] = [];
  if (!IS_OFFSEASON) {
    const { data: cachedRecaps } = await supabase
      .from("matchup_recaps")
      .select("*")
      .eq("week", CURRENT_WEEK)
      .order("matchup_id", { ascending: true });

    if (cachedRecaps && cachedRecaps.length > 0) {
      recaps = cachedRecaps.map((r: any) => r.recap);
    } else {
      recaps = await generateMatchupRecaps(games, CURRENT_WEEK);
      await Promise.all(
        recaps.map((recap: string, i: number) =>
          supabase.from("matchup_recaps").insert([{
            week: CURRENT_WEEK,
            matchup_id: games[i].matchup_id,
            recap
          }])
        )
      );
    }
  }

  let lastWeekRanks: Record<string, number> = {};
  if (!IS_OFFSEASON) {
    const { data: lastWeekData } = await supabase
      .from("ranking_history")
      .select("*")
      .eq("week", CURRENT_WEEK - 1);

    if (lastWeekData) {
      lastWeekData.forEach((r: any) => {
        lastWeekRanks[r.username] = r.rank;
      });
    }

    const { data: thisWeekExists } = await supabase
      .from("ranking_history")
      .select("id")
      .eq("week", CURRENT_WEEK)
      .limit(1);

    if (!thisWeekExists || thisWeekExists.length === 0) {
      const rows = rankings.map((team: any, index: number) => ({
        week: CURRENT_WEEK,
        username: team.username,
        rank: index + 1
      }));
      await supabase.from("ranking_history").insert(rows);
    }
  }

  let hotColdData = { hot: [] as any[], cold: [] as any[] };
  if (!IS_OFFSEASON && CURRENT_WEEK >= 3) {
    try {
      const statsRes = await fetch(`https://api.sleeper.app/v1/stats/nfl/regular/2026/${CURRENT_WEEK}`, { cache: "no-store" });
      const weekStats = await statsRes.json();
      await saveWeeklyStats(supabase, CURRENT_WEEK, matchups, allPlayers, weekStats);
      hotColdData = await getHotColdPlayers(supabase, CURRENT_WEEK);
    } catch (e) {
      console.log("Could not fetch week stats", e);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{fontFamily: "'Inter', system-ui, sans-serif"}}>

      <nav className="border-b border-white/[0.06] px-4 py-4 sticky top-0 bg-[#080808]/95 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-black font-black text-xs tracking-tight">
              CDL
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm tracking-tight leading-none">Chiraq Dynasty</span>
              <span className="text-white/30 text-[10px] tracking-widest uppercase leading-none mt-0.5">League</span>
            </div>
          </div>
          <span className="text-[10px] text-white/20 tracking-widest uppercase">2026–27</span>
        </div>
      </nav>

      <div className="border-b border-white/[0.06] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] tracking-widest uppercase text-emerald-500/70 mb-2">
            {IS_OFFSEASON ? "Offseason Edition" : `Week ${CURRENT_WEEK} Recap`}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white">League Hub</h1>
          <p className="text-white/40 text-sm mt-1">
            {IS_OFFSEASON ? "Season hasn't started yet. Check back week 1 for the full breakdown." : `Everything you need to know from week ${CURRENT_WEEK}.`}
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-12">

        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {IS_OFFSEASON ? "Preseason Power Rankings" : `Week ${CURRENT_WEEK} Power Rankings`}
            </h2>
            <p className="text-white/30 text-sm mt-1">
              {IS_OFFSEASON ? "2026-27 Season Preview" : `Updated after week ${CURRENT_WEEK} results`}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            {rankings.map((team: any, index: number) => (
              <div
                key={index}
                className={`flex flex-col px-4 py-5 border-b border-white/[0.06] last:border-0 ${index === 0 ? 'bg-emerald-950/20' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center font-bold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-white text-base font-bold">#{index + 1}</span>}
                    </span>
                    {team.avatar ? (
                      <img
                        src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`}
                        alt={team.username}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10" />
                    )}
                    <div>
                      <p className="text-base font-semibold text-white leading-tight">{team.teamName}</p>
                      <p className="text-xs text-white/40 leading-tight mt-0.5">@{team.username} · {team.wins}–{team.losses}</p>
                    </div>
                  </div>
                  {!IS_OFFSEASON && (
                    <div className="flex items-center gap-2">
                      {lastWeekRanks[team.username] && (
                        <span className={`text-sm font-mono ${
                          lastWeekRanks[team.username] > index + 1 ? 'text-emerald-400' :
                          lastWeekRanks[team.username] < index + 1 ? 'text-red-400' : 'text-white/20'
                        }`}>
                          {lastWeekRanks[team.username] > index + 1 ? `↑${lastWeekRanks[team.username] - (index + 1)}` :
                           lastWeekRanks[team.username] < index + 1 ? `↓${(index + 1) - lastWeekRanks[team.username]}` : '—'}
                        </span>
                      )}
                      <span className={`text-base font-bold tabular-nums ${index === 0 ? 'text-emerald-400' : 'text-white/60'}`}>
                        {team.powerScore.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                {blurbs[index] && (
                  <p className="text-sm text-white/70 leading-relaxed">{blurbs[index]}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {IS_OFFSEASON ? "Matchups" : `Week ${CURRENT_WEEK} Matchups`}
            </h2>
          </div>
          {IS_OFFSEASON ? (
            <div className="rounded-2xl border border-white/[0.06] px-5 py-8 text-center">
              <p className="text-white/30 text-sm">Matchup recaps will appear here after week 1.</p>
              <p className="text-white/15 text-xs mt-1">Each game will include a score breakdown and AI-generated recap.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {games.map((game: any, index: number) => (
                <div key={index} className="border border-white/[0.06] rounded-xl px-4 py-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {game.avatarA ? (
                        <img src={`https://sleepercdn.com/avatars/thumbs/${game.avatarA}`} className="w-7 h-7 rounded-full flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-white/80 truncate">{game.teamA}</span>
                      <span className="text-base font-bold text-white ml-auto">{game.ptsA.toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-white/20 font-mono px-2">vs</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-base font-bold text-white mr-auto">{game.ptsB.toFixed(2)}</span>
                      <span className="text-sm font-medium text-white/80 truncate text-right">{game.teamB}</span>
                      {game.avatarB ? (
                        <img src={`https://sleepercdn.com/avatars/thumbs/${game.avatarB}`} className="w-7 h-7 rounded-full flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/50 italic border-t border-white/[0.04] pt-3">
                    {recaps[index] || "Recap loading..."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Risers & Fallers</h2>
          </div>
          {IS_OFFSEASON || Object.keys(lastWeekRanks).length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] px-5 py-8 text-center">
              <p className="text-white/30 text-sm">Rankings movement will appear here after week 2.</p>
              <p className="text-white/15 text-xs mt-1">We need two weeks of data to show who's climbing and who's dropping.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-white/[0.06] rounded-xl px-4 py-4">
                <p className="text-xs text-emerald-400/70 uppercase tracking-widest mb-3">Rising</p>
                <div className="flex flex-col gap-2">
                  {rankings
                    .map((team: any, index: number) => ({ ...team, currentRank: index + 1, movement: (lastWeekRanks[team.username] || 99) - (index + 1) }))
                    .filter((t: any) => t.movement > 0)
                    .sort((a: any, b: any) => b.movement - a.movement)
                    .slice(0, 3)
                    .map((t: any) => (
                      <div key={t.username} className="flex items-center justify-between">
                        <span className="text-sm text-white/70">{t.teamName}</span>
                        <span className="text-sm text-emerald-400 font-mono">↑{t.movement}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="border border-white/[0.06] rounded-xl px-4 py-4">
                <p className="text-xs text-red-400/70 uppercase tracking-widest mb-3">Falling</p>
                <div className="flex flex-col gap-2">
                  {rankings
                    .map((team: any, index: number) => ({ ...team, currentRank: index + 1, movement: (lastWeekRanks[team.username] || 99) - (index + 1) }))
                    .filter((t: any) => t.movement < 0)
                    .sort((a: any, b: any) => a.movement - b.movement)
                    .slice(0, 3)
                    .map((t: any) => (
                      <div key={t.username} className="flex items-center justify-between">
                        <span className="text-sm text-white/70">{t.teamName}</span>
                        <span className="text-sm text-red-400 font-mono">↓{Math.abs(t.movement)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Hot & Cold</h2>
          </div>
          {IS_OFFSEASON || CURRENT_WEEK < 3 ? (
            <div className="rounded-2xl border border-white/[0.06] px-5 py-8 text-center">
              <p className="text-white/30 text-sm">Hot & Cold players will appear here after week 3.</p>
              <p className="text-white/15 text-xs mt-1">We track 3 weeks of actual vs projected performance to identify trends.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-white/[0.06] rounded-xl px-4 py-4">
                <p className="text-xs text-emerald-400/70 uppercase tracking-widest mb-3">🔥 Hot</p>
                <div className="flex flex-col gap-3">
                  {hotColdData.hot.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/80 font-medium">{p.name}</p>
                        <p className="text-xs text-white/30">{p.position} · {p.avgActual.toFixed(1)} avg</p>
                      </div>
                      <span className="text-sm text-emerald-400 font-mono">+{p.avgDiff.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-white/[0.06] rounded-xl px-4 py-4">
                <p className="text-xs text-red-400/70 uppercase tracking-widest mb-3">🥶 Cold</p>
                <div className="flex flex-col gap-3">
                  {hotColdData.cold.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/80 font-medium">{p.name}</p>
                        <p className="text-xs text-white/30">{p.position} · {p.avgActual.toFixed(1)} avg</p>
                      </div>
                      <span className="text-sm text-red-400 font-mono">{p.avgDiff.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      <footer className="border-t border-white/[0.04] px-4 py-6 mt-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500 text-black font-black text-[8px]">CDL</div>
            <span className="text-xs text-white/20">Chiraq Dynasty League</span>
          </div>
          <span className="text-xs text-white/15">Powered by Sleeper</span>
        </div>
      </footer>

    </div>
  );
}