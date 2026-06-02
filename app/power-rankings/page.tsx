async function getLeagueData() {
  const leagueId = "1330820695583625216";
  
  const [rostersRes, usersRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`, { cache: 'no-store' }),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`, { cache: 'no-store' })
  ]);

  const rosters = await rostersRes.json();
  const users = await usersRes.json();

  return { rosters, users };
}

export default async function PowerRankings() {
  const { rosters, users } = await getLeagueData();

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
      const pointsAgainst = (roster.settings.fpts_against || 0) + ((roster.settings.fpts_against_decimal || 0) / 100);
      const powerScore = (wins * 3) + (points / 100);
      const user = userMap[roster.owner_id];
      return {
        teamName: user?.name || "Unknown",
        username: user?.username || "Unknown",
        avatar: user?.avatar,
        wins,
        losses,
        points,
        pointsAgainst,
        powerScore
      };
    })
    .sort((a, b) => b.powerScore - a.powerScore);

  const getRankStyle = (index) => {
    if (index === 0) return { card: 'bg-yellow-900/20 border-yellow-600/40', rank: 'text-yellow-400', medal: '🥇' };
    if (index === 1) return { card: 'bg-gray-800/60 border-gray-600/40', rank: 'text-gray-300', medal: '🥈' };
    if (index === 2) return { card: 'bg-orange-900/20 border-orange-700/40', rank: 'text-orange-400', medal: '🥉' };
    return { card: 'bg-gray-900 border-gray-800', rank: 'text-gray-500', medal: null };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-400">League Hub</h1>
          <div className="flex gap-6">
            <a href="/" className="text-gray-300 hover:text-white">Home</a>
            <a href="/power-rankings" className="text-gray-300 hover:text-white">Power Rankings</a>
            <a href="/trade-desk" className="text-gray-300 hover:text-white">Trade Desk</a>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Power Rankings</h2>
          <p className="text-gray-400 mt-1">Ranked by wins + total points scored</p>
        </div>
        <div className="flex flex-col gap-3">
          {rankings.map((team, index) => {
            const style = getRankStyle(index);
            return (
              <div key={index} className={`rounded-lg px-6 py-4 flex items-center justify-between border ${style.card}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-10">
                    {style.medal ? (
                      <span className="text-2xl">{style.medal}</span>
                    ) : (
                      <span className={`text-xl font-bold ${style.rank}`}>#{index + 1}</span>
                    )}
                  </div>
                  {team.avatar && (
                    <img
                      src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`}
                      alt={team.username}
                      className="w-10 h-10 rounded-full object-cover border border-gray-700"
                    />
                  )}
                  <div>
                    <p className="text-lg font-semibold">{team.teamName}</p>
                    <p className="text-sm text-gray-400">@{team.username} · {team.wins}W - {team.losses}L</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-lg">{team.powerScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">power score</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}