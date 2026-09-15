export async function generateMatchupRecaps(games: any[], week: number) {
  const gameSummaries = games.map((game, index) => {
    const winnerName = game.ptsA > game.ptsB ? game.managerA : game.managerB;
    const loserName = game.ptsA > game.ptsB ? game.managerB : game.managerA;
    const winnerPts = game.ptsA > game.ptsB ? game.ptsA : game.ptsB;
    const loserPts = game.ptsA > game.ptsB ? game.ptsB : game.ptsA;
    const margin = Math.abs(game.ptsA - game.ptsB);

    const winnerPlayers = (game.winnerPlayers || []).join(", ");
    const loserPlayers = (game.loserPlayers || []).join(", ");

    return `Matchup ${index + 1}:
Winner: ${winnerName} — ${winnerPts.toFixed(2)} pts
Loser: ${loserName} — ${loserPts.toFixed(2)} pts
Margin: ${margin.toFixed(2)} pts
${winnerName} key performers: ${winnerPlayers || "data unavailable"}
${loserName} key performers: ${loserPlayers || "data unavailable"}`;
  }).join("\n\n");

  const prompt = `You are writing week ${week} matchup recaps for the Chiraq Dynasty League.

Write a 3-4 sentence recap for each matchup. These are post-game score reports — be specific and name names. Cover:
- Who won and by how much — was it a blowout or a nail-biter
- 2-3 standout performers by name from the winning team who made the difference
- Anyone who massively underperformed or busted on the losing side
- One line on what this result means for each team's record going forward

Use manager nicknames not team names. Be sharp and specific with player names and performances.

Manager nicknames:
- chrishorton10 = Commish
- BCregg = Cregg
- ScubaSteve0709 = Scuba Steve
- kmyers = Kyle
- Sher2Lose = Sherlock
- Broth22 = Brothers
- shazman123 = Shaz
- ctracewell = Tracewell
- GrimaceHugeSack = Grimace
- Bdug14 = Dlugos
- SamHuman12 = Sam
- Gillilig = Gill

Matchups:
${gameSummaries}

Return ONLY a valid JSON array of strings, one recap per matchup in the same order. No markdown, no extra text.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return games.map(() => "Recap unavailable.");
  }
}