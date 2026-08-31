export async function getClaudeRosterScores(teams) {
  const teamSummaries = teams.map((team, index) => {
    return `Team ${index + 1}: ${team.teamName} (${team.nickname})
Key starters: ${team.starters.join(", ")}
Bench depth: ${team.bench.join(", ")}
Projected starter points: ${team.projectedPts.toFixed(1)}`;
  }).join("\n\n");

  const prompt = `You are an expert dynasty fantasy football analyst. Rate each of these 12 teams on a scale of 1-10 based on:
- Current roster quality and proven production
- Ceiling and upside of key players
- New team situations and how they affect players
- Age curves — is this roster ascending or declining
- Depth — what happens when injuries hit
- Overall championship contention probability this season

Scoring guidelines:
- 9.0-10.0: Elite, clear championship contender
- 8.0-8.9: Legitimate contender, real depth
- 7.0-7.9: Solid team, fringe contender
- 6.0-6.9: Middle of the pack, real concerns
- 5.0-5.9: Rebuilding or significant weaknesses
- Below 5.0: Full rebuild, tanking

Important notes:
- A high projected points score does NOT automatically mean a high rating — factor in injury risk, age, and roster depth
- A team heavily dependent on one elite QB with weak RB depth should be scored conservatively
- Young ascending rosters with high ceilings should score higher than aging rosters with similar projections
- Injury-prone players should lower a team's score significantly
- Dynasty value (long term outlook) matters alongside this season's outlook

Do NOT just mirror the projected points. Use your football knowledge to identify teams that are overrated or underrated by raw projections.

Teams:
${teamSummaries}

Return ONLY a valid JSON array of exactly ${teams.length} numbers between 1-10, one score per team in the same order. One decimal place. No markdown, no extra text.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const scores = JSON.parse(clean);
    if (Array.isArray(scores) && scores.length === teams.length) {
      return scores;
    }
    return teams.map(() => 5);
  } catch {
    return teams.map(() => 5);
  }
}