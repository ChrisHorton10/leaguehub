async function getLeagueData() {
    const leagueId = "1330820695583625216";
    
    const [rostersRes, usersRes] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`)
    ]);
  
    const rosters = await rostersRes.json();
    const users = await usersRes.json();
  
    return { rosters, users };
  }
  
  export default async function PowerRankings() {
    const { rosters, users } = await getLeagueData();
  
    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user.display_name;
    });
  
    const rankings = rosters
      .map(roster => ({
        name: userMap[roster.owner_id] || "Unknown",
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        points: roster.settings.fpts + (roster.settings.fpts_decimal / 100),
      }))
      .sort((a, b) => b.wins - a.wins || b.points - a.points);
  
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
        <main className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">Power Rankings</h2>
          <div className="flex flex-col gap-4">
            {rankings.map((team, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-green-400">#{index + 1}</span>
                  <span className="text-lg font-medium">{team.name}</span>
                </div>
                <div className="flex gap-8 text-gray-400">
                  <span>{team.wins}-{team.losses}</span>
                  <span>{team.points.toFixed(2)} pts</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }