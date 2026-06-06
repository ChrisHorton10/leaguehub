import { createClient } from "@supabase/supabase-js";
import { generateTeamBlurbs } from "./generateBlurbs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getLeagueData() {
  const leagueId = "1330820695583625216";

  const [rostersRes, usersRes, matchupsRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`, { cache: "no-store" }),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`, { cache: "no-store" }),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/1`, { cache: "no-store" })
  ]);

  const rosters = await rostersRes.json();
  const users = await usersRes.json();
  const matchups = await matchupsRes.json();

  return { rosters, users, matchups };
}

const CURRENT_WEEK = 1;
const IS_OFFSEASON = true;

export default async function Home() {
  const { rosters, users, matchups } = await getLeagueData();

  const { data: tradePosts } = await supabase
    .from("trade_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const userMap = {};
  users.forEach(user => {
    userMap[user.user_id] = {
      name: user.metadata?.team_name || user.display_name,
      username: user.display_name,
      avatar: user.avatar
    };
  });

  const rankings = rosters
    .map(roster => {
      const wins = roster.settings.wins || 0;
      const losses = roster.settings.losses || 0;
      const points = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
      const powerScore = (wins * 3) + (points / 100);
      const user = userMap[roster.owner_id];
      return {
        teamName: user?.name || "Unknown",
        username: user?.username || "Unknown",
        avatar: user?.avatar,
        wins,
        losses,
        points,
        powerScore
      };
    })
    .sort((a, b) => b.powerScore - a.powerScore);

  // Fetch player data once for both injuries and roster players
  let rosterInjuries = {};
  let rosterPlayers = {};
  try {
    const playersRes = await fetch("https://api.sleeper.app/v1/players/nfl", { cache: "no-store" });
    const allPlayers = await playersRes.json();

    rosters.forEach(roster => {
      const user = userMap[roster.owner_id];
      if (!user) return;

      const injured = (roster.players || [])
        .map(id => allPlayers[id])
        .filter(p => p && p.injury_status && ["Out", "IR", "Doubtful", "Questionable"].includes(p.injury_status))
        .map(p => `${p.full_name} (${p.injury_status})`);
      if (injured.length > 0) {
        rosterInjuries[user.username] = injured;
      }

      const positionRanks = { QB: 1, RB: 2, WR: 3, TE: 4 };
      const taxiIds = new Set(roster.taxi || []);
      const players = (roster.players || [])
        .filter(id => !taxiIds.has(id))
        .map(id => allPlayers[id])
        .filter(p => p && p.full_name && ["QB", "RB", "WR", "TE"].includes(p.position) && p.years_exp > 0)
        .sort((a, b) => (positionRanks[a.position] - positionRanks[b.position]))
        .slice(0, 10)
        .map(p => `${p.full_name} (${p.position})`);
      rosterPlayers[user.username] = players;
    });
  } catch (e) {
    console.log("Could not fetch player data");
  }

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
  const matchupMap = {};
  matchups.forEach(m => {
    if (!matchupMap[m.matchup_id]) matchupMap[m.matchup_id] = [];
    matchupMap[m.matchup_id].push(m);
  });

  const games = Object.values(matchupMap).map(pair => {
    const rosterA = rosters.find(r => r.roster_id === pair[0]?.roster_id);
    const rosterB = rosters.find(r => r.roster_id === pair[1]?.roster_id);
    return {
      teamA: userMap[rosterA?.owner_id]?.name || "Unknown",
      teamB: userMap[rosterB?.owner_id]?.name || "Unknown",
      avatarA: userMap[rosterA?.owner_id]?.avatar,
      avatarB: userMap[rosterB?.owner_id]?.avatar,
      ptsA: pair[0]?.points || 0,
      ptsB: pair[1]?.points || 0,
    };
  });

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{fontFamily: "'Inter', system-ui, sans-serif"}}>

      {/* Nav */}
      <nav className="border-b border-white/[0.06] px-6 py-4 sticky top-0 bg-[#080808]/95 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-black font-black text-xs tracking-tight">
              CDL
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm tracking-tight leading-none">Chiraq Dynasty</span>
              <span className="text-white/30 text-[10px] tracking-widest uppercase leading-none mt-0.5">League</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/20 tracking-widest uppercase mr-3">2026–27</span>
            <a href="/trade-desk" className="text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Trade Desk
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b border-white/[0.06] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-widest uppercase text-emerald-500/70 mb-2">
            {IS_OFFSEASON ? "Offseason Edition" : `Week ${CURRENT_WEEK} Recap`}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">League Hub</h1>
          <p className="text-white/30 text-sm mt-1">
            {IS_OFFSEASON ? "Season hasn't started yet. Check back week 1 for the full breakdown." : `Everything you need to know from week ${CURRENT_WEEK}.`}
          </p>
        </div>
      </div>

      {/* Two column layout */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main column */}
          <main className="flex-1 flex flex-col gap-14 min-w-0">

            {/* Power Rankings */}
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
                        <span className="text-xs text-white/25 tabular-nums hidden sm:block">{team.points.toFixed(1)} pts</span>
                        <span className="text-xs text-white/35 tabular-nums w-10 text-right">{team.wins}–{team.losses}</span>
                        <div className="w-14 text-right">
                          <span className={`text-sm font-semibold tabular-nums ${index === 0 ? 'text-emerald-400' : 'text-white/60'}`}>
                            {team.powerScore.toFixed(1)}
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
              <p className="text-[10px] text-white/15 mt-2 text-right tracking-wide">Score = (wins × 3) + (points ÷ 100)</p>
            </section>

            {/* Matchup Recaps */}
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
                        AI recap loading...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Risers & Fallers */}
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
              {IS_OFFSEASON ? (
                <div className="rounded-2xl border border-white/[0.06] px-6 py-8 text-center">
                  <p className="text-white/20 text-sm">Rankings movement will appear here after week 2.</p>
                  <p className="text-white/10 text-xs mt-1">We need two weeks of data to show who's climbing and who's dropping.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-white/[0.06] rounded-xl px-5 py-4">
                    <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-3">Rising</p>
                    <p className="text-white/20 text-xs">Data loads after week 2</p>
                  </div>
                  <div className="border border-white/[0.06] rounded-xl px-5 py-4">
                    <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-3">Falling</p>
                    <p className="text-white/20 text-xs">Data loads after week 2</p>
                  </div>
                </div>
              )}
            </section>

            {/* Best Performances */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-semibold tracking-tight">Best Performances</h2>
                </div>
                <span className="text-[10px] text-white/20 tracking-widest uppercase">
                  {IS_OFFSEASON ? "Preseason" : `Week ${CURRENT_WEEK}`}
                </span>
              </div>
              {IS_OFFSEASON ? (
                <div className="rounded-2xl border border-white/[0.06] px-6 py-8 text-center">
                  <p className="text-white/20 text-sm">Top performers by position will appear here after week 1.</p>
                  <p className="text-white/10 text-xs mt-1">QB · RB · WR · TE — best and worst of the week across your league.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["QB", "RB", "WR", "TE"].map(pos => (
                    <div key={pos} className="border border-white/[0.06] rounded-xl px-4 py-4">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">{pos}</p>
                      <p className="text-sm font-medium text-white/80">—</p>
                      <p className="text-xs text-emerald-400 mt-1">0.0 pts</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Team of the Week */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-semibold tracking-tight">Team of the Week</h2>
                </div>
                <span className="text-[10px] text-white/20 tracking-widest uppercase">
                  {IS_OFFSEASON ? "Preseason" : `Week ${CURRENT_WEEK}`}
                </span>
              </div>
              {IS_OFFSEASON ? (
                <div className="rounded-2xl border border-white/[0.06] px-6 py-8 text-center">
                  <p className="text-white/20 text-sm">The highest scoring team of the week will be crowned here.</p>
                  <p className="text-white/10 text-xs mt-1">Includes their full lineup breakdown.</p>
                </div>
              ) : (
                <div className="border border-white/[0.06] rounded-2xl px-6 py-5">
                  <p className="text-white/20 text-sm">Loading...</p>
                </div>
              )}
            </section>

          </main>

          {/* Sidebar — Trade Block */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-semibold tracking-tight">Trade Block</h2>
                </div>
                <a href="/trade-desk" className="text-[10px] text-emerald-500/60 hover:text-emerald-400 transition-colors uppercase tracking-widest">
                  Post +
                </a>
              </div>

              <div className="flex flex-col gap-2">
                {!tradePosts || tradePosts.length === 0 ? (
                  <div className="border border-white/[0.06] rounded-xl px-4 py-6 text-center">
                    <p className="text-white/20 text-xs">No active trade posts.</p>
                    <a href="/trade-desk" className="text-emerald-500/50 text-xs hover:text-emerald-400 transition-colors mt-1 block">
                      Be the first to post →
                    </a>
                  </div>
                ) : (
                  tradePosts.map(post => (
                    <div key={post.id} className="border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <p className="text-xs font-semibold text-emerald-400 mb-2">{post.manager}</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-[11px] text-white/50 leading-snug">
                          <span className="text-white/25">Offering </span>{post.offering}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.looking.split(", ").map(tag => (
                            <span key={tag} className="text-[10px] bg-white/[0.04] border border-white/[0.06] text-white/30 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {tradePosts && tradePosts.length > 0 && (
                <a href="/trade-desk" className="block text-center text-[10px] text-white/20 hover:text-white/40 transition-colors mt-3 tracking-widest uppercase">
                  View all & post a trade →
                </a>
              )}
            </div>
          </aside>

        </div>
      </div>

      <footer className="border-t border-white/[0.04] px-6 py-6 mt-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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