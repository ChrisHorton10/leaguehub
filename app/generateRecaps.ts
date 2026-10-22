const NICKNAMES: Record<string, string> = {
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

export async function generateMatchupRecaps(games: any[], week: number) {
  const gameSummaries = games.map((game, index) => {
    const aWon = game.ptsA > game.ptsB;
    const winner = NICKNAMES[aWon ? game.managerA : game.managerB] || (aWon ? game.managerA : game.managerB);
    const loser = NICKNAMES[aWon ? game.managerB : game.managerA] || (aWon ? game.managerA : game.managerB);
    const winnerPts = aWon ? game.ptsA : game.ptsB;
    const loserPts = aWon ? game.ptsB : game.ptsA;
    const margin = Math.abs(game.ptsA - game.ptsB);

    return `Matchup ${index + 1}:
Winner: ${winner} with ${winnerPts.toFixed(2)}
Loser: ${loser} with ${loserPts.toFixed(2)}
Margin: ${margin.toFixed(2)}
${winner}'s top starters: ${(game.winnerPlayers || []).join(", ") || "n/a"}
${loser}'s top starters: ${(game.loserPlayers || []).join(", ") || "n/a"}`;
  }).join("\n\n");

  const prompt = `You are writing the Week ${week} matchup recaps for the Chiraq Dynasty League, a dynasty league of close friends who talk trash constantly. Write like a sharp, funny sports columnist covering the game.

Each recap is 3 to 4 sentences and covers:
- Who won and by how much, and what kind of game it was (blowout, nail-biter, one team coasting)
- Two or three players by name with their exact points from the data, who decided it
- Something notable about the loser: a flop, a star who got stuffed, a lineup that left points somewhere
- At least one genuine jab or punchline aimed at a roster, a player, or a performance

HARD RULES:
- NEVER state or imply win-loss records, standings, "improves to", "falls to", "moves to 3-0", "0-2", streaks, or playoff position. You do not have that data and anything you say will be wrong.
- Only use players and point totals that appear in the data. Do not invent stats.
- Use manager nicknames only, never team names.
- Do not use these words: dominant, dominated, demolished, torched, shellacking, absolutely, statement win, blowout (at most once in the whole column).
- Never open two recaps the same way. Vary verbs and sentence structure. Never describe two different games with the same phrase.
- Keep jabs aimed at rosters, performances, and decisions. Short and sharp, with the punchline at the end of the sentence.

Matchups:
${gameSummaries}

Return ONLY a valid JSON array of strings, one recap per matchup, in the same order. No markdown, no extra text.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5-5",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();

  if (!data.content || !data.content[0]) {
    console.log("Recap API error:", JSON.stringify(data).slice(0, 500));
    return games.map(() => "Recap unavailable.");
  }

  const text = data.content[0].text;

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => (typeof item === "string" ? item : item.recap || item.text || JSON.stringify(item)));
    }
    return games.map(() => "Recap unavailable.");
  } catch (e) {
    console.log("Recap parse error:", e);
    return games.map(() => "Recap unavailable.");
  }
}