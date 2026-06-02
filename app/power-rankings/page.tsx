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
      name: user.display_name,
      avatar: user.avatar
    };
  });

  const rankings = rosters
    .map(roster => {
      const wins = roster.settings.wins || 0;
      const losses = roster.settings.losses || 0;
      const points = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
      const powerScore = (wins * 3) + (points / 100);
      return {
        name: userMap[roster.owner_id]?.name || "Unknown",
        wins,
        losses,
        points,
        powerScore
      };
    })
    .sort((a, b) => b.powerScore - a.powerScore);

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
          {rankings.map((team, index) => (
            <div key={index} className={`rounded-lg px-6 py-4 flex items-center justify-between border ${index === 0 ? 'bg-yellow-900/20 border-yellow-600/40' : index === 1 ? 'bg-gray-800/60 border-gray-600/40' : index === 2 ? 'bg-orange-900/20 border-orange-700/40' : 'bg-gray-900 border-gray-800'}`}>
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold w-8 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                  #{index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{team.name}</p>
                  <p className="text-sm text-gray-400">{team.wins}W - {team.losses}L</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">{team.powerScore.toFixed(1)}</p>
                <p className="text-xs text-gray-500">power score</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}