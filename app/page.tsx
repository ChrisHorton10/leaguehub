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

const MANAGER_NICKNAMES = {
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

  const userMap = {};
  users.forEach(user => {
    userMap[user.user_id] = {
      name: user.metadata?.team_name || user.display_name,
      username: user.display_name,
      avatar: user.avatar
    };
  });

  // Fetch player data and projections
  let allPlayers = {};
  let weekProjections = {};
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

  // Build roster data using Sleeper's actual starters
  const rosterInjuries = {};
  const rosterPlayers = {};
  const rosterScores = {};
  const rosterTeamData = [];

  rosters.forEach(roster => {
    const user = userMap[roster.owner_id];
    if (!user) return;

    // Use Sleeper's actual starter slots for projected points
    const actualStarters = (roster.starters || []).map(id => {
      const player = allPlayers[id];
      const proj = weekProjections[id];
      const pts = proj?.pts_ppr || 0;
      if (!player) {
        return { player_id: id, full_name: id, position: "DST", pts_ppr: pts };
      }
      return { ...player, player_id: id, pts_ppr: pts };
    });

    const projectedPts = actualStarters.reduce((sum, p) => sum + (p.pts_ppr || 0), 0);

    // Skill position starters for Claude analysis (no K or DST)
    const startingLineup = actualStarters.filter(p =>
      p.full_name && ["QB", "RB", "WR", "TE"].includes(p.position)
    );

    // Bench depth — non-starters sorted by projected points
    const starterIds = new Set(actualStarters.map(p => p.player_id));
    const taxiIds = new Set(roster.taxi || []);
    const reserveIds = new Set(roster.reserve || []);

    const benchPlayers = (roster.players || [])
      .filter(id => !starterIds.has(id) && !taxiIds.has(id) && !reserveIds.has(id))
      .map(id => {
        const player = allPlayers[id];
        const proj = weekProjections[id];
        return { ...player, player_id: id, pts_ppr: proj?.pts_ppr || 0 };
      })
      .filter(p => p && p.full_name && ["QB", "RB", "WR", "TE"].includes(p.position))
      .sort((a, b) => b.pts_ppr - a.pts_ppr)
      .slice(0, 5);

    const benchScore = benchPlayers.reduce((sum, p) => sum + (p.pts_ppr || 0), 0);
    const lineupScore = (projectedPts * 0.75) + (benchScore * 0.25);

    rosterScores[user.username] = lineupScore;
    rosterPlayers[user.username] = startingLineup.map(p => `${p.full_name} (${p.position})`);

    console.log(`${user.username}: projected=${projectedPts.toFixed(1)} bench=${benchScore.toFixed(1)} total=${lineupScore.toFixed(1)}`);

    // Injuries
    const injured = (roster.players || [])
      .map(id => allPlayers[id])
      .filter(p => p && p.injury_status && ["Out", "IR", "Doubtful", "Questionable"].includes(p.injury_status))
      .map(p => `${p.full_name} (${p.injury_status})`);
    if (injured.length > 0) {
      rosterInjuries[user.username] = injured;
    }

    rosterTeamData.push({
      username: user.username,
      teamName: user.name || user.username,
      nickname: MANAGER_NICKNAMES[user.username] || user.username,
      starters: startingLineup.map(p => `${p.full_name} (${p.position}) proj:${p.pts_ppr.toFixed(1)}`),
      bench: benchPlayers.map(p => `${p.full_name} (${p.position}) proj:${p.pts_ppr.toFixed(1)}`),
      projectedPts
    });
  });

  // Get Claude roster scores with caching
  let claudeScores = {};
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

  console.log("Claude scores:", claudeScores);
  console.log("Roster scores:", rosterScores);

  // Build rankings — 70% projected pts, 30% Claude qualitative
  const rankings = rosters
    .map(roster => {
      const user = userMap[roster.owner_id];
      const username = user?.username || "Unknown";
      const wins = roster.settings.wins || 0;
      const losses = roster.settings.losses || 0;
      const points = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
      const rosterScore = rosterScores[username] || 0;
      const claudeScore = claudeScores[username] || 5;
      const finalScore = (rosterScore * 0.7) + (claudeScore * 10 * 0.3);

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
    .sort((a, b) => b.powerScore - a.powerScore);

  // Get blurbs from cache or generate
  let blurbs = [];
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

  // Build matchups
  const matchupMap = {};
  matchups.forEach(m => {
    if (!matchupMap[m.matchup_id]) matchupMap[m.matchup_id] = [];
    matchupMap[m.matchup_id].push(m);
  });

  const games = Object.values(matchupMap).map(pair => {
    const rosterA = rosters.find(r => r.roster_id === pair[0]?.roster_id);
    const rosterB = rosters.find(r => r.roster_id === pair[1]?.roster_id);
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

  // Matchup recaps
  let recaps = [];
  if (!IS_OFFSEASON) {
    const { data: cachedRecaps } = await supabase
      .from("matchup_recaps")
      .select("*")
      .eq("week", CURRENT_WEEK)
      .order("matchup_id", { ascending: true });

    if (cachedRecaps && cachedRecaps.length > 0) {
      recaps = cachedRecaps.map(r => r.recap);
    } else {
      recaps = await generateMatchupRecaps(games, CURRENT_WEEK);
      await Promise.all(
        recaps.map((recap, i) =>
          supabase.from("matchup_recaps").insert([{
            week: CURRENT_WEEK,
            matchup_id: games[i].matchup_id,
            recap
          }])
        )
      );
    }
  }

  // Last week rankings for risers/fallers
  let lastWeekRanks = {};
  if (!IS_OFFSEASON) {
    const { data: lastWeekData } = await supabase
      .from("ranking_history")
      .select("*")
      .eq("week", CURRENT_WEEK - 1);

    if (lastWeekData) {
      lastWeekData.forEach(r => {
        lastWeekRanks[r.username] = r.rank;
      });
    }

    const { data: thisWeekExists } = await supabase
      .from("ranking_history")
      .select("id")
      .eq("week", CURRENT_WEEK)
      .limit(1);

    if (!thisWeekExists || thisWeekExists.length === 0) {
      const rows = rankings.map((team, index) => ({
        week: CURRENT_WEEK,
        username: team.username,
        rank: index + 1
      }));
      await supabase.from("ranking_history").insert(rows);
    }
  }

  // Hot & Cold
  let hotColdData = { hot: [], cold: [] };
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

      <nav className="border-b border-white/[0.06] px-6 py-4 sticky top-0 bg-[#080808]/95 backdrop-blur-md z-10">
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

      <div className="border-b border-white/[0.06] px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] tracking-widest uppercase text-emerald-500/70 mb-2">
            {IS_OFFSEASON ? "Offseason Edition" : `Week ${CURRENT_WEEK} Recap`}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">League Hub</h1>
          <p className="text-white/30 text-sm mt-1">
            {IS_OFFSEASON ? "Season hasn't started yet. Check back week 1 for the full breakdown." : `Everything you need to know from week ${CURRENT_WEEK}.`}
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-14">

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-semibold tracking-tight">Power Rankings</h2>
            </div>
            <span className="text-[10px] text-white/20 tracking-widest uppercase">
              {IS_OFFSEASON ? "Preseason" : `Week ${CURRENT_WEEK}`}
            </span>
          </div>
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            {rankings.map((team, index) => (
              <div
                key={index}
                className={`flex flex-col px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors ${index === 0 ? 'bg-emerald-950/20' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="text-white/20 text-xs font-mono w-4 text-center tabular-nums">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                    {team.avatar ? (
                      <img
                        src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`}
                        alt={team.username}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 ring-1 ring-white/5" />
                    )}
                    <div>
                      <p className="text-sm font-medium leading-tight">{team.teamName}</p>
                      <p className="text-[11px] text-white/25 leading-tight mt-0.5">@{team.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    {!IS_OFFSEASON && lastWeekRanks[team.username] && (
                      <span className={`text-xs font-mono w-8 text-center ${
                        lastWeekRanks[team.username] > index + 1 ? 'text-emerald-400' :
                        lastWeekRanks[team.username] < index + 1 ? 'text-red-400' : 'text-white/20'
                      }`}>
                        {lastWeekRanks[team.username] > index + 1 ? `↑${lastWeekRanks[team.username] - (index + 1)}` :
                         lastWeekRanks[team.username] < index + 1 ? `↓${(index + 1) - lastWeekRanks[team.username]}` : '—'}
                      </span>
                    )}
                    <span className="text-xs text-white/25 tabular-nums hidden sm:block">{team.wins}–{team.losses}</span>
                    <div className="w-14 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${index === 0 ? 'text-emerald-400' : 'text-white/60'}`}>
                        {IS_OFFSEASON ? `#${index + 1}` : team.powerScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                {blurbs[index] && (
                  <p className="text-[11px] text-white/35 italic mt-2 ml-11 leading-snug">{blurbs[index]}</p>
                )}
              </div>
            ))}
          </div>
          {!IS_OFFSEASON && <p className="text-[10px] text-white/15 mt-2 text-right tracking-wide">Score = projected pts + Claude analysis</p>}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-semibold tracking-tight">Matchup Recaps</h2>
            </div>
            <span className="text-[10px] text-white/20 tracking-widest uppercase">
              {IS_OFFSEASON ? "Preseason" : `Week ${CURRENT_WEEK}`}
            </span>
          </div>
          {IS_OFFSEASON ? (
            <div className="rounded-2xl border border-white/[0.06] px-6 py-8 text-center">
              <p className="text-white/20 text-sm">Matchup recaps will appear here after week 1.</p>
              <p className="text-white/10 text-xs mt-1">Each game will include a score breakdown and AI-generated recap.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {games.map((game, index) => (
                <div key={index} className="border border-white/[0.06] rounded-xl px-5 py-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {game.avatarA ? (
                        <img src={`https://sleepercdn.com/avatars/thumbs/${game.avatarA}`} className="w-6 h-6 rounded-full flex-shrink-0 ring-1 ring-white/10" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-white/80 truncate">{game.teamA}</span>
                      <span className="text-sm font-bold text-white ml-auto">{game.ptsA.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-white/15 font-mono px-2">vs</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-bold text-white mr-auto">{game.ptsB.toFixed(2)}</span>
                      <span className="text-xs font-medium text-white/80 truncate text-right">{game.teamB}</span>
                      {game.avatarB ? (
                        <img src={`https://sleepercdn.com/avatars/thumbs/${game.avatarB}`} className="w-6 h-6 rounded-full flex-shrink-0 ring-1 ring-white/10" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/30 italic border-t border-white/[0.04] pt-3">
                    {recaps[index] || "Recap loading..."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-semibold tracking-tight">Risers & Fallers</h2>
            </div>
            <span className="text-[10px] text-white/20 tracking-widest uppercase">
              {IS_OFFSEASON ? "Preseason" : `Week ${CURRENT_WEEK}`}
            </span>
          </div>
          {IS_OFFSEASON || Object.keys(lastWeekRanks).length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] px-6 py-8 text-center">
              <p className="text-white/20 text-sm">Rankings movement will appear here after week 2.</p>
              <p className="text-white/10 text-xs mt-1">We need two weeks of data to show who's climbing and who's dropping.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-white/[0.06] rounded-xl px-5 py-4">
                <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-3">Rising</p>
                <div className="flex flex-col gap-2">
                  {rankings
                    .map((team, index) => ({ ...team, currentRank: index + 1, movement: (lastWeekRanks[team.username] || 99) - (index + 1) }))
                    .filter(t => t.movement > 0)
                    .sort((a, b) => b.movement - a.movement)
                    .slice(0, 3)
                    .map(t => (
                      <div key={t.username} className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{t.teamName}</span>
                        <span className="text-emerald-400 font-mono">↑{t.movement}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="border border-white/[0.06] rounded-xl px-5 py-4">
                <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-3">Falling</p>
                <div className="flex flex-col gap-2">
                  {rankings
                    .map((team, index) => ({ ...team, currentRank: index + 1, movement: (lastWeekRanks[team.username] || 99) - (index + 1) }))
                    .filter(t => t.movement < 0)
                    .sort((a, b) => a.movement - b.movement)
                    .slice(0, 3)
                    .map(t => (
                      <div key={t.username} className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{t.teamName}</span>
                        <span className="text-red-400 font-mono">↓{Math.abs(t.movement)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-semibold tracking-tight">Hot & Cold</h2>
            </div>
            <span className="text-[10px] text-white/20 tracking-widest uppercase">
              {IS_OFFSEASON ? "Preseason" : `Week ${CURRENT_WEEK}`}
            </span>
          </div>
          {IS_OFFSEASON || CURRENT_WEEK < 3 ? (
            <div className="rounded-2xl border border-white/[0.06] px-6 py-8 text-center">
              <p className="text-white/20 text-sm">Hot & Cold players will appear here after week 3.</p>
              <p className="text-white/10 text-xs mt-1">We track 3 weeks of actual vs projected performance to identify trends.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-white/[0.06] rounded-xl px-5 py-4">
                <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-3">🔥 Hot</p>
                <div className="flex flex-col gap-3">
                  {hotColdData.hot.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-white/70 font-medium">{p.name}</p>
                        <p className="text-white/30">{p.position} · {p.avgActual.toFixed(1)} avg pts</p>
                      </div>
                      <span className="text-emerald-400 font-mono">+{p.avgDiff.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-white/[0.06] rounded-xl px-5 py-4">
                <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-3">🥶 Cold</p>
                <div className="flex flex-col gap-3">
                  {hotColdData.cold.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-white/70 font-medium">{p.name}</p>
                        <p className="text-white/30">{p.position} · {p.avgActual.toFixed(1)} avg pts</p>
                      </div>
                      <span className="text-red-400 font-mono">{p.avgDiff.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      <footer className="border-t border-white/[0.04] px-6 py-6 mt-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500 text-black font-black text-[8px]">CDL</div>
            <span className="text-[11px] text-white/20">Chiraq Dynasty League</span>
          </div>
          <span className="text-[11px] text-white/15">Powered by Sleeper</span>
        </div>
      </footer>

    </div>
  );
}